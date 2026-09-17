export type GameSystem = 'gb' | 'gbc' | 'gba';

export interface RomEntry {
  id: string;
  title: string;
  path: string;
  system: GameSystem;
  cover: string | null;
}
