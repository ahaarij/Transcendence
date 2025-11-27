import 'dotenv/config';
import fp from 'fastify-plugin';
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import Database from 'better-sqlite3';
import type { FastifyPluginAsync } from 'fastify';

const adapter = new PrismaBetterSqlite3({ url: './prisma/dev.db' });

const prisma = new PrismaClient({ 
  adapter,
  log: ['error', 'warn']
});

const prismaPlugin: FastifyPluginAsync = async (fastify) => {
  fastify.decorate('prisma', prisma);
  
  fastify.addHook('onClose', async () => {
    await prisma.$disconnect();
  });
};

export default fp(prismaPlugin);
