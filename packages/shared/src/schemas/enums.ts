import { z } from 'zod'

export const RoleEnum = z.enum(['user', 'admin', 'moderator', 'editor', 'viewer'])
export type Role = z.infer<typeof RoleEnum>

export const BookingStatusEnum = z.enum([
  'pending',
  'confirmed',
  'checked-in',
  'checked-out',
  'cancelled',
  'no-show',
])
export type BookingStatus = z.infer<typeof BookingStatusEnum>

export const PaymentStatusEnum = z.enum([
  'pending',
  'partial',
  'paid',
  'refunded',
  'failed',
])
export type PaymentStatus = z.infer<typeof PaymentStatusEnum>

export const RoomStatusEnum = z.enum([
  'dirty',
  'clean',
  'inspected',
  'maintenance',
  'out-of-order',
])
export type RoomStatus = z.infer<typeof RoomStatusEnum>

export const BookingSourceEnum = z.enum([
  'direct',
  'website',
  'phone',
  'walk-in',
  'booking.com',
  'expedia',
  'airbnb',
  'other',
])
export type BookingSource = z.infer<typeof BookingSourceEnum>

export const HousekeepingTaskStatusEnum = z.enum([
  'pending',
  'in-progress',
  'completed',
  'verified',
  'cancelled',
])
export type HousekeepingTaskStatus = z.infer<typeof HousekeepingTaskStatusEnum>

export const HousekeepingPriorityEnum = z.enum(['low', 'normal', 'high', 'urgent'])
export type HousekeepingPriority = z.infer<typeof HousekeepingPriorityEnum>

export const RoleHierarchy: Record<Role, number> = {
  viewer: 1,
  user: 2,
  editor: 3,
  moderator: 4,
  admin: 5,
}

export function hasMinimumRole(userRole: Role, requiredRole: Role): boolean {
  return RoleHierarchy[userRole] >= RoleHierarchy[requiredRole]
}
