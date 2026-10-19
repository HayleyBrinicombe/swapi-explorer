import catalogue from './images/resources.json';
export type ResourceKind = 'planets' | 'films' | 'starships' | 'vehicles';
const files = import.meta.glob<string>(
  './images/{planets,films,starships,vehicles}/*.jpg',
  {
    eager: true,
    query: '?url',
    import: 'default',
  },
);
const images = new Map(
  catalogue.map((record) => [
    `${record.kind}/${record.id}`,
    files[`./images/${record.kind}/${record.file}`],
  ]),
);
export function getResourceImage(kind: ResourceKind, id: string) {
  return images.get(`${kind}/${id}`);
}
