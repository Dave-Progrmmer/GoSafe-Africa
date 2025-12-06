import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

export const saveFileLocally = async (buffer: Buffer, filename: string): Promise<string> => {
  const uniqueName = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}-${filename}`;
  const filepath = path.join(UPLOAD_DIR, uniqueName);
  
  fs.writeFileSync(filepath, buffer);
  
  return `/uploads/${uniqueName}`;
};

export const deleteFile = async (filepath: string): Promise<void> => {
  const fullPath = path.join(UPLOAD_DIR, path.basename(filepath));
  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
  }
};
