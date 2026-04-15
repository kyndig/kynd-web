import { githubRequest } from './github-client.mjs';
import { updateProjectStatus } from './project-sync.mjs';

function defaultLog(message) {
  console.log(`[issue-hygiene] ${message}`);
}

export async function closeIssue(
  owner,
  repo,
  issueNumber,
  { githubRequestFn = githubRequest } = {},
) {
  return githubRequestFn(`/repos/${owner}/${repo}/issues/${issueNumber}`, {
    method: 'PATCH',
    body: JSON.stringify({
      state: 'closed',
      state_reason: 'completed',
    }),
  });
}

export async function deleteLabel(
  owner,
  repo,
  issueNumber,
  labelName,
  { githubRequestFn = githubRequest } = {},
) {
  return githubRequestFn(
    `/repos/${owner}/${repo}/issues/${issueNumber}/labels/${encodeURIComponent(labelName)}`,
    { method: 'DELETE' },
  );
}

export async function addComment(
  owner,
  repo,
  issueNumber,
  body,
  { githubRequestFn = githubRequest } = {},
) {
  return githubRequestFn(`/repos/${owner}/${repo}/issues/${issueNumber}/comments`, {
    method: 'POST',
    body: JSON.stringify({ body }),
  });
}

export async function fetchIssue(
  owner,
  repo,
  issueNumber,
  { githubRequestFn = githubRequest } = {},
) {
  return githubRequestFn(`/repos/${owner}/${repo}/issues/${issueNumber}`);
}

export function createProcessIssue({
  addCommentFn = addComment,
  closeIssueFn = closeIssue,
  deleteLabelFn = deleteLabel,
  fetchIssueFn = fetchIssue,
  log = defaultLog,
  updateProjectStatusFn = updateProjectStatus,
} = {}) {
  return async function processIssue(owner, repo, issueNumber, pullRequest, config) {
    const issue = await fetchIssueFn(owner, repo, issueNumber);

    if (issue.pull_request) {
      log(`#${issueNumber} is a pull request, not an issue; skipping.`);
      return;
    }

    const actions = [];

    if (issue.state !== 'closed') {
      await closeIssueFn(owner, repo, issueNumber);
      actions.push('Closed as completed');
    }

    const labels = (issue.labels || []).map((label) => label.name).filter(Boolean);
    const blockedLabels = labels.filter((label) => config.blockedLabels.has(label.toLowerCase()));

    for (const label of blockedLabels) {
      await deleteLabelFn(owner, repo, issueNumber, label);
    }

    if (blockedLabels.length > 0) {
      actions.push(
        `Removed blocker label${blockedLabels.length > 1 ? 's' : ''}: ${blockedLabels
          .map((label) => `\`${label}\``)
          .join(', ')}`,
      );
    }

    const projectAction = await updateProjectStatusFn(issue.node_id, config, { log });
    if (projectAction) {
      actions.push(projectAction);
    }

    if (actions.length === 0) {
      log(`#${issueNumber} did not need any updates.`);
      return;
    }

    await addCommentFn(
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
  };
}
