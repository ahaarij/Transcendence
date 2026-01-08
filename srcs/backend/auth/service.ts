import 'dotenv/config';
import { buildServer } from '../shared/fastify';
import { registerAuthRoutes } from './src/main';
import prismaPlugin from '../shared/utils/prisma';

// auth microservice - handles authentication, registration, login, 2fa, tokens
async function startAuthService() {
  const app = buildServer();
  
  // registers database connection
  await app.register(prismaPlugin);
  
  // registers all auth routes
  await registerAuthRoutes(app);
  
  const port = parseInt(process.env.AUTH_PORT || '3001', 10);
  
  try {
    await app.listen({ port, host: '0.0.0.0' });
    console.log(`🔐 Auth Service running on http://localhost:${port}`);
    console.log(`   - POST /auth/register - create new account`);
    console.log(`   - POST /auth/login - login with email/password`);
    console.log(`   - POST /auth/google - login with google`);
    console.log(`   - POST /auth/logout - logout user`);
    console.log(`   - POST /auth/refresh - refresh access token`);
    console.log(`   - GET  /auth/me - get current user`);
    console.log(`   - GET  /auth/verify - verify token (internal)`);
    console.log(`   - POST /auth/2fa/* - 2fa endpoints`);
    console.log(`   - POST /auth/password/change - change password`);
    console.log(`   - DELETE /auth/account - delete account`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

startAuthService();
