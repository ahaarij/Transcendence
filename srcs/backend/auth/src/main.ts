import jwt from "@fastify/jwt";
import type { FastifyInstance } from 'fastify';
import { registerUser } from './routes/register';
import { loginUser } from './routes/login';
import { logoutUser, getCurrentUser, verifyTokenEndpoint } from './routes/session';
import { refreshAccessToken } from './routes/refresh';
import { googleLogin } from './routes/google';
import { enable2FA, verify2FA, disable2FA, validate2FALogin } from './routes/twofa';
import { deleteAccount } from './routes/delete';
import { changePassword } from './routes/password';

// registers all auth related routes to fastify app
export async function registerAuthRoutes(app: FastifyInstance) {
  if (!process.env.JWT_ACCESS_SECRET) {
    throw new Error("JWT_ACCESS_SECRET is not defined in environment variables");
  }

  // sets up jwt authentication plugin
  await app.register(jwt, { 
    secret: process.env.JWT_ACCESS_SECRET, //secret key for signing tokens
    sign: {
      expiresIn: '15m' //access tokens expire in 15 minutes for security
    }
  });

  app.get("/auth/health", async () => ({ status: "ok", service: "auth" })); //health check endpoint
  
  app.post("/auth/register", (request, reply) => registerUser(app, request, reply)); //create new user account
  
  app.post("/auth/login", (request, reply) => loginUser(app, request, reply)); //login with email and password
  
  app.post("/auth/logout", (request, reply) => logoutUser(app, request, reply)); //logout and clear refresh token
  
  app.get("/auth/me", (request, reply) => getCurrentUser(app, request, reply)); //get current logged in user info
  
  app.get("/auth/verify", (request, reply) => verifyTokenEndpoint(app, request, reply)); //verify token for internal services

  app.post("/auth/refresh", (request, reply) => refreshAccessToken(app, request, reply)); //get new access token using refresh token
  
  app.post("/auth/google", (request, reply) => googleLogin(app, request, reply)); //login or register with google account

  app.post("/auth/2fa/enable", (request, reply) => enable2FA(app, request, reply)); //start 2fa setup and get qr code
  
  app.post("/auth/2fa/verify", (request, reply) => verify2FA(app, request, reply)); //verify totp code and activate 2fa
  
  app.post("/auth/2fa/disable", (request, reply) => disable2FA(app, request, reply)); //turn off 2fa for account
  
  app.post("/auth/2fa/validate", (request, reply) => validate2FALogin(app, request, reply)); //verify 2fa code during login

  app.delete("/auth/account", (request, reply) => deleteAccount(app, request, reply)); //permanently delete user account

  app.post("/auth/password/change", (request, reply) => changePassword(app, request, reply)); //change user password
}
