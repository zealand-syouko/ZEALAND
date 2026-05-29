import { NextRequest, NextResponse } from "next/server";
import { validateApiKey } from "@/server/auth/api-key";
import { routeModel } from "@/server/proxy/router";
import { getAdapter } from "@/server/proxy/adapters";
import { getProviderByName } from "@/server/db/providers";
import { decrypt } from "@/server/encryption";
import { createCallLog, incrementApiKeyQuota } from "@/server/db";
import type { OpenAIChatRequest } from "@/server/types";
import { checkRateLimit } from "@/server/ratelimit";
import { chargeUser } from "@/server/billing";

export async function POST(req: NextRequest) {
  const start = Date.now();

  // 1. Auth
  const authHeader = req.headers.get("authorization") || "";
  const auth = await validateApiKey(authHeader);
  if (!auth.valid) {
    return NextResponse.json(
      { error: { message: `Auth failed: ${auth.reason}`, type: "auth_error" } },
      { status: 401 },
    );
  }

  // Rate limit
  if (!checkRateLimit(auth.apiKey.id, 120)) {
    return NextResponse.json(
      { error: { message: "Rate limit exceeded", type: "rate_limit" } },
      { status: 429 },
    );
  }

  // 2. Parse body
  const body: OpenAIChatRequest = await req.json();
  if (!body.model) {
    return NextResponse.json(
      { error: { message: "model is required", type: "invalid_request" } },
      { status: 400 },
    );
  }

  // 3. Route
  let providerName: string;
  try {
    providerName = routeModel(body.model);
  } catch {
    return NextResponse.json(
      { error: { message: `Unknown model: ${body.model}`, type: "invalid_request" } },
      { status: 400 },
    );
  }

  // 4. Check provider
  const providerRecord = await getProviderByName(providerName as Parameters<typeof getProviderByName>[0]);
  if (!providerRecord || !providerRecord.isEnabled) {
    return NextResponse.json(
      { error: { message: `Provider ${providerName} is not available`, type: "provider_error" } },
      { status: 503 },
    );
  }

  // 5. Decrypt API key
  const encryptionKey = process.env.ENCRYPTION_KEY!;
  const apiKey = decrypt(providerRecord.apiKeyEncrypted, encryptionKey);

  const adapter = getAdapter(providerName as Parameters<typeof getAdapter>[0]);
  const config = {
    apiKey,
    baseUrl: providerRecord.baseUrl || "",
  };

  // 6. Proxy
  try {
    if (body.stream) {
      const chunks = adapter.chatStream(body, config);
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of chunks) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`));
            }
            controller.enqueue(encoder.encode("data: [DONE]\n\n"));
            controller.close();
          } catch (e) {
            controller.error(e);
          }
        },
      });

      const latency = Date.now() - start;
      createCallLog({
        apiKeyId: auth.apiKey.id,
        provider: providerName,
        model: body.model,
        endpoint: "/v1/chat/completions",
        requestTokens: 0,
        responseTokens: 0,
        totalTokens: 0,
        latencyMs: latency,
        status: 200,
      }).catch(() => {});

      return new NextResponse(stream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    } else {
      const response = await adapter.chatSync(body, config);
      const latency = Date.now() - start;
      const inputTokens = response.usage?.prompt_tokens || 0;
      const outputTokens = response.usage?.completion_tokens || 0;
      const totalTokens = response.usage?.total_tokens || 0;

      // Async logging + billing
      createCallLog({
        apiKeyId: auth.apiKey.id,
        provider: providerName,
        model: body.model,
        endpoint: "/v1/chat/completions",
        requestTokens: inputTokens,
        responseTokens: outputTokens,
        totalTokens,
        latencyMs: latency,
        status: 200,
      }).catch(() => {});

      incrementApiKeyQuota(auth.apiKey.id, totalTokens).catch(() => {});

      chargeUser(auth.apiKey.userId, body.model, inputTokens, outputTokens, auth.apiKey.id)
        .catch(() => {});

      return NextResponse.json(response);
    }
  } catch (e) {
    const latency = Date.now() - start;
    const message = e instanceof Error ? e.message : "Unknown error";
    createCallLog({
      apiKeyId: auth.apiKey.id,
      provider: providerName,
      model: body.model,
      endpoint: "/v1/chat/completions",
      requestTokens: 0,
      responseTokens: 0,
      totalTokens: 0,
      latencyMs: latency,
      status: 502,
      errorMessage: message,
    }).catch(() => {});

    return NextResponse.json(
      { error: { message, type: "upstream_error" } },
      { status: 502 },
    );
  }
}
