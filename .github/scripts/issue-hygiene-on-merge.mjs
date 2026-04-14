/* global console, fetch, process */

import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

// Optional repository variables:
// - ISSUE_HYGIENE_BASE_BRANCHES=main,overhaul
// - ISSUE_HYGIENE_BLOCKED_LABELS=blocked,blocked-by-dependency
// - ISSUE_HYGIENE_PROJECT_OWNER=kynd
// - ISSUE_HYGIENE_PROJECT_NUMBER=1
// - ISSUE_HYGIENE_STATUS_FIELD_NAME=Status
// - ISSUE_HYGIENE_DONE_OPTION_NAME=Done

const REST_API_BASE = process.env.GITHUB_API_URL || 'https://api.github.com';
const GRAPHQL_API_URL = process.env.GITHUB_GRAPHQL_URL || 'https://api.github.com/graphql';

function log(message) {
  console.log(`[issue-hygiene] ${message}`);
}

function fail(message) {
  console.error(`[issue-hygiene] ${message}`);
}

function parseCsv(value, fallback = []) {
  if (!value || !value.trim()) {
    return fallback;
  }

  return value
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function createIssueReferenceConfig(owner, repo) {
  const fullRepoRefSource = `${escapeRegExp(owner)}\\/${escapeRegExp(repo)}#\\d+`;
  const issueUrlSource = `https?:\\/\\/github\\.com\\/${escapeRegExp(owner)}\\/${escapeRegExp(
    repo,
  )}\\/issues\\/\\d+`;
  const shortRefSource = '#\\d+';
  const issueReferenceSource = `(?:${fullRepoRefSource}|${issueUrlSource}|${shortRefSource})`;

  return {
    issueReferenceSource,
    extractIssueNumber(reference) {
      const fullRepoRefMatch = reference.match(new RegExp(`^${fullRepoRefSource}$`, 'i'));
      if (fullRepoRefMatch) {
        return Number(fullRepoRefMatch[0].split('#')[1]);
      }

      const issueUrlMatch = reference.match(new RegExp(`^${issueUrlSource}$`, 'i'));
      if (issueUrlMatch) {
        return Number(issueUrlMatch[0].split('/').at(-1));
      }

      const shortRefMatch = reference.match(/^#(\d+)$/);
      if (shortRefMatch) {
        return Number(shortRefMatch[1]);
      }

      return null;
    },
  };
}

function addIssueNumbers(refs, references, extractIssueNumber) {
  for (const reference of references) {
    const issueNumber = extractIssueNumber(reference);
    if (issueNumber !== null) {
      refs.add(issueNumber);
    }
  }
}

export function parseClosingIssueNumbers(text, owner, repo) {
  const refs = new Set();
  const { issueReferenceSource, extractIssueNumber } = createIssueReferenceConfig(owner, repo);
  const closingClausePattern = new RegExp(
    String.raw`\b(?:close|closes|closed|fix|fixes|fixed|resolve|resolves|resolved)\b\s*:?\s*(?:issues?\s+)?((?:${issueReferenceSource})(?:\s*(?:,\s*|(?:and|or)\s+)(?:${issueReferenceSource}))*)`,
    'gi',
  );

  for (const line of text.split(/\r?\n/)) {
    for (const clauseMatch of line.matchAll(closingClausePattern)) {
      const references = clauseMatch[1].match(new RegExp(issueReferenceSource, 'gi')) || [];
      addIssueNumbers(refs, references, extractIssueNumber);
    }
  }

  return [...refs];
}

export function parseRelatedIssueNumbers(text, owner, repo) {
  const refs = new Set();
  const { issueReferenceSource, extractIssueNumber } = createIssueReferenceConfig(owner, repo);
  const relatedClausePattern = new RegExp(
    String.raw`\b(?:related|parent(?:\s+epic)?)\b\s*:?\s*((?:${issueReferenceSource})(?:\s*(?:,\s*|(?:and|or)\s+)(?:${issueReferenceSource}))*)`,
    'gi',
  );

  for (const line of text.split(/\r?\n/)) {
    for (const clauseMatch of line.matchAll(relatedClausePattern)) {
      const references = clauseMatch[1].match(new RegExp(issueReferenceSource, 'gi')) || [];
      addIssueNumbers(refs, references, extractIssueNumber);
    }
  }

  return [...refs];
}

export function parseTaskListIssueNumbers(text, owner, repo) {
  const refs = new Set();
  const { issueReferenceSource, extractIssueNumber } = createIssueReferenceConfig(owner, repo);
  const taskListPattern = /^\s*[-*]\s+\[(?: |x|X)\]\s+(.*)$/;

  for (const line of text.split(/\r?\n/)) {
    const taskMatch = line.match(taskListPattern);
    if (!taskMatch) {
      continue;
    }

    const references = taskMatch[1].match(new RegExp(issueReferenceSource, 'gi')) || [];
    addIssueNumbers(refs, references, extractIssueNumber);
  }

  return [...refs];
}

async function githubRequest(path, init = {}) {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error('Missing GITHUB_TOKEN.');
  }

  const response = await fetch(`${REST_API_BASE}${path}`, {
    ...init,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'User-Agent': 'kynd-web-issue-hygiene',
      ...(init.headers || {}),
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`GitHub REST ${response.status} for ${path}: ${body}`);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

async function graphqlRequest(query, variables) {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error('Missing GITHUB_TOKEN.');
  }

  const response = await fetch(GRAPHQL_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'User-Agent': 'kynd-web-issue-hygiene',
    },
    body: JSON.stringify({ query, variables }),
  });

  const payload = await response.json();

  if (!response.ok || payload.errors?.length) {
    throw new Error(`GitHub GraphQL request failed: ${JSON.stringify(payload.errors || payload)}`);
  }

  return payload.data;
}

async function updateProjectStatus(issueNodeId, config) {
  if (!config.projectNumber) {
    return null;
  }

  const projectQuery = `
    query IssueProjectLookup($login: String!, $projectNumber: Int!, $issueId: ID!) {
      organization(login: $login) {
        projectV2(number: $projectNumber) {
          id
          title
          fields(first: 100) {
            nodes {
              __typename
              ... on ProjectV2FieldCommon {
                id
                name
              }
              ... on ProjectV2SingleSelectField {
                options {
                  id
                  name
                }
              }
            }
          }
        }
      }
      user(login: $login) {
        projectV2(number: $projectNumber) {
          id
          title
          fields(first: 100) {
            nodes {
              __typename
              ... on ProjectV2FieldCommon {
                id
                name
              }
              ... on ProjectV2SingleSelectField {
                options {
                  id
                  name
                }
              }
            }
          }
        }
      }
      node(id: $issueId) {
        ... on Issue {
          projectItems(first: 100) {
            nodes {
              id
              project {
                ... on ProjectV2 {
                  id
                }
              }
            }
          }
        }
      }
    }
  `;

  const projectData = await graphqlRequest(projectQuery, {
    login: config.projectOwner,
    projectNumber: config.projectNumber,
    issueId: issueNodeId,
  });

  const project = projectData.organization?.projectV2 || projectData.user?.projectV2 || null;

  if (!project) {
    log(
      `Project ${config.projectOwner} #${config.projectNumber} was not found; skipping project sync.`,
    );
    return null;
  }

  const statusField = project.fields.nodes.find(
    (field) =>
      field?.name === config.statusFieldName && field.__typename === 'ProjectV2SingleSelectField',
  );

  if (!statusField) {
    log(
      `Project field "${config.statusFieldName}" was not found on project ${config.projectNumber}; skipping project sync.`,
    );
    return null;
  }

  const doneOption = statusField.options.find((option) => option.name === config.doneOptionName);

  if (!doneOption) {
    log(
      `Project option "${config.doneOptionName}" was not found on field "${config.statusFieldName}"; skipping project sync.`,
    );
    return null;
  }

  const projectItem = projectData.node?.projectItems?.nodes.find(
    (item) => item.project?.id === project.id,
  );

  if (!projectItem) {
    log(`Issue is not on project ${config.projectNumber}; skipping project sync.`);
    return null;
  }

  const mutation = `
    mutation UpdateProjectStatus(
      $projectId: ID!
      $itemId: ID!
      $fieldId: ID!
      $optionId: String!
    ) {
      updateProjectV2ItemFieldValue(
        input: {
          projectId: $projectId
          itemId: $itemId
          fieldId: $fieldId
          value: { singleSelectOptionId: $optionId }
        }
      ) {
        projectV2Item {
          id
        }
      }
    }
  `;

  await graphqlRequest(mutation, {
    projectId: project.id,
    itemId: projectItem.id,
    fieldId: statusField.id,
    optionId: doneOption.id,
  });

  return `Updated project status to \`${config.doneOptionName}\``;
}

async function closeIssue(owner, repo, issueNumber) {
  return githubRequest(`/repos/${owner}/${repo}/issues/${issueNumber}`, {
    method: 'PATCH',
    body: JSON.stringify({
      state: 'closed',
      state_reason: 'completed',
    }),
  });
}

async function deleteLabel(owner, repo, issueNumber, labelName) {
  return githubRequest(
    `/repos/${owner}/${repo}/issues/${issueNumber}/labels/${encodeURIComponent(labelName)}`,
    { method: 'DELETE' },
  );
}

async function addComment(owner, repo, issueNumber, body) {
  return githubRequest(`/repos/${owner}/${repo}/issues/${issueNumber}/comments`, {
    method: 'POST',
    body: JSON.stringify({ body }),
  });
}

async function fetchIssue(owner, repo, issueNumber) {
  return githubRequest(`/repos/${owner}/${repo}/issues/${issueNumber}`);
}

async function processIssue(owner, repo, issueNumber, pullRequest, config) {
  const issue = await fetchIssue(owner, repo, issueNumber);

  if (issue.pull_request) {
    log(`#${issueNumber} is a pull request, not an issue; skipping.`);
    return;
  }

  const actions = [];

  if (issue.state !== 'closed') {
    await closeIssue(owner, repo, issueNumber);
    actions.push('Closed as completed');
  }

  const labels = (issue.labels || []).map((label) => label.name).filter(Boolean);
  const blockedLabels = labels.filter((label) => config.blockedLabels.has(label.toLowerCase()));

  for (const label of blockedLabels) {
    await deleteLabel(owner, repo, issueNumber, label);
  }

  if (blockedLabels.length > 0) {
    actions.push(
      `Removed blocker label${blockedLabels.length > 1 ? 's' : ''}: ${blockedLabels
        .map((label) => `\`${label}\``)
        .join(', ')}`,
    );
  }

  const projectAction = await updateProjectStatus(issue.node_id, config);
  if (projectAction) {
    actions.push(projectAction);
  }

  if (actions.length === 0) {
    log(`#${issueNumber} did not need any updates.`);
    return;
  }

  await addComment(
    owner,
    repo,
    issueNumber,
    [
      `Updated automatically after PR #${pullRequest.number} merged into \`${pullRequest.base.ref}\`.`,
      '',
      ...actions.map((action) => `- ${action}`),
      '',
      pullRequest.html_url,
    ].join('\n'),
  );

  log(`#${issueNumber}: ${actions.join('; ')}.`);
}

export async function processLinkedIssues(
  owner,
  repo,
  linkedIssueNumbers,
  pullRequest,
  config,
  processIssueFn = processIssue,
) {
  const failedIssueNumbers = [];

  for (const issueNumber of linkedIssueNumbers) {
    try {
      await processIssueFn(owner, repo, issueNumber, pullRequest, config);
    } catch (error) {
      const message = error instanceof Error ? error.stack || error.message : String(error);
      fail(`Failed to process issue #${issueNumber}: ${message}`);
      failedIssueNumbers.push(issueNumber);
    }
  }

  if (failedIssueNumbers.length > 0) {
    throw new Error(
      `Issue hygiene failed for ${failedIssueNumbers.length} issue(s): ${failedIssueNumbers
        .map((issueNumber) => `#${issueNumber}`)
        .join(', ')}`,
    );
  }
}

export async function processReadyRelatedIssues(
  owner,
  repo,
  relatedIssueNumbers,
  pullRequest,
  config,
  { loadIssueFn = fetchIssue, processIssueFn = processIssue } = {},
) {
  const seenIssueNumbers = new Set();

  for (const issueNumber of relatedIssueNumbers) {
    if (seenIssueNumbers.has(issueNumber)) {
      continue;
    }

    seenIssueNumbers.add(issueNumber);

    const issue = await loadIssueFn(owner, repo, issueNumber);

    if (issue.pull_request) {
      log(`#${issueNumber} is a pull request, not an issue; skipping related issue sync.`);
      continue;
    }

    if (issue.state === 'closed') {
      log(`#${issueNumber} is already closed; skipping related issue sync.`);
      continue;
    }

    const taskListIssueNumbers = parseTaskListIssueNumbers(issue.body || '', owner, repo);
    if (taskListIssueNumbers.length === 0) {
      log(`#${issueNumber} has no issue task list; skipping related issue sync.`);
      continue;
    }

    let allTaskListIssuesClosed = true;

    for (const taskListIssueNumber of taskListIssueNumbers) {
      const taskIssue = await loadIssueFn(owner, repo, taskListIssueNumber);
      if (taskIssue.state !== 'closed') {
        allTaskListIssuesClosed = false;
        break;
      }
    }

    if (!allTaskListIssuesClosed) {
      log(`#${issueNumber} still has open checklist issues; skipping related issue sync.`);
      continue;
    }

    await processIssueFn(owner, repo, issueNumber, pullRequest, config);
  }
}

function toErrorMessage(error) {
  return error instanceof Error ? error.message : String(error);
}

export async function processIssueGroups(
  owner,
  repo,
  linkedIssueNumbers,
  relatedIssueNumbers,
  pullRequest,
  config,
  {
    processLinkedIssuesFn = processLinkedIssues,
    processReadyRelatedIssuesFn = processReadyRelatedIssues,
  } = {},
) {
  const groupFailures = [];

  try {
    await processLinkedIssuesFn(owner, repo, linkedIssueNumbers, pullRequest, config);
  } catch (error) {
    const message = toErrorMessage(error);
    fail(`Linked issue sync failed: ${message}`);
    groupFailures.push(`linked issues: ${message}`);
  }

  try {
    await processReadyRelatedIssuesFn(owner, repo, relatedIssueNumbers, pullRequest, config);
  } catch (error) {
    const message = toErrorMessage(error);
    fail(`Related issue sync failed: ${message}`);
    groupFailures.push(`related issues: ${message}`);
  }

  if (groupFailures.length > 0) {
    throw new Error(`Issue hygiene had failures in ${groupFailures.join('; ')}`);
  }
}

export async function main() {
  const eventPath = process.env.GITHUB_EVENT_PATH;
  if (!eventPath) {
    throw new Error('Missing GITHUB_EVENT_PATH.');
  }

  const event = JSON.parse(await readFile(eventPath, 'utf8'));
  const pullRequest = event.pull_request;

  if (!pullRequest?.merged) {
    log('Pull request was not merged; nothing to do.');
    return;
  }

  const [owner, repo] = (process.env.GITHUB_REPOSITORY || '').split('/');
  if (!owner || !repo) {
    throw new Error('Missing GITHUB_REPOSITORY.');
  }

  const allowedBaseBranches = new Set(
    parseCsv(process.env.ISSUE_HYGIENE_BASE_BRANCHES, ['main', 'overhaul']),
  );

  if (!allowedBaseBranches.has(pullRequest.base.ref)) {
    log(`Base branch "${pullRequest.base.ref}" is not configured for issue hygiene; skipping.`);
    return;
  }

  const linkedIssueNumbers = parseClosingIssueNumbers(
    `${pullRequest.title || ''}\n${pullRequest.body || ''}`,
    owner,
    repo,
  );
  const relatedIssueNumbers = parseRelatedIssueNumbers(
    `${pullRequest.title || ''}\n${pullRequest.body || ''}`,
    owner,
    repo,
  ).filter((issueNumber) => !linkedIssueNumbers.includes(issueNumber));

  if (linkedIssueNumbers.length === 0 && relatedIssueNumbers.length === 0) {
    log('No closing or related issue references found in the merged PR.');
    return;
  }

  const config = {
    blockedLabels: new Set(
      parseCsv(process.env.ISSUE_HYGIENE_BLOCKED_LABELS, ['blocked']).map((label) =>
        label.toLowerCase(),
      ),
    ),
    doneOptionName: process.env.ISSUE_HYGIENE_DONE_OPTION_NAME?.trim() || 'Done',
    projectNumber: Number.parseInt(process.env.ISSUE_HYGIENE_PROJECT_NUMBER || '', 10),
    projectOwner: process.env.ISSUE_HYGIENE_PROJECT_OWNER?.trim() || owner,
    statusFieldName: process.env.ISSUE_HYGIENE_STATUS_FIELD_NAME?.trim() || 'Status',
  };

  await processIssueGroups(
    owner,
    repo,
    linkedIssueNumbers,
    relatedIssueNumbers,
    pullRequest,
    config,
  );
}

const isDirectRun = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isDirectRun) {
  main().catch((error) => {
    fail(error instanceof Error ? error.stack || error.message : String(error));
    process.exitCode = 1;
  });
}
