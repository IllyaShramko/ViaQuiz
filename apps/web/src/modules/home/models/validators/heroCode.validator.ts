import { z } from 'zod';

export const heroCodeSchema = z.object({
  code: z.string().trim().max(12),
});

export type HeroCodeFormData = z.infer<typeof heroCodeSchema>;
