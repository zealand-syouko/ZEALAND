export default function TermsPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-20">
      <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>

      <div className="space-y-4 text-gray-700 text-sm">
        <h2 className="text-lg font-bold text-black">1. Service</h2>
        <p>Token Relay is an API proxy service that forwards requests to third-party AI providers (DeepSeek, OpenAI, etc.). We do not generate, store, or modify AI responses.</p>

        <h2 className="text-lg font-bold text-black">2. Payments</h2>
        <p>All payments are made in USDT (TRC20). Payments are non-refundable once the API credits have been consumed. Unused credits remain in your account indefinitely.</p>

        <h2 className="text-lg font-bold text-black">3. API Usage</h2>
        <p>You agree not to use the API for illegal purposes, including but not limited to: generating harmful content, spamming, or violating any applicable laws.</p>

        <h2 className="text-lg font-bold text-black">4. Service Availability</h2>
        <p>We strive for high uptime but do not guarantee 100% availability. Service may be interrupted for maintenance or due to third-party provider outages.</p>

        <h2 className="text-lg font-bold text-black">5. Limitation of Liability</h2>
        <p>Token Relay is provided "as is". We are not liable for any damages arising from the use or inability to use the service.</p>

        <h2 className="text-lg font-bold text-black">6. Contact</h2>
        <p>tokenrelay@proton.me</p>
      </div>
    </div>
  );
}
