import mongoose, { Document, Model, Schema } from "mongoose";

export interface IUser extends Document {
  email: string;
  password: string;
  displayName: string;
  provider: "credentials" | "google" | "github";
  providerId?: string;
  avatar?: string;
  emailVerified?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,10})+$/,
        "Please provide valid email",
      ],
    },
    password: {
      type: String,
      required: function () {
        return this.provider === "credentials";
      },
      minlength: 8,
      select: false,
    },
    displayName: {
      type: String,
      required: true,
      trim: true,
    },
    provider: {
      type: String,
      enum: ["credentials", "google", "github"],
      default: "credentials",
    },
    providerId: {
      type: String,
      sparse: true,
      unique: true,
    },
    avatar: {
      type: String,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

// Hash password before saving (handled by auth service, not here)
UserSchema.index({ email: 1 });
UserSchema.index({ providerId: 1, provider: 1 });

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
