import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { prisma } from "./client";
import { createApiKey, getApiKeyByHash, getApiKeysByUser, updateApiKey, deleteApiKey, incrementApiKeyQuota } from "./api-keys";
import { createUser } from "./users";

let userId: string;

beforeAll(async () => {
  await prisma.callLog.deleteMany();
  await prisma.apiKey.deleteMany();
  await prisma.user.deleteMany();
  const user = await createUser("keytest@example.com", "pass");
  userId = user.id;
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("api-keys db", () => {
  it("creates an api key", async () => {
    const key = await createApiKey({
      userId,
      name: "test-key",
      keyPrefix: "sk-abc12",
      keyHash: "hash123",
    });
    expect(key.keyPrefix).toBe("sk-abc12");
    expect(key.isActive).toBe(true);
  });

  it("finds key by hash", async () => {
    const key = await getApiKeyByHash("hash123");
    expect(key).not.toBeNull();
    expect(key!.name).toBe("test-key");
  });

  it("lists keys by user", async () => {
    const keys = await getApiKeysByUser(userId);
    expect(keys.length).toBe(1);
  });

  it("updates a key", async () => {
    const keys = await getApiKeysByUser(userId);
    await updateApiKey(keys[0].id, { name: "renamed", isActive: false });
    const updated = await getApiKeyByHash("hash123");
    expect(updated!.name).toBe("renamed");
  });

  it("increments quota", async () => {
    const keys = await getApiKeysByUser(userId);
    await incrementApiKeyQuota(keys[0].id, 150);
    const key = await getApiKeyByHash("hash123");
    expect(key!.usedQuota).toBe(150);
  });

  it("deletes a key", async () => {
    const keys = await getApiKeysByUser(userId);
    await deleteApiKey(keys[0].id);
    const remaining = await getApiKeysByUser(userId);
    expect(remaining.length).toBe(0);
  });
});
