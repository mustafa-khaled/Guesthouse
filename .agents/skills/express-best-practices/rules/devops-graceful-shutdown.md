# Graceful Shutdown

`server.ts` handles SIGTERM/SIGINT with ordered resource cleanup. Follow this pattern when adding new connections.

## Shutdown order

```
1. server.close()        — stop accepting new HTTP connections
2. closeSocket()         — disconnect Socket.IO clients
3. stopWorkers()         — stop BullMQ workers
4. closeQueues()         — close BullMQ queue connections
5. disconnectRedis()     — close Redis client
6. mongoose.disconnect() — close MongoDB connection
7. process.exit(0)
```

30-second forced exit timeout if cleanup hangs.

## Good

```typescript
// server.ts — already implemented
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

async function gracefulShutdown(signal: string) {
  server.close(async () => {
    await closeSocket();
    await stopWorkers();
    await closeQueues();
    await disconnectRedis();
    await mongoose.disconnect();
    process.exit(0);
  });
}
```

## Bad

```typescript
// New long-lived connection without cleanup
const wsClient = new WebSocket('wss://external.api');
// no close in gracefulShutdown — leaks on deploy

// process.exit(0) immediately — drops in-flight requests
process.on('SIGTERM', () => process.exit(0));

// Starting workers without stopWorkers counterpart
startWorkers(); // no stopWorkers in shutdown
```

## Rules

- Any new persistent connection (WebSocket client, interval, stream) needs a cleanup function called in `gracefulShutdown`
- Docker/K8s sends SIGTERM — do not rely on SIGINT only
- Workers must drain or stop gracefully via `stopWorkers()`
- Do not start new work after `server.close()` begins
