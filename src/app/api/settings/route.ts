import { Settings } from "@/lib/models/Settings";
import { connectDB } from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";

const DEFAULT_SETTINGS = {
  displayName: "",
  email: "",
  defaultCurrency: "INR",
  defaultTravelers: 1,
  notifications: true,
  darkMode: true,
  language: "en",
};

// GET /api/settings
export async function GET() {
  await connectDB();

  const doc = await Settings.findOne({ userId: "default" }).lean();
  if (!doc) return NextResponse.json(DEFAULT_SETTINGS);

  const { _id, __v, userId, ...rest } = doc;
  return NextResponse.json({ ...DEFAULT_SETTINGS, ...rest });
}

// POST /api/settings — upsert
export async function POST(req: NextRequest) {
  await connectDB();
  const body = await req.json();

  const doc = await Settings.findOneAndUpdate(
    { userId: "default" },
    {
      $set: {
        displayName: body.displayName ?? "",
        email: body.email ?? "",
        defaultCurrency: body.defaultCurrency ?? "INR",
        defaultTravelers: body.defaultTravelers ?? 1,
        notifications: body.notifications ?? true,
        darkMode: body.darkMode ?? true,
        language: body.language ?? "en",
      },
    },
    { upsert: true, new: true, lean: true },
  );

  const { _id, __v, userId, ...rest } = doc as Record<string, unknown>;
  return NextResponse.json(rest);
}
