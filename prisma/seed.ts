import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.DEFAULT_ADMIN_EMAIL || "admin@tokenrelay.local";
  const password = process.env.DEFAULT_ADMIN_PASSWORD || "admin123";

  const existing = await prisma.user.findUnique({ where: { email } });
  if (!existing) {
    const passwordHash = await bcrypt.hash(password, 10);
    await prisma.user.create({ data: { email, passwordHash } });
    console.log(`Created admin user: ${email}`);
  } else {
    console.log(`Admin user already exists: ${email}`);
  }

  const names = ["openai", "anthropic", "google", "deepseek"];
  for (const name of names) {
    await prisma.provider.upsert({
      where: { name },
      create: { name, apiKeyEncrypted: "" },
      update: {},
    });
  }
  console.log("Seeded 4 providers");

  const pricing = [
    { model: "gpt", inputPrice: 150, outputPrice: 600 },
    { model: "claude", inputPrice: 300, outputPrice: 1500 },
    { model: "gemini", inputPrice: 35, outputPrice: 100 },
    { model: "deepseek", inputPrice: 4, outputPrice: 4 },
  ];
  for (const p of pricing) {
    await prisma.modelPricing.upsert({
      where: { model: p.model },
      create: p,
      update: { inputPrice: p.inputPrice, outputPrice: p.outputPrice },
    });
  }
  console.log("Seeded 4 model prices");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => { console.error(e); prisma.$disconnect(); process.exit(1); });
