import { RomLibrary } from '../components/RomLibrary';

export function LibraryPage() {
  return (
    <section className="page library-page">
      <header className="page-header">
        <h1>Travel Game</h1>
        <p>GB · GBC · GBA — offline in your browser</p>
      </header>
      <RomLibrary />
    </section>
  );
}
