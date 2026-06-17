import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { logger } from "./logger";
import { Role } from "../common/enums/role.enum";

export interface SocketUser {
  id: string;
  email: string;
  role: Role;
  propertyId?: string;
}

export interface AuthenticatedSocket extends Socket {
  user: SocketUser;
}

let io: Server | null = null;

export function initializeSocket(httpServer: HttpServer): Server {
  io = new Server(httpServer, {
    cors: {
      origin: env.FRONTEND_URL,
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  io.use(authenticateSocket);

  io.on("connection", (socket: Socket) => {
    const authSocket = socket as AuthenticatedSocket;
    const user = authSocket.user;

    logger.info({ userId: user.id, socketId: socket.id }, "Socket connected");

    socket.join(`user:${user.id}`);

    if (user.role === Role.ADMIN) {
      socket.join("admin");
    }

    if (user.role === Role.ADMIN) {
      socket.join("managers");
    }

    if (user.role === Role.MODERATOR || user.role === Role.EDITOR || user.role === Role.ADMIN) {
      socket.join("staff");
    }

    socket.on("join:property", (propertyId: string) => {
      if (canAccessProperty(user, propertyId)) {
        socket.join(`property:${propertyId}`);
        logger.debug({ userId: user.id, propertyId }, "User joined property room");
      }
    });

    socket.on("leave:property", (propertyId: string) => {
      socket.leave(`property:${propertyId}`);
      logger.debug({ userId: user.id, propertyId }, "User left property room");
    });

    socket.on("join:front-desk", (propertyId: string) => {
      if (canAccessFrontDesk(user)) {
        socket.join(`front-desk:${propertyId}`);
        logger.debug({ userId: user.id, propertyId }, "User joined front-desk room");
      }
    });

    socket.on("join:housekeeping", (propertyId: string) => {
      if (canAccessHousekeeping(user)) {
        socket.join(`housekeeping:${propertyId}`);
        logger.debug({ userId: user.id, propertyId }, "User joined housekeeping room");
      }
    });

    socket.on("join:dashboard", (propertyId: string) => {
      if (canAccessDashboard(user)) {
        socket.join(`dashboard:${propertyId}`);
        logger.debug({ userId: user.id, propertyId }, "User joined dashboard room");
      }
    });

    socket.on("disconnect", (reason) => {
      logger.info({ userId: user.id, socketId: socket.id, reason }, "Socket disconnected");
    });

    socket.on("error", (error) => {
      logger.error({ userId: user.id, socketId: socket.id, error }, "Socket error");
    });
  });

  logger.info("Socket.IO server initialized");
  return io;
}

function authenticateSocket(socket: Socket, next: (err?: Error) => void): void {
  try {
    const token = 
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization?.replace("Bearer ", "");

    if (!token) {
      return next(new Error("Authentication required"));
    }

    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as {
      sub: string;
      email?: string;
      role: Role;
    };

    (socket as AuthenticatedSocket).user = {
      id: payload.sub,
      email: payload.email || "",
      role: payload.role,
    };

    next();
  } catch (error) {
    logger.warn({ error }, "Socket authentication failed");
    next(new Error("Invalid token"));
  }
}

function canAccessProperty(user: SocketUser, _propertyId: string): boolean {
  if (user.role === Role.ADMIN) return true;
  if (user.role === Role.MODERATOR) return true;
  if (user.role === Role.EDITOR) return true;
  return false;
}

function canAccessFrontDesk(user: SocketUser): boolean {
  return [Role.ADMIN, Role.MODERATOR].includes(user.role);
}

function canAccessHousekeeping(user: SocketUser): boolean {
  return [Role.ADMIN, Role.MODERATOR, Role.EDITOR].includes(user.role);
}

function canAccessDashboard(user: SocketUser): boolean {
  return [Role.ADMIN].includes(user.role);
}

export function getIO(): Server | null {
  return io;
}

export function emitToProperty(propertyId: string, event: string, data: any): void {
  if (io) {
    io.to(`property:${propertyId}`).emit(event, data);
    logger.debug({ propertyId, event }, "Emitted to property room");
  }
}

export function emitToFrontDesk(propertyId: string, event: string, data: any): void {
  if (io) {
    io.to(`front-desk:${propertyId}`).emit(event, data);
    logger.debug({ propertyId, event }, "Emitted to front-desk room");
  }
}

export function emitToHousekeeping(propertyId: string, event: string, data: any): void {
  if (io) {
    io.to(`housekeeping:${propertyId}`).emit(event, data);
    logger.debug({ propertyId, event }, "Emitted to housekeeping room");
  }
}

export function emitToDashboard(propertyId: string, event: string, data: any): void {
  if (io) {
    io.to(`dashboard:${propertyId}`).emit(event, data);
    logger.debug({ propertyId, event }, "Emitted to dashboard room");
  }
}

export function emitToUser(userId: string, event: string, data: any): void {
  if (io) {
    io.to(`user:${userId}`).emit(event, data);
    logger.debug({ userId, event }, "Emitted to user room");
  }
}

export function emitToManagers(event: string, data: any): void {
  if (io) {
    io.to("managers").emit(event, data);
    logger.debug({ event }, "Emitted to managers room");
  }
}

export function emitToStaff(event: string, data: any): void {
  if (io) {
    io.to("staff").emit(event, data);
    logger.debug({ event }, "Emitted to staff room");
  }
}

export function emitToAll(event: string, data: any): void {
  if (io) {
    io.emit(event, data);
    logger.debug({ event }, "Emitted to all");
  }
}

export function closeSocket(): Promise<void> {
  return new Promise((resolve) => {
    if (io) {
      io.close(() => {
        io = null;
        logger.info("Socket.IO server closed");
        resolve();
      });
    } else {
      resolve();
    }
  });
}
