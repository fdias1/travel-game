import { Dpad } from './Dpad';
import { GameButton } from './GameButton';
import type { MgbaButton } from '../../emulator/mgbaBindings';

interface PortraitLayoutProps {
  onPress: (button: MgbaButton) => void;
  onRelease: (button: MgbaButton) => void;
}

export function PortraitLayout({ onPress, onRelease }: PortraitLayoutProps) {
  return (
    <div className="controls controls-portrait">
      <div className="portrait-main">
        <div className="portrait-left">
          <GameButton
            label="L"
            button="L"
            className="shoulder shoulder-l"
            onPress={onPress}
            onRelease={onRelease}
          />
          <Dpad onPress={onPress} onRelease={onRelease} />
        </div>
        <div className="portrait-right">
          <GameButton
            label="R"
            button="R"
            className="shoulder shoulder-r"
            onPress={onPress}
            onRelease={onRelease}
          />
          <div className="face-buttons">
            <GameButton label="B" button="B" className="btn-b" onPress={onPress} onRelease={onRelease} />
            <GameButton label="A" button="A" className="btn-a" onPress={onPress} onRelease={onRelease} />
          </div>
        </div>
      </div>
      <div className="center-buttons portrait-center">
        <GameButton
          label="Select"
          button="Select"
          className="btn-select btn-mini"
          onPress={onPress}
          onRelease={onRelease}
        >
          Sel
        </GameButton>
        <GameButton
          label="Start"
          button="Start"
          className="btn-start btn-mini"
          onPress={onPress}
          onRelease={onRelease}
        >
          Sta
        </GameButton>
      </div>
    </div>
  );
}
