import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { prisma } from "./client";
import { createUser, getUserByEmail, getUserById, verifyPassword } from "./users";
import bcrypt from "bcrypt";

beforeAll(async () => {
  await prisma.callLog.deleteMany();
  await prisma.apiKey.deleteMany();
  await prisma.user.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("users db", () => {
  it("creates a user and finds by email", async () => {
    const user = await createUser("test@example.com", "mypassword");
    expect(user.email).toBe("test@example.com");
    expect(user.passwordHash).not.toBe("mypassword");

    const found = await getUserByEmail("test@example.com");
    expect(found).not.toBeNull();
    expect(found!.id).toBe(user.id);
  });

  it("verifies correct password", async () => {
    await createUser("verify@example.com", "correct");
    const user = await getUserByEmail("verify@example.com");
    expect(await verifyPassword("correct", user!.passwordHash)).toBe(true);
    expect(await verifyPassword("wrong", user!.passwordHash)).toBe(false);
  });

  it("finds user by id", async () => {
    const created = await createUser("byid@example.com", "pass");
    const found = await getUserById(created.id);
    expect(found).not.toBeNull();
    expect(found!.email).toBe("byid@example.com");
  });

  it("returns null for unknown email", async () => {
    const found = await getUserByEmail("nobody@example.com");
    expect(found).toBeNull();
  });
});
