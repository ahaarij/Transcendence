import 'dotenv/config';
import { buildServer } from '../shared/fastify';
import { registerGameRoutes } from './src/main';
import prismaPlugin from '../shared/utils/prisma';

// game microservice - handles match recording, game history, stats
async function startGameService() {
  const app = buildServer();
  
  // registers database connection
  await app.register(prismaPlugin);
  
  // registers all game routes
  await registerGameRoutes(app);
  
  const port = parseInt(process.env.GAME_PORT || '3003', 10);
  
  try {
    await app.listen({ port, host: '0.0.0.0' });
    console.log(`🎮 Game Service running on http://localhost:${port}`);
    console.log(`   - POST /game/match - record match result`);
    console.log(`   - GET  /game/history/:userId - get match history`);
    console.log(`   - GET  /game/stats/:userId - get detailed stats`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

startGameService();
