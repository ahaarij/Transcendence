import type { FastifyInstance } from 'fastify';
import { hashPassword } from '../utils/password';
import { generateAccessToken, generateRefreshToken } from '../utils/tokens';
import { validatePassword, getPasswordRequirements } from '../utils/validation';

// creates new user account with email and password
export async function registerUser(app: FastifyInstance, request: any, reply: any) {
  try {
    const { username, email, password } = request.body as {
      username: string;
      email: string;
      password: string;
    };
    
    console.log("register request body:", request.body);
    
    if (!username || !email || !password) {
      return reply.status(400).send({ error: "username, email and password required" }); //missing fields
    }

    // validates password meets security requirements
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return reply.status(400).send({ 
        error: passwordValidation.errors[0]
      });
    }

    // checks if email already exists in database
    const existEmail = await app.prisma.user.findUnique({
      where: { email },
    });
    
    if (existEmail) {
      return reply.status(400).send({ error: "email already registered" }); //email taken
    }

    // checks if username already exists in database
    const existUsername = await app.prisma.user.findUnique({
      where: { username },
    });
    
    if (existUsername) {
      return reply.status(400).send({ error: "username already registered" }); //username taken
    }
    
    const hashPass = await hashPassword(password); //encrypt password before storing

    // creates new user in database
    const user = await app.prisma.user.create({
      data: {
        username,
        email,
        password: hashPass,
        avatar: '/assets/default-avatar.png', //default avatar for new users
      },
    });

    const accessToken = await generateAccessToken(app, user.id); //short lived token for api requests
    const refreshToken = await generateRefreshToken(app, user.id); //long lived token to get new access tokens

    // saves refresh token to user record
    await app.prisma.user.update({
      where: { id: user.id },
      data: { refreshToken }, //store refresh token in database
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
    console.error("registration error:", error);
    return reply.status(500).send({ 
      error: "internal server error", 
      details: error instanceof Error ? error.message : "unknown error" 
    });
  }
}
