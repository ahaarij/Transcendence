import jwt from "@fastify/jwt"; // imports jwt for authentications and stuff
import type { FastifyInstance } from 'fastify';
import bcrypt from "bcryptjs"; //encrypt passwords

export async function registerAuthRoutes(app: FastifyInstance) {
  await app.register(jwt, { secret: process.env.JWT_ACCESS_SECRET || "dev-secret-fallback" });

  app.get("/auth/health", async () => ({ status: "ok", service: "auth" })); //to check health
  
  app.post("/auth/register", async (request, reply) => {   //register a new user
	const {email, password} = request.body as {
		email: string;
		password: string;
	};
	if (!email || !password)
		return (reply.status(400).send({error: "Email and password required"}));
	const exist_email = await app.prisma.user.findUnique({
		where : {email},
	});

	if (exist_email){
		return (reply.status(400).send({error: "Email already registered"}));
	}
	const hash_pass = await bcrypt.hash(password, 10);

	const user = await app.prisma.user.create({
		data:{
			email,
			password: hash_pass,
		},
	});

	const jwt_token = app.jwt.sign({ userId: user.id});

	return reply.send({
		jwt_token,
		user: {
			id: user.id,
			email: user.email,
		},
	});
    
  });
  
  app.post("/auth/login", async (request, reply) => {
	const {email, password} = request.body as {
		email: string;
		password: string;
	}
	if (!email || !password)
		return (reply.status(400).send({error: "Email and password required"}));
    
	const user = await app.prisma.user.findUnique({
		where: { email },
	});
	if (!user){
		return reply.status(401).send({error: "Invalid email or password"});
	}
    
	const valid_pass = await bcrypt.compare(password, user.password);
	if (!valid_pass) {
    return reply.status(401).send({ error: "Invalid email or password" });
	}
   
	const token = app.jwt.sign({ userID: user.id });

    return (reply.send({
		token,
		user: {
			id: user.id,
			email: user.email,
		},
	}));
  });
  
  app.post("/auth/logout", async (request, reply) => {
    return { message: "Logged out successfully" };
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
          email: true,
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
}
