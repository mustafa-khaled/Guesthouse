import type { TestProject } from 'vitest/node';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer: MongoMemoryServer;

export default async function setup(project: TestProject) {
  const existingUri = process.env.MONGODB_URI;
  if (existingUri) {
    project.provide('MONGODB_URI', existingUri);
    return;
  }

  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  process.env.MONGODB_URI = uri;
  project.provide('MONGODB_URI', uri);

  return async () => {
    if (mongoServer) await mongoServer.stop();
  };
}
