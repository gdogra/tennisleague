import { z } from 'zod';

export const SlotSchema = z.object({ start: z.string().min(10), end: z.string().optional() });
export const SlotsSchema = z.array(SlotSchema).min(1);
export const ResultSetSchema = z.object({ a: z.number().int().min(0).max(7), b: z.number().int().min(0).max(7) });
export const ResultReportSchema = z.object({ winner_member_id: z.number().int().positive(), sets: z.array(ResultSetSchema).min(1).max(3) });
export const MemberPatchSchema = z.object({
  name: z.string().min(1).optional(),
  area: z.string().optional(),
  tennis_rating: z.number().min(1).max(7).optional(),
  avatar_url: z.string().url().optional(),
  availability: z.array(z.object({ day: z.number().int().min(0).max(6), enabled: z.boolean(), start: z.string(), end: z.string() })).optional()
});

