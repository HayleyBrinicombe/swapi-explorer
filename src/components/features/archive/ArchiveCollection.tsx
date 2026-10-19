import { useState } from 'react';
import { MdSearch } from 'react-icons/md';
import {
  archiveCollectionSchema,
  type ArchiveKind,
} from '../../../../shared/contracts';
import { useResource } from '../../../hooks/useResource';
import { ResourceState } from '../../ui/ResourceState/ResourceState';
import { Button } from '../../ui/Button/Button';
import { ArchiveRecordCard } from './ArchiveRecordCard';
const titles = {
  planets: 'Planets',
  films: 'Films',
  starships: 'Starships',
  vehicles: 'Vehicles',
};
const descriptions = {
  planets:
    'From desert horizons to distant oceans. Discover the worlds of Star Wars.',
  films:
    'The stories that shaped a galaxy. Explore the six films recorded in SWAPI.',
  starships:
    'Legendary freighters, starfighters and flagships. Meet the fleet.',
  vehicles:
    'From snowfields to city skylines. Discover how the galaxy gets around.',
};
export function ArchiveCollection({ kind }: { kind: ArchiveKind }) {
  const { resource, retry } = useResource(
    `/api/archive/${kind}`,
    archiveCollectionSchema,
  );
  const [search, setSearch] = useState('');
  const [limit, setLimit] = useState(12);
  const records =
    resource.status === 'success'
      ? resource.data.records.filter((record) =>
          record.name.toLowerCase().includes(search.trim().toLowerCase()),
        )
      : [];
  return (
    <section className="archive-collection" aria-labelledby="collection-title">
      <p className="eyebrow">The Galactic Archive</p>
      <h1 id="collection-title">{titles[kind]}</h1>
      <p className="discovery-description">{descriptions[kind]}</p>
      <div className="search-toolbar">
        <div className="search-field">
          <label className="sr-only" htmlFor="collection-search">
            Search {kind} by name
          </label>
          <MdSearch aria-hidden="true" size={20} />
          <input
            id="collection-search"
            type="search"
            value={search}
            placeholder={`Search ${kind}…`}
            onChange={(event) => {
              setSearch(event.target.value);
              setLimit(12);
            }}
          />
        </div>
        <p className="result-count" role="status">
          {resource.status === 'success'
            ? `${records.length} records found`
            : 'Awaiting records'}
        </p>
      </div>
      {resource.status !== 'success' ? (
        <ResourceState
          message={resource.status === 'error' ? resource.message : undefined}
          retry={resource.status === 'error' ? retry : undefined}
        />
      ) : records.length ? (
        <>
          <ul className="connection-grid archive-grid">
            {records.slice(0, limit).map((record) => (
              <li key={record.id}>
                <ArchiveRecordCard
                  record={record}
                  kind={kind}
                  headingLevel={2}
                />
              </li>
            ))}
          </ul>
          {records.length > limit && (
            <div className="load-more">
              <p>
                Showing {Math.min(limit, records.length)} of {records.length}{' '}
                records
              </p>
              <Button
                variant="secondary"
                onClick={() => setLimit((value) => value + 12)}
              >
                Load more records
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="resource-state">
          <h2>No matching records</h2>
          <p>Try another name or clear your search.</p>
          <Button onClick={() => setSearch('')}>Clear search</Button>
        </div>
      )}
      <p className="source-note">
        Records from SWAPI. Imagery © Lucasfilm; artwork is not available for
        every record.
      </p>
    </section>
  );
}
