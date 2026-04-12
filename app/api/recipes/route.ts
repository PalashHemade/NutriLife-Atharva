import { NextResponse } from "next/server";
import dbConnect from "@/lib/db/mongodb";
import Recipe from "@/lib/models/Recipe";
import recipesData from "@/lib/seed/recipes.json";

// POST: Fetch recipes by diet type (as specified in docx)
export async function POST(req: Request) {
  try {
    await dbConnect();
    const { dietType } = await req.json();

    // Auto-seed if collection is empty
    const count = await Recipe.countDocuments();
    if (count === 0) {
      await Recipe.insertMany(recipesData);
      console.log(`✅ Seeded ${recipesData.length} recipes into MongoDB`);
    }

    const recipes = await Recipe.find({
      dietType: dietType,
    }).limit(10);

    return NextResponse.json(recipes);
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch recipes" }, { status: 500 });
  }
}

// GET: Return all recipes with optional filters
export async function GET(req: Request) {
  try {
    await dbConnect();

    // Auto-seed if collection is empty
    const count = await Recipe.countDocuments();
    if (count === 0) {
      await Recipe.insertMany(recipesData);
      console.log(`✅ Seeded ${recipesData.length} recipes into MongoDB`);
    }

    const { searchParams } = new URL(req.url);
    const dietType = searchParams.get("dietType");
    const cuisine = searchParams.get("cuisine");
    const type = searchParams.get("type"); // Veg or Non-Veg
    const tag = searchParams.get("tag");

    const filter: any = {};
    if (dietType) filter.dietType = dietType;
    if (cuisine) filter.cuisine = cuisine;
    if (type) filter.type = type;
    if (tag) filter.tags = tag;

    const recipes = await Recipe.find(filter).sort({ name: 1 });

    return NextResponse.json({ recipes });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
