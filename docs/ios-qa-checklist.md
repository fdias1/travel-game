# iOS / Safari QA checklist

Manual verification on iPhone Safari (and optionally Add to Home Screen):

- [ ] First visit shows boot screen, reloads once, then `crossOriginIsolated` is active (emulator starts after Play).
- [ ] Library loads; ROM cards navigate to player.
- [ ] Portrait: GBC-style control layout; landscape: GBA layout with L/R shoulders.
- [ ] Virtual buttons respond without scrolling the page.
- [ ] Tap **Play** starts audio (user gesture).
- [ ] Save / Load slots persist after closing tab and reopening the same game.
- [ ] Enable airplane mode after full load; library and games still open from cache.

Desktop smoke test: `npm run build && npm run preview` — keyboard Z/X, arrows, Enter/Backspace.
