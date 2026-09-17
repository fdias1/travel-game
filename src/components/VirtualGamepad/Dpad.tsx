import { GameButton } from './GameButton';
import type { MgbaButton } from '../../emulator/mgbaBindings';

interface DpadProps {
  onPress: (button: MgbaButton) => void;
  onRelease: (button: MgbaButton) => void;
}

export function Dpad({ onPress, onRelease }: DpadProps) {
  return (
    <div className="dpad" aria-label="Directional pad">
      <GameButton label="Up" button="Up" className="dpad-up" onPress={onPress} onRelease={onRelease} />
      <GameButton label="Left" button="Left" className="dpad-left" onPress={onPress} onRelease={onRelease} />
      <GameButton label="Right" button="Right" className="dpad-right" onPress={onPress} onRelease={onRelease} />
      <GameButton label="Down" button="Down" className="dpad-down" onPress={onPress} onRelease={onRelease} />
    </div>
  );
}
