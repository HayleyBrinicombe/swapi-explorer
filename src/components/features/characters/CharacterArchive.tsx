import { GalaxyDiscovery } from './GalaxyDiscovery';
import { CharacterHero } from './CharacterHero';
import { Button } from '../../ui/Button/Button';
import { CharacterGridSkeleton } from './CharacterGridSkeleton';
import { MdSearch, MdCancel, MdPeopleOutline } from 'react-icons/md';
import { useState } from 'react';
import { characterListSchema } from '../../../../shared/contracts';
import { useResource } from '../../../hooks/useResource';
import { ResourceState } from '../../ui/ResourceState/ResourceState';
import { CharacterCard } from './CharacterCard';
export function CharacterArchive({
  search,
  setSearch,
  onNavigate,
}: {
  search: string;
  setSearch: (value: string) => void;
  onNavigate: (event: React.MouseEvent<HTMLAnchorElement>, id: string) => void;
}) {
  const { resource, retry } = useResource(
    '/api/characters',
    characterListSchema,
  );
  const [limit, setLimit] = useState(12);
  const characters =
    resource.status === 'success'
      ? resource.data.characters.filter((character) =>
          character.name.toLowerCase().includes(search.trim().toLowerCase()),
        )
      : [];
  return (
    <>
      <CharacterHero />
      <GalaxyDiscovery onNavigate={onNavigate} />
      <section
        id="records"
        tabIndex={-1}
        className="records"
        aria-labelledby="records-title"
      >
        <div className="section-heading">
          <div>
            <p className="eyebrow">The collection</p>
            <h2 id="records-title">
              Find your favourites<span className="heading-dot">.</span>
            </h2>
          </div>
          <span className="collection-label">
            <MdPeopleOutline size={15} aria-hidden="true" /> Characters
          </span>
        </div>
        <div className="search-toolbar">
          <div className="search-field">
            <label className="sr-only" htmlFor="character-search">
              Search characters by name
            </label>
            <MdSearch size={20} aria-hidden="true" />
            <input
              id="character-search"
              type="search"
              placeholder="Who are you looking for?"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setLimit(12);
              }}
            />
            {search && (
              <button
                onClick={() => {
                  setSearch('');
                  setLimit(12);
                }}
                aria-label="Clear search"
              >
                <MdCancel size={18} aria-hidden="true" />
              </button>
            )}
          </div>
          <p className="result-count" role="status">
            {resource.status === 'success' ? (
              <>
                <strong>{characters.length}</strong>{' '}
                {characters.length === 1 ? 'record' : 'records'} found
              </>
            ) : (
              'Awaiting records'
            )}
          </p>
        </div>
        {resource.status === 'loading' && (
          <>
            <p className="loading-label" role="status">
              Accessing the archive
            </p>
            <CharacterGridSkeleton />
          </>
        )}
        {resource.status === 'error' && (
          <ResourceState message={resource.message} retry={retry} />
        )}
        {resource.status === 'success' &&
          (characters.length ? (
            <>
              <div className="character-grid">
                {characters.slice(0, limit).map((character) => (
                  <CharacterCard
                    key={character.id}
                    character={character}
                    onNavigate={onNavigate}
                  />
                ))}
              </div>
              {characters.length > limit && (
                <div className="load-more">
                  <p>
                    Showing {Math.min(limit, characters.length)} of{' '}
                    {characters.length} records
                  </p>
                  <Button
                    variant="secondary"
                    onClick={() => setLimit((value) => value + 12)}
                  >
                    Load more records{' '}
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="resource-state">
              <span className="state-symbol" aria-hidden="true">
                <MdSearch size={24} />
              </span>
              <h3>No matching records</h3>
              <p>
                Try another name, or clear your search to explore the archive.
              </p>
              <Button onClick={() => setSearch('')}>Clear search</Button>
            </div>
          ))}
      </section>
    </>
  );
}
