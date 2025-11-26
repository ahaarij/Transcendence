import 'dotenv/config';
import { buildServer } from './shared/fastify';
import { registerAuthRoutes } from './auth/src/main';
import { registerUserRoutes } from './user/src/main';
import prismaPlugin from './shared/utils/prisma';

async function start() {
  const app = buildServer();
  
  await app.register(prismaPlugin);
  
  await registerAuthRoutes(app);
  await registerUserRoutes(app);
  
  const port = parseInt(process.env.PORT || '3000', 10);
  
  try {
    await app.listen({ port, host: '0.0.0.0' });
    console.log(`✅ Server running on http://localhost:${port}`);
    console.log(`   - Auth routes: http://localhost:${port}/auth/*`);
    console.log(`   - User routes: http://localhost:${port}/user/*`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

start();