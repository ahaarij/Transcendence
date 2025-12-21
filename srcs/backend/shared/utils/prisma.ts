import 'dotenv/config';
import fp from 'fastify-plugin';
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import Database from 'better-sqlite3';
import type { FastifyPluginAsync } from 'fastify';

// creates sqlite adapter for prisma
const adapter = new PrismaBetterSqlite3({ url: './prisma/dev.db' });

// initializes prisma client with sqlite adapter
const prisma = new PrismaClient({ 
  adapter,
  log: ['error', 'warn']  // only logs errors and warnings
});

// fastify plugin that adds prisma to app instance
const prismaPlugin: FastifyPluginAsync = async (fastify) => {
  // attaches prisma client to fastify instance
  fastify.decorate('prisma', prisma);
  
  // disconnects prisma when server closes
  fastify.addHook('onClose', async () => {
    await prisma.$disconnect();
  });
};

export default fp(prismaPlugin);
