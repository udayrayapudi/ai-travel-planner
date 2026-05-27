import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISettings extends Document {
  userId: string;
  displayName: string;
  email: string;
  defaultCurrency: string;
  defaultTravelers: number;
  notifications: boolean;
  darkMode: boolean;
  language: string;
}

const SettingsSchema = new Schema<ISettings>(
  {
    userId: { type: String, required: true, unique: true, index: true, default: 'default' },
    displayName: { type: String, default: '' },
    email: { type: String, default: '' },
    defaultCurrency: { type: String, default: 'INR' },
    defaultTravelers: { type: Number, default: 1 },
    notifications: { type: Boolean, default: true },
    darkMode: { type: Boolean, default: true },
    language: { type: String, default: 'en' },
  },
  { timestamps: false }
);

export const Settings: Model<ISettings> =
  mongoose.models.Settings || mongoose.model<ISettings>('Settings', SettingsSchema);
