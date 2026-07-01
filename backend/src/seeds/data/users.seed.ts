import { Role } from "../../common/enums/role.enum";
import { AuthProvider } from "../../models/user.model";

export const usersSeed = [
  {
    email: "admin@guesthouse.com",
    password: "Admin123!@#",
    name: "System Admin",
    role: Role.ADMIN,
    authProvider: AuthProvider.LOCAL,
    isEmailVerified: true,
  },
  {
    email: "manager@guesthouse.com",
    password: "Manager123!@#",
    name: "Hotel Manager",
    role: Role.ADMIN,
    authProvider: AuthProvider.LOCAL,
    isEmailVerified: true,
  },
  {
    email: "staff@guesthouse.com",
    password: "Staff123!@#",
    name: "Front Desk Staff",
    role: Role.MODERATOR,
    authProvider: AuthProvider.LOCAL,
    isEmailVerified: true,
  },
  {
    email: "user@guesthouse.com",
    password: "User123!@#",
    name: "Test User",
    role: Role.USER,
    authProvider: AuthProvider.LOCAL,
    isEmailVerified: true,
  },
];
