import { z } from 'zod'
import { HousekeepingPriorityEnum, HousekeepingTaskStatusEnum } from './enums.js'

export const housekeepingTaskSchema = z.object({
  id: z.string().optional(),
  _id: z.string().optional(),
  propertyId: z.string(),
  roomId: z.union([z.string(), z.record(z.unknown())]),
  type: z.string(),
  status: HousekeepingTaskStatusEnum,
  priority: HousekeepingPriorityEnum.optional(),
  assignedTo: z.union([z.string(), z.record(z.unknown())]).optional(),
  notes: z.string().optional(),
  dueDate: z.string().optional(),
  completedAt: z.string().optional(),
})

export type HousekeepingTask = z.infer<typeof housekeepingTaskSchema>
