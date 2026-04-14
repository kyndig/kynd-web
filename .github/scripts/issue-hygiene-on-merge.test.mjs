import assert from 'node:assert/strict';
import test from 'node:test';

import {
  parseClosingIssueNumbers,
  parseRelatedIssueNumbers,
  parseTaskListIssueNumbers,
  processIssueGroups,
  processLinkedIssues,
  processReadyRelatedIssues,
} from './issue-hygiene-on-merge.mjs';

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

test('parseRelatedIssueNumbers only collects explicit related references', () => {
  const relatedIssueNumbers = parseRelatedIssueNumbers(
    [
      'Related: #29 and kynd-no/kynd-web#30',
      'Parent epic: https://github.com/kynd-no/kynd-web/issues/31',
      'See #32 for context.',
    ].join('\n'),
    'kynd-no',
    'kynd-web',
  );

  assert.deepEqual(relatedIssueNumbers, [29, 30, 31]);
});

test('parseTaskListIssueNumbers only reads issue references from markdown task lists', () => {
  const taskListIssueNumbers = parseTaskListIssueNumbers(
    [
      '- [x] #35 [page-home] Rebuild Home page from Stitch',
      '- [ ] kynd-no/kynd-web#36 [page-services] Rebuild Services page from Stitch',
      'Blocked by: #29',
    ].join('\n'),
    'kynd-no',
    'kynd-web',
  );

  assert.deepEqual(taskListIssueNumbers, [35, 36]);
});

test('processReadyRelatedIssues closes a related parent once every checklist issue is closed', async () => {
  const processedIssues = [];
  const pullRequest = {
    base: { ref: 'overhaul' },
    html_url: 'https://github.com/kynd-no/kynd-web/pull/123',
    number: 123,
  };
  const issueMap = {
    29: {
      body: ['- [x] #35', '- [x] #36'].join('\n'),
      state: 'open',
    },
    35: { body: '', state: 'closed' },
    36: { body: '', state: 'closed' },
  };

  await processReadyRelatedIssues(
    'kynd-no',
    'kynd-web',
    [29],
    pullRequest,
    { blockedLabels: new Set() },
    {
      loadIssueFn: async (_owner, _repo, issueNumber) => issueMap[issueNumber],
      processIssueFn: async (_owner, _repo, issueNumber) => {
        processedIssues.push(issueNumber);
      },
    },
  );

  assert.deepEqual(processedIssues, [29]);
});

test('processIssueGroups still processes related issues when linked processing fails', async () => {
  const callOrder = [];
  const pullRequest = {
    base: { ref: 'overhaul' },
    html_url: 'https://github.com/kynd-no/kynd-web/pull/123',
    number: 123,
  };

  await assert.rejects(
    () =>
      processIssueGroups(
        'kynd-no',
        'kynd-web',
        [10],
        [29],
        pullRequest,
        { blockedLabels: new Set() },
        {
          processLinkedIssuesFn: async () => {
            callOrder.push('linked');
            throw new Error('linked failure');
          },
          processReadyRelatedIssuesFn: async () => {
            callOrder.push('related');
          },
        },
      ),
    /Issue hygiene had failures in linked issues: linked failure/,
  );

  assert.deepEqual(callOrder, ['linked', 'related']);
});

test('processIssueGroups reports both linked and related failures together', async () => {
  const pullRequest = {
    base: { ref: 'overhaul' },
    html_url: 'https://github.com/kynd-no/kynd-web/pull/123',
    number: 123,
  };

  await assert.rejects(
    () =>
      processIssueGroups(
        'kynd-no',
        'kynd-web',
        [10],
        [29],
        pullRequest,
        { blockedLabels: new Set() },
        {
          processLinkedIssuesFn: async () => {
            throw new Error('linked failure');
          },
          processReadyRelatedIssuesFn: async () => {
            throw new Error('related failure');
          },
        },
      ),
    /Issue hygiene had failures in linked issues: linked failure; related issues: related failure/,
  );
});
