import { streamText } from "ai";

import { AI_MODEL, REASONING_OPTIONS, aiErrorMessage, createGateway } from "./ai-gateway.server";

const SYSTEM_PROMPT = `You are an expert agronomist and plant pathologist working with smallholder farmers in Malawi and the wider region.
You are given a single photo. Look carefully at the actual plant, leaves, stems, fruit and any visible damage in THAT photo.

Rules:
- Identify the crop/plant species you can actually see. If you cannot tell, say so honestly in "crop" (e.g. "Unclear - likely a leafy vegetable").
- Base every field on what is visible. Never invent a disease that the image does not support.
- If the plant looks healthy, say it is healthy and give care advice instead of a treatment.
- If the image is not a plant, set "issue" to explain that and leave disease/pest null.
- Treatment advice must be practical and safe: cultural controls first, then active ingredient classes rather than brand names, and always remind the farmer to follow the product label.
- Write in clear, simple English.

Respond with ONLY a JSON object (no markdown fences) with exactly these keys:
{
  "crop": string,
  "disease": string | null,
  "pest": string | null,
  "confidence": number,            // 0-1, your honest confidence in the main finding
  "issue": string,                 // one or two sentences on what you see in this photo
  "cause": string,
  "symptoms": string,              // the symptoms visible in this image
  "prevention": string,
  "treatment": string,
  "pesticides": string | null,
  "fungicides": string | null,
  "severity": string               // "healthy" | "mild" | "moderate" | "severe" | "unknown"
}`;

export type PlantDiagnosis = {
  crop: string;
  disease: string | null;
  pest: string | null;
  confidence: number;
  issue: string;
  cause: string;
  symptoms: string;
  prevention: string;
  treatment: string;
  pesticides: string | null;
  fungicides: string | null;
  severity: string;
  disclaimer: string;
};

function extractJson(text: string): Record<string, unknown> {
  const cleaned = text.replace(/```json/gi, "").replace(/```/g, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("The AI response could not be read. Please try again.");
  return JSON.parse(cleaned.slice(start, end + 1)) as Record<string, unknown>;
}

function str(value: unknown, fallback = ""): string {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function nullableStr(value: unknown): string | null {
  const text = str(value);
  if (!text || /^(none|null|n\/a|not applicable)$/i.test(text)) return null;
  return text;
}

export async function handlePlantDiagnosis(request: Request): Promise<Response> {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const body = (await request.json()) as { image?: unknown; notes?: unknown };
    const image = body.image;
    if (typeof image !== "string" || !image.startsWith("data:image/")) {
      return Response.json({ error: "A valid crop photo is required." }, { status: 400 });
    }

    const { provider } = createGateway(request);
    const notes = str(body.notes);

    const result = streamText({
      model: provider.responses(AI_MODEL),
      system: SYSTEM_PROMPT,
      abortSignal: request.signal,
      providerOptions: REASONING_OPTIONS,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: notes
                ? `Diagnose this plant photo. Farmer notes: ${notes}`
                : "Diagnose this plant photo.",
            },
            { type: "image", image },
          ],
        },
      ],
    });

    const text = await result.text;
    const parsed = extractJson(text);

    const diagnosis: PlantDiagnosis = {
      crop: str(parsed.crop, "Unidentified plant"),
      disease: nullableStr(parsed.disease),
      pest: nullableStr(parsed.pest),
      confidence: Math.max(0, Math.min(1, Number(parsed.confidence) || 0)),
      issue: str(parsed.issue, "No clear problem could be read from this photo."),
      cause: str(parsed.cause, "Not determined from this photo."),
      symptoms: str(parsed.symptoms, "No distinct symptoms were visible."),
      prevention: str(parsed.prevention, "Keep the crop well spaced, remove damaged material and avoid wetting leaves."),
      treatment: str(parsed.treatment, "Monitor the plant and consult a local extension officer if symptoms spread."),
      pesticides: nullableStr(parsed.pesticides),
      fungicides: nullableStr(parsed.fungicides),
      severity: str(parsed.severity, "unknown"),
      disclaimer:
        "This is AI image-based screening, not a definitive diagnosis. Confirm serious problems with a local agricultural officer and always follow product labels.",
    };

    return Response.json(diagnosis);
  } catch (error) {
    console.error("[plant-diagnosis]", error);
    return Response.json({ error: aiErrorMessage(error) }, { status: 500 });
  }
}
