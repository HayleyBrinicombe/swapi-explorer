import type { RelatedRecord, ArchiveKind } from '../shared/contracts.js';
import type { SwapiClient } from './swapi.js';
type Planet = Awaited<ReturnType<SwapiClient['getPlanets']>>[number];
type Film = Awaited<ReturnType<SwapiClient['getFilms']>>[number];
type Craft = Awaited<ReturnType<SwapiClient['getStarships']>>[number];
export const resourceId = (url: string) =>
  url.replace(/\/$/, '').split('/').at(-1)!;
export const toPlanet = (planet: Planet): RelatedRecord => ({
  id: resourceId(planet.url),
  name: planet.name,
  subtitle: planet.terrain,
  facts: [
    { label: 'Climate', value: planet.climate },
    { label: 'Terrain', value: planet.terrain },
    { label: 'Population', value: planet.population },
  ],
});
export const toFilm = (film: Film): RelatedRecord => ({
  id: resourceId(film.url),
  name: film.title,
  subtitle: `Episode ${['I', 'II', 'III', 'IV', 'V', 'VI'][film.episode_id - 1]} · ${film.release_date.slice(0, 4)}`,
  facts: [{ label: 'Director', value: film.director }],
});
export const toCraft = (craft: Craft): RelatedRecord => ({
  id: resourceId(craft.url),
  name: craft.name,
  subtitle: craft.model,
  facts: [
    { label: 'Manufacturer', value: craft.manufacturer },
    { label: 'Crew', value: craft.crew },
  ],
});
export function createArchiveService(client: SwapiClient) {
  const lists: Record<ArchiveKind, () => Promise<RelatedRecord[]>> = {
    planets: async () => (await client.getPlanets()).map(toPlanet),
    films: async () => (await client.getFilms()).map(toFilm),
    starships: async () => (await client.getStarships()).map(toCraft),
    vehicles: async () => (await client.getVehicles()).map(toCraft),
  };
  return (kind: ArchiveKind) => lists[kind]();
}
