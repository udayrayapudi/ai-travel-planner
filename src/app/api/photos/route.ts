import { NextRequest, NextResponse } from "next/server";

const UNSPLASH_ACCESS_KEY = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY;
const UNSPLASH_API = "https://api.unsplash.com";

// In-memory cache to avoid burning API quota (50 req/hr on free tier)
const cache = new Map<string, { url: string; expires: number }>();
const CACHE_TTL = 1000 * 60 * 60; // 1 hour

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("query")?.trim();
  const width = searchParams.get("w") || "800";

  if (!query) {
    return NextResponse.json({ error: "Missing query" }, { status: 400 });
  }

  if (!UNSPLASH_ACCESS_KEY) {
    return NextResponse.json(
      { error: "Unsplash API key not configured" },
      { status: 500 },
    );
  }

  const cacheKey = `${query.toLowerCase()}:${width}`;

  // Return cached result if fresh
  const cached = cache.get(cacheKey);
  if (cached && cached.expires > Date.now()) {
    return NextResponse.json({ url: cached.url });
  }

  try {
    const res = await fetch(
      `${UNSPLASH_API}/search/photos?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape&content_filter=high`,
      {
        headers: {
          Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
        },
      },
    );

    if (!res.ok) {
      const errText = await res.text();
      console.error("Unsplash API error:", res.status, errText);
      return NextResponse.json(
        { error: "Unsplash API request failed" },
        { status: 502 },
      );
    }

    const data = await res.json();
    const photo = data.results?.[0];

    if (!photo) {
      return NextResponse.json({ url: null });
    }

    // Build the raw URL with requested width
    const photoUrl = `${photo.urls.raw}&w=${width}&q=80&fit=crop&auto=format`;

    // Cache the result
    cache.set(cacheKey, { url: photoUrl, expires: Date.now() + CACHE_TTL });

    return NextResponse.json({
      url: photoUrl,
      credit: {
        name: photo.user?.name,
        link: photo.user?.links?.html,
      },
    });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to fetch photo";
    console.error("Unsplash fetch error:", error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
