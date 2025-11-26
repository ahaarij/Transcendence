const { buildServer } = require("../../shared/fastify");
const jwt = require("@fastify/jwt");
const prismaPlugin = require("../../shared/utils/prisma");

async function start() {
  const app = buildServer();

  await app.register(jwt, { secret: "dev-secret" });
  await app.register(prismaPlugin);

  app.get("/auth/health", async () => ({ status: "ok", service: "auth" }));

  try {
    await app.listen({ port: 3001, host: "0.0.0.0" });
    console.log("✅ Auth service running on http://localhost:3001");
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

start();
