import Fastify from "fastify"; //safe for using app and not setting it to something dumb
import cors from "@fastify/cors";

export function buildServer() { 
  const app = Fastify({ logger: true }); //creates fastify instance logger is true so we can work with requests

  app.register(cors, { origin: "*" }); //registers the CORS plugin * for any domain

  return app; //returns fastify instance
}
