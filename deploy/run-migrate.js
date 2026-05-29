const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs");

const prismaBin = path.join(__dirname, "..", "node_modules", "prisma", "build", "index.js");

try {
  console.log("Running database migrations...");
  execSync(`node ${prismaBin} migrate deploy`, {
    cwd: path.join(__dirname, ".."),
    stdio: "inherit",
    env: { ...process.env },
  });
} catch (e) {
  console.log("migrate deploy failed, trying migrate dev...");
  try {
    execSync(`node ${prismaBin} migrate dev --name init --skip-generate`, {
      cwd: path.join(__dirname, ".."),
      stdio: "inherit",
      env: { ...process.env },
    });
  } catch (e2) {
    console.error("Migration failed:", e2.message);
  }
}

try {
  console.log("Seeding database...");
  execSync(`node ${prismaBin} db seed`, {
    cwd: path.join(__dirname, ".."),
    stdio: "inherit",
    env: { ...process.env },
  });
} catch (e) {
  console.log("Seed skipped");
}
