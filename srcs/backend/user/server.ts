import 'dotenv/config';
import { buildServer } from '../shared/fastify';
import { registerUserRoutes } from './src/main';
import prismaPlugin from '../shared/utils/prisma';
import jwt from '@fastify/jwt';

// starts the user microservice
async function start() {
  const app = buildServer();  // creates fastify app
  
  await app.register(prismaPlugin);  // adds database
  
  // registers jwt for token verification
  await app.register(jwt, {
    secret: process.env.JWT_ACCESS_SECRET || 'your-secret-key',
  });
  
  await registerUserRoutes(app);  // registers user routes
  
  const port = parseInt(process.env.PORT || '3002', 10);
  
  try {
    // starts user service
    await app.listen({ port, host: '0.0.0.0' });
    console.log(`✅ user service running on http://localhost:${port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

start();
