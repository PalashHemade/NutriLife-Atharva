import mongoose, { Document, Schema } from "mongoose";

export interface INutritionist extends Document {
  name: string;
  specialization: string;
  experience: string;
  rating: number;
  reviews: number;
  patients: string;
  bio: string;
  badges: string[];
  emoji: string;
  createdAt: Date;
  updatedAt: Date;
}

const NutritionistSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    specialization: {
      type: String,
      required: true,
    },
    experience: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 0,
      max: 5,
    },
    reviews: {
      type: Number,
      required: true,
    },
    patients: {
      type: String,
      required: true,
    },
    bio: {
      type: String,
      required: true,
    },
    badges: [{
      type: String,
    }],
    emoji: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Nutritionist || mongoose.model<INutritionist>("Nutritionist", NutritionistSchema);
