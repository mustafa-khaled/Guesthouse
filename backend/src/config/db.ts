import mongoose from "mongoose";
import { env } from "./env";
import { logger } from "../lib/logger";

export async function connectDB() {
  try {
    await mongoose.connect(env.MONGODB_URI);
    logger.info("Connected to MongoDB");
  } catch (error) {
    logger.fatal({ err: error }, "Failed to connect to MongoDB");
    process.exit(1);
  }
}
