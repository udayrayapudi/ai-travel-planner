import { User } from "@/lib/models/User";
import { connectDB } from "@/lib/mongodb";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const SignUpSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  displayName: z.string().min(2, "Name must be at least 2 characters"),
});

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();

    // Validate input
    const validationResult = SignUpSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors[0].message },
        { status: 400 },
      );
    }

    const { email, password, displayName } = validationResult.data;

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 },
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const newUser = await User.create({
      email: email.toLowerCase(),
      password: hashedPassword,
      displayName,
      provider: "credentials",
    });

    return NextResponse.json(
      {
        message: "User created successfully",
        user: {
          id: newUser._id,
          email: newUser.email,
          displayName: newUser.displayName,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Failed to create account" },
      { status: 500 },
    );
  }
}
