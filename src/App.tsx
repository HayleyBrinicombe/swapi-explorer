import {
  CinematicIntro,
  shouldShowIntro,
} from './components/ui/CinematicIntro/CinematicIntro';
import { Button } from './components/ui/Button/Button';
import { Container } from './components/ui/Container/Container';
import { MdRocketLaunch, MdOpenInNew } from 'react-icons/md';
import { useCallback, useEffect, useRef, useState } from 'react';
import { archiveKinds, type ArchiveKind } from '../shared/contracts';
import { ArchiveCollection } from './components/features/archive/ArchiveCollection';
import { CharacterArchive } from './components/features/characters/CharacterArchive';
import { CharacterDetail } from './components/features/characters/CharacterDetail';
const selectedId = () =>
  new URLSearchParams(window.location.search).get('character');
const selectedCollection = (): ArchiveKind | null => {
  const value = new URLSearchParams(window.location.search).get('collection');
  return archiveKinds.find((kind) => kind === value) ?? null;
};
export function App() {
  const [introVisible, setIntroVisible] = useState(shouldShowIntro);
  const [id, setId] = useState(selectedId);
  const [collection, setCollection] = useState(selectedCollection);
  const [search, setSearch] = useState('');
  const main = useRef<HTMLElement>(null);
  const finishIntro = useCallback(() => {
    setIntroVisible(false);
    requestAnimationFrame(() => {
      const target = document.getElementById(window.location.hash.slice(1));
      if (target && main.current?.contains(target)) {
        target.focus({ preventScroll: true });
        target.scrollIntoView({ block: 'start' });
      } else main.current?.focus({ preventScroll: true });
    });
  }, []);
  useEffect(() => {
    const pop = () => {
      setId(selectedId());
      setCollection(selectedCollection());
      main.current?.focus();
    };
    window.addEventListener('popstate', pop);
    return () => window.removeEventListener('popstate', pop);
  }, []);
  function navigate(
    event: React.MouseEvent<HTMLAnchorElement>,
    next: string | null,
    nextCollection: ArchiveKind | null = null,
  ) {
    if (
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    )
      return;
    event.preventDefault();
    const url = new URL(window.location.href);
    if (next) url.searchParams.set('character', next);
    else url.searchParams.delete('character');
    if (nextCollection) url.searchParams.set('collection', nextCollection);
    else url.searchParams.delete('collection');
    url.hash = new URL(event.currentTarget.href).hash;
    window.history.pushState({}, '', url);
    setId(next);
    setCollection(nextCollection);
    window.scrollTo({ top: 0 });
    main.current?.focus();
  }
  return (
    <>
      {introVisible && <CinematicIntro onFinish={finishIntro} />}
      <a href="#main" className="skip-link" inert={introVisible}>
        Skip to content
      </a>
      <Container inert={introVisible} aria-hidden={introVisible || undefined}>
        <header className="site-header">
          <a
            className="brand"
            href="?"
            onClick={(event) => navigate(event, null)}
            aria-label="Galactic Archive home"
          >
            <span className="brand-mark" aria-hidden="true">
              <MdRocketLaunch size={28} />
            </span>
            <span>
              Galactic <span className="brand-subtitle">Archive</span>
            </span>
          </a>
          <nav aria-label="Main navigation">
            <a
              className={!collection ? 'nav-active' : undefined}
              href="?"
              onClick={(event) => navigate(event, null)}
              aria-current={!id && !collection ? 'page' : undefined}
            >
              Characters
            </a>
            {archiveKinds.map((kind) => (
              <a
                key={kind}
                href={`?collection=${kind}`}
                onClick={(event) => navigate(event, null, kind)}
                className={collection === kind ? 'nav-active' : undefined}
                aria-current={collection === kind ? 'page' : undefined}
              >
                {
                  {
                    planets: 'Planets',
                    films: 'Films',
                    starships: 'Starships',
                    vehicles: 'Vehicles',
                  }[kind]
                }
              </a>
            ))}
            <a href="https://swapi.info/" target="_blank" rel="noreferrer">
              About SWAPI <MdOpenInNew size={13} aria-hidden="true" />
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </nav>
          <span className="header-caption">
            A little wonder. A whole galaxy.
          </span>
        </header>
        <main id="main" ref={main} tabIndex={-1}>
          {id ? (
            <CharacterDetail
              key={id}
              id={id}
              onBack={(event) => navigate(event, null)}
            />
          ) : collection ? (
            <ArchiveCollection key={collection} kind={collection} />
          ) : (
            <CharacterArchive
              search={search}
              setSearch={setSearch}
              onNavigate={navigate}
            />
          )}
        </main>
        <footer>
          <a
            className="footer-brand"
            href="?"
            onClick={(event) => navigate(event, null)}
          >
            <MdRocketLaunch size={18} aria-hidden="true" /> Galactic archive
          </a>
          <p>
            Built for the curious. Powered by{' '}
            <a href="https://swapi.info/">SWAPI</a>.
          </p>
          <Button
            variant="secondary"
            className="replay-button"
            onClick={() => {
              window.scrollTo({ top: 0 });
              setIntroVisible(true);
            }}
          >
            Replay opening
          </Button>
        </footer>
      </Container>
    </>
  );
}
