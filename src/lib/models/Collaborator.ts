import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICollaborator extends Document {
  collabId: string;
  tripId: string;
  name: string;
  email: string;
  role: 'owner' | 'editor' | 'viewer';
  addedAt: string;
}

const CollaboratorSchema = new Schema<ICollaborator>(
  {
    collabId: { type: String, required: true, unique: true, index: true },
    tripId: { type: String, required: true, index: true },
    name: { type: String, default: '' },
    email: { type: String, default: '' },
    role: { type: String, enum: ['owner', 'editor', 'viewer'], default: 'viewer' },
    addedAt: { type: String, default: () => new Date().toISOString() },
  },
  { timestamps: false }
);

export const Collaborator: Model<ICollaborator> =
  mongoose.models.Collaborator || mongoose.model<ICollaborator>('Collaborator', CollaboratorSchema);
