import type * as MGBA from '@thenick775/mgba-wasm';

type mGBAEmulator = MGBA.mGBAEmulator;

export type MgbaButton =
  | 'A'
  | 'B'
  | 'Start'
  | 'Select'
  | 'Up'
  | 'Down'
  | 'Left'
  | 'Right'
  | 'L'
  | 'R';

export function pressButton(module: mGBAEmulator, name: MgbaButton) {
  module.buttonPress(name);
}

export function releaseButton(module: mGBAEmulator, name: MgbaButton) {
  module.buttonUnpress(name);
}

export async function syncFilesystem(module: mGBAEmulator) {
  await module.FSSync();
}
