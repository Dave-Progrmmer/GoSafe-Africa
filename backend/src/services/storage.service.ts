import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export const uploadToCloudinary = async (buffer: Buffer, filename: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        folder: 'gosafe-reports',
        resource_type: 'image',
        public_id: `${Date.now()}-${filename.replace(/\.[^/.]+$/, '')}`,
        transformation: [
          { width: 1200, height: 1200, crop: 'limit' },
          { quality: 'auto:good' }
        ]
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result!.secure_url);
        }
      }
    ).end(buffer);
  });
};

export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  await cloudinary.uploader.destroy(publicId);
};

// Fallback to local storage if Cloudinary is not configured
export const saveFileLocally = async (buffer: Buffer, filename: string): Promise<string> => {
  console.warn('Cloudinary not configured, using local storage');
  const fs = require('fs');
  const path = require('path');
  const crypto = require('crypto');
  
  const UPLOAD_DIR = './uploads';
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }
  
  const uniqueName = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}-${filename}`;
  const filepath = path.join(UPLOAD_DIR, uniqueName);
  
  fs.writeFileSync(filepath, buffer);
  return `/uploads/${uniqueName}`;
};

// Smart upload: use Cloudinary if configured, otherwise local
export const uploadPhoto = async (buffer: Buffer, filename: string): Promise<string> => {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  
  if (cloudName && apiKey && apiSecret) {
    return uploadToCloudinary(buffer, filename);
  } else {
    return saveFileLocally(buffer, filename);
  }
};
