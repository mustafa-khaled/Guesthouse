/**
 * Role definitions for the Hotel Booking System
 * 
 * Role Mapping for Hotel Operations:
 * - ADMIN: Hotel Manager - Full access to all properties, users, reports
 * - MODERATOR: Front Desk - Check-in/out, booking management, guest profiles
 * - EDITOR: Housekeeping - Room status updates, task management
 * - USER: Guest - Own bookings, profile, reviews
 * - VIEWER: Read-only Staff - View dashboards, reports only
 */
export enum Role {
  USER = "user",
  ADMIN = "admin",
  MODERATOR = "moderator",
  EDITOR = "editor",
  VIEWER = "viewer",
}

export const RoleHierarchy: Record<Role, number> = {
  [Role.VIEWER]: 1,
  [Role.USER]: 2,
  [Role.EDITOR]: 3,
  [Role.MODERATOR]: 4,
  [Role.ADMIN]: 5,
};

export function hasMinimumRole(userRole: Role, requiredRole: Role): boolean {
  return RoleHierarchy[userRole] >= RoleHierarchy[requiredRole];
}

export const HotelRoles = {
  MANAGER: Role.ADMIN,
  FRONT_DESK: Role.MODERATOR,
  HOUSEKEEPING: Role.EDITOR,
  GUEST: Role.USER,
  READONLY_STAFF: Role.VIEWER,
} as const;
