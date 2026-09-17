import { useCallback } from 'react';
import { LandscapeLayout } from './LandscapeLayout';
import { PortraitLayout } from './PortraitLayout';
import { pressButton, releaseButton, type MgbaButton } from '../../emulator/mgbaBindings';
import { useEmulator } from '../../emulator/EmulatorContext';
import type { LayoutMode } from '../../emulator/detectPlatform';

interface VirtualGamepadProps {
  layout: LayoutMode;
}

export function VirtualGamepad({ layout }: VirtualGamepadProps) {
  const { module } = useEmulator();

  const onPress = useCallback(
    (button: MgbaButton) => {
      if (module) pressButton(module, button);
    },
    [module],
  );

  const onRelease = useCallback(
    (button: MgbaButton) => {
      if (module) releaseButton(module, button);
    },
    [module],
  );

  if (layout === 'landscape') {
    return <LandscapeLayout onPress={onPress} onRelease={onRelease} />;
  }
  return <PortraitLayout onPress={onPress} onRelease={onRelease} />;
}
