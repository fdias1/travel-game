interface SaveStateDrawerProps {
  open: boolean;
  onClose: () => void;
  onSave: (slot: number) => void;
  onLoad: (slot: number) => void;
}

const SLOTS = [0, 1, 2];

export function SaveStateDrawer({ open, onClose, onSave, onLoad }: SaveStateDrawerProps) {
  if (!open) return null;

  return (
    <div className="drawer-backdrop" role="presentation" onClick={onClose}>
      <div className="drawer" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <header className="drawer-header">
          <h2>Save states</h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close">
            ×
          </button>
        </header>
        <ul className="slot-list">
          {SLOTS.map((slot) => (
            <li key={slot}>
              <span>Slot {slot + 1}</span>
              <div className="slot-actions">
                <button type="button" onClick={() => onSave(slot)}>
                  Save
                </button>
                <button type="button" onClick={() => onLoad(slot)}>
                  Load
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
