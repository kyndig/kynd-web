/* global console, process */

import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import {
  parseClosingIssueNumbers,
  parseRelatedIssueNumbers,
  parseTaskListIssueNumbers,
} from './parse-issues.mjs';
import { createProcessIssue, fetchIssue } from './issue-operations.mjs';

// Optional repository variables:
// - ISSUE_HYGIENE_BASE_BRANCHES=main,overhaul
// - ISSUE_HYGIENE_BLOCKED_LABELS=blocked,blocked-by-dependency
// - ISSUE_HYGIENE_PROJECT_OWNER=kynd
// - ISSUE_HYGIENE_PROJECT_NUMBER=1
// - ISSUE_HYGIENE_STATUS_FIELD_NAME=Status
// - ISSUE_HYGIENE_DONE_OPTION_NAME=Done

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

const processIssue = createProcessIssue({ log });

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
