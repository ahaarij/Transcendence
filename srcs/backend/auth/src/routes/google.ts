import type { FastifyInstance } from 'fastify';
import { OAuth2Client } from 'google-auth-library';
import { hashPassword } from '../utils/password';
import { generateAccessToken, generateRefreshToken } from '../utils/tokens';

// initialize google oauth client with credentials
const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET
); //initialize google oauth client

// handles google oauth login or registration
export async function googleLogin(app: FastifyInstance, request: any, reply: any) {
  try {
    const { idToken } = request.body as { idToken: string };
    
    if (!idToken) {
      return reply.status(400).send({ error: "google id token required" }); //no token from google
    }

    // verifies google token is valid and for our app
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID, //verify token is for our app
    });

    const payload = ticket.getPayload(); //extract user info from token
    
    if (!payload) {
      return reply.status(401).send({ error: "invalid google token" }); //token verification failed
    }

    const { sub: googleId, email, name, picture } = payload; //get google user data

    if (!email) {
      return reply.status(400).send({ error: "email not provided by google" }); //google didn't send email
    }

    // looks for existing user by google id or email
    let user = await app.prisma.user.findFirst({
      where: {
        OR: [
          { googleId }, //check if user already linked google account
          { email },    //or if email matches existing user
        ],
      },
    });

    if (!user) {
      // creates new user if not found
      const username = name || email.split('@')[0]; //use google name or email prefix as username
      
      user = await app.prisma.user.create({
        data: {
          username,
          email,
          googleId,
          avatar: picture, //use google profile picture
          password: null,  //google users don't need password
        },
      });
    } else {
      // updates existing user with google info
      user = await app.prisma.user.update({
        where: { id: user.id },
        data: { 
          googleId: user.googleId || googleId, //link google id if not set
          avatar: (user.avatar === '/assets/default-avatar.png' || !user.avatar) ? picture : undefined
        },
      });
    }

    const accessToken = await generateAccessToken(app, user.id); //create access token
    const refreshToken = await generateRefreshToken(app, user.id); //create refresh token

    const hashedRefreshToken = await hashPassword(refreshToken); //hash refresh token before storing
    
    // saves hashed refresh token to database
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
    console.error("google auth error:", error);
    return reply.status(500).send({ 
      error: "google authentication failed",
      details: error instanceof Error ? error.message : "unknown error"
    });
  }
}
