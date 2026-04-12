import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";
import dbConnect from "@/lib/db/mongodb";
import User from "@/lib/models/User";
import MealPlan from "@/lib/models/MealPlan";
import Recipe from "@/lib/models/Recipe";
import recipesData from "@/lib/seed/recipes.json";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const user = await User.findById((session.user as any).id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await req.json();
    const {
      age, height, weight, gender, glucoseLevel, cholesterol,
      allergies, goals, dailyCaloricIntake, bloodPressure,
      dietaryRestrictions, preferredCuisine, weeklyExerciseHours
    } = body;

    // Update user health profile
    if (age) user.age = age;
    if (height) user.height = height;
    if (weight) user.weight = weight;
    if (gender) user.gender = gender;
    if (glucoseLevel) user.glucoseLevel = glucoseLevel;
    if (cholesterol) user.cholesterol = cholesterol;
    if (allergies) user.allergies = allergies;
    if (goals) user.goals = goals;
    await user.save();

    // Calculate BMI
    const h = height || user.height || 170;
    const w = weight || user.weight || 70;
    const bmi = Math.round((w / ((h / 100) ** 2)) * 10) / 10;

    // Step 1: Call ML service with ALL 13 features (as specified in docx)
    let dietCategory = "Balanced";
    try {
      const mlPayload = {
        Age: age || user.age || 30,
        Gender: (gender || user.gender || "male").charAt(0).toUpperCase() + (gender || user.gender || "male").slice(1),
        Weight_kg: w,
        Height_cm: h,
        BMI: bmi,
        Daily_Caloric_Intake: dailyCaloricIntake || 2000,
        "Cholesterol_mg/dL": cholesterol || user.cholesterol || 180,
        Blood_Pressure_mmHg: bloodPressure || 120,
        "Glucose_mg/dL": glucoseLevel || user.glucoseLevel || 90,
        Dietary_Restrictions: dietaryRestrictions || "None",
        Allergies: (allergies || user.allergies || []).join(", ") || "None",
        Preferred_Cuisine: preferredCuisine || "Indian",
        Weekly_Exercise_Hours: weeklyExerciseHours || 3,
      };

      const mlRes = await fetch(`${process.env.ML_SERVICE_URL || "http://localhost:8000"}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mlPayload),
      });
      if (mlRes.ok) {
        const mlData = await mlRes.json();
        dietCategory = mlData.diet || "Balanced";
      }
    } catch (mlErr) {
      console.log("ML service unavailable, using default category:", mlErr);
    }

    // Step 2: Fetch matching recipes from database
    const recipeCount = await Recipe.countDocuments();
    if (recipeCount === 0) {
      await Recipe.insertMany(recipesData);
    }
    const matchingRecipes = await Recipe.find({ dietType: dietCategory }).limit(10);
    const recipeNames = matchingRecipes.map((r: any) => `${r.name} (${r.type}, ${r.nutritionPer100g?.caloriesKcal || "?"}kcal/100g)`).join(", ");

    // Step 3: Call Groq AI to generate a detailed meal plan using recipes from DB
    const userAllergies = (allergies || user.allergies || []).join(", ") || "none";
    const userGoals = (goals || user.goals || []).join(", ") || "general health";

    const prompt = `You are a clinical nutritionist AI. Generate a daily meal plan for this person:

- Age: ${age || user.age || 30}, Gender: ${gender || user.gender || "male"}
- Height: ${h}cm, Weight: ${w}kg, BMI: ${bmi}
- Glucose: ${glucoseLevel || user.glucoseLevel || 90}mg/dL, Cholesterol: ${cholesterol || user.cholesterol || 180}mg/dL
- Blood Pressure: ${bloodPressure || 120}mmHg
- Allergies: ${userAllergies}
- Dietary Restrictions: ${dietaryRestrictions || "None"}
- Preferred Cuisine: ${preferredCuisine || "Indian"}
- Goals: ${userGoals}
- ML-classified diet category: ${dietCategory}
- Available recipes from our database: ${recipeNames || "various dishes"}

Generate exactly 4 meals (breakfast, lunch, dinner, snack). Prefer using recipes from our database when suitable. For each meal provide:
- A specific dish name
- Calories, protein (g), carbs (g), fat (g)
- Brief one-line description

Respond ONLY with valid JSON in this exact format, no markdown, no code blocks:
{"meals":[{"name":"Dish Name","mealType":"breakfast","calories":400,"protein":25,"carbs":45,"fat":12,"description":"Brief description"},{"name":"Dish Name","mealType":"lunch","calories":550,"protein":35,"carbs":60,"fat":18,"description":"Brief description"},{"name":"Dish Name","mealType":"dinner","calories":500,"protein":30,"carbs":50,"fat":15,"description":"Brief description"},{"name":"Dish Name","mealType":"snack","calories":200,"protein":10,"carbs":25,"fat":8,"description":"Brief description"}]}`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 1024,
    });

    const aiResponse = chatCompletion.choices[0]?.message?.content || "";

    let meals;
    try {
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        meals = parsed.meals;
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseErr) {
      console.error("AI response parse error:", parseErr, "Raw:", aiResponse);
      meals = [
        { name: "Vegetable Upma", mealType: "breakfast", calories: 280, protein: 8, carbs: 42, fat: 8, description: "South Indian semolina breakfast" },
        { name: "Dal Tadka with Chapati", mealType: "lunch", calories: 520, protein: 18, carbs: 68, fat: 14, description: "Protein-rich lentil curry" },
        { name: "Palak Paneer with Roti", mealType: "dinner", calories: 480, protein: 22, carbs: 40, fat: 20, description: "Spinach paneer with whole wheat roti" },
        { name: "Sprouts Salad", mealType: "snack", calories: 150, protein: 12, carbs: 22, fat: 2, description: "Fiber-rich sprouted lentils" },
      ];
    }

    const today = new Date().toISOString().split("T")[0];
    const totalCalories = meals.reduce((s: number, m: any) => s + (m.calories || 0), 0);
    const totalProtein = meals.reduce((s: number, m: any) => s + (m.protein || 0), 0);
    const totalCarbs = meals.reduce((s: number, m: any) => s + (m.carbs || 0), 0);
    const totalFat = meals.reduce((s: number, m: any) => s + (m.fat || 0), 0);

    const mealPlan = await MealPlan.findOneAndUpdate(
      { userId: user._id, date: today },
      {
        userId: user._id,
        date: today,
        category: dietCategory,
        meals: meals.map((m: any) => ({ ...m, consumed: false, consumedAmount: 0 })),
        totalCalories,
        totalProtein,
        totalCarbs,
        totalFat,
        modified: false,
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({
      success: true,
      mealPlan,
      dietCategory,
      matchingRecipes: matchingRecipes.length,
    });
  } catch (err: any) {
    console.error("[GENERATE PLAN ERROR]", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}

// GET: Fetch today's meal plan
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const today = new Date().toISOString().split("T")[0];
    const mealPlan = await MealPlan.findOne({ userId: (session.user as any).id, date: today });

    return NextResponse.json({ mealPlan });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
