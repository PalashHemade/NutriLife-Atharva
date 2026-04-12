import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/db/mongodb";
import User from "@/lib/models/User";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password, role } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email, and password are required." }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
    }

    const validRoles = ["user", "consultant", "trainer", "admin"];
    const assignedRole = validRoles.includes(role) ? role : "user";

    await dbConnect();

    const existing = await User.findOne({ email });
    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: assignedRole,
    });

    return NextResponse.json(
      { message: "Account created successfully.", userId: user._id.toString() },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("[REGISTER ERROR]", {
      message: err.message,
      stack: err.stack,
      cause: err.cause,
    });
    return NextResponse.json(
      { error: "Internal server error.", details: err.message },
      { status: 500 }
    );
  }
}
