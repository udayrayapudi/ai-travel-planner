import { getCurrentUserId } from "@/lib/auth-helpers";
import { Trip } from "@/lib/models/Trip";
import { connectDB } from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";

// GET /api/trips — list all trips for user, or ?id=xxx for single trip
export async function GET(req: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (id) {
      const trip = await Trip.findOne({ tripId: id, userId }).lean();
      if (!trip)
        return NextResponse.json({ error: "Trip not found" }, { status: 404 });
      return NextResponse.json(toClient(trip));
    }

    const trips = await Trip.find({ userId }).sort({ createdAt: -1 }).lean();
    return NextResponse.json(trips.map(toClient));
  } catch (error) {
    console.error("Error fetching trips:", error);
    return NextResponse.json(
      { error: "Failed to fetch trips" },
      { status: 500 },
    );
  }
}

// POST /api/trips — create or update a trip
export async function POST(req: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const body = await req.json();

    const existing = await Trip.findOne({ tripId: body.id, userId });
    if (existing) {
      // Update
      existing.set({
        destination: body.destination ?? existing.destination,
        startLocation: body.startLocation ?? existing.startLocation,
        dates: body.dates ?? existing.dates,
        travelers: body.travelers ?? existing.travelers,
        budget: body.budget ?? existing.budget,
        formData: body.formData ?? existing.formData,
        plan: body.plan ?? existing.plan,
        status: body.status ?? existing.status,
        createdAt: body.createdAt ?? existing.createdAt,
      });
      await existing.save();
      return NextResponse.json(toClient(existing.toObject()));
    }

    // Create new
    const trip = await Trip.create({
      tripId: body.id,
      userId,
      destination: body.destination || "",
      startLocation: body.startLocation || "",
      dates: body.dates || "",
      travelers: body.travelers || "1",
      budget: body.budget || "Flexible",
      formData: body.formData || {},
      plan: body.plan || null,
      status: body.status || "planning",
      createdAt: body.createdAt || new Date().toISOString(),
    });

    return NextResponse.json(toClient(trip.toObject()), { status: 201 });
  } catch (error) {
    console.error("Error saving trip:", error);
    return NextResponse.json({ error: "Failed to save trip" }, { status: 500 });
  }
}

// DELETE /api/trips?id=xxx
export async function DELETE(req: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const trip = await Trip.findOneAndDelete({ tripId: id, userId });
    if (!trip)
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting trip:", error);
    return NextResponse.json(
      { error: "Failed to delete trip" },
      { status: 500 },
    );
  }
}

// Convert Mongo document to client-facing shape (tripId → id, strip _id)
function toClient(doc: Record<string, unknown>) {
  const { _id, __v, tripId, userId, ...rest } = doc as Record<string, unknown>;
  return { id: tripId, ...rest };
}
