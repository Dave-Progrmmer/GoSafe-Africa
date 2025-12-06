import bcrypt from 'bcrypt';
import crypto from 'crypto';

const SALT_ROUNDS = 12;

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

export const generateOTP = (): string => {
  return crypto.randomInt(100000, 999999).toString();
};

export const hashOTP = async (otp: string): Promise<string> => {
  return bcrypt.hash(otp, SALT_ROUNDS);
};

export const verifyOTP = async (otp: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(otp, hash);
};

export const getOTPExpiry = (minutes: number = 5): Date => {
  return new Date(Date.now() + minutes * 60 * 1000);
};
