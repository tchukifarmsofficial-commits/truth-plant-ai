import { streamText, type ModelMessage } from "ai";

import { AI_MODEL, REASONING_OPTIONS, aiErrorMessage, createGateway } from "./ai-gateway.server";

const SYSTEM_PROMPT = `You are Njira, a practical farming assistant for smallholder farmers in Malawi and nearby regions.

How you answer:
- Give real, specific, actionable advice. Do not deflect every question to an extension officer.
- Cover crops, planting windows, soil and fertilizer, pests and diseases, livestock, irrigation, post-harvest handling and simple farm economics.
- Prefer low-cost and locally available methods; mention chemical options by active ingredient, never by invented brand name, and remind about label rates and pre-harvest intervals when you do.
- Be concise: short paragraphs or bullet points, plain language, no jargon.
- Ask at most one clarifying question, and only when the answer would otherwise be wrong.
- If you are unsure of a local figure (prices, subsidy rules, exact district dates), say plainly that it varies and explain how to check.
- Never invent statistics, laws or research findings.`;

export async function handleFarmChat(request: Request): Promise<Response> {
  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const body = (await request.json()) as {
      messages?: Array<{ role?: string; content?: string }>;
      language?: string;
    };

    const history = (body.messages ?? [])
      .filter((m) => typeof m.content === "string" && m.content.trim())
      .slice(-12)
      .map<ModelMessage>((m) => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: String(m.content),
      }));

    if (history.length === 0) {
      return new Response("A question is required.", { status: 400 });
    }

    const { provider } = createGateway(request);
    const chichewa = body.language === "ny";

    const result = streamText({
      model: provider.responses(AI_MODEL),
      system: chichewa
        ? `${SYSTEM_PROMPT}\n\nAnswer entirely in Chichewa (Chinyanja), using simple everyday wording.`
        : SYSTEM_PROMPT,
      messages: history,
      abortSignal: request.signal,
      providerOptions: REASONING_OPTIONS,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("[farm-chat]", error);
    return new Response(aiErrorMessage(error), { status: 500 });
  }
}
