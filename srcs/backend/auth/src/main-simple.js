const Fastify = require("fastify");
const cors = require("@fastify/cors");

async function start() {
  const app = Fastify({ logger: true });

  await app.register(cors, { origin: "*" });

  app.get("/auth/health", async () => ({ status: "ok", service: "auth" }));

  try {
    await app.listen({ port: 3001, host: "0.0.0.0" });
    console.log("✅ Auth service is running on http://localhost:3001");
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

start();
