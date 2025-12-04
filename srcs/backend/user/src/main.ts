import type { FastifyInstance } from 'fastify';

export async function registerUserRoutes(app: FastifyInstance) {
  app.get("/user/health", async () => ({ status: "ok", service: "user" }));
  
  // Get public profile by username
  app.get("/user/profile/:username", async (request, reply) => {
    try {
      const { username } = request.params as { username: string };
      
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
        return reply.status(404).send({ error: "User not found" });
      }

      return reply.send(user);
    } catch (error) {
      console.error("Get profile error:", error);
      return reply.status(500).send({ error: "Internal server error" });
    }
  });

  // Update own profile
  app.put("/user/me", async (request, reply) => {
    try {
      const authHeader = request.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return reply.status(401).send({ error: "Missing or invalid token" });
      }
      
      const token = authHeader.split(" ")[1];
      const decoded = app.jwt.verify(token) as { userId: number };
      
      const { username, avatar } = request.body as { username?: string; avatar?: string };
      
      // Check if username is taken if it's being changed
      if (username) {
        const existing = await app.prisma.user.findUnique({
          where: { username },
        });
        if (existing && existing.id !== decoded.userId) {
          return reply.status(400).send({ error: "Username already taken" });
        }
      }

      const updatedUser = await app.prisma.user.update({
        where: { id: decoded.userId },
        data: {
          ...(username && { username }),
          ...(avatar && { avatar }),
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
      console.error("Update profile error:", error);
      return reply.status(500).send({ error: "Internal server error" });
    }
  });
}