export async function GET() {
  return Response.json({
    service: "Token Relay",
    version: "1.0",
    base_url: "https://zealand-delta.vercel.app",
    endpoints: {
      chat: {
        method: "POST",
        path: "/api/proxy",
        description: "OpenAI-compatible chat completion",
        auth: "Bearer YOUR_API_KEY",
        body: {
          model: { type: "string", required: true, examples: ["deepseek-chat", "deepseek-reasoner"] },
          messages: { type: "array", required: true, example: [{ role: "user", content: "Hello" }] },
          stream: { type: "boolean", default: false },
          max_tokens: { type: "number", optional: true },
          temperature: { type: "number", optional: true },
        },
      },
    },
    models: ["deepseek-chat", "deepseek-reasoner"],
    pricing: "https://zealand-delta.vercel.app/#pricing",
  });
}
