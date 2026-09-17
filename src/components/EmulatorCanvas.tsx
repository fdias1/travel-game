import { useEffect, useRef } from 'react';
import { useEmulator } from '../emulator/EmulatorContext';

function fitCanvasToShell(canvas: HTMLCanvasElement, shell: HTMLElement) {
  const nw = canvas.width;
  const nh = canvas.height;
  if (!nw || !nh) return;

  const scale = Math.min(shell.clientWidth / nw, shell.clientHeight / nh);
  const w = Math.max(1, Math.floor(nw * scale));
  const h = Math.max(1, Math.floor(nh * scale));
  canvas.style.width = `${w}px`;
  canvas.style.height = `${h}px`;
}

interface EmulatorCanvasProps {
  /** Bumps canvas fit when game starts or layout changes */
  scaleKey?: string;
}

export function EmulatorCanvas({ scaleKey }: EmulatorCanvasProps) {
  const shellRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { initModule, status } = useEmulator();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || status === 'ready') return;
    void initModule(canvas);
  }, [initModule, status]);

  useEffect(() => {
    const shell = shellRef.current;
    const canvas = canvasRef.current;
    if (!shell || !canvas) return;

    const observer = new ResizeObserver(() => {
      fitCanvasToShell(canvas, shell);
    });
    observer.observe(shell);

    const onResize = () => fitCanvasToShell(canvas, shell);
    window.addEventListener('orientationchange', onResize);

    return () => {
      observer.disconnect();
      window.removeEventListener('orientationchange', onResize);
    };
  }, [status]);

  useEffect(() => {
    const shell = shellRef.current;
    const canvas = canvasRef.current;
    if (!shell || !canvas || !scaleKey) return;

    let frames = 0;
    let frameId = 0;
    const refit = () => {
      fitCanvasToShell(canvas, shell);
      frames += 1;
      if (frames < 8) {
        frameId = requestAnimationFrame(refit);
      }
    };
    refit();
    return () => cancelAnimationFrame(frameId);
  }, [scaleKey, status]);

  return (
    <div ref={shellRef} className="canvas-scaler">
      <canvas ref={canvasRef} className="emulator-canvas" />
    </div>
  );
}
