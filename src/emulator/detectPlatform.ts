import type { GameSystem } from '../types/rom';

export function systemFromExtension(filename: string): GameSystem {
  const lower = filename.toLowerCase();
  if (lower.endsWith('.gba')) return 'gba';
  if (lower.endsWith('.gbc')) return 'gbc';
  return 'gb';
}

export function nativeCanvasSize(system: GameSystem): { width: number; height: number } {
  if (system === 'gba') {
    return { width: 240, height: 160 };
  }
  return { width: 160, height: 144 };
}

export type LayoutMode = 'portrait' | 'landscape';

export function defaultLayoutForSystem(system: GameSystem): LayoutMode {
  return system === 'gba' ? 'landscape' : 'portrait';
}

export function resolveLayout(
  system: GameSystem,
  viewportPortrait: boolean,
): LayoutMode {
  if (system === 'gba') {
    return viewportPortrait ? 'portrait' : 'landscape';
  }
  if (system === 'gb' || system === 'gbc') {
    return viewportPortrait ? 'portrait' : 'landscape';
  }
  return viewportPortrait ? 'portrait' : 'landscape';
}

export function preferLandscapeForSystem(system: GameSystem): boolean {
  return system === 'gba';
}
