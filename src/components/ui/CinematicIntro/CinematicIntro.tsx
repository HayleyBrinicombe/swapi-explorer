import { useEffect, useRef, type CSSProperties } from 'react';
import { Button } from '../Button/Button';
const INTRO_DURATION_MS = 8000;
export function shouldShowIntro(): boolean {
  return !window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
}
export function CinematicIntro({ onFinish }: { onFinish: () => void }) {
  const skip = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    skip.current?.focus({ preventScroll: true });
    const media = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (media?.matches) {
      onFinish();
      return;
    }
    const timer = window.setTimeout(onFinish, INTRO_DURATION_MS);
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onFinish();
      if (event.key === 'Tab') {
        event.preventDefault();
        skip.current?.focus();
      }
    };
    const reduced = (event: MediaQueryListEvent) => {
      if (event.matches) onFinish();
    };
    document.addEventListener('keydown', escape);
    media?.addEventListener('change', reduced);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener('keydown', escape);
      media?.removeEventListener('change', reduced);
    };
  }, [onFinish]);
  return (
    <div
      className="cinematic-intro"
      style={{ '--intro-duration': `${INTRO_DURATION_MS}ms` } as CSSProperties}
      role="dialog"
      aria-modal="true"
      aria-label="Opening sequence"
      aria-describedby="intro-description"
    >
      <div className="intro-stars" aria-hidden="true" />
      <div className="intro-saber intro-saber--blue" aria-hidden="true" />
      <div className="intro-saber intro-saber--red" aria-hidden="true" />
      <div className="intro-copy">
        <p id="intro-description">
          A long time ago, in a galaxy far, far away…
        </p>
        <div className="intro-wordmark">
          Galactic<span>Archive</span>
        </div>
        <p className="intro-caption">The stories. The heroes. The legends.</p>
      </div>
      <Button
        ref={skip}
        variant="secondary"
        className="intro-skip"
        onClick={onFinish}
      >
        Skip intro
      </Button>
    </div>
  );
}
