import Fastify from "fastify"; //safe for using app and not setting it to something dumb
import cors from "@fastify/cors";
import fastifyStatic from "@fastify/static";
import path from "path";

export function buildServer() { 
  const app = Fastify({ 
    logger: true,
    bodyLimit: 1048576 * 10 // 10MB limit for base64 images
  }); //creates fastify instance logger is true so we can work with requests

  app.register(cors, { 
    origin: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
  });

  app.register(fastifyStatic, {
    root: path.join(process.cwd(), "public"),
    prefix: "/public/",
  });

  return app; //returns fastify instance
}
