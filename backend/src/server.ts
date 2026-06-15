import dotenv from "dotenv";
import http from "http";
import { connectDB } from "./config/db";
import app from "./app";

dotenv.config();

async function startServer() {
  await connectDB();

  const server = http.createServer(app);
  server.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
  });
}

startServer().catch((error) => {
  console.error(error);
  process.exit(1);
});
