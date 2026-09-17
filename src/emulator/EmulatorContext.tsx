import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type * as MGBA from '@thenick775/mgba-wasm';
import { nativeCanvasSize } from './detectPlatform';
import type { GameSystem } from '../types/rom';
import {
  loadAutoSaveState,
  loadSaveStateSlot,
  storeAutoSaveState,
  storeSaveStateSlot,
} from '../storage/saveStates';
import { loadBatterySave, storeBatterySave } from '../storage/batterySaves';
import { syncFilesystem } from './mgbaBindings';
import { loadMgbaFactory } from './loadMgba';
import { readSaveStateSlot, writeSaveStateSlot } from './saveStateFs';

export type MgbaModule = MGBA.mGBAEmulator;

type EmulatorStatus = 'idle' | 'loading' | 'ready' | 'error';

interface EmulatorContextValue {
  status: EmulatorStatus;
  error: string | null;
  module: MgbaModule | null;
  crossOriginReady: boolean;
  initModule: (canvas: HTMLCanvasElement) => Promise<void>;
  loadRomAsset: (params: {
    romId: string;
    assetUrl: string;
    filename: string;
    system: GameSystem;
  }) => Promise<boolean>;
  quitGame: () => void;
  saveStateToSlot: (romId: string, slot: number) => Promise<boolean>;
  loadStateFromSlot: (romId: string, slot: number) => Promise<boolean>;
  syncPersistence: (romId: string) => Promise<void>;
}

const EmulatorContext = createContext<EmulatorContextValue | null>(null);

let moduleSingleton: MgbaModule | null = null;
let modulePromise: Promise<MgbaModule> | null = null;

async function createModule(canvas: HTMLCanvasElement): Promise<MgbaModule> {
  if (moduleSingleton) {
    return moduleSingleton;
  }
  if (!modulePromise) {
    modulePromise = (async () => {
      const factory = await loadMgbaFactory();
      const instance = await factory({ canvas });
      await instance.FSInit();
      moduleSingleton = instance;
      return instance;
    })();
  }
  return modulePromise;
}

export function EmulatorProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<EmulatorStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [module, setModule] = useState<MgbaModule | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const crossOriginReady = typeof crossOriginIsolated !== 'undefined' && crossOriginIsolated;

  const initModule = useCallback(async (canvas: HTMLCanvasElement) => {
    if (!crossOriginReady) {
      setStatus('error');
      setError('Cross-origin isolation is required. Reload the page after the offline worker activates.');
      return;
    }
    canvasRef.current = canvas;
    setStatus('loading');
    setError(null);
    try {
      const instance = await createModule(canvas);
      setModule(instance);
      setStatus('ready');
    } catch (err) {
      console.error(err);
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Failed to start emulator');
    }
  }, [crossOriginReady]);

  const loadRomAsset = useCallback(
    async ({
      romId,
      assetUrl,
      filename,
      system,
    }: {
      romId: string;
      assetUrl: string;
      filename: string;
      system: GameSystem;
    }) => {
      if (!module) return false;
      const size = nativeCanvasSize(system);
      if (canvasRef.current) {
        canvasRef.current.width = size.width;
        canvasRef.current.height = size.height;
      }

      const response = await fetch(assetUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch ROM (${response.status})`);
      }
      const blob = await response.blob();
      const file = new File([blob], filename, { type: 'application/octet-stream' });

      await new Promise<void>((resolve) => {
        module.uploadRom(file, () => resolve());
      });

      const battery = await loadBatterySave(romId);
      if (battery) {
        const saveFile = new File([Uint8Array.from(battery)], `${filename}.sav`, {
          type: 'application/octet-stream',
        });
        await new Promise<void>((resolve) => {
          module.uploadSaveOrSaveState(saveFile, () => resolve());
        });
      }

      const paths = module.filePaths();
      const listed = module.listRoms();
      const romFile = listed.includes(filename) ? filename : listed.at(-1);
      if (!romFile) return false;

      const romPath = `${paths.gamePath}/${romFile}`.replace(/\/+/g, '/');
      const savePath = `${paths.savePath}/${romFile}.sav`.replace(/\/+/g, '/');
      const loaded = module.loadGame(romPath, battery ? savePath : undefined);
      if (!loaded) return false;

      module.resumeGame();
      module.resumeAudio();

      const auto = await loadAutoSaveState(romId);
      if (auto) {
        await module.uploadAutoSaveState(auto.name, auto.data);
        module.loadAutoSaveState();
      }

      for (const slot of [0, 1, 2]) {
        const data = await loadSaveStateSlot(romId, slot);
        if (!data) continue;
        writeSaveStateSlot(module, slot, data);
      }

      return true;
    },
    [module],
  );

  const syncPersistence = useCallback(
    async (romId: string) => {
      if (!module) return;
      const save = module.getSave();
      if (save) {
        await storeBatterySave(romId, save);
      }
      await syncFilesystem(module);
      const auto = module.getAutoSaveState();
      if (auto) {
        await storeAutoSaveState(romId, auto.autoSaveStateName, auto.data);
      }
    },
    [module],
  );

  const saveStateToSlot = useCallback(
    async (romId: string, slot: number) => {
      if (!module || !module.gameName) return false;

      module.resumeGame();
      const ok = module.saveState(slot);
      if (!ok) return false;

      await syncFilesystem(module);

      const data = readSaveStateSlot(module, slot);
      if (!data) return false;

      await storeSaveStateSlot(romId, slot, data);
      await syncPersistence(romId);
      return true;
    },
    [module, syncPersistence],
  );

  const loadStateFromSlot = useCallback(
    async (romId: string, slot: number) => {
      if (!module || !module.gameName) return false;

      const fromIdb = await loadSaveStateSlot(romId, slot);
      if (fromIdb) {
        writeSaveStateSlot(module, slot, fromIdb);
      }

      module.resumeGame();
      const loaded = module.loadState(slot);
      if (loaded) {
        module.resumeAudio();
      }
      return loaded;
    },
    [module],
  );

  const quitGame = useCallback(() => {
    if (!module) return;
    module.pauseGame();
    module.quitGame();
  }, [module]);

  const value = useMemo(
    () => ({
      status,
      error,
      module,
      crossOriginReady,
      initModule,
      loadRomAsset,
      quitGame,
      saveStateToSlot,
      loadStateFromSlot,
      syncPersistence,
    }),
    [
      status,
      error,
      module,
      crossOriginReady,
      initModule,
      loadRomAsset,
      quitGame,
      saveStateToSlot,
      loadStateFromSlot,
      syncPersistence,
    ],
  );

  return <EmulatorContext.Provider value={value}>{children}</EmulatorContext.Provider>;
}

export function useEmulator() {
  const ctx = useContext(EmulatorContext);
  if (!ctx) {
    throw new Error('useEmulator must be used within EmulatorProvider');
  }
  return ctx;
}

export function useAutosave(romId: string | null, active: boolean) {
  const { module, syncPersistence, saveStateToSlot } = useEmulator();

  useEffect(() => {
    if (!romId || !active || !module) return;

    const interval = window.setInterval(() => {
      void saveStateToSlot(romId, 0);
    }, 60_000);

    const onVisibility = () => {
      if (document.visibilityState === 'hidden') {
        module.forceAutoSaveState();
        void syncPersistence(romId);
      }
    };

    const onPageHide = () => {
      module.forceAutoSaveState();
      void syncPersistence(romId);
    };

    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('pagehide', onPageHide);

    return () => {
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pagehide', onPageHide);
    };
  }, [romId, active, module, syncPersistence, saveStateToSlot]);
}
