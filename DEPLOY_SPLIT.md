# 🚀 DEPLOY NOW - Split Deployment (EASIEST METHOD)

## Why Split Deployment?
- ✅ **No build errors** - Frontend builds separately
- ✅ **Faster** - Each service deploys independently
- ✅ **Free** - Both services on free tier
- ✅ **Simple** - No complex configuration

---

## 🎯 STEP 1: Deploy Backend (5 minutes)

### 1.1 Create Web Service
1. Go to: https://dashboard.render.com/
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Select **CodeClash**

### 1.2 Configure Backend
Fill in EXACTLY:

| Field | Value |
|-------|-------|
| **Name** | `codeclash-backend` |
| **Root Directory** | `server` ⚠️ |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |

### 1.3 Add Environment Variables
Click "Advanced" → Add these:

- `NODE_ENV` = `production`
- `CORS_ORIGIN` = `*`
- `PISTON_API_URL` = `https://emkc.org/api/v2/piston`

### 1.4 Deploy
1. Click **"Create Web Service"**
2. Wait 2-3 minutes
3. **COPY YOUR BACKEND URL**: `https://codeclash-backend-xxxx.onrender.com`

✅ Backend is now live!

---

## 🎨 STEP 2: Deploy Frontend (5 minutes)

### 2.1 Create Static Site
1. Go back to Render Dashboard
2. Click **"New +"** → **"Static Site"**
3. Connect **same repository** (CodeClash)

### 2.2 Configure Frontend
Fill in EXACTLY:

| Field | Value |
|-------|-------|
| **Name** | `codeclash-frontend` |
| **Root Directory** | *(leave empty)* |
| **Build Command** | `npm install && npm run build` |
| **Publish Directory** | `dist` |

### 2.3 Add Environment Variable
Click "Advanced" → Add:

- Key: `VITE_SOCKET_URL`
- Value: `https://codeclash-backend-xxxx.onrender.com`

⚠️ **Use YOUR backend URL from Step 1.4!**

### 2.4 Deploy
1. Click **"Create Static Site"**
2. Wait 2-3 minutes
3. Your app is live at: `https://codeclash-frontend.onrender.com`

✅ Frontend is now live!

---

## 🔧 STEP 3: Update CORS (2 minutes)

Now connect frontend to backend:

1. Go to your **backend service** (codeclash-backend)
2. Click **"Environment"** tab
3. Find `CORS_ORIGIN`
4. Click "Edit"
5. Change from `*` to: `https://codeclash-frontend.onrender.com`
6. Save (triggers redeploy)

✅ Services are now connected!

---

## 🎉 DONE!

Your app is live at:
**https://codeclash-frontend.onrender.com**

### Test It:
1. Visit your frontend URL
2. Click "Enter the Arena"
3. Create a room
4. Test code execution
5. Everything should work!

---

## 📊 Your Architecture

```
Frontend (Static Site)          Backend (Web Service)
codeclash-frontend.onrender  →  codeclash-backend.onrender
     ↓                                  ↓
  React App                      Node.js + Socket.IO
  Vite Build                     Express API
  CDN Served                     Piston Integration
```

---

## 🐛 Troubleshooting

### Frontend can't connect to backend
- Check `VITE_SOCKET_URL` has correct backend URL
- Check `CORS_ORIGIN` in backend matches frontend URL
- No trailing slashes in URLs!

### Backend not responding
- Check backend logs in Render dashboard
- Verify environment variables are set
- Free tier spins down after 15 min (takes 30s to wake)

---

## 💰 Cost
**$0/month** - Both services on free tier!

---

**Ready to deploy?** Follow the 3 steps above! 🚀
