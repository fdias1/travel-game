import { useEffect, useState } from 'react';

interface OfflineBannerProps {
  needRefresh?: boolean;
  onUpdate?: () => void;
}

export function OfflineBanner({ needRefresh, onUpdate }: OfflineBannerProps) {
  const [online, setOnline] = useState(navigator.onLine);

  useEffect(() => {
    const onOnline = () => setOnline(true);
    const onOffline = () => setOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  return (
    <>
      {!online && <div className="banner banner-offline">Offline mode — cached games available</div>}
      {needRefresh && (
        <div className="banner banner-update">
          <span>New version available</span>
          <button type="button" onClick={onUpdate}>
            Update
          </button>
        </div>
      )}
    </>
  );
}
