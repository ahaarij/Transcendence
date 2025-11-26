const { buildServer } = require("../../shared/fastify");
const prismaPlugin = require("../../shared/utils/prisma");

async function start() {
  const app = buildServer();

  await app.register(prismaPlugin);

  app.get("/user/health", async () => ({ status: "ok", service: "user" }));

  try {
    await app.listen({ port: 3002, host: "0.0.0.0" });
    console.log("✅ User service running on http://localhost:3002");
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

start();
