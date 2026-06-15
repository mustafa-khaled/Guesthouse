import { z } from "zod";
import { dateStringSchema } from "../../common/utils/dateUtils";
import {
  HousekeepingTaskType,
  HousekeepingTaskStatus,
  HousekeepingPriority,
} from "../../common/enums/roomStatus.enum";

export const createTaskSchema = z.object({
  body: z.object({
    propertyId: z.string().min(1),
    roomId: z.string().min(1),
    bookingId: z.string().optional(),
    type: z.nativeEnum(HousekeepingTaskType),
    priority: z.nativeEnum(HousekeepingPriority).default(HousekeepingPriority.NORMAL),
    assignedTo: z.string().optional(),
    scheduledDate: z.coerce.date(),
    notes: z.string().max(1000).optional(),
  }),
});

export const updateTaskStatusSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    status: z.nativeEnum(HousekeepingTaskStatus),
    notes: z.string().max(500).optional(),
  }),
});

export const completeTaskSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    notes: z.string().max(500).optional(),
    issues: z
      .array(
        z.object({
          description: z.string().min(1),
          severity: z.enum(["low", "medium", "high", "critical"]),
        })
      )
      .optional(),
  }),
});

export const verifyTaskSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    notes: z.string().max(500).optional(),
  }),
});

export const getTaskSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
});

export const listTasksSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(50),
    propertyId: z.string().optional(),
    roomId: z.string().optional(),
    assignedTo: z.string().optional(),
    status: z.nativeEnum(HousekeepingTaskStatus).optional(),
    type: z.nativeEnum(HousekeepingTaskType).optional(),
    priority: z.nativeEnum(HousekeepingPriority).optional(),
    scheduledDate: dateStringSchema.optional(),
    fromDate: dateStringSchema.optional(),
    toDate: dateStringSchema.optional(),
  }),
});

export const assignTaskSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    assignedTo: z.string().min(1),
  }),
});

export const reportIssueSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    description: z.string().min(1).max(500),
    severity: z.enum(["low", "medium", "high", "critical"]),
  }),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskStatusInput = z.infer<typeof updateTaskStatusSchema>;
export type CompleteTaskInput = z.infer<typeof completeTaskSchema>;
export type VerifyTaskInput = z.infer<typeof verifyTaskSchema>;
export type GetTaskInput = z.infer<typeof getTaskSchema>;
export type ListTasksInput = z.infer<typeof listTasksSchema>;
export type AssignTaskInput = z.infer<typeof assignTaskSchema>;
export type ReportIssueInput = z.infer<typeof reportIssueSchema>;
