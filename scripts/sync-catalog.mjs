import { copyFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const source = resolve(root, 'catalog/apps.json');
const destination = resolve(root, 'apps/platform/public/catalog/apps.json');

mkdirSync(dirname(destination), { recursive: true });
copyFileSync(source, destination);

console.log('Synced catalog/apps.json to the platform public assets.');

