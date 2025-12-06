import mongoose, { Schema, Document } from 'mongoose';

export interface ITilePack extends Document {
  name: string;
  region: string;
  version: number;
  storageUrl: string;
  sizeBytes: number;
  bbox: [number, number, number, number]; // [minLng, minLat, maxLng, maxLat]
  minZoom: number;
  maxZoom: number;
  requiredTier: 'free' | 'premium';
  createdAt: Date;
}

const TilePackSchema = new Schema<ITilePack>(
  {
    name: { type: String, required: true },
    region: { type: String, required: true, unique: true },
    version: { type: Number, required: true, default: 1 },
    storageUrl: { type: String, required: true }, // S3 key or URL
    sizeBytes: { type: Number, required: true },
    bbox: {
      type: [Number],
      required: true,
      validate: {
        validator: (v: number[]) => v.length === 4,
        message: 'BBox must be [minLng, minLat, maxLng, maxLat]'
      }
    },
    minZoom: { type: Number, required: true, min: 0, max: 22 },
    maxZoom: { type: Number, required: true, min: 0, max: 22 },
    requiredTier: { type: String, enum: ['free', 'premium'], default: 'free' }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// Indexes
TilePackSchema.index({ region: 1, version: -1 });

export const TilePack = mongoose.model<ITilePack>('TilePack', TilePackSchema);
