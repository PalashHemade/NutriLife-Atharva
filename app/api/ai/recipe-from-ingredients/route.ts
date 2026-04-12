import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { ingredients } = body;

    if (!ingredients || !ingredients.length) {
      return NextResponse.json({ error: "Please provide at least one ingredient." }, { status: 400 });
    }

    const prompt = `You are a creative chef and nutritionist. The user has these ingredients available:
${ingredients.join(", ")}

Create a delicious, healthy recipe using these ingredients. Include:
1. Recipe name
2. Serving size
3. Step-by-step cooking instructions
4. Estimated nutrition per serving (calories, protein, carbs, fat)
5. Preparation time and cooking time

Respond ONLY with valid JSON, no markdown:
{"name":"Recipe Name","servings":2,"prepTime":"10 min","cookTime":"20 min","ingredients":["ingredient 1 - amount","ingredient 2 - amount"],"instructions":["Step 1","Step 2","Step 3"],"nutrition":{"calories":400,"protein":25,"carbs":45,"fat":12},"tips":"Optional cooking tip"}`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      temperature: 0.8,
      max_tokens: 1024,
    });

    const aiResponse = chatCompletion.choices[0]?.message?.content || "";

    let recipe;
    try {
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        recipe = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found");
      }
    } catch {
      return NextResponse.json({
        error: "Could not generate recipe. Please try with different ingredients.",
      }, { status: 500 });
    }

    return NextResponse.json({ success: true, recipe });
  } catch (err: any) {
    console.error("[RECIPE ERROR]", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
