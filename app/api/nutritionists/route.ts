import { NextResponse } from "next/server";
import dbConnect from "@/lib/db/mongodb";
import Nutritionist from "@/lib/models/Nutritionist";

export async function GET() {
  try {
    await dbConnect();

    let nutritionists = await Nutritionist.find({}).sort({ rating: -1 });

    // Auto-seed if empty
    if (nutritionists.length === 0) {
      const seedData = [
        {
          name: "Dr. Aisha Mehta",
          specialization: "Clinical Nutrition",
          experience: "12+ years",
          rating: 4.9,
          reviews: 846,
          patients: "2.4K",
          bio: "Specializes in diabetes management, thyroid disorders, and PCOS nutrition therapy. MBBS + M.Sc Clinical Nutrition.",
          badges: ["Diabetes", "Thyroid", "PCOS"],
          emoji: "👩‍⚕️",
        },
        {
          name: "Rohan Sharma",
          specialization: "Sports Nutrition",
          experience: "8+ years",
          rating: 4.8,
          reviews: 612,
          patients: "1.8K",
          bio: "Certified sports nutritionist working with professional athletes. Expert in performance-based meal planning.",
          badges: ["Athletes", "Muscle Gain", "Performance"],
          emoji: "🏋️",
        },
        {
          name: "Neha Kapoor",
          specialization: "Weight Management",
          experience: "10+ years",
          rating: 4.8,
          reviews: 734,
          patients: "3.1K",
          bio: "Award-winning weight management specialist. Pioneer of sustainable, non-restrictive diet programs.",
          badges: ["Obesity", "Keto", "Intermittent Fasting"],
          emoji: "🌿",
        },
        {
          name: "Aarav Iyer",
          specialization: "Diabetic Specialist",
          experience: "15+ years",
          rating: 4.9,
          reviews: 921,
          patients: "4.2K",
          bio: "India's #1 rated diabetic nutrition expert. Former HOD of Nutrition at AIIMS. Published 50+ research papers.",
          badges: ["Type 2 Diabetes", "Insulin", "Lifestyle"],
          emoji: "🩺",
        },
      ];

      nutritionists = await Nutritionist.insertMany(seedData);
    }

    return NextResponse.json({ nutritionists });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
