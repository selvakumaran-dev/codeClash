# 🚀 Split Deployment - Frontend (Static) + Backend (Web Service)

## Overview

Deploy CodeClash as TWO separate Render services:
1. **Static Site** - React frontend (fast, free, no build issues)
2. **Web Service** - Node.js backend (API + WebSocket)

---

## 📦 PART 1: Deploy Backend (Web Service)

### Step 1: Create Web Service for Backend

1. Go to https://dashboard.render.com/
2. Click **"New +"** → **"Web Service"**
3. Connect your **CodeClash** repository

### Step 2: Configure Backend Service

| Setting | Value |
|---------|-------|
| **Name** | `codeclash-backend` |
| **Root Directory** | `server` ⚠️ IMPORTANT |
| **Runtime** | Node |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Instance Type** | Free |

### Step 3: Add Environment Variables

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `CORS_ORIGIN` | `*` (we'll update this later) |
| `PISTON_API_URL` | `https://emkc.org/api/v2/piston` |

### Step 4: Deploy Backend

1. Click **"Create Web Service"**
2. Wait for deployment (~2 minutes)
3. **Copy your backend URL**: `https://codeclash-backend-xxxx.onrender.com`

---

## 🎨 PART 2: Deploy Frontend (Static Site)

### Step 1: Create Static Site

1. Go back to Render Dashboard
2. Click **"New +"** → **"Static Site"**
3. Connect the **same CodeClash repository**

### Step 2: Configure Frontend

| Setting | Value |
|---------|-------|
| **Name** | `codeclash-frontend` |
| **Root Directory** | *(leave empty)* |
| **Build Command** | `npm install && npm run build` |
| **Publish Directory** | `dist` |

### Step 3: Add Environment Variable

Click **"Advanced"** → Add:

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://codeclash-backend-xxxx.onrender.com` |

⚠️ **Replace with YOUR actual backend URL from Part 1**

### Step 4: Deploy Frontend

1. Click **"Create Static Site"**
2. Wait for build (~2 minutes)
3. Your frontend will be live at: `https://codeclash-frontend.onrender.com`

---

## 🔧 PART 3: Connect Frontend to Backend

Now we need to update the frontend code to use the backend URL.

### Update Socket Connection

I'll create the necessary code changes for you...

---

## 📊 Final Architecture

```
┌─────────────────────────────┐
│   Static Site (Frontend)    │
│  codeclash-frontend.onrender│
│                             │
│  • React App                │
│  • Served by Render CDN     │
│  • Fast & Free              │
└──────────────┬──────────────┘
               │
               │ API Calls
               │ WebSocket
               ▼
┌─────────────────────────────┐
│   Web Service (Backend)     │
│  codeclash-backend.onrender │
│                             │
│  • Node.js + Express        │
│  • Socket.IO                │
│  • API Routes               │
│  • Piston Integration       │
└─────────────────────────────┘
```

---

## ✅ Advantages

✅ **No Build Issues** - Static site builds frontend separately
✅ **Faster Deploys** - Each service deploys independently  
✅ **Better Performance** - Frontend served by CDN
✅ **Easier Debugging** - Separate logs for frontend/backend
✅ **Free Tier** - Both can run on free tier

---

## 🎯 Next Steps

1. Deploy backend first (Part 1)
2. Copy backend URL
3. Deploy frontend (Part 2) with backend URL
4. I'll help you update the code to connect them

**Ready to start?** Let me know when you've deployed the backend and I'll help with the frontend configuration!
