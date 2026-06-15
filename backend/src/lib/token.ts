import jwt from "jsonwebtoken";
import { Role } from "../common/enums/role.enum";

export interface AccessTokenPayload {
  sub: string;
  role: Role;
  tokenVersion: number;
}

export interface RefreshTokenPayload {
  sub: string;
  tokenVersion: number;
}

export function createAccessToken(
  userId: string,
  role: Role,
  tokenVersion: number,
) {
  const payload: AccessTokenPayload = { sub: userId, role, tokenVersion };

  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET!, {
    expiresIn: "30m",
  });
}

export function createRefreshToken(userId: string, tokenVersion: number) {
  const payload: RefreshTokenPayload = { sub: userId, tokenVersion };

  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET!, {
    expiresIn: "7d",
  });
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as RefreshTokenPayload;
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as AccessTokenPayload;
}
