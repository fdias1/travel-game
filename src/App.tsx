import { useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { CoiBootstrap } from './components/CoiBootstrap';
import { OfflineBanner } from './components/OfflineBanner';
import { EmulatorProvider } from './emulator/EmulatorContext';
import { GamePlayerPage } from './pages/GamePlayerPage';
import { LibraryPage } from './pages/LibraryPage';

const basename = import.meta.env.BASE_URL.replace(/\/$/, '') || '/';

function AppRoutes() {
  const [needRefresh, setNeedRefresh] = useState(false);
  const { updateServiceWorker } = useRegisterSW({
    immediate: true,
    onNeedRefresh() {
      setNeedRefresh(true);
    },
    onRegisteredSW(_url, registration) {
      const coepCredentialless = !(
        (window as Window & { chrome?: unknown }).chrome ||
        (window as Window & { netscape?: unknown }).netscape
      );
      registration?.active?.postMessage({
        type: 'coepCredentialless',
        value: coepCredentialless,
      });
    },
  });

  return (
    <>
      <OfflineBanner
        needRefresh={needRefresh}
        onUpdate={() => {
          void updateServiceWorker(true);
          setNeedRefresh(false);
        }}
      />
      <main className="app-shell">
        <Routes>
          <Route path="/" element={<LibraryPage />} />
          <Route path="/play/:romId" element={<GamePlayerPage />} />
        </Routes>
      </main>
    </>
  );
}

export default function App() {
  return (
    <CoiBootstrap>
      <EmulatorProvider>
        <BrowserRouter basename={basename === '/' ? undefined : basename}>
          <AppRoutes />
        </BrowserRouter>
      </EmulatorProvider>
    </CoiBootstrap>
  );
}
