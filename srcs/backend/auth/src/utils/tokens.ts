import type { FastifyInstance } from 'fastify';

// generates access token with user id (uuid string)
export async function generateAccessToken(app: FastifyInstance, userId: string): Promise<string> {
  return app.jwt.sign({ userId }); //creates access token that expires in 15 mins
}

// generates refresh token with user id (uuid string)
export async function generateRefreshToken(app: FastifyInstance, userId: string): Promise<string> {
  return app.jwt.sign(
    { userId, type: 'refresh' },
    { expiresIn: '7d' } //refresh token lasts 7 days to keep user logged in
  );
}

// verifies token and returns user id (uuid string)
export function verifyToken(app: FastifyInstance, token: string): { userId: string } {
  return app.jwt.verify(token) as { userId: string }; //validates token and extracts user id
}
