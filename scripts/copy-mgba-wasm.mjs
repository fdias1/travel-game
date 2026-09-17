import { cpSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const srcDir = join(root, 'node_modules', '@thenick775', 'mgba-wasm', 'dist');
const destDir = join(root, 'public', 'wasm');

if (!existsSync(srcDir)) {
  console.error('Missing @thenick775/mgba-wasm dist. Run npm install.');
  process.exit(1);
}

mkdirSync(destDir, { recursive: true });
for (const file of ['mgba.js', 'mgba.wasm']) {
  cpSync(join(srcDir, file), join(destDir, file));
}
console.log('Copied mGBA WASM assets to public/wasm/');
