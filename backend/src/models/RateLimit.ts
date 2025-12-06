import mongoose, { Schema } from 'mongoose';

export interface IRateLimit {
  _id: string; // composite key like "userId:endpoint"
  count: number;
  resetAt: Date;
}

const RateLimitSchema = new Schema<IRateLimit>(
  {
    _id: { type: String, required: true }, // e.g., "507f1f77bcf86cd799439011:POST:/api/v1/reports"
    count: { type: Number, default: 0 },
    resetAt: { type: Date, required: true, index: { expires: 0 } } // TTL index
  },
  { _id: false, timestamps: false }
);

export const RateLimit = mongoose.model<IRateLimit>('RateLimit', RateLimitSchema);
