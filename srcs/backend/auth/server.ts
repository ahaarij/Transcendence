import 'dotenv/config';
import { buildServer } from '../shared/fastify';
import { registerAuthRoutes } from './src/main';
import prismaPlugin from '../shared/utils/prisma';

// validates required environment variables for auth service
const requiredEnvVars = [
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET'
];

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error('❌ missing environment variables:');
  missingEnvVars.forEach(envVar => console.error(`   - ${envVar}`));
  process.exit(1);
}

// starts the auth microservice
async function start() {
  const app = buildServer();  // creates fastify app
  
  await app.register(prismaPlugin);  // adds database
  await registerAuthRoutes(app);  // registers auth routes
  
  const port = parseInt(process.env.PORT || '3001', 10);
  
  try {
    // starts auth service
    await app.listen({ port, host: '0.0.0.0' });
    console.log(`✅ auth service running on http://localhost:${port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

start();
