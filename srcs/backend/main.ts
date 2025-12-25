import 'dotenv/config';
import { buildServer } from './shared/fastify';
import { registerAuthRoutes } from './auth/src/main';
import { registerUserRoutes } from './user/src/main';
import { registerGameRoutes } from './game/src/main';
import prismaPlugin from './shared/utils/prisma';

// validates all required environment variables exist
const requiredEnvVars = [
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET'
];

// checks if any required env vars are missing
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error('❌ error: missing required environment variables:');
  missingEnvVars.forEach(envVar => console.error(`   - ${envVar}`));
  console.error('please create a .env file with these variables.');
  process.exit(1);
}

// starts the main server with all services
async function start() {
  const app = buildServer();  // creates fastify app
  
  await app.register(prismaPlugin);  // adds database connection

  // registers all microservice routes
  await registerAuthRoutes(app);  // auth service routes
  await registerUserRoutes(app);  // user service routes
  await registerGameRoutes(app);  // game service routes
  
  const port = parseInt(process.env.PORT || '3000', 10);
  
  try {
    // starts server on configured port
    await app.listen({ port, host: '0.0.0.0' });
    console.log(`✅ server running on http://localhost:${port}`);
    console.log(`   - auth routes: http://localhost:${port}/auth/*`);
    console.log(`   - user routes: http://localhost:${port}/user/*`);
    console.log(`   - game routes: http://localhost:${port}/game/*`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

// starts the application
start();