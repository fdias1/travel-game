# Travel Game

Offline web emulator for **Game Boy**, **Game Boy Color**, and **Game Boy Advance** (mGBA WASM core).

Repository: [github.com/fdias1/travel-game](https://github.com/fdias1/travel-game)

## Features

- GB / GBC / GBA from bundled ROM assets
- Mobile-friendly controls (portrait ≈ GBC, landscape ≈ GBA)
- PWA offline cache after first load
- Save states and battery saves in IndexedDB (browser-local)

## ROMs

Add your legally owned ROMs to [`public/roms/`](public/roms/) (`.gb`, `.gbc`, `.gba`). Run `npm run predev` or `npm run build` to refresh the library manifest.

## Development

```bash
npm install
npm run dev
```

Dev server uses COOP/COEP headers for SharedArrayBuffer. Default base path: `/travel-game/`.

Local preview (production build):

```bash
npm run build
npm run preview
```

## Deploy

### GitHub Pages (primary)

1. Push to `main`.
2. Enable **Settings → Pages → Source: GitHub Actions**.
3. Site URL: `https://fdias1.github.io/travel-game/`

The service worker applies cross-origin isolation headers required by the WASM core.

**Note:** GitHub Pages sites are **public on the internet** even when the repository is private. ROMs in the build are downloadable by anyone with the URL.

### Vercel (fallback)

Import the repo, framework **Vite**, output **`dist`**. [`vercel.json`](vercel.json) sets COOP/COEP headers (no COI service worker needed).

For Vercel, set `VITE_BASE=/` in project environment variables if you deploy at the domain root.

## License

Application code: private/personal use. See [NOTICE](NOTICE) for mGBA (MPL-2.0).
