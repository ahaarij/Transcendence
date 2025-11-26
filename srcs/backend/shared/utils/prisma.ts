const fp = require("fastify-plugin");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

module.exports = fp(async (fastify: any) => {
  fastify.decorate("prisma", prisma);
  fastify.addHook("onClose", async () => {
    await prisma.$disconnect();
  });
});
