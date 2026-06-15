import { HousekeepingTask, IHousekeepingTask } from "../../models/housekeepingTask.model";
import { Room } from "../../models/room.model";
import { Property } from "../../models/property.model";
import { User } from "../../models/user.model";
import {
  NotFoundError,
  BadRequestError,
} from "../../common/errors/http.errors";
import {
  getPaginationParams,
  createPaginatedResult,
  PaginatedResult,
} from "../../common/utils/pagination";
import {
  HousekeepingTaskType,
  HousekeepingTaskStatus,
  HousekeepingPriority,
  RoomStatus,
} from "../../common/enums/roomStatus.enum";
import { parseDate, getTodayUTC } from "../../common/utils/dateUtils";
import { Types } from "mongoose";

export interface CreateTaskData {
  propertyId: string;
  roomId: string;
  bookingId?: string;
  type: HousekeepingTaskType;
  priority?: HousekeepingPriority;
  assignedTo?: string;
  scheduledDate: Date;
  notes?: string;
}

export interface ListTasksFilters {
  propertyId?: string;
  roomId?: string;
  assignedTo?: string;
  status?: HousekeepingTaskStatus;
  type?: HousekeepingTaskType;
  priority?: HousekeepingPriority;
  scheduledDate?: string;
  fromDate?: string;
  toDate?: string;
}

class HousekeepingService {
  async create(data: CreateTaskData): Promise<IHousekeepingTask> {
    if (!Types.ObjectId.isValid(data.propertyId)) {
      throw new BadRequestError("Invalid property ID");
    }
    if (!Types.ObjectId.isValid(data.roomId)) {
      throw new BadRequestError("Invalid room ID");
    }

    const room = await Room.findById(data.roomId);
    if (!room || room.propertyId.toString() !== data.propertyId) {
      throw new NotFoundError("Room not found for this property");
    }

    const task = new HousekeepingTask({
      propertyId: new Types.ObjectId(data.propertyId),
      roomId: new Types.ObjectId(data.roomId),
      bookingId: data.bookingId ? new Types.ObjectId(data.bookingId) : undefined,
      type: data.type,
      priority: data.priority || HousekeepingPriority.NORMAL,
      assignedTo: data.assignedTo ? new Types.ObjectId(data.assignedTo) : undefined,
      scheduledDate: data.scheduledDate,
      notes: data.notes,
      status: HousekeepingTaskStatus.PENDING,
    });

    await task.save();
    return task;
  }

  async findById(id: string): Promise<IHousekeepingTask> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestError("Invalid task ID");
    }

    const task = await HousekeepingTask.findById(id)
      .populate("roomId", "roomNumber floor")
      .populate("assignedTo", "name email")
      .populate("verifiedBy", "name email");

    if (!task) {
      throw new NotFoundError("Task not found");
    }

    return task;
  }

  async updateStatus(
    id: string,
    status: HousekeepingTaskStatus,
    notes?: string
  ): Promise<IHousekeepingTask> {
    const task = await this.findById(id);

    if (task.status === HousekeepingTaskStatus.VERIFIED) {
      throw new BadRequestError("Cannot update status of verified task");
    }

    task.status = status;

    if (notes) {
      task.notes = notes;
    }

    if (status === HousekeepingTaskStatus.IN_PROGRESS && !task.startedAt) {
      task.startedAt = new Date();
    }

    await task.save();
    return task;
  }

  async complete(
    id: string,
    userId: string,
    notes?: string,
    issues?: { description: string; severity: string }[]
  ): Promise<IHousekeepingTask> {
    const task = await this.findById(id);

    if (task.status === HousekeepingTaskStatus.COMPLETED || task.status === HousekeepingTaskStatus.VERIFIED) {
      throw new BadRequestError("Task is already completed");
    }

    task.status = HousekeepingTaskStatus.COMPLETED;
    task.completedAt = new Date();

    if (task.startedAt) {
      task.duration = Math.round((task.completedAt.getTime() - task.startedAt.getTime()) / 60000);
    }

    if (notes) {
      task.notes = notes;
    }

    if (issues && issues.length > 0) {
      for (const issue of issues) {
        task.issues.push({
          description: issue.description,
          severity: issue.severity,
          reportedAt: new Date(),
        });
      }
    }

    await task.save();

    const room = await Room.findById(task.roomId);
    if (room) {
      room.status = RoomStatus.CLEAN;
      room.lastCleanedAt = new Date();
      await room.save();
    }

    return task;
  }

  async verify(id: string, userId: string, notes?: string): Promise<IHousekeepingTask> {
    const task = await this.findById(id);

    if (task.status !== HousekeepingTaskStatus.COMPLETED) {
      throw new BadRequestError("Can only verify completed tasks");
    }

    task.status = HousekeepingTaskStatus.VERIFIED;
    task.verifiedAt = new Date();
    task.verifiedBy = new Types.ObjectId(userId);

    if (notes) {
      task.notes = notes;
    }

    await task.save();

    const room = await Room.findById(task.roomId);
    if (room) {
      room.status = RoomStatus.INSPECTED;
      room.lastInspectedAt = new Date();
      await room.save();
    }

    return task;
  }

  async assign(id: string, assignedTo: string): Promise<IHousekeepingTask> {
    const task = await this.findById(id);

    if (!Types.ObjectId.isValid(assignedTo)) {
      throw new BadRequestError("Invalid user ID");
    }

    const user = await User.findById(assignedTo);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    task.assignedTo = new Types.ObjectId(assignedTo);
    await task.save();

    return task;
  }

  async reportIssue(
    id: string,
    description: string,
    severity: string
  ): Promise<IHousekeepingTask> {
    const task = await this.findById(id);

    task.issues.push({
      description,
      severity,
      reportedAt: new Date(),
    });

    await task.save();
    return task;
  }

  async list(
    filters: ListTasksFilters,
    page: number = 1,
    limit: number = 50
  ): Promise<PaginatedResult<IHousekeepingTask>> {
    const query: any = {};

    if (filters.propertyId) {
      query.propertyId = new Types.ObjectId(filters.propertyId);
    }

    if (filters.roomId) {
      query.roomId = new Types.ObjectId(filters.roomId);
    }

    if (filters.assignedTo) {
      query.assignedTo = new Types.ObjectId(filters.assignedTo);
    }

    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.type) {
      query.type = filters.type;
    }

    if (filters.priority) {
      query.priority = filters.priority;
    }

    if (filters.scheduledDate) {
      const date = parseDate(filters.scheduledDate);
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);
      query.scheduledDate = { $gte: date, $lt: nextDay };
    } else if (filters.fromDate || filters.toDate) {
      query.scheduledDate = {};
      if (filters.fromDate) {
        query.scheduledDate.$gte = parseDate(filters.fromDate);
      }
      if (filters.toDate) {
        query.scheduledDate.$lte = parseDate(filters.toDate);
      }
    }

    const pagination = getPaginationParams(page, limit);

    const [tasks, total] = await Promise.all([
      HousekeepingTask.find(query)
        .populate("roomId", "roomNumber floor")
        .populate("assignedTo", "name email")
        .sort({ priority: -1, scheduledDate: 1 })
        .skip(pagination.skip)
        .limit(pagination.limit),
      HousekeepingTask.countDocuments(query),
    ]);

    return createPaginatedResult(tasks, total, pagination);
  }

  async getDashboard(propertyId: string): Promise<{
    pending: number;
    inProgress: number;
    completed: number;
    verified: number;
    todaysTasks: number;
    urgentTasks: number;
  }> {
    if (!Types.ObjectId.isValid(propertyId)) {
      throw new BadRequestError("Invalid property ID");
    }

    const today = getTodayUTC();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [statusCounts, todaysTasks, urgentTasks] = await Promise.all([
      HousekeepingTask.aggregate([
        { $match: { propertyId: new Types.ObjectId(propertyId) } },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
      HousekeepingTask.countDocuments({
        propertyId: new Types.ObjectId(propertyId),
        scheduledDate: { $gte: today, $lt: tomorrow },
        status: { $nin: [HousekeepingTaskStatus.COMPLETED, HousekeepingTaskStatus.VERIFIED] },
      }),
      HousekeepingTask.countDocuments({
        propertyId: new Types.ObjectId(propertyId),
        priority: HousekeepingPriority.URGENT,
        status: { $nin: [HousekeepingTaskStatus.COMPLETED, HousekeepingTaskStatus.VERIFIED] },
      }),
    ]);

    const counts = {
      pending: 0,
      inProgress: 0,
      completed: 0,
      verified: 0,
    };

    for (const item of statusCounts) {
      if (item._id === HousekeepingTaskStatus.PENDING) counts.pending = item.count;
      else if (item._id === HousekeepingTaskStatus.IN_PROGRESS) counts.inProgress = item.count;
      else if (item._id === HousekeepingTaskStatus.COMPLETED) counts.completed = item.count;
      else if (item._id === HousekeepingTaskStatus.VERIFIED) counts.verified = item.count;
    }

    return {
      ...counts,
      todaysTasks,
      urgentTasks,
    };
  }

  async createCheckoutTask(
    propertyId: string,
    roomId: string,
    bookingId: string
  ): Promise<IHousekeepingTask> {
    return this.create({
      propertyId,
      roomId,
      bookingId,
      type: HousekeepingTaskType.CHECKOUT_CLEAN,
      priority: HousekeepingPriority.HIGH,
      scheduledDate: new Date(),
    });
  }
}

export const housekeepingService = new HousekeepingService();
