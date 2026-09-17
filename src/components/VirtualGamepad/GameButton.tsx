import type { PointerEvent, ReactNode } from 'react';
import type { MgbaButton } from '../../emulator/mgbaBindings';

interface GameButtonProps {
  label: string;
  button: MgbaButton;
  className?: string;
  children?: ReactNode;
  onPress: (button: MgbaButton) => void;
  onRelease: (button: MgbaButton) => void;
}

export function GameButton({
  label,
  button,
  className,
  children,
  onPress,
  onRelease,
}: GameButtonProps) {
  const handlePointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    onPress(button);
  };

  const handlePointerUp = (event: PointerEvent<HTMLButtonElement>) => {
    event.preventDefault();
    onRelease(button);
  };

  return (
    <button
      type="button"
      className={`pad-btn ${className ?? ''}`}
      aria-label={label}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      {children ?? label}
    </button>
  );
}
