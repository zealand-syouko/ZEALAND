import { prisma } from "./client";
import bcrypt from "bcrypt";

export async function createUser(email: string, password: string, recoveryCode?: string) {
  const passwordHash = await bcrypt.hash(password, 10);
  return prisma.user.create({
    data: { email, passwordHash, recoveryCode },
  });
}

export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } });
}

export async function getUserById(id: string) {
  return prisma.user.findUnique({ where: { id } });
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}
