/** Preserve SWAPI's unknown/not-applicable strings; only known numbers get units. */
export function formatMeasurement(value: string, unit: 'cm' | 'kg'): string {
  return /^\d+(?:,\d{3})*(?:\.\d+)?$/.test(value) ? `${value} ${unit}` : value;
}
