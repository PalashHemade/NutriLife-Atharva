import mongoose, { Document, Schema } from "mongoose";

export interface IIngredient {
  name: string;
  quantity: number;
  unit: string;
}

export interface INutrition {
  caloriesKcal: number;
  proteinG: number;
  fatG: number;
  carbohydratesG: number;
  sugarG: number;
  sodiumMg: number;
}

export interface IRecipe extends Document {
  name: string;
  type: "Veg" | "Non-Veg";
  dietType: string[]; // Low_Carb, Low_Sodium, Balanced
  cuisine?: string;
  cookingTimeMinutes?: number;
  nutritionPer100g: INutrition;
  ingredients: IIngredient[];
  recipeSteps: string[];
  tags: string[];
  createdAt: Date;
}

const IngredientSchema: Schema = new Schema(
  {
    name: String,
    quantity: Number,
    unit: String,
  },
  { _id: false }
);

const NutritionSchema: Schema = new Schema(
  {
    caloriesKcal: Number,
    proteinG: Number,
    fatG: Number,
    carbohydratesG: Number,
    sugarG: Number,
    sodiumMg: Number,
  },
  { _id: false }
);

const RecipeSchema: Schema = new Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ["Veg", "Non-Veg"], required: true },
  dietType: [{ type: String, enum: ["Low_Carb", "Low_Sodium", "Balanced"] }],
  cuisine: String,
  cookingTimeMinutes: Number,
  nutritionPer100g: NutritionSchema,
  ingredients: [IngredientSchema],
  recipeSteps: [String],
  tags: [String],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Recipe || mongoose.model<IRecipe>("Recipe", RecipeSchema);
