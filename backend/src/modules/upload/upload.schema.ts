import { z } from 'zod';

export const uploadResultSchema = z.object({
  url: z.string().url(),
  publicId: z.string().min(1),
  width: z.number().int().nonnegative(),
  height: z.number().int().nonnegative(),
  format: z.string().min(1),
  bytes: z.number().int().nonnegative(),
});

export type UploadResultDto = z.infer<typeof uploadResultSchema>;
