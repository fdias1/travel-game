import { readdirSync, statSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, relative, extname, basename } from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const romsDir = join(root, 'public', 'roms');
const outDir = join(root, 'src', 'generated');
const outFile = join(outDir, 'rom-manifest.json');

const EXT_SYSTEM = {
  '.gb': 'gb',
  '.gbc': 'gbc',
  '.gba': 'gba',
};

function walk(dir, files = []) {
  if (!existsSync(dir)) return files;
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) {
      walk(full, files);
    } else {
      files.push(full);
    }
  }
  return files;
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

const entries = walk(romsDir)
  .filter((f) => {
    const ext = extname(f).toLowerCase();
    return ext in EXT_SYSTEM;
  })
  .map((fullPath) => {
    const rel = relative(join(root, 'public'), fullPath).replace(/\\/g, '/');
    const ext = extname(fullPath).toLowerCase();
    const title = basename(fullPath, extname(fullPath));
    const hash = createHash('sha1').update(rel).digest('hex').slice(0, 10);
    const id = `${slugify(title)}-${hash}`;
    const coverPath = rel.replace(/\.(gb|gbc|gba)$/i, '.png');
    const coverFull = join(root, 'public', coverPath);
    return {
      id,
      title,
      path: rel,
      system: EXT_SYSTEM[ext],
      cover: existsSync(coverFull) ? coverPath : null,
    };
  })
  .sort((a, b) => a.title.localeCompare(b.title));

mkdirSync(outDir, { recursive: true });
writeFileSync(outFile, `${JSON.stringify(entries, null, 2)}\n`);
console.log(`Wrote ${entries.length} ROM(s) to src/generated/rom-manifest.json`);
