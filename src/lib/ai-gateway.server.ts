import { createOpenAI } from "@ai-sdk/openai";

import { createLovableAiGatewayRunIdFetch, getLovableAiGatewayRunId } from "./ai-run-id.server";

export const AI_MODEL = "openai/gpt-6-astra";
const BASE_URL = "https://ai.gateway.lovable.dev/v1";

export function createGateway(request?: Request) {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw new Error("AI is not configured on the server.");

  const runIdFetch = createLovableAiGatewayRunIdFetch(
    request ? getLovableAiGatewayRunId(request) : undefined,
  );

  const provider = createOpenAI({
    baseURL: BASE_URL,
    apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    fetch: runIdFetch.fetch,
  });

  return { provider, runIdFetch };
}

export const REASONING_OPTIONS = {
  openai: {
    store: false,
    forceReasoning: true,
    reasoningEffort: "low",
    reasoningSummary: "auto",
    include: ["reasoning.encrypted_content"],
  },
} as const;

export function aiErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  if (message.includes("402")) {
    return "The AI service is out of credits. Please top up to continue using AI features.";
  }
  if (message.includes("429")) {
    return "Too many AI requests right now. Please wait a moment and try again.";
  }
  return message || "The AI service could not complete this request.";
}
