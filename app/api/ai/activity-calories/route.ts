import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";
import dbConnect from "@/lib/db/mongodb";
import ActivityLog from "@/lib/models/ActivityLog";
import User from "@/lib/models/User";

// MET values for common activities (Metabolic Equivalent of Task)
const ACTIVITIES: Record<string, { met: number; label: string; emoji: string }> = {
  walking:        { met: 3.5,  label: "Walking (moderate)",    emoji: "🚶" },
  jogging:        { met: 7.0,  label: "Jogging",               emoji: "🏃" },
  running:        { met: 9.8,  label: "Running (fast)",        emoji: "🏃‍♂️" },
  cycling:        { met: 7.5,  label: "Cycling",               emoji: "🚴" },
  swimming:       { met: 6.0,  label: "Swimming",              emoji: "🏊" },
  yoga:           { met: 3.0,  label: "Yoga",                  emoji: "🧘" },
  weight_training: { met: 5.0, label: "Weight Training",       emoji: "🏋️" },
  hiit:           { met: 8.0,  label: "HIIT Workout",          emoji: "⚡" },
  dancing:        { met: 5.5,  label: "Dancing",               emoji: "💃" },
  jump_rope:      { met: 12.3, label: "Jump Rope",             emoji: "⏩" },
  stretching:     { met: 2.3,  label: "Stretching",            emoji: "🤸" },
  pilates:        { met: 3.8,  label: "Pilates",               emoji: "🧘‍♀️" },
  hiking:         { met: 6.5,  label: "Hiking",                emoji: "🥾" },
  basketball:     { met: 6.5,  label: "Basketball",            emoji: "🏀" },
  football:       { met: 8.0,  label: "Football/Soccer",       emoji: "⚽" },
};

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const body = await req.json();
    const { activity, duration } = body; // duration in minutes

    if (!activity || !duration) {
      return NextResponse.json({ error: "Activity and duration are required." }, { status: 400 });
    }

    const actInfo = ACTIVITIES[activity];
    if (!actInfo) {
      return NextResponse.json({ error: "Unknown activity type." }, { status: 400 });
    }

    // Get user weight for calorie calculation
    const user = await User.findById((session.user as any).id);
    const weightKg = user?.weight || 70; // default 70kg

    // Calories burnt = MET × weight(kg) × duration(hours)
    const durationHours = duration / 60;
    const caloriesBurnt = Math.round(actInfo.met * weightKg * durationHours);

    const today = new Date().toISOString().split("T")[0];

    const log = await ActivityLog.create({
      userId: (session.user as any).id,
      date: today,
      activity: actInfo.label,
      duration,
      caloriesBurnt,
      met: actInfo.met,
    });

    // Get today's total
    const todayLogs = await ActivityLog.find({ userId: (session.user as any).id, date: today });
    const totalBurnt = todayLogs.reduce((s: number, l: any) => s + l.caloriesBurnt, 0);

    return NextResponse.json({
      success: true,
      log,
      totalBurntToday: totalBurnt,
    });
  } catch (err: any) {
    console.error("[ACTIVITY ERROR]", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}

// GET: list activities + today's logs
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const today = new Date().toISOString().split("T")[0];
    const todayLogs = await ActivityLog.find({ userId: (session.user as any).id, date: today }).sort({ createdAt: -1 });
    const totalBurnt = todayLogs.reduce((s: number, l: any) => s + l.caloriesBurnt, 0);

    return NextResponse.json({
      activities: Object.entries(ACTIVITIES).map(([key, val]) => ({ id: key, ...val })),
      todayLogs,
      totalBurntToday: totalBurnt,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
