import catalogue from './images/characters/catalogue.json';
// Vite fingerprints these assets at build time. Only displayed images are fetched.
const files = import.meta.glob<string>('./images/characters/*.jpg', {
  eager: true,
  query: '?url',
  import: 'default',
});
const portraits = new Map(
  catalogue.map((record) => [
    record.id,
    files[`./images/characters/${record.file}`],
  ]),
);
export function getPortraitUrl(id: string): string | undefined {
  return portraits.get(id);
}
