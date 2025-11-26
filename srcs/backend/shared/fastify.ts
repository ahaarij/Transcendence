const Fastify = require("fastify");
const cors = require("@fastify/cors");

function buildServer() {
  const app = Fastify({ logger: true });

  app.register(cors, { origin: "*" });

  return app;
}

module.exports = { buildServer };
