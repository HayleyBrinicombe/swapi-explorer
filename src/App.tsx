import {
  CinematicIntro,
  shouldShowIntro,
} from './components/ui/CinematicIntro/CinematicIntro';
import { Button } from './components/ui/Button/Button';
import { Container } from './components/ui/Container/Container';
import { MdRocketLaunch, MdOpenInNew } from 'react-icons/md';
import { useCallback, useEffect, useRef, useState } from 'react';
import { CharacterArchive } from './components/features/characters/CharacterArchive';
import { CharacterDetail } from './components/features/characters/CharacterDetail';
const selectedId = () =>
  new URLSearchParams(window.location.search).get('character');
export function App() {
  const [introVisible, setIntroVisible] = useState(shouldShowIntro);
  const [id, setId] = useState(selectedId);
  const [search, setSearch] = useState('');
  const main = useRef<HTMLElement>(null);
  const finishIntro = useCallback(() => {
    setIntroVisible(false);
    requestAnimationFrame(() => main.current?.focus({ preventScroll: true }));
  }, []);
  useEffect(() => {
    const pop = () => {
      setId(selectedId());
      main.current?.focus();
    };
    window.addEventListener('popstate', pop);
    return () => window.removeEventListener('popstate', pop);
  }, []);
  function navigate(
    event: React.MouseEvent<HTMLAnchorElement>,
    next: string | null,
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
    url.hash = '';
    window.history.pushState({}, '', url);
    setId(next);
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
              className="nav-active"
              href="?"
              onClick={(event) => navigate(event, null)}
              aria-current={id ? undefined : 'page'}
            >
              Characters
            </a>
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
