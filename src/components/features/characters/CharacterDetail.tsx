import { formatMeasurement } from './characterFormatting';
import { Card } from '../../ui/Card/Card';
import { MdChevronLeft } from 'react-icons/md';
import { CharacterPortrait } from './CharacterPortrait';
import { characterDetailSchema } from '../../../../shared/contracts';
import { useResource } from '../../../hooks/useResource';
import { ResourceState } from '../../ui/ResourceState/ResourceState';
export function CharacterDetail({
  id,
  onBack,
}: {
  id: string;
  onBack: (event: React.MouseEvent<HTMLAnchorElement>) => void;
}) {
  const { resource, retry } = useResource(
    `/api/characters/${encodeURIComponent(id)}`,
    characterDetailSchema,
  );
  if (resource.status !== 'success')
    return (
      <section className="detail">
        <a href="?" className="text-link" onClick={onBack}>
          <MdChevronLeft size={17} aria-hidden="true" /> Back to directory
        </a>
        <ResourceState
          message={resource.status === 'error' ? resource.message : undefined}
          retry={resource.status === 'error' ? retry : undefined}
        />
      </section>
    );
  const c = resource.data.character;
  const facts = [
    ['Birth year', c.birthYear],
    ['Height', formatMeasurement(c.height, 'cm')],
    ['Mass', formatMeasurement(c.mass, 'kg')],
    ['Gender', c.gender],
    ['Eye colour', c.eyeColor],
    ['Hair colour', c.hairColor],
    ['Skin colour', c.skinColor],
  ];
  return (
    <section className="detail" aria-labelledby="character-name">
      <a href="?" className="text-link" onClick={onBack}>
        <MdChevronLeft size={17} aria-hidden="true" /> Back to directory
      </a>
      <div className="detail-header">
        <CharacterPortrait id={c.id} name={c.name} eager />
        <div className="detail-title">
          <p className="eyebrow">Character profile / {c.id.padStart(3, '0')}</p>
          <h1 id="character-name">{c.name}</h1>
          <p className="hero-description">
            A record from a galaxy far, far away.
          </p>
        </div>
      </div>
      <div className="detail-layout">
        <Card className="detail-panel">
          <p className="eyebrow">Biographical data</p>
          <h2>Behind the name</h2>
          <dl className="detail-facts">
            {facts.map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        </Card>
        <aside>
          <Card className="detail-panel">
            <p className="eyebrow">Across the galaxy</p>
            <h2>Archive connections</h2>
            <dl className="connection-facts">
              {[
                ['Film appearances', c.filmCount],
                ['Starships', c.starshipCount],
                ['Vehicles', c.vehicleCount],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{String(value).padStart(2, '0')}</dd>
                </div>
              ))}
            </dl>
            <p className="source-note">
              Connections reflect the original SWAPI records. Related-resource
              browsing is outside this edition of the archive.
            </p>
          </Card>
        </aside>
      </div>
    </section>
  );
}
