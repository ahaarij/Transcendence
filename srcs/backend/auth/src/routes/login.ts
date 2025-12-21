import type { FastifyInstance } from 'fastify';
import { comparePassword, hashPassword } from '../utils/password';
import { generateAccessToken, generateRefreshToken } from '../utils/tokens';

export async function loginUser(app: FastifyInstance, request: any, reply: any) {
  try {
    const { email, password } = request.body as {
      email: string;
      password: string;
    };
    
    if (!email || !password) {
      return reply.status(400).send({ error: "email and password required" }); //missing credentials
    }
    
    const user = await app.prisma.user.findUnique({
      where: { email },
    });
    
    if (!user || !user.password) {
      return reply.status(401).send({ error: "invalid email or password" }); //user not found or no password set
    }
    
    const validPass = await comparePassword(password, user.password); //check if password matches
    
    if (!validPass) {
      return reply.status(401).send({ error: "invalid email or password" }); //wrong password
    }

    // checks if user has 2fa enabled
    if (user.twoFactorEnabled) {
      return reply.send({
        requires2FA: true,  // tells frontend to show 2fa input
        email: user.email,
        message: "enter 2fa code to complete login"
      });
    }
    
    const accessToken = await generateAccessToken(app, user.id); //create new access token
    const refreshToken = await generateRefreshToken(app, user.id); //create new refresh token

    const hashedRefreshToken = await hashPassword(refreshToken); //hash refresh token before storing
    
    await app.prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: hashedRefreshToken }, //save hashed refresh token
    });

    return reply.send({
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("login error:", error);
    return reply.status(500).send({ 
      error: "internal server error",
      details: error instanceof Error ? error.message : "unknown error"
    });
  }
}
