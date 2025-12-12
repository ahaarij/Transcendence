import bcrypt from "bcryptjs";

export async function hashPassword(password: string): Promise<string> { 
  return bcrypt.hash(password, 10); //hashes password with 10 salt rounds for security
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash); //compares plain password with hashed version
}
