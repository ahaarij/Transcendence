import 'dotenv/config';
import { buildServer } from '../shared/fastify';
import { registerGameRoutes } from './src/main';
import prismaPlugin from '../shared/utils/prisma';

// starts the game microservice
async function start() {
  const app = buildServer();  // creates fastify app
  
  await app.register(prismaPlugin);  // adds database
  await registerGameRoutes(app);  // registers game routes
  
  const port = parseInt(process.env.PORT || '3003', 10);
  
  try {
    // starts game service
    await app.listen({ port, host: '0.0.0.0' });
    console.log(`✅ game service running on http://localhost:${port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

start();
