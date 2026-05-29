import type { Adapter, AdapterConfig, OpenAIChatRequest, OpenAIChatResponse, OpenAIDeltaChunk } from "../../types";

interface GoogleContent {
  role: string;
  parts: { text: string }[];
}

function toGoogleContents(messages: OpenAIChatRequest["messages"]): { contents: GoogleContent[]; systemInstruction?: GoogleContent } {
  const systemMessages = messages.filter((m) => m.role === "system");
  const chatMessages = messages.filter((m) => m.role !== "system");

  return {
    contents: chatMessages.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    })),
    systemInstruction: systemMessages.length > 0
      ? { role: "user", parts: [{ text: systemMessages.map((m) => m.content).join("\n") }] }
      : undefined,
  };
}

function toOpenAIResponse(body: Record<string, unknown>, model: string): OpenAIChatResponse {
  const candidates = (body.candidates as Array<Record<string, unknown>>) || [];
  const content = candidates[0]?.content as { parts: Array<{ text: string }> } | undefined;
  const text = content?.parts?.map((p) => p.text).join("") || "";
  const usage = body.usageMetadata as { promptTokenCount: number; candidatesTokenCount: number } | undefined;
  return {
    id: `gemini-${Date.now()}`,
    object: "chat.completion",
    created: Math.floor(Date.now() / 1000),
    model,
    choices: [
      {
        index: 0,
        message: { role: "assistant", content: text },
        finish_reason: ((candidates[0]?.finishReason as string) || "STOP"),
      },
    ],
    usage: usage
      ? {
          prompt_tokens: usage.promptTokenCount,
          completion_tokens: usage.candidatesTokenCount,
          total_tokens: usage.promptTokenCount + usage.candidatesTokenCount,
        }
      : undefined,
  };
}

export const googleAdapter: Adapter = {
  async chatSync(req: OpenAIChatRequest, config: AdapterConfig): Promise<OpenAIChatResponse> {
    const baseUrl = config.baseUrl || "https://generativelanguage.googleapis.com";
    const { contents, systemInstruction } = toGoogleContents(req.messages);
    const body: Record<string, unknown> = { contents };
    if (systemInstruction) body.systemInstruction = systemInstruction;

    const generationConfig: Record<string, unknown> = {};
    if (req.max_tokens) generationConfig.maxOutputTokens = req.max_tokens;
    if (req.temperature !== undefined) generationConfig.temperature = req.temperature;
    if (req.top_p !== undefined) generationConfig.topP = req.top_p;
    if (Object.keys(generationConfig).length > 0) body.generationConfig = generationConfig;

    const res = await fetch(
      `${baseUrl}/v1beta/models/${req.model}:generateContent?key=${config.apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      },
    );
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Google error ${res.status}: ${err}`);
    }
    return toOpenAIResponse(await res.json(), req.model);
  },

  async *chatStream(req: OpenAIChatRequest, config: AdapterConfig): AsyncIterable<OpenAIDeltaChunk> {
    const baseUrl = config.baseUrl || "https://generativelanguage.googleapis.com";
    const { contents, systemInstruction } = toGoogleContents(req.messages);
    const body: Record<string, unknown> = { contents };
    if (systemInstruction) body.systemInstruction = systemInstruction;

    const generationConfig: Record<string, unknown> = {};
    if (req.max_tokens) generationConfig.maxOutputTokens = req.max_tokens;
    if (req.temperature !== undefined) generationConfig.temperature = req.temperature;
    if (Object.keys(generationConfig).length > 0) body.generationConfig = generationConfig;

    const res = await fetch(
      `${baseUrl}/v1beta/models/${req.model}:streamGenerateContent?alt=sse&key=${config.apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      },
    );
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Google stream error ${res.status}: ${err}`);
    }

    const reader = res.body!.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    const id = `gemini-${Date.now()}`;

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
        const candidates = (event.candidates as Array<Record<string, unknown>>) || [];
        const content = candidates[0]?.content as { parts: Array<{ text: string }> } | undefined;
        const text = content?.parts?.map((p) => p.text).join("") || "";
        yield {
          id,
          object: "chat.completion.chunk",
          created: Math.floor(Date.now() / 1000),
          model: req.model,
          choices: [
            {
              index: 0,
              delta: text ? { content: text } : {},
              finish_reason: (candidates[0]?.finishReason as string) || null,
            },
          ],
        };
      }
    }
  },
};
