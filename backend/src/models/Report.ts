import mongoose, { Schema, Document } from 'mongoose';

export type ReportType = 'pothole' | 'accident' | 'roadblock' | 'police' | 'flood' | 'construction';
export type ReportStatus = 'pending' | 'verified' | 'rejected' | 'expired';

export interface IReport extends Document {
  userId: mongoose.Types.ObjectId;
  type: ReportType;
  location: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat]
  };
  description: string;
  photos: string[];
  severity: 1 | 2 | 3;
  status: ReportStatus;
  confirmations: number;
  denials: number;
  credibilityScore: number;
  clusterId?: mongoose.Types.ObjectId;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ReportSchema = new Schema<IReport>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: ['pothole', 'accident', 'roadblock', 'police', 'flood', 'construction'],
      required: true
    },
    location: {
      type: { type: String, enum: ['Point'], required: true },
      coordinates: {
        type: [Number],
        required: true,
        validate: {
          validator: (v: number[]) => v.length === 2,
          message: 'Coordinates must be [longitude, latitude]'
        }
      }
    },
    description: { type: String, required: true, maxlength: 500 },
    photos: [{ type: String }],
    severity: { type: Number, enum: [1, 2, 3], required: true },
    status: {
      type: String,
      enum: ['pending', 'verified', 'rejected', 'expired'],
      default: 'pending'
    },
    confirmations: { type: Number, default: 0 },
    denials: { type: Number, default: 0 },
    credibilityScore: { type: Number, default: 0 },
    clusterId: { type: Schema.Types.ObjectId, ref: 'ReportCluster' },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    }
  },
  { timestamps: true }
);

// Geospatial index for location queries
ReportSchema.index({ location: '2dsphere' });
ReportSchema.index({ status: 1, createdAt: -1 });
ReportSchema.index({ userId: 1, createdAt: -1 });
ReportSchema.index({ expiresAt: 1 }); // For TTL cleanup job

export const Report = mongoose.model<IReport>('Report', ReportSchema);
