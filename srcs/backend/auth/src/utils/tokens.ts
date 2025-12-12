import type { FastifyInstance } from 'fastify';

export async function generateAccessToken(app: FastifyInstance, userId: number): Promise<string> {
  return app.jwt.sign({ userId }); //creates access token that expires in 15 mins
}

export async function generateRefreshToken(app: FastifyInstance, userId: number): Promise<string> {
  return app.jwt.sign(
    { userId, type: 'refresh' },
    { expiresIn: '7d' } //refresh token lasts 7 days to keep user logged in
  );
}

export function verifyToken(app: FastifyInstance, token: string): { userId: number } {
  return app.jwt.verify(token) as { userId: number }; //validates token and extracts user id
}
