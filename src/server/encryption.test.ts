import { describe, it, expect } from "vitest";
import { encrypt, decrypt } from "./encryption";

const KEY = "a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2";

describe("encryption", () => {
  it("encrypts and decrypts a string", () => {
    const plaintext = "sk-test-secret-key";
    const encrypted = encrypt(plaintext, KEY);
    expect(encrypted).not.toBe(plaintext);
    const decrypted = decrypt(encrypted, KEY);
    expect(decrypted).toBe(plaintext);
  });

  it("produces different ciphertexts for same plaintext", () => {
    const plaintext = "same-value";
    const a = encrypt(plaintext, KEY);
    const b = encrypt(plaintext, KEY);
    expect(a).not.toBe(b); // different IVs
  });
});
