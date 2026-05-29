import type { Adapter, ProviderName } from "../../types";
import { openaiAdapter } from "./openai";
import { anthropicAdapter } from "./anthropic";
import { googleAdapter } from "./google";
import { deepseekAdapter } from "./deepseek";

const adapters: Record<ProviderName, Adapter> = {
  openai: openaiAdapter,
  anthropic: anthropicAdapter,
  google: googleAdapter,
  deepseek: deepseekAdapter,
};

export function getAdapter(provider: ProviderName): Adapter {
  const adapter = adapters[provider];
  if (!adapter) throw new Error(`No adapter for provider: ${provider}`);
  return adapter;
}
