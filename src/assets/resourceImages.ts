import catalogue from './images/resources.json';
import illustrations from './images/planets/illustrations.json';
import type { ArchiveKind } from '../../shared/contracts';
export type ResourceKind = ArchiveKind;
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
const impressionImages = new Map(
  illustrations.map((record) => [
    record.id,
    files[`./images/planets/${record.file}`],
  ]),
);
export function isGeneratedResourceImage(
  kind: ResourceKind,
  id: string,
): boolean {
  return (
    kind === 'planets' &&
    !images.get(`${kind}/${id}`) &&
    Boolean(impressionImages.get(id))
  );
}
export function getResourceImage(kind: ResourceKind, id: string) {
  return (
    images.get(`${kind}/${id}`) ??
    (kind === 'planets' ? impressionImages.get(id) : undefined)
  );
}

const credits = new Map(
  catalogue.map((record) => [
    `${record.kind}/${record.id}`,
    'credit' in record ? record.credit : undefined,
  ]),
);
export function getResourceImageCredit(
  kind: ResourceKind,
  id: string,
): string | undefined {
  return isGeneratedResourceImage(kind, id)
    ? 'AI-generated artist’s impression'
    : credits.get(`${kind}/${id}`);
}
