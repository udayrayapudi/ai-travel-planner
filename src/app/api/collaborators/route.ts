import { Collaborator } from "@/lib/models/Collaborator";
import { connectDB } from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";

// GET /api/collaborators — all, or ?tripId=xxx
export async function GET(req: NextRequest) {
  await connectDB();

  const { searchParams } = new URL(req.url);
  const tripId = searchParams.get("tripId");

  const filter = tripId ? { tripId } : {};
  const collabs = await Collaborator.find(filter).sort({ addedAt: -1 }).lean();
  return NextResponse.json(collabs.map(toClient));
}

// POST /api/collaborators — create or update
export async function POST(req: NextRequest) {
  await connectDB();
  const body = await req.json();

  const existing = await Collaborator.findOne({ collabId: body.id });
  if (existing) {
    existing.set({
      tripId: body.tripId ?? existing.tripId,
      name: body.name ?? existing.name,
      email: body.email ?? existing.email,
      role: body.role ?? existing.role,
      addedAt: body.addedAt ?? existing.addedAt,
    });
    await existing.save();
    return NextResponse.json(toClient(existing.toObject()));
  }

  const collab = await Collaborator.create({
    collabId: body.id,
    tripId: body.tripId,
    name: body.name || "",
    email: body.email || "",
    role: body.role || "viewer",
    addedAt: body.addedAt || new Date().toISOString(),
  });

  return NextResponse.json(toClient(collab.toObject()), { status: 201 });
}

// DELETE /api/collaborators?id=xxx
export async function DELETE(req: NextRequest) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  await Collaborator.deleteOne({ collabId: id });
  return NextResponse.json({ success: true });
}

function toClient(doc: Record<string, unknown>) {
  const { _id, __v, collabId, ...rest } = doc;
  return { id: collabId, ...rest };
}
