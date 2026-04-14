/* global console, process */

import { pathToFileURL } from 'node:url';

export * from './issue-hygiene/index.mjs';
export * from './issue-hygiene/parse-issues.mjs';
import { main } from './issue-hygiene/index.mjs';

function fail(message) {
  console.error(`[issue-hygiene] ${message}`);
}

const isDirectRun = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isDirectRun) {
  main().catch((error) => {
    fail(error instanceof Error ? error.stack || error.message : String(error));
    process.exitCode = 1;
  });
}
