import jwt from "@fastify/jwt"; // imports jwt for authentications and stuff
import type { FastifyInstance } from 'fastify';

export async function registerAuthRoutes(app: FastifyInstance) {
  await app.register(jwt, { secret: process.env.JWT_ACCESS_SECRET || "dev-secret-fallback" });

  app.get("/auth/health", async () => ({ status: "ok", service: "auth" }));
  
  // TODO: Add more auth routes here (register, login, etc.)
}
