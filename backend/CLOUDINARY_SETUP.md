# Cloudinary Setup Guide (100% Free)

## 🎯 Get Free Cloudinary Account

### Step 1: Sign Up
1. Go to https://cloudinary.com/users/register/free
2. Sign up with email (no credit card required)
3. Verify email

### Step 2: Get Credentials
1. Go to https://cloudinary.com/console
2. You'll see your **Dashboard** with:
   - **Cloud Name**: `your_cloud_name`
   - **API Key**: `123456789012345`
   - **API Secret**: `abcdefghijklmnopqrstuvwxyz123`

### Step 3: Update Backend `.env`
```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz123
```

### Step 4: Restart Server
```bash
# Ctrl+C to stop, then:
npm run dev
```

---

## 📊 Free Tier Limits
- ✅ **25 GB** storage
- ✅ **25 GB** bandwidth per month
- ✅ **25,000** transformations per month
- ✅ Unlimited images
- ✅ Auto image optimization
- ✅ CDN delivery worldwide

Perfect for MVP and small apps! 🚀

---

## ✨ What You Get

### Automatic Optimizations
- Images auto-compressed for web
- Responsive sizing
- Fast CDN delivery
- Format conversion (WebP, AVIF)

### Features
- Direct upload from mobile
- Image transformations
- Thumbnail generation
- Secure HTTPS URLs

---

## 🧪 Test It

After configuration, test with:

```bash
curl -X POST http://localhost:3000/api/v1/reports \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "pothole",
    "location": {"coordinates": [3.3792, 6.5244]},
    "description": "Test with photo",
    "severity": 2,
    "photos": ["data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD..."]
  }'
```

The photo will upload to Cloudinary and return a URL like:
`https://res.cloudinary.com/your_cloud_name/image/upload/gosafe-reports/12345-photo.jpg`

---

## 🔄 Fallback Behavior

**Smart Upload Logic:**
- ✅ If Cloudinary configured → Upload to cloud
- ✅ If not configured → Save locally (development)

This means:
- **Local dev**: Works without Cloudinary
- **Production**: Must configure Cloudinary for Vercel

---

## 🚀 For Vercel Deployment

Add to Vercel environment variables:
```
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz123
```

Done! Your images will now upload to Cloudinary on Vercel. 🎉
