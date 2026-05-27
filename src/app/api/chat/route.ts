import { getCurrentUserId } from "@/lib/auth-helpers";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

const SYSTEM_PROMPT = `You are WanderWise — a friendly, knowledgeable travel assistant.
Your role: Help users decide WHERE to travel, suggest hidden gems, compare destinations, give practical travel tips.
Rules: Keep responses SHORT with clear formatting. Use **bold** for place names. Be honest about downsides.
Specialize in travel - gently redirect non-travel questions.`;

const ChatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1, "Message cannot be empty"),
});

const ChatRequestSchema = z.object({
  messages: z
    .array(ChatMessageSchema)
    .min(1, "At least one message is required"),
});

type ChatMessage = z.infer<typeof ChatMessageSchema>;

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!GROQ_API_KEY) {
      return NextResponse.json(
        { error: "Chat service not configured" },
        { status: 503 },
      );
    }

    const body = await request.json();
    const validationResult = ChatRequestSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors[0].message },
        { status: 400 },
      );
    }

    const { messages } = validationResult.data;

    const response = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages.slice(-20),
        ],
        max_tokens: 1024,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      console.error(`Groq API error: ${response.status}`);
      return NextResponse.json(
        { error: "Failed to generate response" },
        { status: 502 },
      );
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const reply =
      data.choices?.[0]?.message?.content ||
      "Sorry, I couldn't generate a response.";

    return NextResponse.json({ reply });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Internal server error";
    console.error("Chat API error:", error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
