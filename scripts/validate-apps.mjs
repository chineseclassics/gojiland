import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const catalog = JSON.parse(readFileSync(resolve(root, 'catalog/apps.json'), 'utf8'));
const ids = new Set();
const errors = [];

for (const app of catalog) {
  if (!app.id || ids.has(app.id)) errors.push(`Invalid or duplicate app id: ${app.id}`);
  ids.add(app.id);

  for (const field of ['title', 'description', 'subject', 'ageRange', 'status', 'url']) {
    if (!app[field]) errors.push(`${app.id || 'unknown'} is missing ${field}`);
  }

  if (!['draft', 'published', 'archived'].includes(app.status)) {
    errors.push(`${app.id} has unsupported status ${app.status}`);
  }

  if (!existsSync(resolve(root, 'apps', app.id, 'package.json'))) {
    errors.push(`${app.id} has no matching apps/${app.id}/package.json`);
  }
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}

console.log(`Validated ${catalog.length} GojiLand app.`);

