import type * as MGBA from '@thenick775/mgba-wasm';

export type MgbaFactory = (options: {
  canvas: HTMLCanvasElement;
}) => Promise<MGBA.mGBAEmulator>;

/**
 * Loads mGBA from public/wasm at runtime. Vite forbids static/dynamic import()
 * of public assets from source, so we use an indirect import the bundler cannot analyze.
 */
export async function loadMgbaFactory(): Promise<MgbaFactory> {
  const scriptUrl = new URL(
    'wasm/mgba.js',
    `${window.location.origin}${import.meta.env.BASE_URL}`,
  ).href;

  const runtimeImport = new Function(
    'specifier',
    'return import(specifier)',
  ) as (specifier: string) => Promise<{ default: MgbaFactory }>;

  const loaded = await runtimeImport(scriptUrl);
  return loaded.default;
}
