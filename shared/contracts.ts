import { z } from 'zod';
export const characterSchema = z.object({
  id: z.string(),
  name: z.string(),
  height: z.string(),
  mass: z.string(),
  birthYear: z.string(),
  gender: z.string(),
  hairColor: z.string(),
  skinColor: z.string(),
  eyeColor: z.string(),
  filmCount: z.number().int().nonnegative(),
  starshipCount: z.number().int().nonnegative(),
  vehicleCount: z.number().int().nonnegative(),
});
export const characterListSchema = z.object({
  characters: z.array(characterSchema),
});
export const characterDetailSchema = z.object({ character: characterSchema });
export type Character = z.infer<typeof characterSchema>;
export type ApiErrorCode =
  | 'INVALID_REQUEST'
  | 'NOT_FOUND'
  | 'UPSTREAM_UNAVAILABLE'
  | 'UPSTREAM_TIMEOUT'
  | 'INTERNAL_ERROR';
export type ApiError = { error: { code: ApiErrorCode; message: string } };
