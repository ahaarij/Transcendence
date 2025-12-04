import Fastify from "fastify"; //safe for using app and not setting it to something dumb
import cors from "@fastify/cors";
import fastifyStatic from "@fastify/static";
import path from "path";

export function buildServer() { 
  const app = Fastify({ logger: true }); //creates fastify instance logger is true so we can work with requests

  app.register(cors, { origin: "*" }); //registers the CORS plugin * for any domain

  app.register(fastifyStatic, {
    root: path.join(__dirname, "..", "public"),
    prefix: "/public/",
  });

  return app; //returns fastify instance
}
