# Vercel Deployment Troubleshooting

## 🔴 Current Issue: 500 Internal Server Error

Your deployment is live but crashing. Common causes:

### 1. MongoDB Connection Not Configured ⚠️
**Most Likely Cause**

**Fix:**
1. Go to https://vercel.com/dashboard
2. Select your project `gosafe-one`
3. Settings → Environment Variables
4. Add these variables:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/gosafe
JWT_SECRET=your_super_secret_jwt_key_min_32_characters_long
NODE_ENV=production
CLOUDINARY_CLOUD_NAME=your_cloud_name (optional)
CLOUDINARY_API_KEY=your_api_key (optional)
CLOUDINARY_API_SECRET=your_api_secret (optional)
```

5. Redeploy: Deployments → ... → Redeploy

### 2. MongoDB Atlas Not Configured

If you don't have MongoDB Atlas:

1. Go to https://mongodb.com/cloud/atlas
2. Create **FREE** account
3. Create **FREE** cluster (M0 - 512MB)
4. Create database user
5. Whitelist all IPs: `0.0.0.0/0` (for serverless)
6. Get connection string
7. Add to Vercel environment variables

### 3. Check Vercel Logs

To see exact error:
1. Go to Vercel Dashboard
2. Your project → Deployments
3. Click latest deployment
4. Click "Runtime Logs"
5. Look for error messages

---

## ✅ Quick Fix Checklist

- [ ] MongoDB URI added to Vercel env vars
- [ ] JWT_SECRET added to Vercel env vars
- [ ] MongoDB Atlas IP whitelist includes `0.0.0.0/0`
- [ ] Redeployed after adding env vars
- [ ] Checked Runtime Logs for errors

---

## 🧪 Test Endpoints After Fix

```bash
# Health check
curl https://gosafe-one.vercel.app/health

# Register
curl -X POST https://gosafe-one.vercel.app/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","name":"Test"}'

# Get reports
curl https://gosafe-one.vercel.app/api/v1/reports
```

---

## 🆘 Still Not Working?

Share the Vercel Runtime Logs and I'll help debug!
