import 'dotenv/config';
import { buildServer } from './shared/fastify';
import { registerAuthRoutes } from './auth/src/main';
import { registerUserRoutes } from './user/src/main';
import { registerGameRoutes } from './game/src/main';
import prismaPlugin from './shared/utils/prisma';

// Validate environment variables
const requiredEnvVars = [
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET'
];

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error('❌ Error: Missing required environment variables:');
  missingEnvVars.forEach(envVar => console.error(`   - ${envVar}`));
  console.error('Please create a .env file with these variables.');
  process.exit(1);
}

async function start() {
  const app = buildServer();
  
  await app.register(prismaPlugin);
  
  await registerAuthRoutes(app);
  await registerUserRoutes(app);
  await registerGameRoutes(app);
  
  const port = parseInt(process.env.PORT || '3000', 10);
  
  try {
    await app.listen({ port, host: '0.0.0.0' });
    console.log(`✅ Server running on http://localhost:${port}`);
    console.log(`   - Auth routes: http://localhost:${port}/auth/*`);
    console.log(`   - User routes: http://localhost:${port}/user/*`);
    console.log(`   - Game routes: http://localhost:${port}/game/*`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

start();