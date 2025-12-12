import type { FastifyInstance } from 'fastify';
import { comparePassword } from '../utils/password';
import { generateAccessToken, verifyToken } from '../utils/tokens';

export async function refreshAccessToken(app: FastifyInstance, request: any, reply: any) {
  try {
    const { refreshToken } = request.body as { refreshToken: string };
    
    if (!refreshToken) {
      return reply.status(400).send({ error: "refresh token required" }); //no token provided
    }
    
    const decoded = verifyToken(app, refreshToken); //verify refresh token
    
    const user = await app.prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user || !user.refreshToken) {
      return reply.status(401).send({ error: "invalid refresh token" }); //user not found or no refresh token stored
    }

    const isValidRefreshToken = await comparePassword(refreshToken, user.refreshToken); //check if refresh token matches stored hash

    if (!isValidRefreshToken) {
      return reply.status(401).send({ error: "invalid refresh token" }); //token doesn't match
    }

    const newAccessToken = await generateAccessToken(app, user.id); //generate new access token

    return reply.send({ accessToken: newAccessToken });
  } catch (error) {
    console.error("refresh token error:", error);
    return reply.status(401).send({ error: "invalid or expired refresh token" }); //token verification failed
  }
}
