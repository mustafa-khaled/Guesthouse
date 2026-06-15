import { Schema, model } from "mongoose";
import { Role } from "../common/enums/role.enum";

export enum AuthProvider {
  LOCAL = "local",
  GOOGLE = "google",
}

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: false,
    },
    role: {
      type: String,
      enum: Object.values(Role),
      default: Role.USER,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    name: {
      type: String,
    },
    authProvider: {
      type: String,
      enum: Object.values(AuthProvider),
      default: AuthProvider.LOCAL,
    },
    googleId: {
      type: String,
      sparse: true,
      unique: true,
    },
    tokenVersion: {
      type: Number,
      default: 0,
    },
    resetPasswordToken: {
      type: String,
      default: undefined,
    },
    resetPasswordExpires: {
      type: Date,
      default: undefined,
    },
  },
  { timestamps: true },
);

export const User = model("User", userSchema);
