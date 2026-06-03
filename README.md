# Token Relay — One API Key, All AI Models

OpenAI-compatible API gateway for DeepSeek, GPT, Claude, and Gemini. **No credit card required.**

## Why Token Relay?

- **One Key, All Models** — Single API key works across DeepSeek, GPT, Claude, Gemini
- **No Credit Card** — Pay via Alipay/WeChat or manual transfer
- **OpenAI Compatible** — Drop-in replacement. Works with any ChatGPT client or SDK
- **Cheaper than Direct** — DeepSeek from $0.02/1M input tokens

## Quick Start

```bash
curl https://zealand-delta.vercel.app/api/proxy \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"deepseek-chat","messages":[{"role":"user","content":"Hello!"}]}'
```

Or with any OpenAI SDK:

```python
from openai import OpenAI
client = OpenAI(
    api_key="YOUR_API_KEY",
    base_url="https://zealand-delta.vercel.app/api/proxy"
)
response = client.chat.completions.create(
    model="deepseek-chat",
    messages=[{"role": "user", "content": "Hello!"}]
)
```

## Pricing

| Model | Input (per 1M tokens) | Output (per 1M tokens) |
|-------|----------------------|------------------------|
| DeepSeek Chat | $0.02 | $0.06 |

GPT, Claude, Gemini coming soon.

## Get Started

1. Register at [zealand-delta.vercel.app](https://zealand-delta.vercel.app)
2. Create an API key
3. Start calling the API

## Self-Host

```bash
git clone https://github.com/zealand-syouko/ZEALAND.git
cd ZEALAND
npm install
npm run setup
npm run dev
```

Open http://localhost:3000, configure your LLM providers, and you have your own API gateway.

## Tech Stack

Next.js · TypeScript · Prisma · PostgreSQL · Tailwind CSS · Railway/Vercel
