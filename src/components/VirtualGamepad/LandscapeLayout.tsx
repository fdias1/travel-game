import { Dpad } from './Dpad';
import { GameButton } from './GameButton';
import type { MgbaButton } from '../../emulator/mgbaBindings';

interface LandscapeLayoutProps {
  onPress: (button: MgbaButton) => void;
  onRelease: (button: MgbaButton) => void;
}

export function LandscapeLayout({ onPress, onRelease }: LandscapeLayoutProps) {
  return (
    <div className="controls controls-landscape">
      <GameButton label="L" button="L" className="shoulder shoulder-l" onPress={onPress} onRelease={onRelease} />
      <GameButton label="R" button="R" className="shoulder shoulder-r" onPress={onPress} onRelease={onRelease} />
      <Dpad onPress={onPress} onRelease={onRelease} />
      <div className="face-buttons">
        <GameButton label="B" button="B" className="btn-b" onPress={onPress} onRelease={onRelease} />
        <GameButton label="A" button="A" className="btn-a" onPress={onPress} onRelease={onRelease} />
      </div>
      <div className="center-buttons">
        <GameButton label="Select" button="Select" className="btn-select" onPress={onPress} onRelease={onRelease} />
        <GameButton label="Start" button="Start" className="btn-start" onPress={onPress} onRelease={onRelease} />
      </div>
    </div>
  );
}
