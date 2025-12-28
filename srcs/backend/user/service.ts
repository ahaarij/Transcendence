import 'dotenv/config';
import jwt from "@fastify/jwt";
import { buildServer } from '../shared/fastify';
import { registerUserRoutes } from './src/main';
import prismaPlugin from '../shared/utils/prisma';

// user microservice - handles user profiles, friends, user data
async function startUserService() {
  const app = buildServer();
  
  // registers database connection
  await app.register(prismaPlugin);
  
  // sets up jwt for token verification (uses same secret as auth service)
  if (!process.env.JWT_ACCESS_SECRET) {
    throw new Error("JWT_ACCESS_SECRET is not defined");
  }
  await app.register(jwt, { 
    secret: process.env.JWT_ACCESS_SECRET,
    sign: { expiresIn: '15m' }
  });
  
  // registers all user routes
  await registerUserRoutes(app);
  
  const port = parseInt(process.env.USER_PORT || '3002', 10);
  
  try {
    await app.listen({ port, host: '0.0.0.0' });
    console.log(`👤 User Service running on http://localhost:${port}`);
    console.log(`   - GET  /user/profile/:username - get public profile`);
    console.log(`   - PUT  /user/me - update own profile`);
    console.log(`   - GET  /user/:userId - get user by id (internal)`);
    console.log(`   - POST /user/friends/request - send friend request`);
    console.log(`   - PUT  /user/friends/respond - accept/reject request`);
    console.log(`   - GET  /user/friends - get friends list`);
    console.log(`   - DELETE /user/friends/:id - remove friend`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

startUserService();
