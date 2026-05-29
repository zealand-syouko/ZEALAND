import type { Adapter, AdapterConfig, OpenAIChatRequest, OpenAIChatResponse, OpenAIDeltaChunk } from "../../types";

function toAnthropicMessages(messages: OpenAIChatRequest["messages"]) {
  const system = messages.filter((m) => m.role === "system").map((m) => m.content).join("\n");
  const chat = messages.filter((m) => m.role !== "system").map((m) => ({
    role: m.role,
    content: m.content,
  }));
  return { system: system || undefined, messages: chat };
}

function toOpenAIResponse(body: Record<string, unknown>, model: string): OpenAIChatResponse {
  const content = (body as { content?: Array<{ text: string }> }).content;
  const usage = body as { usage?: { input_tokens: number; output_tokens: number } };
  const text = content ? content.map((c) => c.text).join("") : "";
  return {
    id: (body.id as string) || "",
    object: "chat.completion",
    created: Math.floor(Date.now() / 1000),
    model,
    choices: [
      {
        index: 0,
        message: { role: "assistant", content: text },
        finish_reason: ((body.stop_reason as string) || "stop"),
      },
    ],
    usage: usage.usage
      ? {
          prompt_tokens: usage.usage.input_tokens,
          completion_tokens: usage.usage.output_tokens,
          total_tokens: usage.usage.input_tokens + usage.usage.output_tokens,
        }
      : undefined,
  };
}

export const anthropicAdapter: Adapter = {
  async chatSync(req: OpenAIChatRequest, config: AdapterConfig): Promise<OpenAIChatResponse> {
    const baseUrl = config.baseUrl || "https://api.anthropic.com";
    const { system, messages } = toAnthropicMessages(req.messages);
    const body: Record<string, unknown> = {
      model: req.model,
      messages,
      max_tokens: req.max_tokens || 4096,
    };
    if (system) body.system = system;
    if (req.temperature !== undefined) body.temperature = req.temperature;

    const res = await fetch(`${baseUrl}/v1/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": config.apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Anthropic error ${res.status}: ${err}`);
    }
    return toOpenAIResponse(await res.json(), req.model);
  },

  async *chatStream(req: OpenAIChatRequest, config: AdapterConfig): AsyncIterable<OpenAIDeltaChunk> {
    const baseUrl = config.baseUrl || "https://api.anthropic.com";
    const { system, messages } = toAnthropicMessages(req.messages);
    const body: Record<string, unknown> = {
      model: req.model,
      messages,
      max_tokens: req.max_tokens || 4096,
      stream: true,
    };
    if (system) body.system = system;
    if (req.temperature !== undefined) body.temperature = req.temperature;

    const res = await fetch(`${baseUrl}/v1/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": config.apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Anthropic stream error ${res.status}: ${err}`);
    }

    const reader = res.body!.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let id = "";
    let index = 0;

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
        const event = JSON.parse(data) as Record<string, unknown>;

        if (event.type === "message_start") {
          id = (event.message as { id: string })?.id || "";
          yield {
            id,
            object: "chat.completion.chunk",
            created: Math.floor(Date.now() / 1000),
            model: req.model,
            choices: [{ index: 0, delta: { role: "assistant" }, finish_reason: null }],
          };
        } else if (event.type === "content_block_delta") {
          const delta = event.delta as { text: string };
          yield {
            id,
            object: "chat.completion.chunk",
            created: Math.floor(Date.now() / 1000),
            model: req.model,
            choices: [{ index, delta: { content: delta.text }, finish_reason: null }],
          };
        } else if (event.type === "message_stop") {
          yield {
            id,
            object: "chat.completion.chunk",
            created: Math.floor(Date.now() / 1000),
            model: req.model,
            choices: [{ index, delta: {}, finish_reason: "stop" }],
          };
        }
      }
    }
  },
};
