export { default as requireAuth } from "./requireAuth";
export { default as requiredRole } from "./requiredRole";
export { errorHandler, notFoundHandler } from "./errorHandler";
export {
  validate,
  validateBody,
  validateQuery,
  validateParams,
  type ValidatedRequest,
} from "./validateRequest";

import requiredRole from "./requiredRole";
import { Role } from "../common/enums/role.enum";

/**
 * Hotel-specific role middleware helpers
 */
export const requireManager = requiredRole(Role.ADMIN);
export const requireFrontDesk = requiredRole(Role.MODERATOR, Role.ADMIN);
export const requireHousekeeping = requiredRole(Role.EDITOR, Role.MODERATOR, Role.ADMIN);
export const requireStaff = requiredRole(Role.VIEWER, Role.EDITOR, Role.MODERATOR, Role.ADMIN);
export const requireGuest = requiredRole(Role.USER, Role.MODERATOR, Role.ADMIN);
