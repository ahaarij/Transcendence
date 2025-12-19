import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { comparePassword } from '../utils/password';

// deletes user account permanently
export async function deleteAccount(app: FastifyInstance, request: FastifyRequest, reply: FastifyReply) {
  try {
    // gets auth token from header
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return reply.status(401).send({ error: "missing or invalid token" });
    }

    // extracts and verifies jwt token
    const token = authHeader.split(" ")[1];
    const decoded = app.jwt.verify(token) as { userId: number };

    // gets password from request body for confirmation
    const { password } = request.body as { password: string };

    if (!password) {
      return reply.status(400).send({ error: "password required to delete account" });
    }

    // finds user in database
    const user = await app.prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      return reply.status(404).send({ error: "user not found" });
    }

    // verifies password before deletion
    if (user.password) {
      const validPassword = await comparePassword(password, user.password);
      
      if (!validPassword) {
        return reply.status(401).send({ error: "invalid password" });
      }
    }

    // deletes all user matches first
    await app.prisma.match.deleteMany({
      where: { userId: decoded.userId },
    });

    // deletes user account
    await app.prisma.user.delete({
      where: { id: decoded.userId },
    });

    return reply.send({ message: "account deleted successfully" });
  } catch (error) {
    console.error("delete account error:", error);
    return reply.status(500).send({ error: "internal server error" });
  }
}
