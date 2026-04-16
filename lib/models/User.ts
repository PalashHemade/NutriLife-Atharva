import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: "user" | "consultant" | "trainer" | "admin";
  // Health profile
  age?: number;
  height?: number; // cm
  weight?: number; // kg
  gender?: "male" | "female" | "other";
  glucoseLevel?: number; // mg/dL
  cholesterol?: number; // mg/dL
  bloodPressure?: number; // mmHg
  allergies?: string[];
  goals?: string[];
  dietaryRestrictions?: string;
  preferredCuisine?: string;
  weeklyExerciseHours?: number;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "consultant", "trainer", "admin"],
      default: "user",
    },
    // Health profile fields
    age: Number,
    height: Number,
    weight: Number,
    gender: {
      type: String,
      enum: ["male", "female", "other"],
    },
    glucoseLevel: Number,
    cholesterol: Number,
    bloodPressure: Number,
    allergies: [String],
    goals: [String],
    dietaryRestrictions: String,
    preferredCuisine: String,
    weeklyExerciseHours: Number,
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.User || mongoose.model<IUser>("User", UserSchema);