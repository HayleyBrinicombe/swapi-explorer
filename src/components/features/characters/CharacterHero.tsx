import { CharacterPortrait } from './CharacterPortrait';
import { MdArrowForward } from 'react-icons/md';
import { ButtonLink } from '../../ui/Button/Button';
import { Typography } from '../../ui/Typography/Typography';
export function CharacterHero() {
  return (
    <section className="hero" aria-labelledby="archive-title">
      <div className="hero-copy">
        <p className="hero-kicker">
          <span />
          The Star Wars character archive
        </p>
        <Typography as="h1" variant="display" id="archive-title">
          Meet the
          <br />
          <em>legends.</em>
        </Typography>
        <p className="hero-description">
          Jedi. Rebels. Droids. Dark lords.
          <br />
          Discover the characters who made a galaxy unforgettable.
        </p>
        <ButtonLink className="hero-action" href="#records">
          Explore the galaxy <MdArrowForward size={20} aria-hidden="true" />
        </ButtonLink>
        <p className="hero-caption">A long time ago. A little closer now.</p>
      </div>
      <div className="hero-art" aria-hidden="true">
        <div className="hero-character hero-character--vader">
          <CharacterPortrait id="4" name="Darth Vader" eager />
        </div>
        <div className="hero-character hero-character--luke">
          <CharacterPortrait id="1" name="Luke Skywalker" eager />
        </div>
        <div className="hero-character hero-character--leia">
          <CharacterPortrait id="5" name="Leia Organa" eager />
        </div>
        <span className="hero-art-label">
          The light. The dark. The legends in between.
        </span>
      </div>
      <div className="hero-lights" aria-hidden="true" />
    </section>
  );
}
