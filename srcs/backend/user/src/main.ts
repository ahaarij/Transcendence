import type { FastifyInstance } from 'fastify';

export async function registerUserRoutes(app: FastifyInstance) {
  app.get("/user/health", async () => ({ status: "ok", service: "user" }));
  
  // TODO: Add more user routes here (get profile, update profile, etc.)
}