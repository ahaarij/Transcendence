import type { FastifyInstance } from 'fastify';
import { verifyToken } from '../utils/tokens';

// logs user out by clearing refresh token
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

// gets current logged in user info
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
    });

    if (!user) {
      return reply.status(404).send({ error: "user not found" }); //user deleted
    }

    // returns user profile data without sensitive info
    return reply.send({ 
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        createdAt: user.createdAt,
        twoFactorEnabled: user.twoFactorEnabled,
        hasPassword: !!user.password
      }
    });
  } catch (err) {
    console.error(err);
    return reply.status(401).send({ error: "invalid or expired token" }); //token verification failed
  }
}

// verifies token for internal service communication
export async function verifyTokenEndpoint(app: FastifyInstance, request: any, reply: any) {
  try {
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return reply.status(401).send({ error: "missing or invalid token" }); //no token provided
    }
    
    const token = authHeader.split(" ")[1]; //extract token
    const decoded = verifyToken(app, token); //verify and decode token

    // returns user id if token is valid
    return reply.send({ userId: decoded.userId, valid: true });
  } catch (err) {
    return reply.status(401).send({ error: "invalid or expired token", valid: false }); //token verification failed
  }
}

