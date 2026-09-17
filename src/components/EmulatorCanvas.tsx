import { useEffect, useRef } from 'react';
import { useEmulator } from '../emulator/EmulatorContext';

export function EmulatorCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { initModule, status } = useEmulator();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || status === 'ready') return;
    void initModule(canvas);
  }, [initModule, status]);

  return <canvas ref={canvasRef} className="emulator-canvas" />;
}
