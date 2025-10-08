#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// resolve project root
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const baseDir = path.join(projectRoot, 'src/content/handbook');

const template = (title, order) => `---
title: '${capitalize(title)}'
order: ${order}
---

import Prose from '@/components/Prose.astro';

<Prose align="left">
  <p>Write your content here…</p>
</Prose>

<Prose align="right">
  <h3>Section Title</h3>
  <ul>
    <li>Example item</li>
  </ul>
</Prose>
`;

// slugify for filename: lowercase, remove accents, replace spaces
function slugify(str) {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove accents
    .replace(/æ/g, 'ae')
    .replace(/Æ/g, 'ae')
    .replace(/ø/g, 'o')
    .replace(/Ø/g, 'o')
    .replace(/å/g, 'a')
    .replace(/Å/g, 'a')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-') // replace non-alphanumerics with -
    .replace(/^-+|-+$/g, ''); // trim -
}

// pad number with leading zeros (e.g. 01, 02, 10)
function pad(num, size = 2) {
  let s = String(num);
  while (s.length < size) s = '0' + s;
  return s;
}

// capitalize first letter of string
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// get highest order in existing files
function getMaxOrder() {
  if (!fs.existsSync(baseDir)) return 0;

  const files = fs.readdirSync(baseDir).filter((f) => f.endsWith('.mdx'));
  let maxOrder = 0;

  files.forEach((file) => {
    const content = fs.readFileSync(path.join(baseDir, file), 'utf8');
    const match = content.match(/order:\s*(\d+)/);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num > maxOrder) maxOrder = num;
    }
  });

  return maxOrder;
}

const titles = process.argv.slice(2);

if (titles.length === 0) {
  console.error('Usage: node scripts/create-handbook.js "Title One" "Title Two" ...');
  process.exit(1);
}

if (!fs.existsSync(baseDir)) {
  fs.mkdirSync(baseDir, { recursive: true });
}

let currentOrder = getMaxOrder();

titles.forEach((title) => {
  const slug = slugify(title);
  currentOrder++;
  const filename = `${pad(currentOrder)}-${slug}.mdx`;
  const fullPath = path.join(baseDir, filename);

  if (fs.existsSync(fullPath)) {
    console.log(`⚠️ Skipping ${filename}, already exists.`);
    return;
  }

  fs.writeFileSync(fullPath, template(title, currentOrder));
  console.log(`✅ Created ${fullPath} (order: ${currentOrder}, title: "${title}")`);
});
