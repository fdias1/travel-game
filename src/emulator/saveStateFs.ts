import type * as MGBA from '@thenick775/mgba-wasm';

type MgbaModule = MGBA.mGBAEmulator;

function normalizePath(path: string) {
  return path.replace(/\/+/g, '/');
}

function romBaseFile(module: MgbaModule): string | null {
  const gameName = module.gameName;
  if (!gameName) return null;
  return gameName.split('/').pop() ?? null;
}

/** Paths mGBA may use for a manual save-state slot */
export function saveStatePathCandidates(module: MgbaModule, slot: number): string[] {
  const baseFile = romBaseFile(module);
  if (!baseFile) return [];

  const { saveStatePath } = module.filePaths();
  const stem = baseFile.replace(/\.(gba|gbc|gb)$/i, '');
  const names = [
    `${baseFile}.ss${slot}`,
    `${stem}.ss${slot}`,
    `${baseFile}.ss${slot + 1}`,
    `${stem}.ss${slot + 1}`,
  ];

  return [...new Set(names.map((name) => normalizePath(`${saveStatePath}/${name}`)))];
}

export function findSaveStatePath(module: MgbaModule, slot: number): string | null {
  for (const path of saveStatePathCandidates(module, slot)) {
    try {
      if (module.FS.analyzePath(path).exists) {
        return path;
      }
    } catch {
      // ignore missing paths
    }
  }

  try {
    const { saveStatePath } = module.filePaths();
    const suffixes = [`.ss${slot}`, `.ss${slot + 1}`];
    const files = module.FS.readdir(saveStatePath) as string[];
    const match = files.find(
      (file) => suffixes.some((suffix) => file.endsWith(suffix)) && !file.startsWith('.'),
    );
    if (match) {
      return normalizePath(`${saveStatePath}/${match}`);
    }
  } catch {
    // ignore
  }

  return saveStatePathCandidates(module, slot)[0] ?? null;
}

export function readSaveStateSlot(module: MgbaModule, slot: number): Uint8Array | null {
  const path = findSaveStatePath(module, slot);
  if (!path) return null;
  try {
    return module.FS.readFile(path);
  } catch {
    return null;
  }
}

export function writeSaveStateSlot(
  module: MgbaModule,
  slot: number,
  data: Uint8Array,
): string | null {
  const path = findSaveStatePath(module, slot) ?? saveStatePathCandidates(module, slot)[0];
  if (!path) return null;
  module.FS.writeFile(path, data);
  return path;
}
