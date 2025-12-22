import type { FastifyInstance } from 'fastify';
import * as fs from 'fs';
import * as path from 'path';

// registers all user related routes to fastify app
export async function registerUserRoutes(app: FastifyInstance) {
  // health check endpoint for user service
  app.get("/user/health", async () => ({ status: "ok", service: "user" }));
  
  // gets public profile info by username
  app.get("/user/profile/:username", async (request, reply) => {
    try {
      const { username } = request.params as { username: string };
      
      // finds user in database by username
      const user = await app.prisma.user.findUnique({
        where: { username },
        select: {
          id: true,
          username: true,
          avatar: true,
          createdAt: true,
        }
      });

      if (!user) {
        return reply.status(404).send({ error: "user not found" });
      }

      return reply.send(user);
    } catch (error) {
      console.error("get profile error:", error);
      return reply.status(500).send({ error: "internal server error" });
    }
  });

  // updates own profile info
  app.put("/user/me", async (request, reply) => {
    try {
      // extracts and verifies auth token
      const authHeader = request.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return reply.status(401).send({ error: "missing or invalid token" });
      }
      
      const token = authHeader.split(" ")[1];
      const decoded = app.jwt.verify(token) as { userId: string };
      
      const { username, avatar } = request.body as { username?: string; avatar?: string };
      
      let avatarUrl = avatar;

      // handles base64 image upload if provided
      if (avatar && avatar.startsWith('data:image')) {
        try {
          // extracts image data from base64 string
          const matches = avatar.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
          if (matches && matches.length === 3) {
            const type = matches[1];
            const buffer = Buffer.from(matches[2], 'base64');
            const extension = type.split('/')[1];
            const filename = `avatar-${decoded.userId}-${Date.now()}.${extension}`;
            const uploadDir = '/app/public/uploads';
            
            // creates upload directory if it doesnt exist
            if (!fs.existsSync(uploadDir)) {
              fs.mkdirSync(uploadDir, { recursive: true });
            }
            
            // saves avatar file to disk
            const filepath = path.join(uploadDir, filename);
            fs.writeFileSync(filepath, buffer);
            
            avatarUrl = `/public/uploads/${filename}`;
          }
        } catch (err) {
          console.error("failed to save avatar:", err);
        }
      }

      // checks if username is taken if changing username
      if (username) {
        const existing = await app.prisma.user.findUnique({
          where: { username },
        });
        if (existing && existing.id !== decoded.userId) {
          return reply.status(400).send({ error: "username already taken" });
        }
      }

      // updates user in database with new info
      const updatedUser = await app.prisma.user.update({
        where: { id: decoded.userId },
        data: {
          ...(username && { username }),
          ...(avatarUrl && { avatar: avatarUrl }),
        },
        select: {
          id: true,
          username: true,
          email: true,
          avatar: true,
        }
      });

      return reply.send(updatedUser);
    } catch (error) {
      console.error("update profile error:", error);
      return reply.status(500).send({ error: "internal server error" });
    }
  });

  // gets user info by id for internal service calls
  app.get("/user/:userId", async (request, reply) => {
    try {
      // extracts and verifies auth token
      const authHeader = request.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return reply.status(401).send({ error: "missing or invalid token" });
      }

      const { userId } = request.params as { userId: string };

      // validates user id is provided
      if (!userId) {
        return reply.status(400).send({ error: "invalid user id" });
      }

      // finds user in database by id (uuid string)
      const user = await app.prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          username: true,
          email: true,
          avatar: true,
          createdAt: true,
        }
      });

      if (!user) {
        return reply.status(404).send({ error: "user not found" });
      }

      return reply.send(user);
    } catch (error) {
      console.error("get user error:", error);
      return reply.status(500).send({ error: "internal server error" });
    }
  });
}