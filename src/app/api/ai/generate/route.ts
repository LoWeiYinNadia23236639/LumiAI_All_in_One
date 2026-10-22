import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI, Type } from "@google/genai";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const PREFERRED_MODEL = process.env.GEMINI_MODEL || "gemini-3.8-flash";
// Hardcoded known-good chain in case the model-listing endpoint fails or returns nothing.
const HARDCODED_FALLBACKS = ["gemini-3.8-flash", "gemini-3.6-flash"];

type ToolType = "storyboard" | "caption" | "quote" | "message" | "planner" | "rate";

// Serverless functions can run longer when retries kick in.
export const maxDuration = 30;

// Cached candidate model list so we only list models once per server lifetime.
let resolvedModels: string[] | null = null;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryable(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return /503|UNAVAILABLE|high demand|overloaded|RESOURCE_EXHAUSTED|quota|deadline exceeded|timeout/i.test(
    msg
  );
}

const LOCALE_HINTS: Record<string, string> = {
  "zh-hk": "Use natural Traditional Chinese with a Cantonese-friendly tone (廣東話語感).",
  "zh-cn": "Use Simplified Chinese (简体中文).",
  en: "Use English.",
};

function buildPrompt(type: ToolType, input: Record<string, unknown>): { system: string; user: string } {
  const localeHint = LOCALE_HINTS[String(input.locale ?? "en")] ?? "";
  const languageRule =
    "Respond entirely in the same language as the user's input. " + localeHint;

  switch (type) {
    case "storyboard":
      return {
        system: `You are a professional video director creating storyboards for content creators. ${languageRule}`,
        user: `Create a detailed storyboard for this content idea.\nIdea: ${input.prompt}\nMood/Atmosphere: ${input.mood || "not specified"}\nProvide 4-7 scenes, each with scene_number, description, shot_angle, lighting; plus an equipment_checklist array and a pro_tips array.`,
      };
    case "caption":
      return {
        system: `You write high-engagement, high-click-rate social media captions. ${languageRule}`,
        user: `Write exactly 3 caption options for ${input.platform}. Tone: ${input.tone}. Topic: ${input.prompt}\nEach caption must include: text (the caption itself), hashtags (8-12 relevant tags without the # symbol), emoji (a few suggested emoji to sprinkle in).`,
      };
    case "quote":
      return {
        system: `You are a pricing advisor for influencer marketing. ${languageRule}`,
        user: `Estimate a job quote for this creator project.\nBrand: ${input.brandName}\nDeliverables: ${(input.deliverables as string[])?.join(", ")}\nContent type: ${input.contentType}\nComplexity: ${input.complexity}\nTimeline: ${input.timeline}\nBrief: ${input.briefDescription}`,
      };
    case "message": {
      const scenarios: Record<string, string> = {
        dm: "a short, casual DM to open a conversation with a brand",
        proposal: "a collaboration proposal email to a brand",
        followup: "a polite follow-up message about a pending collaboration",
        decline: "a polite message declining an offer",
        negotiation: "a negotiation reply to discuss pricing/terms",
      };
      return {
        system: `You write professional, effective outreach messages for content creators. ${languageRule}`,
        user: `Write this message: ${scenarios[String(input.scenario)] ?? scenarios.proposal}.\nClient/Brand name: ${input.clientName}\nProject brief: ${input.projectBrief}\nTone: ${input.tone}\nPoints to include: ${input.specificPoints || "none"}`,
      };
    }
    case "planner":
      return {
        system: `You are a content campaign project planner. ${languageRule}`,
        user: `Create a project plan.\nCampaign name: ${input.campaignName}\nDuration: ${input.duration}\nPlatforms: ${(input.platforms as string[])?.join(", ")}\nNumber of content pieces: ${input.contentCount}\nGoals: ${input.goals}`,
      };
    case "rate":
      return {
        system: `You are an influencer rate consultant. ${languageRule}`,
        user: `Estimate fair sponsorship rates for this creator.\nNiche: ${input.niche}\nFollower count: ${input.followers}\nEngagement rate: ${input.engagement}\nPrimary platform: ${input.platform}`,
      };
  }
}

const SCHEMAS: Record<ToolType, unknown> = {
  storyboard: {
    type: Type.OBJECT,
    properties: {
      scenes: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            scene_number: { type: Type.NUMBER },
            description: { type: Type.STRING },
            shot_angle: { type: Type.STRING },
            lighting: { type: Type.STRING },
          },
          required: ["scene_number", "description", "shot_angle", "lighting"],
        },
      },
      equipment_checklist: { type: Type.ARRAY, items: { type: Type.STRING } },
      pro_tips: { type: Type.ARRAY, items: { type: Type.STRING } },
    },
    required: ["scenes", "equipment_checklist", "pro_tips"],
  },
  caption: {
    type: Type.OBJECT,
    properties: {
      captions: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            text: { type: Type.STRING },
            hashtags: { type: Type.ARRAY, items: { type: Type.STRING } },
            emoji: { type: Type.STRING },
          },
          required: ["text", "hashtags", "emoji"],
        },
      },
    },
    required: ["captions"],
  },
  quote: {
    type: Type.OBJECT,
    properties: {
      estimatedHours: { type: Type.NUMBER },
      recommendedPrice: {
        type: Type.OBJECT,
        properties: { min: { type: Type.NUMBER }, max: { type: Type.NUMBER } },
        required: ["min", "max"],
      },
      pricePerDeliverable: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            type: { type: Type.STRING },
            price: { type: Type.NUMBER },
            time: { type: Type.STRING },
          },
          required: ["type", "price", "time"],
        },
      },
      timelineBreakdown: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            phase: { type: Type.STRING },
            duration: { type: Type.STRING },
            tasks: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ["phase", "duration", "tasks"],
        },
      },
      factors: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            factor: { type: Type.STRING },
            impact: { type: Type.STRING },
            description: { type: Type.STRING },
          },
          required: ["factor", "impact", "description"],
        },
      },
      marketComparison: {
        type: Type.OBJECT,
        properties: {
          percentile: { type: Type.STRING },
          averagePrice: { type: Type.NUMBER },
          yourRange: { type: Type.STRING },
        },
        required: ["percentile", "averagePrice", "yourRange"],
      },
    },
    required: ["estimatedHours", "recommendedPrice", "pricePerDeliverable", "timelineBreakdown", "factors", "marketComparison"],
  },
  message: {
    type: Type.OBJECT,
    properties: {
      subject: { type: Type.STRING },
      body: { type: Type.STRING },
      tone: { type: Type.STRING },
      tips: { type: Type.ARRAY, items: { type: Type.STRING } },
      alternatives: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            tone: { type: Type.STRING },
            preview: { type: Type.STRING },
          },
          required: ["tone", "preview"],
        },
      },
    },
    required: ["subject", "body", "tone", "tips", "alternatives"],
  },
  planner: {
    type: Type.OBJECT,
    properties: {
      overview: {
        type: Type.OBJECT,
        properties: {
          totalDays: { type: Type.NUMBER },
          keyMilestones: { type: Type.ARRAY, items: { type: Type.STRING } },
          criticalDates: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                date: { type: Type.STRING },
                event: { type: Type.STRING },
              },
              required: ["date", "event"],
            },
          },
        },
        required: ["totalDays", "keyMilestones", "criticalDates"],
      },
      phases: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            duration: { type: Type.STRING },
            tasks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  estimatedTime: { type: Type.STRING },
                  priority: { type: Type.STRING },
                },
                required: ["name", "estimatedTime", "priority"],
              },
            },
            deliverables: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ["name", "duration", "tasks", "deliverables"],
        },
      },
      resources: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            type: { type: Type.STRING },
            cost: { type: Type.STRING },
          },
          required: ["name", "type"],
        },
      },
      contentCalendar: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            day: { type: Type.NUMBER },
            platform: { type: Type.STRING },
            content: { type: Type.STRING },
            notes: { type: Type.STRING },
          },
          required: ["day", "platform", "content", "notes"],
        },
      },
    },
    required: ["overview", "phases", "resources", "contentCalendar"],
  },
  rate: {
    type: Type.OBJECT,
    properties: {
      suggested_range: {
        type: Type.OBJECT,
        properties: { min: { type: Type.NUMBER }, max: { type: Type.NUMBER } },
        required: ["min", "max"],
      },
      percentile: { type: Type.STRING },
      insights: { type: Type.ARRAY, items: { type: Type.STRING } },
      recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
    },
    required: ["suggested_range", "percentile", "insights", "recommendations"],
  },
};

async function getCandidateModels(): Promise<string[]> {
  if (resolvedModels) return resolvedModels;
  const models = [PREFERRED_MODEL];
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`
    );
    const data = await res.json();
    const ids: string[] = (data.models ?? []).map((m: { name: string }) =>
      m.name.replace(/^models\//, "")
    );
    // Other flash-tier models as fallbacks (preferred model is already first).
    for (const id of ids) {
      if (id.includes("flash") && !models.includes(id)) models.push(id);
    }
  } catch {
    // Model listing failed — stick with the preferred model for now.
  }
  // Always append the hardcoded chain so a broken/stale env var or a failed
  // listing can't leave us with a single dead model.
  for (const id of HARDCODED_FALLBACKS) {
    if (!models.includes(id)) models.push(id);
  }
  if (models.length > 1) {
    console.log(`[ai] candidate models: ${models.join(", ")}`);
  }
  resolvedModels = models;
  return models;
}

async function generate(type: ToolType, system: string, user: string): Promise<unknown> {
  const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  const models = await getCandidateModels();
  // Try at most 2 models so worst-case latency stays within the function budget.
  const modelsToTry = models.slice(0, 2);
  const delays = [0, 1000, 2500]; // per-model backoff with jitter added below
  let lastErr: unknown;
  for (const model of modelsToTry) {
    for (let attempt = 0; attempt < delays.length; attempt++) {
      if (delays[attempt] > 0) {
        await sleep(delays[attempt] + Math.floor(Math.random() * 500));
      }
      try {
        return await callModel(ai, model, type, system, user);
      } catch (err) {
        lastErr = err;
        if (!isRetryable(err)) {
          // Non-retryable (e.g. model not found / schema unsupported) — rotate model now.
          break;
        }
        if (attempt === delays.length - 1) {
          console.error(`[ai] ${model} still 503 after ${delays.length} attempts, rotating`);
        }
      }
    }
  }
  throw lastErr;
}

async function callModel(
  ai: GoogleGenAI,
  model: string,
  type: ToolType,
  system: string,
  user: string
): Promise<unknown> {
  const response = await ai.models.generateContent({
    model,
    contents: [{ role: "user", parts: [{ text: user }] }],
    config: {
      systemInstruction: system,
      responseMimeType: "application/json",
      responseSchema: SCHEMAS[type] as never,
    },
  });
  const text = response.text ?? "";
  try {
    return JSON.parse(text.replace(/```(?:json)?\s*|\s*```/g, ""));
  } catch {
    throw new Error(`Failed to parse Gemini response as JSON: ${text.slice(0, 200)}`);
  }
}

export async function POST(req: NextRequest) {
  // --- Auth: caller must supply their Supabase access token (client-side session) ---
  const authHeader = req.headers.get("authorization") ?? "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const authClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data: userData, error: userError } = await authClient.auth.getUser(token);
  if (userError || !userData.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!GEMINI_API_KEY) {
    return NextResponse.json({ error: "GEMINI_API_KEY is not configured" }, { status: 500 });
  }

  // Client scoped to this user so the generations insert passes RLS (user_id = auth.uid()).
  const userClient: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });

  let body: { type?: ToolType; input?: Record<string, unknown> };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const { type, input } = body;
  if (!type || !(type in SCHEMAS) || !input) {
    return NextResponse.json({ error: "Missing or invalid type/input" }, { status: 400 });
  }

  const { system, user: promptText } = buildPrompt(type, input);

  let result: unknown;
  try {
    result = await generate(type, system, promptText);
  } catch (err) {
    console.error("[ai] generation failed:", err);
    return NextResponse.json(
      { error: "Generation failed", detail: err instanceof Error ? err.message : String(err) },
      { status: 502 }
    );
  }

  // Record the generation (non-fatal if the insert fails).
  const { error: insertError } = await userClient.from("generations").insert({
    user_id: userData.user.id,
    type,
    prompt: JSON.stringify(input),
    result: JSON.stringify(result),
  });
  if (insertError) {
    console.error("[ai] failed to save generation:", insertError.message);
  }

  return NextResponse.json({ result });
}
