import { getCurrentUserId } from "@/lib/auth-helpers";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const TripPlanSchema = z.object({
  startLocation: z.string().min(1, "Starting location is required"),
  destination: z.string().min(1, "Destination is required"),
  dates: z.string().min(1, "Travel dates are required"),
  totalBudget: z.string().optional(),
  travelers: z.string().optional(),
  travelStyle: z.string().optional(),
  purpose: z.string().optional(),
  interests: z.string().optional(),
  preferences: z.string().optional(),
  refinement: z.string().optional(),
});

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

const SYSTEM_PROMPT = `You are an expert travel planner. Generate a complete travel itinerary in strict JSON format matching this exact structure:

{
  "input_summary": {
    "destination": "destination name",
    "dates": "travel dates",
    "budget": "budget provided",
    "travelers": "number of travelers"
  },
  "verdict": {
    "status": "GOOD",
    "reasoning": "why this trip is good/conditional/not recommended",
    "required_changes": null
  },
  "intelligence": {
    "weather_pattern": "weather description",
    "rain_probability": "rain probability percentage",
    "temperature_range": "high-low temperatures",
    "crowd_density": "crowd level assessment",
    "price_seasonality": "pricing information",
    "local_festivals": "festivals or events",
    "safety_conditions": "safety assessment",
    "scenic_quality": "scenery assessment",
    "daylight_hours": "daylight duration"
  },
  "cost_analysis": {
    "per_person_breakdown": {
      "transport_to_destination": "$amount",
      "stay": "$amount",
      "food": "$amount",
      "internal_transport": "$amount",
      "activities": "$amount",
      "buffer": "$amount"
    },
    "classification": "UNDER_BUDGET"
  },
  "alternatives": [],
  "selected_plan": "original",
  "trip_highlights": {
    "title": "catchy trip title",
    "narrative": "engaging 2-3 paragraph description of the trip"
  },
  "itinerary": [
    {
      "day": 1,
      "narrative": "day summary",
      "morning": "morning activities with times and costs",
      "afternoon": "afternoon activities with times and costs",
      "evening": "evening activities with times and costs",
      "travel_time": "travel details",
      "why_optimal": "why this plan is optimal",
      "food_recommendation": "restaurant name and details",
      "booking_strategy": "booking tips",
      "best_photo_timing": "best times for photos",
      "maps_link": "https://www.google.com/maps/search/..."
    }
  ],
  "experience_optimization": {
    "tourist_traps_to_avoid": ["trap description with why"],
    "high_value_experiences": ["free or cheap activities"],
    "hidden_gems": ["lesser known places"],
    "best_viewpoints": ["viewpoint rankings"],
    "best_timing_for_attractions": ["timing recommendations"]
  },
  "risks_and_backups": [
    {"risk": "weather", "mitigation": "indoor activities backup"},
    {"risk": "crowds", "mitigation": "early arrival strategy"}
  ],
  "packing_and_preparation": {
    "weather_based_packing_list": ["item 1", "item 2"],
    "documents": ["passport", "travel insurance"],
    "pre_booking_timeline": ["book flights 2 months ahead", "book hotels 6 weeks ahead"]
  },
  "trip_score": {
    "score": 8.5,
    "explanation": "why this score - value for money, timing, efficiency, uniqueness"
  }
}

CRITICAL REQUIREMENTS:
- Return ONLY valid JSON starting with { and ending with }
- Include all sections with real, specific data
- NO markdown, NO code blocks, NO extra text before or after JSON
- All values must be strings or arrays of strings
- Include specific venue names, times, and costs
- Make it actionable and detailed`;

export async function POST(req: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validationResult = TripPlanSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors[0].message },
        { status: 400 },
      );
    }

    const {
      startLocation,
      destination,
      dates,
      totalBudget,
      travelers,
      travelStyle,
      purpose,
      interests,
      preferences,
      refinement,
    } = validationResult.data;

    const userPrompt = `Create a complete travel itinerary JSON response for:

Destination: ${destination}
Dates: ${dates}
Starting from: ${startLocation}
Budget: ${totalBudget}
Travelers: ${travelers} [${travelStyle}]
Trip Type: ${purpose}
Interests: ${interests}
Preferences: ${preferences}
${refinement ? `\nRefinement Request: ${refinement}` : ""}

Generate ALL sections of the itinerary with:
- Specific restaurant/hotel names verified on Google Maps
- Exact times for activities
- Real costs for each activity
- 3-5 days of detailed day-by-day itinerary
- Complete trip highlights, analysis, and recommendations
${refinement ? "\nIncorporate the refinement request into the updated itinerary." : ""}

Return ONLY valid JSON.`;

    const GROQ_API_KEY = process.env.GROQ_API_KEY;
    if (!GROQ_API_KEY) {
      throw new Error("GROQ API key not configured");
    }

    const requestBody = {
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.6,
      max_tokens: 8000,
      response_format: { type: "json_object" },
    };

    console.log("Sending request to Groq API");

    const completion = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!completion.ok) {
      const errBody = await completion.text();
      console.error("Groq API error response:", {
        status: completion.status,
        statusText: completion.statusText,
        body: errBody,
      });
      throw new Error(`Groq API error (${completion.status}): ${errBody}`);
    }

    const groqData = await completion.json();
    const rawText = groqData.choices?.[0]?.message?.content;

    if (!rawText) {
      console.error("Groq response:", groqData);
      throw new Error("No content generated from Groq");
    }

    // Try to parse the JSON response
    let parsedResult;
    try {
      parsedResult = JSON.parse(rawText);
    } catch (parseError) {
      console.error(
        "Failed to parse Groq response as JSON. Raw text:",
        rawText,
      );
      throw new Error(
        `Invalid JSON response from Groq: ${(parseError as Error).message}`,
      );
    }

    return NextResponse.json(parsedResult);
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to generate travel plan";
    console.error("Error in travel planner API:", error);
    return NextResponse.json(
      {
        error: errorMessage,
        details:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 },
    );
  }
}
