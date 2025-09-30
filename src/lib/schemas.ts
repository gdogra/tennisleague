import { z } from 'zod';

export const SlotSchema = z.object({ start: z.string().min(10), end: z.string().optional() });
export const SlotsSchema = z.array(SlotSchema).min(1);

export const ResultSetSchema = z.object({ a: z.number().int().min(0).max(7), b: z.number().int().min(0).max(7) });
export const ResultReportSchema = z.object({ winner_member_id: z.number().int().positive(), sets: z.array(ResultSetSchema).min(1).max(3) });

export const ProfileSchema = z.object({
  name: z.string().min(1),
  area: z.string().min(1).optional().default(''),
  tennis_rating: z.number().min(1).max(7).optional(),
  avatar_url: z.string().url().optional().or(z.literal('')),
});

