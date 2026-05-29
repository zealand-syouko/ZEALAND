import type { ProviderName } from "../types";

const ROUTES: { pattern: RegExp; provider: ProviderName }[] = [
  { pattern: /^gpt|^o1|^o3/, provider: "openai" },
  { pattern: /^claude/, provider: "anthropic" },
  { pattern: /^gemini/, provider: "google" },
  { pattern: /^deepseek/, provider: "deepseek" },
];

export function routeModel(model: string): ProviderName {
  for (const route of ROUTES) {
    if (route.pattern.test(model)) {
      return route.provider;
    }
  }
  throw new Error(`Unknown model: ${model}. Cannot determine provider.`);
}
