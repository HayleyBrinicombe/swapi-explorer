import { useEffect } from 'react';
import { MdPublic } from 'react-icons/md';
import { characterConnectionsSchema } from '../../../../shared/contracts';
import { useResource } from '../../../hooks/useResource';
import { ResourceState } from '../../ui/ResourceState/ResourceState';
import { ArchiveRecordCard } from '../archive/ArchiveRecordCard';
export function CharacterConnections({ id }: { id: string }) {
  const { resource, retry } = useResource(
    `/api/characters/${encodeURIComponent(id)}/connections`,
    characterConnectionsSchema,
  );
  useEffect(() => {
    if (resource.status !== 'success') return;
    const target = window.location.hash.slice(1);
    if (
      ![
        'connections-title',
        'homeworld-title',
        'films-title',
        'starships-title',
        'vehicles-title',
      ].includes(target)
    )
      return;
    const heading = document.getElementById(target);
    heading?.focus({ preventScroll: true });
    heading?.scrollIntoView({ block: 'start' });
  }, [resource]);
  return (
    <section
      className="character-connections"
      aria-labelledby="connections-title"
    >
      <p className="eyebrow">Every legend has a story</p>
      <h2 id="connections-title" tabIndex={-1}>
        Explore their galaxy
      </h2>
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
            <h3
              id="homeworld-title"
              tabIndex={-1}
              className="connection-section-title"
            >
              <MdPublic aria-hidden="true" /> Homeworld
            </h3>
            {resource.data.homeworld ? (
              <ArchiveRecordCard
                record={resource.data.homeworld}
                kind="planets"
              />
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
              <h3
                id={`${kind}-title`}
                tabIndex={-1}
                className="connection-section-title"
              >
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
                      <ArchiveRecordCard record={record} kind={kind} />
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
