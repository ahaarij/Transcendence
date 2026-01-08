import type { FastifyInstance } from 'fastify';
import { comparePassword, hashPassword } from '../utils/password';
import { verifyToken } from '../utils/tokens';
import { validatePassword, getPasswordRequirements } from '../utils/validation';

// changes user password after verifying current password
export async function changePassword(app: FastifyInstance, request: any, reply: any) {
  try {
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return reply.status(401).send({ error: "Missing or invalid token" }); //no token provided
    }

    const token = authHeader.split(" ")[1]; //extract token
    const decoded = verifyToken(app, token); //verify and decode token

    const { currentPassword, newPassword } = request.body as {
      currentPassword: string;
      newPassword: string;
    };

    // validates input fields are present
    if (!currentPassword || !newPassword) {
      return reply.status(400).send({ error: "Current password and New password required" });
    }

    // validates new password meets security requirements
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.valid) {
      return reply.status(400).send({ 
        error: passwordValidation.errors[0]
      });
    }

    // gets user from database
    const user = await app.prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      return reply.status(404).send({ error: "User not found" });
    }

    // checks if user has a password (google users might not have one)
    if (!user.password) {
      return reply.status(400).send({ error: "Cannot change password for google accounts" });
    }

    // verifies current password is correct
    const validPass = await comparePassword(currentPassword, user.password);
    if (!validPass) {
      return reply.status(401).send({ error: "Current password is incorrect" });
    }

    // checks new password is different from current
    const samePassword = await comparePassword(newPassword, user.password);
    if (samePassword) {
      return reply.status(400).send({ error: "New password must be different from current password" });
    }

    // hashes and saves new password
    const hashedNewPassword = await hashPassword(newPassword);
    await app.prisma.user.update({
      where: { id: decoded.userId },
      data: { password: hashedNewPassword },
    });

    return reply.send({ message: "Password changed successfully" });
  } catch (error) {
    console.error("change password error:", error);
    return reply.status(500).send({ 
      error: "Internal server error",
      details: error instanceof Error ? error.message : "unknown error"
    });
  }
}
