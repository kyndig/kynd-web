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
