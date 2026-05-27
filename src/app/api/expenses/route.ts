import { Expense } from "@/lib/models/Expense";
import { connectDB } from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";

// GET /api/expenses — all expenses, or ?tripId=xxx for trip-specific
export async function GET(req: NextRequest) {
  await connectDB();

  const { searchParams } = new URL(req.url);
  const tripId = searchParams.get("tripId");

  const filter = tripId ? { tripId } : {};
  const expenses = await Expense.find(filter).sort({ date: -1 }).lean();
  return NextResponse.json(expenses.map(toClient));
}

// POST /api/expenses — create or update
export async function POST(req: NextRequest) {
  await connectDB();
  const body = await req.json();

  const existing = await Expense.findOne({ expenseId: body.id });
  if (existing) {
    existing.set({
      tripId: body.tripId ?? existing.tripId,
      category: body.category ?? existing.category,
      description: body.description ?? existing.description,
      amount: body.amount ?? existing.amount,
      currency: body.currency ?? existing.currency,
      date: body.date ?? existing.date,
      paidBy: body.paidBy ?? existing.paidBy,
    });
    await existing.save();
    return NextResponse.json(toClient(existing.toObject()));
  }

  const expense = await Expense.create({
    expenseId: body.id,
    tripId: body.tripId,
    category: body.category || "",
    description: body.description || "",
    amount: body.amount || 0,
    currency: body.currency || "USD",
    date: body.date || "",
    paidBy: body.paidBy || "Me",
  });

  return NextResponse.json(toClient(expense.toObject()), { status: 201 });
}

// DELETE /api/expenses?id=xxx
export async function DELETE(req: NextRequest) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  await Expense.deleteOne({ expenseId: id });
  return NextResponse.json({ success: true });
}

function toClient(doc: Record<string, unknown>) {
  const { _id, __v, expenseId, ...rest } = doc;
  return { id: expenseId, ...rest };
}
