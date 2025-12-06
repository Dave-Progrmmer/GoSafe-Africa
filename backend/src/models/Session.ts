import mongoose, { Schema, Document } from 'mongoose';

export interface ISession extends Document {
  userId: mongoose.Types.ObjectId;
  refreshToken: string;
  deviceId: string;
  expiresAt: Date;
  createdAt: Date;
}

const SessionSchema = new Schema<ISession>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    refreshToken: { type: String, required: true, unique: true },
    deviceId: { type: String, required: true },
    expiresAt: { type: Date, required: true, index: { expires: 0 } } // TTL index
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// Indexes
SessionSchema.index({ userId: 1, deviceId: 1 });
SessionSchema.index({ refreshToken: 1 });

export const Session = mongoose.model<ISession>('Session', SessionSchema);
