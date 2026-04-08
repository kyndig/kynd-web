import assert from 'node:assert/strict';
import test from 'node:test';

import { parseClosingIssueNumbers, processLinkedIssues } from './issue-hygiene-on-merge.mjs';

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

test('parseClosingIssueNumbers only closes references directly attached to a closing keyword', () => {
  const closingIssueNumbers = parseClosingIssueNumbers(
    [
      'Resolves #10, see #20 for context.',
      'Fixed the bug reported in #30.',
      'Closes #40 and kynd-no/kynd-web#41.',
      'Fixes https://github.com/kynd-no/kynd-web/issues/42.',
    ].join('\n'),
    'kynd-no',
    'kynd-web',
  );

  assert.deepEqual(closingIssueNumbers, [10, 40, 41, 42]);
});
