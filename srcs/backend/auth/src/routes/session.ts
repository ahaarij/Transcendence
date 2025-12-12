import type { FastifyInstance } from 'fastify';
import { verifyToken } from '../utils/tokens';

export async function logoutUser(app: FastifyInstance, request: any, reply: any) {
  try {
    const authHeader = request.headers.authorization;
    
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1]; //extract token from header
      const decoded = verifyToken(app, token); //get user id from token
      
      await app.prisma.user.update({
        where: { id: decoded.userId },
        data: { refreshToken: null }, //clear refresh token from database
      });
    }
    
    return { message: "logged out successfully" };
  } catch (error) {
    return { message: "logged out successfully" }; //still return success even if token invalid
  }
}

export async function getCurrentUser(app: FastifyInstance, request: any, reply: any) {
  try {
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return reply.status(401).send({ error: "missing or invalid token" }); //no token provided
    }
    
    const token = authHeader.split(" ")[1]; //extract token
    const decoded = verifyToken(app, token); //verify and decode token

    const user = await app.prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        username: true,
        email: true,
        avatar: true,
        createdAt: true,
      },
    });

    if (!user) {
      return reply.status(404).send({ error: "user not found" }); //user deleted
    }

    return reply.send({ user });
  } catch (err) {
    console.error(err);
    return reply.status(401).send({ error: "invalid or expired token" }); //token verification failed
  }
}
