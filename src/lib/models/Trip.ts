import mongoose, { Document, Model, Schema } from "mongoose";

export interface ITrip extends Document {
  tripId: string;
  userId: string;
  destination: string;
  startLocation: string;
  dates: string;
  travelers: string;
  budget: string;
  formData: Record<string, any>;
  plan: Record<string, any> | null;
  status: "planning" | "generated";
  createdAt: string;
}

const TripSchema = new Schema<ITrip>(
  {
    tripId: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    destination: { type: String, default: "" },
    startLocation: { type: String, default: "" },
    dates: { type: String, default: "" },
    travelers: { type: String, default: "1" },
    budget: { type: String, default: "Flexible" },
    formData: { type: Schema.Types.Mixed, default: {} },
    plan: { type: Schema.Types.Mixed, default: null },
    status: {
      type: String,
      enum: ["planning", "generated"],
      default: "planning",
    },
    createdAt: { type: String, default: () => new Date().toISOString() },
  },
  { timestamps: false },
);

// Index for faster queries by userId
TripSchema.index({ userId: 1, createdAt: -1 });

export const Trip: Model<ITrip> =
  mongoose.models.Trip || mongoose.model<ITrip>("Trip", TripSchema);
