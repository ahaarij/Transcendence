import Fastify from "fastify";
import cors from "@fastify/cors";
import fastifyStatic from "@fastify/static";
import path from "path";

// builds and configures fastify server instance
export function buildServer() { 
  // creates fastify instance with logging and increased body limit
  const app = Fastify({ 
    logger: true,  // enables logging for debugging
    bodyLimit: 1048576 * 10  // allows 10mb uploads for avatars
  });

  // enables cors for frontend requests
  app.register(cors, { 
    origin: true,  // allows all origins
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],  // allowed http methods
    allowedHeaders: ["Content-Type", "Authorization"],  // allowed request headers
    credentials: true  // allows cookies and auth headers
  });

  // serves static files from public directory
  app.register(fastifyStatic, {
    root: path.join(process.cwd(), "public"),  // path to static files
    prefix: "/public/",  // url prefix for static files
  });

  return app;
}
