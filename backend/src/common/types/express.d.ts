import { Role } from '../enums/role.enum';

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  role: Role;
  isEmailVerified: boolean;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
      requestId?: string;
    }
  }
}

declare module 'express-serve-static-core' {
  interface ParamsDictionary {
    [key: string]: string;
  }
}

export interface AuthenticatedRequest extends Express.Request {
  user: AuthUser;
}
