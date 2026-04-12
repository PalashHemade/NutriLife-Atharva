import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";
import dbConnect from "@/lib/db/mongodb";
import MealPlan from "@/lib/models/MealPlan";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const body = await req.json();
    const { consumedMeals } = body;
    // consumedMeals: [{ mealId, consumedAmount (0-100) }]

    const today = new Date().toISOString().split("T")[0];
    const mealPlan = await MealPlan.findOne({ userId: (session.user as any).id, date: today });

    if (!mealPlan) {
      return NextResponse.json({ error: "No meal plan found for today. Generate one first." }, { status: 404 });
    }

    // Update consumed status
    for (const cm of consumedMeals) {
      const meal = mealPlan.meals.id(cm.mealId);
      if (meal) {
        meal.consumed = true;
        meal.consumedAmount = cm.consumedAmount;
      }
    }
    await mealPlan.save();

    // Calculate what was consumed vs what remains
    const consumedCals = mealPlan.meals
      .filter((m: any) => m.consumed)
      .reduce((s: number, m: any) => s + (m.calories * (m.consumedAmount / 100)), 0);
    const consumedProtein = mealPlan.meals
      .filter((m: any) => m.consumed)
      .reduce((s: number, m: any) => s + (m.protein * (m.consumedAmount / 100)), 0);
    const consumedCarbs = mealPlan.meals
      .filter((m: any) => m.consumed)
      .reduce((s: number, m: any) => s + (m.carbs * (m.consumedAmount / 100)), 0);
    const consumedFat = mealPlan.meals
      .filter((m: any) => m.consumed)
      .reduce((s: number, m: any) => s + (m.fat * (m.consumedAmount / 100)), 0);

    const remainingCals = mealPlan.totalCalories - consumedCals;
    const remainingProtein = mealPlan.totalProtein - consumedProtein;
    const remainingCarbs = mealPlan.totalCarbs - consumedCarbs;
    const remainingFat = mealPlan.totalFat - consumedFat;

    const unconsumedMeals = mealPlan.meals.filter((m: any) => !m.consumed);

    if (unconsumedMeals.length === 0) {
      return NextResponse.json({
        success: true,
        message: "All meals already consumed! Great job hitting your targets.",
        mealPlan,
        consumed: { calories: Math.round(consumedCals), protein: Math.round(consumedProtein), carbs: Math.round(consumedCarbs), fat: Math.round(consumedFat) },
      });
    }

    const consumedList = mealPlan.meals
      .filter((m: any) => m.consumed)
      .map((m: any) => `${m.name} (${m.mealType}): ate ${m.consumedAmount}% — ~${Math.round(m.calories * m.consumedAmount / 100)} cal`)
      .join("\n");

    const prompt = `You are a clinical nutritionist AI. The user has a daily target of:
- Calories: ${mealPlan.totalCalories} kcal
- Protein: ${mealPlan.totalProtein}g, Carbs: ${mealPlan.totalCarbs}g, Fat: ${mealPlan.totalFat}g
- Diet category: ${mealPlan.category}

What they already ate today:
${consumedList}

Remaining targets: ~${Math.round(remainingCals)} cal, ${Math.round(remainingProtein)}g protein, ${Math.round(remainingCarbs)}g carbs, ${Math.round(remainingFat)}g fat

Generate ${unconsumedMeals.length} replacement meal(s) for the remaining meal types: ${unconsumedMeals.map((m: any) => m.mealType).join(", ")}. Adjust portions so the TOTAL daily intake hits the original targets.

Respond ONLY with valid JSON, no markdown:
{"meals":[{"name":"Dish Name","mealType":"lunch","calories":550,"protein":35,"carbs":60,"fat":18,"description":"Brief description"}]}`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 1024,
    });

    const aiResponse = chatCompletion.choices[0]?.message?.content || "";
    let newMeals;
    try {
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        newMeals = parsed.meals;
      } else {
        throw new Error("No JSON found");
      }
    } catch {
      // Keep existing unconsumed meals as fallback
      return NextResponse.json({
        success: true,
        message: "AI couldn't adjust — keeping original plan.",
        mealPlan,
        consumed: { calories: Math.round(consumedCals), protein: Math.round(consumedProtein) },
      });
    }

    // Replace unconsumed meals with AI-adjusted ones
    for (let i = 0; i < unconsumedMeals.length && i < newMeals.length; i++) {
      const mealDoc = mealPlan.meals.id(unconsumedMeals[i]._id);
      if (mealDoc) {
        mealDoc.name = newMeals[i].name;
        mealDoc.calories = newMeals[i].calories;
        mealDoc.protein = newMeals[i].protein;
        mealDoc.carbs = newMeals[i].carbs;
        mealDoc.fat = newMeals[i].fat;
        mealDoc.description = newMeals[i].description;
      }
    }
    mealPlan.modified = true;
    await mealPlan.save();

    return NextResponse.json({
      success: true,
      mealPlan,
      consumed: { calories: Math.round(consumedCals), protein: Math.round(consumedProtein), carbs: Math.round(consumedCarbs), fat: Math.round(consumedFat) },
    });
  } catch (err: any) {
    console.error("[MODIFY PLAN ERROR]", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
