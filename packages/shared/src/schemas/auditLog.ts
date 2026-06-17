import { z } from 'zod'

export const auditLogSchema = z.object({
  id: z.string().optional(),
  _id: z.string().optional(),
  action: z.string(),
  resource: z.string(),
  resourceId: z.string().optional(),
  userId: z.union([z.string(), z.record(z.unknown())]).optional(),
  changes: z.record(z.unknown()).optional(),
  ipAddress: z.string().optional(),
  createdAt: z.string().optional(),
})

export type AuditLog = z.infer<typeof auditLogSchema>
