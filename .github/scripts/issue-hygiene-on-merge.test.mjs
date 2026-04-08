import assert from 'node:assert/strict';
import test from 'node:test';

import { processLinkedIssues } from './issue-hygiene-on-merge.mjs';

test('processLinkedIssues continues after a per-issue failure and reports all failed issue numbers', async () => {
  const attemptedIssues = [];
  const pullRequest = {
    base: { ref: 'overhaul' },
    html_url: 'https://github.com/kynd-no/kynd-web/pull/123',
    number: 123,
  };

  const processIssueStub = async (_owner, _repo, issueNumber) => {
    attemptedIssues.push(issueNumber);

    if (issueNumber === 20 || issueNumber === 40) {
      throw new Error(`simulated failure for #${issueNumber}`);
    }
  };

  await assert.rejects(
    () =>
      processLinkedIssues(
        'kynd-no',
        'kynd-web',
        [10, 20, 30, 40],
        pullRequest,
        { blockedLabels: new Set() },
        processIssueStub,
      ),
    /Issue hygiene failed for 2 issue\(s\): #20, #40/,
  );

  assert.deepEqual(attemptedIssues, [10, 20, 30, 40]);
});
