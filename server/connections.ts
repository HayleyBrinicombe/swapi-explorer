import type {
  CharacterConnections,
  RelatedRecord,
} from '../shared/contracts.js';
import { toPlanet, toFilm, toCraft } from './resources.js';
import { ApplicationError, type SwapiClient } from './swapi.js';
const idOf = (url: string) => url.replace(/\/$/, '').split('/').at(-1)!;
const sameResource = (a: string, b: string) =>
  a.replace(/\/$/, '') === b.replace(/\/$/, '');

export function createConnectionService(client: SwapiClient) {
  return async (id: string): Promise<CharacterConnections> => {
    const person = (await client.getPeople()).find((p) => idOf(p.url) === id);
    if (!person)
      throw new ApplicationError(
        404,
        'NOT_FOUND',
        'This character is not in the archive.',
      );
    // At most four collection requests, shared across characters and warm requests.
    const [planets, films, starships, vehicles] = await Promise.all([
      client.getPlanets(),
      person.films.length ? client.getFilms() : [],
      person.starships.length ? client.getStarships() : [],
      person.vehicles.length ? client.getVehicles() : [],
    ]);
    const planet = planets.find((p) => sameResource(p.url, person.homeworld));
    function select<T extends { url: string }>(
      urls: string[],
      records: T[],
      map: (record: T) => RelatedRecord,
    ) {
      return urls.map((url) => {
        const record = records.find((item) => sameResource(item.url, url));
        if (!record)
          throw new ApplicationError(
            502,
            'UPSTREAM_UNAVAILABLE',
            'Some archive connections are unavailable. Please try again.',
          );
        return map(record);
      });
    }
    if (!planet)
      throw new ApplicationError(
        502,
        'UPSTREAM_UNAVAILABLE',
        'The homeworld record is unavailable. Please try again.',
      );
    return {
      homeworld:
        planet.name.toLowerCase() === 'unknown' ? null : toPlanet(planet),
      films: select(person.films, films, toFilm),
      starships: select(person.starships, starships, toCraft),
      vehicles: select(person.vehicles, vehicles, toCraft),
    };
  };
}
