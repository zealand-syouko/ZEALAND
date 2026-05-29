import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { prisma } from "./client";
import { getAllProviders, getProviderByName, upsertProvider, setProviderEnabled } from "./providers";

beforeAll(async () => {
  await prisma.provider.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("providers db", () => {
  it("upserts a new provider", async () => {
    const p = await upsertProvider("openai", "encrypted-key", "https://api.openai.com");
    expect(p.name).toBe("openai");
    expect(p.apiKeyEncrypted).toBe("encrypted-key");
  });

  it("upserts updates existing provider", async () => {
    const p = await upsertProvider("openai", "new-key");
    expect(p.apiKeyEncrypted).toBe("new-key");
  });

  it("gets provider by name", async () => {
    const p = await getProviderByName("openai");
    expect(p).not.toBeNull();
  });

  it("sets enabled status", async () => {
    await setProviderEnabled("openai", true);
    const p = await getProviderByName("openai");
    expect(p!.isEnabled).toBe(true);
  });

  it("lists all providers", async () => {
    await upsertProvider("anthropic", "ant-key");
    const all = await getAllProviders();
    expect(all.length).toBe(2);
  });
});
