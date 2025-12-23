import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { generateTOTPSecret, verifyTOTPToken } from '../utils/totp';

// enables 2fa for user account
export async function enable2FA(app: FastifyInstance, request: FastifyRequest, reply: FastifyReply) {
  try {
    // gets auth token from header
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return reply.status(401).send({ error: "missing or invalid token" });
    }

    // extracts and verifies jwt token
    const token = authHeader.split(" ")[1];
    const decoded = app.jwt.verify(token) as { userId: string };

    // finds user in database
    const user = await app.prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      return reply.status(404).send({ error: "user not found" });
    }

    // checks if 2fa already enabled
    if (user.twoFactorEnabled) {
      return reply.status(400).send({ error: "2fa already enabled" });
    }

    // generates new totp secret and qr code
    const { secret, qrCode } = await generateTOTPSecret(user.username);

    // saves secret to database but keeps 2fa disabled until verified
    await app.prisma.user.update({
      where: { id: user.id },
      data: { twoFactorSecret: secret },
    });

    // returns qr code for user to scan with authenticator app
    return reply.send({
      qrCode,
      secret,  // backup secret in case qr code doesnt work
      message: "scan qr code with authenticator app then verify code"
    });
  } catch (error) {
    console.error("enable 2fa error:", error);
    return reply.status(500).send({ error: "internal server error" });
  }
}

// verifies and activates 2fa
export async function verify2FA(app: FastifyInstance, request: FastifyRequest, reply: FastifyReply) {
  try {
    // gets auth token from header
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return reply.status(401).send({ error: "missing or invalid token" });
    }

    // extracts and verifies jwt token
    const token = authHeader.split(" ")[1];
    const decoded = app.jwt.verify(token) as { userId: string };

    // gets totp code from request body
    const { code } = request.body as { code: string };

    if (!code) {
      return reply.status(400).send({ error: "verification code required" });
    }

    // finds user in database
    const user = await app.prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user || !user.twoFactorSecret) {
      return reply.status(400).send({ error: "2fa setup not started" });
    }

    // verifies the totp code
    const isValid = verifyTOTPToken(user.twoFactorSecret, code);

    if (!isValid) {
      return reply.status(400).send({ error: "invalid verification code" });
    }

    // enables 2fa now that code is verified
    await app.prisma.user.update({
      where: { id: user.id },
      data: { twoFactorEnabled: true },
    });

    return reply.send({ message: "2fa enabled successfully" });
  } catch (error) {
    console.error("verify 2fa error:", error);
    return reply.status(500).send({ error: "internal server error" });
  }
}

// disables 2fa for user account
export async function disable2FA(app: FastifyInstance, request: FastifyRequest, reply: FastifyReply) {
  try {
    // gets auth token from header
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return reply.status(401).send({ error: "missing or invalid token" });
    }

    // extracts and verifies jwt token
    const token = authHeader.split(" ")[1];
    const decoded = app.jwt.verify(token) as { userId: string };

    // gets totp code and password from request body
    const { code, password } = request.body as { code: string; password: string };

    if (!code || !password) {
      return reply.status(400).send({ error: "code and password required" });
    }

    // finds user in database
    const user = await app.prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user || !user.twoFactorSecret) {
      return reply.status(400).send({ error: "2fa not enabled" });
    }

    // verifies password
    const bcrypt = await import('bcrypt');
    const validPassword = await bcrypt.compare(password, user.password || '');
    
    if (!validPassword) {
      return reply.status(401).send({ error: "invalid password" });
    }

    // verifies the totp code
    const isValid = verifyTOTPToken(user.twoFactorSecret, code);

    if (!isValid) {
      return reply.status(400).send({ error: "invalid verification code" });
    }

    // removes 2fa from user account
    await app.prisma.user.update({
      where: { id: user.id },
      data: {
        twoFactorEnabled: false,
        twoFactorSecret: null,
      },
    });

    return reply.send({ message: "2fa disabled successfully" });
  } catch (error) {
    console.error("disable 2fa error:", error);
    return reply.status(500).send({ error: "internal server error" });
  }
}

// verifies 2fa code during login
export async function validate2FALogin(app: FastifyInstance, request: FastifyRequest, reply: FastifyReply) {
  try {
    // gets email and totp code from request
    const { email, code } = request.body as { email: string; code: string };

    if (!email || !code) {
      return reply.status(400).send({ error: "email and code required" });
    }

    // finds user by email
    const user = await app.prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.twoFactorEnabled || !user.twoFactorSecret) {
      return reply.status(400).send({ error: "invalid request" });
    }

    // verifies the totp code
    const isValid = verifyTOTPToken(user.twoFactorSecret, code);

    if (!isValid) {
      return reply.status(400).send({ error: "invalid verification code" });
    }

    // generates tokens after successful 2fa verification
    const { generateAccessToken, generateRefreshToken } = await import('../utils/tokens');
    const { hashPassword } = await import('../utils/password');
    
    const accessToken = await generateAccessToken(app, user.id);
    const refreshToken = await generateRefreshToken(app, user.id);
    const hashedRefreshToken = await hashPassword(refreshToken);

    // saves refresh token
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
    console.error("validate 2fa login error:", error);
    return reply.status(500).send({ error: "internal server error" });
  }
}
