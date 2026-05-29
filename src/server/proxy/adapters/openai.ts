import type { Adapter, AdapterConfig, OpenAIChatRequest, OpenAIChatResponse, OpenAIDeltaChunk } from "../../types";

export const openaiAdapter: Adapter = {
  async chatSync(req: OpenAIChatRequest, config: AdapterConfig): Promise<OpenAIChatResponse> {
    const baseUrl = config.baseUrl || "https://api.openai.com";
    const res = await fetch(`${baseUrl}/v1/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({ ...req, stream: false }),
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`OpenAI error ${res.status}: ${err}`);
    }
    return res.json();
  },

  async *chatStream(req: OpenAIChatRequest, config: AdapterConfig): AsyncIterable<OpenAIDeltaChunk> {
    const baseUrl = config.baseUrl || "https://api.openai.com";
    const res = await fetch(`${baseUrl}/v1/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({ ...req, stream: true }),
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`OpenAI stream error ${res.status}: ${err}`);
    }
    const reader = res.body!.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith("data: ")) continue;
        const data = trimmed.slice(6);
        if (data === "[DONE]") return;
        yield JSON.parse(data) as OpenAIDeltaChunk;
      }
    }
  },
};
