import { useState } from 'react';
import {
  MdPublic,
  MdMovie,
  MdRocketLaunch,
  MdDirectionsCar,
} from 'react-icons/md';
import {
  characterConnectionsSchema,
  type RelatedRecord,
} from '../../../../shared/contracts';
import {
  getResourceImage,
  type ResourceKind,
} from '../../../assets/resourceImages';
import { useResource } from '../../../hooks/useResource';
import { Card } from '../../ui/Card/Card';
import { ResourceState } from '../../ui/ResourceState/ResourceState';

function ConnectionCard({
  record,
  kind,
}: {
  record: RelatedRecord;
  kind: ResourceKind;
}) {
  const [failed, setFailed] = useState(false);
  const image = getResourceImage(kind, record.id);
  const Icon = {
    planets: MdPublic,
    films: MdMovie,
    starships: MdRocketLaunch,
    vehicles: MdDirectionsCar,
  }[kind];
  return (
    <Card className={`connection-card connection-card--${kind}`}>
      <div className="connection-image">
        {image && !failed ? (
          <img
            src={image}
            alt=""
            loading="lazy"
            width="640"
            height={kind === 'films' ? '600' : '360'}
            onError={() => setFailed(true)}
          />
        ) : (
          <Icon size={48} aria-hidden="true" />
        )}
      </div>
      <div className="connection-copy">
        <p className="eyebrow">{record.subtitle}</p>
        <h4>{record.name}</h4>
        <dl>
          {record.facts.map((fact) => (
            <div key={fact.label}>
              <dt>{fact.label}</dt>
              <dd>{fact.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </Card>
  );
}

export function CharacterConnections({ id }: { id: string }) {
  const { resource, retry } = useResource(
    `/api/characters/${encodeURIComponent(id)}/connections`,
    characterConnectionsSchema,
  );
  return (
    <section
      className="character-connections"
      aria-labelledby="connections-title"
    >
      <p className="eyebrow">Every legend has a story</p>
      <h2 id="connections-title">Explore their galaxy</h2>
      {resource.status !== 'success' ? (
        <ResourceState
          message={resource.status === 'error' ? resource.message : undefined}
          retry={resource.status === 'error' ? retry : undefined}
        />
      ) : (
        <>
          <section
            className="connection-section"
            aria-labelledby="homeworld-title"
          >
            <h3 id="homeworld-title" className="connection-section-title">
              <MdPublic aria-hidden="true" /> Homeworld
            </h3>
            {resource.data.homeworld ? (
              <ConnectionCard record={resource.data.homeworld} kind="planets" />
            ) : (
              <p className="source-note">
                Homeworld unknown in the source records.
              </p>
            )}
          </section>
          {(['films', 'starships', 'vehicles'] as const).map((kind) => (
            <section
              className="connection-section"
              key={kind}
              aria-labelledby={`${kind}-title`}
            >
              <h3 id={`${kind}-title`} className="connection-section-title">
                {
                  {
                    films: 'Film appearances',
                    starships: 'Starships',
                    vehicles: 'Vehicles',
                  }[kind]
                }{' '}
                <span>{resource.data[kind].length}</span>
              </h3>
              {resource.data[kind].length ? (
                <ul className="connection-grid">
                  {resource.data[kind].map((record) => (
                    <li key={record.id}>
                      <ConnectionCard record={record} kind={kind} />
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="source-note">
                  No {kind === 'films' ? 'film appearances' : kind} recorded for
                  this character.
                </p>
              )}
            </section>
          ))}
          <p className="source-note">
            Connections come from SWAPI. Imagery: StarWars.com / Lucasfilm.
            Missing artwork uses a category icon.
          </p>
        </>
      )}
    </section>
  );
}
