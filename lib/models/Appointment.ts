import mongoose from "mongoose";

const AppointmentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  nutritionistId: { type: mongoose.Schema.Types.ObjectId, ref: "Nutritionist", required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  status: { type: String, enum: ["pending", "confirmed", "completed", "cancelled"], default: "pending" },
  notes: { type: String },
  userName: { type: String },
  nutritionistName: { type: String },
}, { timestamps: true });

export default mongoose.models.Appointment || mongoose.model("Appointment", AppointmentSchema);
