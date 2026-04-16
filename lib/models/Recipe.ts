import mongoose, { Document, Schema } from "mongoose";

export interface IRecipe extends Document {
  name: string;
  type: string; // breakfast, lunch, dinner, snack
  dietType: string; // Balanced, Low_Carb, Low_Sodium, etc.
  ingredients: string[];
  instructions: string;
  cuisine?: string; // Indian, Chinese, etc.
  nutritionPer100g: {
    caloriesKcal: number;
    proteinG: number;
    carbsG: number;
    fatG: number;
    fiberG?: number;
    sugarG?: number;
    sodiumMg?: number;
  };
  prepTime: number; // minutes
  cookTime: number; // minutes
  servings: number;
  createdAt: Date;
  updatedAt: Date;
}

const RecipeSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["breakfast", "lunch", "dinner", "snack"],
    },
    dietType: {
      type: String,
      required: true,
    },
    ingredients: [{
      type: String,
    }],
    instructions: {
      type: String,
      required: true,
    },
    cuisine: {
      type: String,
    },
    nutritionPer100g: {
      caloriesKcal: {
        type: Number,
        required: true,
      },
      proteinG: {
        type: Number,
        required: true,
      },
      carbsG: {
        type: Number,
        required: true,
      },
      fatG: {
        type: Number,
        required: true,
      },
      fiberG: Number,
      sugarG: Number,
      sodiumMg: Number,
    },
    prepTime: {
      type: Number,
      required: true,
    },
    cookTime: {
      type: Number,
      required: true,
    },
    servings: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Recipe || mongoose.model<IRecipe>("Recipe", RecipeSchema);