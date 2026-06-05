export default function FAQPage() {
  const items = [
    { q: "How do I pay?", a: "We accept USDT (TRC20). Create a recharge order in your dashboard, send USDT to the wallet address shown, and the admin will confirm your payment." },
    { q: "How much does it cost?", a: "$0.50 per 1 million tokens, flat rate. See the pricing section on our homepage." },
    { q: "Which models are supported?", a: "Currently DeepSeek Chat (deepseek-chat) and DeepSeek Reasoner (deepseek-reasoner). GPT and Claude coming soon." },
    { q: "Is this OpenAI-compatible?", a: "Yes. Our API endpoint accepts OpenAI-format requests. You can use any ChatGPT client or the OpenAI SDK — just change the base URL." },
    { q: "How do I get an API key?", a: "Register an account at zealandr.xyz, go to API Keys, and click Create Key. Keys are free to generate." },
    { q: "What happens when my balance runs out?", a: "API calls will return HTTP 402 until you recharge. You'll see a warning on your dashboard when balance is low." },
    { q: "I forgot my password", a: "Click 'Forgot password?' on the login page. You'll need the recovery code you saved when registering." },
    { q: "How do I use this with my code?", a: "See the /docs page for Python, Node.js, and curl examples." },
  ];

  return (
    <div className="max-w-2xl mx-auto px-6 py-20">
      <h1 className="text-3xl font-bold mb-8">FAQ</h1>
      <div className="space-y-6">
        {items.map((item, i) => (
          <div key={i}>
            <h3 className="font-bold">{item.q}</h3>
            <p className="text-gray-600 text-sm mt-1">{item.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
