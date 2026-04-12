import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";
import dbConnect from "@/lib/db/mongodb";
import Appointment from "@/lib/models/Appointment";
import Nutritionist from "@/lib/models/Nutritionist";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const body = await req.json();
    const { nutritionistId, date, time, notes } = body;

    if (!nutritionistId || !date || !time) {
      return NextResponse.json({ error: "Nutritionist, date, and time are required." }, { status: 400 });
    }

    const nutritionist = await Nutritionist.findById(nutritionistId);
    if (!nutritionist) {
      return NextResponse.json({ error: "Nutritionist not found." }, { status: 404 });
    }

    const appointment = await Appointment.create({
      userId: (session.user as any).id,
      nutritionistId,
      date,
      time,
      notes: notes || "",
      userName: session.user.name || "User",
      nutritionistName: nutritionist.name,
      status: "pending",
    });

    return NextResponse.json({ success: true, appointment }, { status: 201 });
  } catch (err: any) {
    console.error("[APPOINTMENT ERROR]", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const appointments = await Appointment.find({ userId: (session.user as any).id })
      .sort({ createdAt: -1 })
      .limit(20);

    return NextResponse.json({ appointments });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
