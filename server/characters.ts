import type { Character } from '../shared/contracts.js';
import {
  ApplicationError,
  type SwapiClient,
  type SwapiPerson,
} from './swapi.js';
export function toCharacter(person: SwapiPerson): Character {
  return {
    id: person.url.replace(/\/$/, '').split('/').at(-1)!,
    name: person.name,
    height: person.height,
    mass: person.mass,
    birthYear: person.birth_year,
    gender: person.gender,
    hairColor: person.hair_color,
    skinColor: person.skin_color,
    eyeColor: person.eye_color,
    filmCount: person.films.length,
    starshipCount: person.starships.length,
    vehicleCount: person.vehicles.length,
  };
}
export function createCharacterService(client: SwapiClient) {
  async function list() {
    return (await client.getPeople()).map(toCharacter);
  }
  return {
    list,
    async get(id: string) {
      const character = (await list()).find((person) => person.id === id);
      if (!character)
        throw new ApplicationError(
          404,
          'NOT_FOUND',
          'This character is not in the archive.',
        );
      return character;
    },
  };
}
