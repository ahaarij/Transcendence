import jwt from "@fastify/jwt";
import type { FastifyInstance } from 'fastify';
import { registerUser } from './routes/register';
import { loginUser } from './routes/login';
import { logoutUser, getCurrentUser } from './routes/session';
import { refreshAccessToken } from './routes/refresh';
import { googleLogin } from './routes/google';

export async function registerAuthRoutes(app: FastifyInstance) {
  if (!process.env.JWT_ACCESS_SECRET) {
    throw new Error("JWT_ACCESS_SECRET is not defined in environment variables");
  }

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
  
  app.post("/auth/refresh", (request, reply) => refreshAccessToken(app, request, reply)); //get new access token using refresh token
  
  app.post("/auth/google", (request, reply) => googleLogin(app, request, reply)); //login or register with google account
}
