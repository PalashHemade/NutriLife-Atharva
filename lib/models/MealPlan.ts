import mongoose, { Document, Schema } from "mongoose";

export interface IMeal extends Document {
  name: string;
  mealType: string; // breakfast, lunch, dinner, snack
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  description: string;
  consumed: boolean;
  consumedAmount: number; // percentage consumed
}

export interface IMealPlan extends Document {
  userId: mongoose.Types.ObjectId;
  date: string; // YYYY-MM-DD
  category: string; // Balanced, Low_Carb, etc.
  meals: IMeal[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  modified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MealSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    mealType: {
      type: String,
      required: true,
      enum: ["breakfast", "lunch", "dinner", "snack"],
    },
    calories: {
      type: Number,
      required: true,
    },
    protein: {
      type: Number,
      required: true,
    },
    carbs: {
      type: Number,
      required: true,
    },
    fat: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    consumed: {
      type: Boolean,
      default: false,
    },
    consumedAmount: {
      type: Number,
      default: 0,
    },
  },
  { _id: false }
);

const MealPlanSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    meals: [MealSchema],
    totalCalories: {
      type: Number,
      required: true,
    },
    totalProtein: {
      type: Number,
      required: true,
    },
    totalCarbs: {
      type: Number,
      required: true,
    },
    totalFat: {
      type: Number,
      required: true,
    },
    modified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.MealPlan || mongoose.model<IMealPlan>("MealPlan", MealPlanSchema);