export interface OpenAIChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface OpenAIChatRequest {
  model: string;
  messages: OpenAIChatMessage[];
  stream?: boolean;
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
}

export interface OpenAIChatChoice {
  index: number;
  message?: { role: string; content: string };
  delta?: { role?: string; content?: string };
  finish_reason: string | null;
}

export interface OpenAIChatResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: OpenAIChatChoice[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface OpenAIDeltaChunk {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    delta: { role?: string; content?: string };
    finish_reason: string | null;
  }[];
}

export interface AdapterConfig {
  apiKey: string;
  baseUrl: string;
}

export interface Adapter {
  chatSync(req: OpenAIChatRequest, config: AdapterConfig): Promise<OpenAIChatResponse>;
  chatStream(req: OpenAIChatRequest, config: AdapterConfig): AsyncIterable<OpenAIDeltaChunk>;
}

export type ProviderName = "openai" | "anthropic" | "google" | "deepseek";

export interface ProviderRecord {
  id: string;
  name: ProviderName;
  apiKeyEncrypted: string;
  baseUrl: string | null;
  isEnabled: boolean;
}
