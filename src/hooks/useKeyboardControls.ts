import { useEffect } from 'react';
import { pressButton, releaseButton, type MgbaButton } from '../emulator/mgbaBindings';
import type { MgbaModule } from '../emulator/EmulatorContext';

const KEY_MAP: Record<string, MgbaButton> = {
  ArrowUp: 'Up',
  ArrowDown: 'Down',
  ArrowLeft: 'Left',
  ArrowRight: 'Right',
  KeyZ: 'B',
  KeyX: 'A',
  Enter: 'Start',
  Backspace: 'Select',
  KeyA: 'L',
  KeyS: 'R',
};

export function useKeyboardControls(module: MgbaModule | null, enabled: boolean) {
  useEffect(() => {
    if (!module || !enabled) return;

    const pressed = new Set<string>();

    const onKeyDown = (event: KeyboardEvent) => {
      const button = KEY_MAP[event.code];
      if (!button || pressed.has(event.code)) return;
      event.preventDefault();
      pressed.add(event.code);
      pressButton(module, button);
    };

    const onKeyUp = (event: KeyboardEvent) => {
      const button = KEY_MAP[event.code];
      if (!button) return;
      event.preventDefault();
      pressed.delete(event.code);
      releaseButton(module, button);
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [module, enabled]);
}
