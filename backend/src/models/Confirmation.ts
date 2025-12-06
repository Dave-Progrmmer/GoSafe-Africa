import mongoose, { Schema, Document } from 'mongoose';

export interface IConfirmation extends Document {
  reportId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  action: 'confirm' | 'deny';
  createdAt: Date;
}

const ConfirmationSchema = new Schema<IConfirmation>(
  {
    reportId: { type: Schema.Types.ObjectId, ref: 'Report', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, enum: ['confirm', 'deny'], required: true }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// Compound unique index to prevent duplicate confirmations
ConfirmationSchema.index({ reportId: 1, userId: 1 }, { unique: true });

export const Confirmation = mongoose.model<IConfirmation>('Confirmation', ConfirmationSchema);
