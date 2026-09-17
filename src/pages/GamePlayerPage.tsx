import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import manifest from '../generated/rom-manifest.json';
import { EmulatorCanvas } from '../components/EmulatorCanvas';
import { SaveStateDrawer } from '../components/SaveStateDrawer';
import { VirtualGamepad } from '../components/VirtualGamepad/VirtualGamepad';
import { useAutosave, useEmulator } from '../emulator/EmulatorContext';
import { useKeyboardControls } from '../hooks/useKeyboardControls';
import {
  defaultLayoutForSystem,
  preferLandscapeForSystem,
  resolveLayout,
  type LayoutMode,
} from '../emulator/detectPlatform';
import type { RomEntry } from '../types/rom';

const roms = manifest as RomEntry[];

function useViewportPortrait() {
  const [portrait, setPortrait] = useState(() => window.matchMedia('(orientation: portrait)').matches);

  useEffect(() => {
    const mq = window.matchMedia('(orientation: portrait)');
    const handler = () => setPortrait(mq.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return portrait;
}

export function GamePlayerPage() {
  const { romId } = useParams<{ romId: string }>();
  const navigate = useNavigate();
  const rom = useMemo(() => roms.find((entry) => entry.id === romId), [romId]);
  const viewportPortrait = useViewportPortrait();
  const [layoutOverride, setLayoutOverride] = useState<LayoutMode | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [bootError, setBootError] = useState<string | null>(null);
  const [started, setStarted] = useState(false);
  const { status, module, loadRomAsset, quitGame, saveStateToSlot, loadStateFromSlot, syncPersistence } =
    useEmulator();

  useKeyboardControls(module, started);

  const layout =
    layoutOverride ??
    (rom ? resolveLayout(rom.system, viewportPortrait) : defaultLayoutForSystem('gba'));

  useAutosave(rom?.id ?? null, started);

  useEffect(() => {
    if (!rom) return;
    if (preferLandscapeForSystem(rom.system) && !viewportPortrait) {
      void screen.orientation?.lock?.('landscape').catch(() => undefined);
    }
    return () => {
      void screen.orientation?.unlock?.();
    };
  }, [rom, viewportPortrait]);

  const handleStart = useCallback(async () => {
    if (!rom) return;
    setBootError(null);
    const assetUrl = `${import.meta.env.BASE_URL}${rom.path}`;
    const filename = rom.path.split('/').pop() ?? rom.path;
    try {
      const ok = await loadRomAsset({
        romId: rom.id,
        assetUrl,
        filename,
        system: rom.system,
      });
      if (!ok) {
        setBootError('Could not load this ROM.');
        return;
      }
      setStarted(true);
    } catch (error) {
      setBootError(error instanceof Error ? error.message : 'Failed to load ROM');
    }
  }, [loadRomAsset, rom]);

  const handleExit = useCallback(async () => {
    if (rom) {
      await syncPersistence(rom.id);
    }
    quitGame();
    navigate('/');
  }, [navigate, quitGame, rom, syncPersistence]);

  if (!rom) {
    return (
      <div className="page player-page">
        <p>Game not found.</p>
        <Link to="/">Back to library</Link>
      </div>
    );
  }

  return (
    <div className={`page player-page layout-${layout}`}>
      <header className="player-toolbar">
        <button type="button" className="text-btn" onClick={() => void handleExit()}>
          ← Library
        </button>
        <span className="player-title">{rom.title}</span>
        <div className="toolbar-actions">
          <button
            type="button"
            className="text-btn"
            onClick={() =>
              setLayoutOverride((current) =>
                (current ?? layout) === 'portrait' ? 'landscape' : 'portrait',
              )
            }
          >
            Rotate UI
          </button>
          <button type="button" className="text-btn" onClick={() => setDrawerOpen(true)}>
            Saves
          </button>
        </div>
      </header>

      <div className="player-stage">
        <div className="screen-shell">
          <EmulatorCanvas />
          {!started && (
            <div className="start-overlay">
              {status === 'loading' && <p>Starting emulator…</p>}
              {status === 'error' && <p className="error-text">Emulator failed to start.</p>}
              {bootError && <p className="error-text">{bootError}</p>}
              <button type="button" className="primary-btn" onClick={() => void handleStart()}>
                Play
              </button>
            </div>
          )}
        </div>
        {started && <VirtualGamepad layout={layout} />}
      </div>

      <SaveStateDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onSave={(slot) => {
          void saveStateToSlot(rom.id, slot);
        }}
        onLoad={(slot) => {
          void loadStateFromSlot(rom.id, slot);
        }}
      />
    </div>
  );
}
