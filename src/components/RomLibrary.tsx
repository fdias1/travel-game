import { Link } from 'react-router-dom';
import manifest from '../generated/rom-manifest.json';
import type { RomEntry } from '../types/rom';

const roms = manifest as RomEntry[];

export function RomLibrary() {
  if (roms.length === 0) {
    return (
      <div className="library-empty">
        <h2>No games yet</h2>
        <p>Add `.gb`, `.gbc`, or `.gba` files to <code>public/roms/</code> and rebuild.</p>
      </div>
    );
  }

  return (
    <ul className="rom-grid">
      {roms.map((rom) => (
        <li key={rom.id}>
          <Link to={`/play/${rom.id}`} className="rom-card">
            {rom.cover ? (
              <img src={`${import.meta.env.BASE_URL}${rom.cover}`} alt="" className="rom-cover" />
            ) : (
              <div className="rom-cover rom-cover-fallback">{rom.system.toUpperCase()}</div>
            )}
            <div className="rom-meta">
              <strong>{rom.title}</strong>
              <span className="rom-badge">{rom.system.toUpperCase()}</span>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
