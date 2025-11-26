const fp = require("fastify-plugin");
const { PrismaClient } = require("@prisma/client");
const { PrismaBetterSqlite3 } = require("@prisma/adapter-better-sqlite3");
const Database = require("better-sqlite3");

// Create the adapter with the database file
const db = new Database("./prisma/dev.db");
const adapter = new PrismaBetterSqlite3(db);

// Create Prisma Client with the adapter
const prisma = new PrismaClient({ adapter });

module.exports = fp(async (fastify) => {
  fastify.decorate("prisma", prisma);
  fastify.addHook("onClose", async () => {
    await prisma.$disconnect();
  });
});
