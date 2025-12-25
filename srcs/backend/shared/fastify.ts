import Fastify from "fastify";
import cors from "@fastify/cors";
import fastifyStatic from "@fastify/static";
import path from "path";
import fs from "fs";

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

  // determines public directory path - use /app/public in docker, otherwise process.cwd()/public
  const publicDir = process.env.NODE_ENV === 'production' 
    ? '/app/public' 
    : path.join(process.cwd(), 'public');
  
  // ensures uploads directory exists for avatar storage
  const uploadsDir = path.join(publicDir, 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log(`✅ created uploads directory: ${uploadsDir}`);
  }

  // serves static files from public directory
  app.register(fastifyStatic, {
    root: publicDir,  // path to static files
    prefix: "/public/",  // url prefix for static files
    decorateReply: false,  // don't conflict with other plugins
    setHeaders: (res) => {
      // adds CORS headers for static files (avatars)
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    }
  });

  return app;
}
