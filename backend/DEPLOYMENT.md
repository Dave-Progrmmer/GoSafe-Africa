# GoSafe Africa Backend - Vercel Deployment Guide

## 🚀 Deploy to Vercel (Free Tier)

### Step 1: Prepare Your Code
```bash
cd backend
git init
git add .
git commit -m "Initial commit"
```

### Step 2: Push to GitHub
```bash
# Create a new repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/gosafe-backend.git
git push -u origin main
```

### Step 3: Deploy to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub (free)
3. Click **"Add New Project"**
4. Select your `gosafe-backend` repository
5. Vercel will auto-detect it as a Node.js project
6. Click **"Deploy"**

### Step 4: Configure Environment Variables
In Vercel dashboard → Settings → Environment Variables, add:

```env
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_super_secret_jwt_key_min_32_characters
NODE_ENV=production
```

### Step 5: Get MongoDB Atlas (Free)
1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create free account
3. Create free cluster (512MB)
4. Get connection string
5. Add to Vercel environment variables

---

## ⚠️ Important Notes

### File Uploads Won't Work on Vercel
Vercel is **serverless** - it doesn't have persistent storage.

**Solutions:**
1. **Remove photo uploads** (simplest for MVP)
2. **Use Cloudinary** (free tier: 25GB storage)
3. **Use Vercel Blob** (paid)

To disable photo uploads for now:
```typescript
// In report.controller.ts
// Comment out photo handling code
const photoUrls: string[] = []; // Just use empty array
```

### API Endpoint
After deployment, your API will be at:
```
https://your-project-name.vercel.app/api/v1/auth/register
```

---

## 🆓 100% Free Deployment Stack
- ✅ **Vercel**: Free hosting (serverless functions)
- ✅ **MongoDB Atlas**: Free tier (512MB)
- ✅ **GitHub**: Free repository hosting
- ✅ **Custom domain**: Free with Vercel

Total cost: **$0/month** 🎉

---

## Alternative: Traditional Hosting (if you need file uploads)

If you want to keep local file uploads, use these instead:

### Render (Free Tier)
- 512MB RAM
- Sleeps after 15min inactivity
- Supports persistent disk
- Deploy: Connect GitHub repo

### Railway (Free Trial)
- $5 free credit
- Better performance
- Supports file storage

### Fly.io (Free Tier)
- 3 VMs free
- Persistent volumes
- Global CDN

Choose **Vercel** for simplest deployment, **Render** if you need file uploads.
