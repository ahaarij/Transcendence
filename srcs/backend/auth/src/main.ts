import jwt from "@fastify/jwt"; // imports jwt for authentications and stuff
import type { FastifyInstance } from 'fastify';
import bcrypt from "bcryptjs"; //encrypt passwords
import { OAuth2Client } from 'google-auth-library';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

async function generateRefreshToken(app: FastifyInstance, userId: number): Promise<string> { //makes the token last 7 days instead of 15 mins
  return app.jwt.sign(
    { userId, type: 'refresh' },
    { expiresIn: '7d' } //this is a token used to get access tokens more secure
  );
}

async function hashToken(token: string): Promise<string> { //encrypt passwords
  return bcrypt.hash(token, 10);
}

export async function registerAuthRoutes(app: FastifyInstance) { //quick and easier way to register jwt tokens
  await app.register(jwt, { 
    secret: process.env.JWT_ACCESS_SECRET || "dev-secret-fallback",
    sign: {
      expiresIn: '15m' //why 15 mins its incase it gets hacked
    }
  });

  app.get("/auth/health", async () => ({ status: "ok", service: "auth" })); //to check health
  
  app.post("/auth/register", async (request, reply) => {   //register a new user
	try {
		const {username, email, password} = request.body as {
			username: string;
			email: string;
			password: string;
		};
		console.log("Register request body:", request.body);
		
		if (!username || !email || !password)
			return (reply.status(400).send({error: "Username, email and password required"}));
	
	const exist_email = await app.prisma.user.findUnique({
		where : {email},
	});

	if (exist_email){
		return (reply.status(400).send({error: "Email already registered"}));
	}

	const exist_username = await app.prisma.user.findUnique({
		where : {username},
	});

	if (exist_username){
		return (reply.status(400).send({error: "Username already registered"}));
	}
	
	const hash_pass = await bcrypt.hash(password, 10);

	const user = await app.prisma.user.create({
		data:{
			username,
			email,
			password: hash_pass,
			avatar: '/assets/default-avatar.png',
		},
	});

	const accessToken = app.jwt.sign({ userId: user.id });
	const refreshToken = await generateRefreshToken(app, user.id);

	await app.prisma.user.update({
		where: { id: user.id },
		data: { refreshToken },
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
		console.error("Registration error:", error);
		return reply.status(500).send({ 
			error: "Internal server error", 
			details: error instanceof Error ? error.message : "Unknown error" 
		});
	}
  });
  
  app.post("/auth/login", async (request, reply) => {
	try {
		const {email, password} = request.body as {
			email: string;
			password: string;
		}
		if (!email || !password)
			return (reply.status(400).send({error: "Email and password required"}));
		
		const user = await app.prisma.user.findUnique({
			where: { email },
		});
		if (!user || !user.password){
			return reply.status(401).send({error: "Invalid email or password"});
		}
		
		const valid_pass = await bcrypt.compare(password, user.password);
		if (!valid_pass) {
			return reply.status(401).send({ error: "Invalid email or password" });
		}
		
		const accessToken = app.jwt.sign({ userId: user.id });
		const refreshToken = await generateRefreshToken(app, user.id);

		const hashedRefreshToken = await hashToken(refreshToken);
		await app.prisma.user.update({
			where: { id: user.id },
			data: { refreshToken: hashedRefreshToken },
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
		console.error("Login error:", error);
		return reply.status(500).send({ 
			error: "Internal server error",
			details: error instanceof Error ? error.message : "Unknown error"
		});
	}
  });
  
  app.post("/auth/logout", async (request, reply) => {
    try {
      const authHeader = request.headers.authorization;
      if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.split(" ")[1];
        const decoded = app.jwt.verify(token) as { userId: number };
        
        await app.prisma.user.update({
          where: { id: decoded.userId },
          data: { refreshToken: null },
        });
      }
      
      return { message: "Logged out successfully" };
    } catch (error) {
      return { message: "Logged out successfully" };
    }
  });
  
  app.get("/auth/me", async (request, reply) => {
	try {
		const authHeader = request.headers.authorization;

		if (!authHeader || !authHeader.startsWith("Bearer ")){
			return reply.status(401).send({ error: "Missing or invalid token" });
		}
		const token = authHeader.split(" ")[1];
		const decode = app.jwt.verify(token) as {userId: number};

     	const user = await app.prisma.user.findUnique({
        where: { id: decode.userId },
        select: {
          id: true,
          username: true,
          email: true,
          avatar: true,
          createdAt: true,
        },
      });

      if (!user) {
        return reply.status(404).send({ error: "User not found" });
      }

      return reply.send({ user });
    } catch (err) {
      console.error(err);
      return reply.status(401).send({ error: "Invalid or expired token" });
    }
  });

  app.post("/auth/refresh", async (request, reply) => {
    try {
      const { refreshToken } = request.body as { refreshToken: string };
      
      if (!refreshToken) {
        return reply.status(400).send({ error: "Refresh token required" });
      }
      const decoded = app.jwt.verify(refreshToken) as { userId: number; type?: string };
      const user = await app.prisma.user.findUnique({
        where: { id: decoded.userId },
      });

      if (!user || !user.refreshToken) {
        return reply.status(401).send({ error: "Invalid refresh token" });
      }

      const isValidRefreshToken = await bcrypt.compare(refreshToken, user.refreshToken);

      if (!isValidRefreshToken) {
        return reply.status(401).send({ error: "Invalid refresh token" });
      }

      const newAccessToken = app.jwt.sign({ userId: user.id });

      return reply.send({ accessToken: newAccessToken });
    } catch (error) {
      console.error("Refresh token error:", error);
      return reply.status(401).send({ error: "Invalid or expired refresh token" });
    }
  });

  app.post("/auth/google", async (request, reply) => {
    try {
      const { idToken } = request.body as { idToken: string };
      
      if (!idToken) {
        return reply.status(400).send({ error: "Google ID token required" });
      }

      const ticket = await googleClient.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      if (!payload) {
        return reply.status(401).send({ error: "Invalid Google token" });
      }

      const { sub: googleId, email, name, picture } = payload;

      if (!email) {
        return reply.status(400).send({ error: "Email not provided by Google" });
      }

      let user = await app.prisma.user.findFirst({
        where: {
          OR: [
            { googleId },
            { email },
          ],
        },
      });

      if (!user) {
        const username = name || email.split('@')[0];
        
        user = await app.prisma.user.create({
          data: {
            username,
            email,
            googleId,
            avatar: picture,
            password: null,
          },
        });
      } else {
        // Update googleId if not set, and avatar if not set
        user = await app.prisma.user.update({
          where: { id: user.id },
          data: { 
            googleId: user.googleId || googleId,
            avatar: user.avatar ? undefined : picture
          },
        });
      }

      const accessToken = app.jwt.sign({ userId: user.id });
      const refreshToken = await generateRefreshToken(app, user.id);

      const hashedRefreshToken = await hashToken(refreshToken);
      await app.prisma.user.update({
        where: { id: user.id },
        data: { refreshToken: hashedRefreshToken },
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
      console.error("Google auth error:", error);
      return reply.status(500).send({ 
        error: "Google authentication failed",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
}
