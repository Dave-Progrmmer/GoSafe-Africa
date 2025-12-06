import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLog extends Document {
  userId?: mongoose.Types.ObjectId;
  action: string;
  resource: string;
  metadata: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    action: { type: String, required: true },
    resource: { type: String, required: true },
    metadata: { type: Schema.Types.Mixed, default: {} },
    ipAddress: { type: String, required: true },
    userAgent: { type: String, required: true }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// Indexes
AuditLogSchema.index({ userId: 1, createdAt: -1 });
AuditLogSchema.index({ action: 1, createdAt: -1 });

// TTL index - remove logs older than 90 days
AuditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
