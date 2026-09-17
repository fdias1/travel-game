import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import { execSync } from 'node:child_process';

const base = process.env.VITE_BASE ?? '/travel-game/';

function runSetupScripts() {
  execSync('node scripts/copy-mgba-wasm.mjs', { stdio: 'inherit' });
  execSync('node scripts/generate-rom-manifest.mjs', { stdio: 'inherit' });
}

export default defineConfig({
  base,
  plugins: [
    {
      name: 'travel-game-setup',
      buildStart() {
        runSetupScripts();
      },
    },
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
      injectManifest: {
        globPatterns: [
          '**/*.{js,css,html,ico,png,svg,wasm,gb,gbc,gba,json,webmanifest,txt}',
          'roms/**/*',
        ],
        maximumFileSizeToCacheInBytes: 32 * 1024 * 1024,
      },
      includeAssets: ['wasm/**/*', 'icons/**/*'],
      manifest: {
        name: 'Travel Game',
        short_name: 'Travel Game',
        description: 'Offline GB / GBC / GBA emulator',
        theme_color: '#1a1a2e',
        background_color: '#1a1a2e',
        display: 'standalone',
        orientation: 'any',
        start_url: base,
        scope: base,
        icons: [
          {
            src: `${base}favicon.svg`.replace(/\/+/g, '/'),
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any',
          },
        ],
      },
      devOptions: {
        enabled: true,
        type: 'module',
      },
    }),
  ],
  server: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
  },
  preview: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
  },
});
