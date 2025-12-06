import mongoose, { Schema, Document } from 'mongoose';

export interface IDevice {
  deviceId: string;
  fcmToken?: string;
  apnsToken?: string;
  platform: 'ios' | 'android';
}

export interface IUser extends Document {
  phone: string;
  phoneVerified: boolean;
  otpHash?: string;
  otpExpiry?: Date;
  profile: {
    name?: string;
    avatar?: string;
  };
  role: 'user' | 'admin';
  credibilityScore: number;
  devices: IDevice[];
  banned: boolean;
  bannedReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const DeviceSchema = new Schema<IDevice>({
  deviceId: { type: String, required: true },
  fcmToken: String,
  apnsToken: String,
  platform: { type: String, enum: ['ios', 'android'], required: true }
});

const UserSchema = new Schema<IUser>(
  {
    phone: {
      type: String,
      required: true,
      unique: true
      // Removed phone validation - now used for email
    },
    phoneVerified: { type: Boolean, default: false },
    otpHash: String,
    otpExpiry: Date,
    profile: {
      name: String,
      avatar: String
    },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    credibilityScore: { type: Number, default: 50, min: 0, max: 100 },
    devices: [DeviceSchema],
    banned: { type: Boolean, default: false },
    bannedReason: String
  },
  { timestamps: true }
);

// Indexes
UserSchema.index({ phone: 1 });
UserSchema.index({ credibilityScore: -1 });

export const User = mongoose.model<IUser>('User', UserSchema);
