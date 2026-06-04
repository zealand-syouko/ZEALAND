"use client";

export default function DocsPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12 space-y-10">
      <div>
        <h1 className="text-3xl font-bold">API Documentation</h1>
        <p className="text-gray-500 mt-2">OpenAI-compatible chat completion endpoint. Use your API key from the dashboard.</p>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold">Quick Start</h2>
        <div className="rounded-xl bg-gray-900 p-6 text-white font-mono text-sm overflow-x-auto">
          <pre>{`curl https://zealand-delta.vercel.app/api/proxy \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "deepseek-chat",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'`}</pre>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold">Python (OpenAI SDK)</h2>
        <div className="rounded-xl bg-gray-900 p-6 text-white font-mono text-sm overflow-x-auto">
          <pre>{`from openai import OpenAI

client = OpenAI(
    api_key="YOUR_API_KEY",
    base_url="https://zealand-delta.vercel.app/api/proxy"
)
response = client.chat.completions.create(
    model="deepseek-chat",
    messages=[{"role": "user", "content": "Hello!"}]
)
print(response.choices[0].message.content)`}</pre>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold">Node.js</h2>
        <div className="rounded-xl bg-gray-900 p-6 text-white font-mono text-sm overflow-x-auto">
          <pre>{`const res = await fetch("https://zealand-delta.vercel.app/api/proxy", {
  method: "POST",
  headers: {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    model: "deepseek-chat",
    messages: [{ role: "user", content: "Hello!" }]
  })
});
const data = await res.json();
console.log(data.choices[0].message.content);`}</pre>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold">Supported Models</h2>
        <div className="overflow-hidden rounded-xl border">
          <table className="w-full text-sm" suppressHydrationWarning>
            <thead><tr className="bg-gray-50 text-left"><th className="px-4 py-3">Model</th><th className="px-4 py-3">Context</th><th className="px-4 py-3">Description</th></tr></thead>
            <tbody>
              <tr className="border-t"><td className="px-4 py-3 font-mono">deepseek-chat</td><td className="px-4 py-3">128K</td><td className="px-4 py-3">Fast, cost-effective chat model</td></tr>
              <tr className="border-t"><td className="px-4 py-3 font-mono">deepseek-reasoner</td><td className="px-4 py-3">128K</td><td className="px-4 py-3">Advanced reasoning model (DeepSeek-R1)</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold">Pricing</h2>
        <p className="text-gray-600">$0.50 per 1 million tokens, flat rate. See <a href="/" className="text-blue-600 underline">homepage</a> for details.</p>
      </div>
    </div>
  );
}
