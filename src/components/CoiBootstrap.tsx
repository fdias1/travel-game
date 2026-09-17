import { useEffect, useState, type ReactNode } from 'react';
import { registerSW } from 'virtual:pwa-register';
type Phase = 'checking' | 'reload' | 'ready' | 'unsupported';

export function CoiBootstrap({ children }: { children: ReactNode }) {
  const [phase, setPhase] = useState<Phase>('checking');

  useEffect(() => {
    let cancelled = false;

    async function ensureIsolation() {
      if (typeof crossOriginIsolated !== 'undefined' && crossOriginIsolated) {
        if (!cancelled) setPhase('ready');
        return;
      }

      if (!('serviceWorker' in navigator)) {
        if (!cancelled) setPhase('unsupported');
        return;
      }

      const coepCredentialless = !(
        (window as Window & { chrome?: unknown }).chrome ||
        (window as Window & { netscape?: unknown }).netscape
      );

      await registerSW({
        immediate: true,
        onRegisteredSW(_url, registration) {
          registration?.active?.postMessage({
            type: 'coepCredentialless',
            value: coepCredentialless,
          });
        },
      });

      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'coepCredentialless',
          value: coepCredentialless,
        });
      }

      await navigator.serviceWorker.ready;

      if (!crossOriginIsolated) {
        if (!sessionStorage.getItem('travel-game-coi-reload')) {
          sessionStorage.setItem('travel-game-coi-reload', '1');
          if (!cancelled) setPhase('reload');
          window.location.reload();
          return;
        }
      }

      if (!cancelled) {
        setPhase(crossOriginIsolated ? 'ready' : 'unsupported');
      }
    }

    void ensureIsolation();

    return () => {
      cancelled = true;
    };
  }, []);

  if (phase === 'checking' || phase === 'reload') {
    return (
      <div className="boot-screen">
        <p>Preparing offline emulator…</p>
        <p className="boot-sub">Activating cross-origin isolation</p>
      </div>
    );
  }

  if (phase === 'unsupported') {
    return (
      <div className="boot-screen boot-error">
        <h1>Cannot start emulator</h1>
        <p>
          This app needs cross-origin isolation (for WebAssembly threads). Reload once, or open
          via HTTPS with the service worker enabled.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
