import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import httpProxy from '@fastify/http-proxy';

// api gateway - routes requests to appropriate microservices
// this is the single entry point for all client requests

const app = Fastify({ 
  logger: true,
  bodyLimit: 1048576 * 10  // 10mb for avatar uploads
});

// enables cors for frontend
app.register(cors, {
  origin: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
});

// service urls from environment or defaults
const AUTH_SERVICE = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';
const USER_SERVICE = process.env.USER_SERVICE_URL || 'http://localhost:3002';
const GAME_SERVICE = process.env.GAME_SERVICE_URL || 'http://localhost:3003';

// proxy auth routes to auth service
app.register(httpProxy, {
  upstream: AUTH_SERVICE,
  prefix: '/auth',
  rewritePrefix: '/auth',
  http2: false
});

// proxy user routes to user service
app.register(httpProxy, {
  upstream: USER_SERVICE,
  prefix: '/user',
  rewritePrefix: '/user',
  http2: false
});

// proxy game routes to game service
app.register(httpProxy, {
  upstream: GAME_SERVICE,
  prefix: '/game',
  rewritePrefix: '/game',
  http2: false
});

// health check endpoint for gateway itself
app.get('/health', async () => ({
  status: 'ok',
  service: 'api-gateway',
  uptime: process.uptime()
}));

// aggregated health check for all services
app.get('/health/all', async () => {
  const checkService = async (name: string, url: string) => {
    try {
      const response = await fetch(`${url}/${name}/health`, { 
        signal: AbortSignal.timeout(3000) 
      });
      const data = await response.json();
      return { name, status: data.status, healthy: data.status === 'ok' };
    } catch {
      return { name, status: 'unreachable', healthy: false };
    }
  };

  const results = await Promise.all([
    checkService('auth', AUTH_SERVICE),
    checkService('user', USER_SERVICE),
    checkService('game', GAME_SERVICE)
  ]);

  const allHealthy = results.every(r => r.healthy);

  return {
    status: allHealthy ? 'ok' : 'degraded',
    services: results
  };
});

// starts api gateway
async function startGateway() {
  const port = parseInt(process.env.GATEWAY_PORT || '3000', 10);
  
  try {
    await app.listen({ port, host: '0.0.0.0' });
    console.log(`🚀 API Gateway running on http://localhost:${port}`);
    console.log(`   Proxying to:`);
    console.log(`   - Auth Service:  ${AUTH_SERVICE}`);
    console.log(`   - User Service:  ${USER_SERVICE}`);
    console.log(`   - Game Service:  ${GAME_SERVICE}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

startGateway();
