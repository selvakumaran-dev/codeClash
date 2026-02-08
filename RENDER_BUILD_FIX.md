# 🔧 RENDER BUILD ERROR - QUICK FIX

## The Problem

Render is looking in `/opt/render/project/src/` instead of `/opt/render/project/`

This means the **Root Directory** is incorrectly set to `src`.

---

## ✅ SOLUTION: Fix Root Directory

### In Render Dashboard:

1. Go to your **CodeClash** service
2. Click **"Settings"** tab (left sidebar)
3. Scroll to **"Build & Deploy"** section
4. Find **"Root Directory"**
5. **Make sure it's EMPTY** (or shows `.`)
6. If it says `src`, **DELETE IT** and leave it blank
7. Click **"Save Changes"**
8. Render will automatically trigger a new deploy

---

## Alternative: Manual Redeploy

If the above doesn't work:

1. Go to **"Manual Deploy"** tab
2. Click **"Clear build cache & deploy"**
3. This forces a fresh build from scratch

---

## ✅ Correct Settings

Your settings should be:

| Setting | Value |
|---------|-------|
| **Root Directory** | *(empty)* or `.` |
| **Build Command** | `npm install && npm run build && cd server && npm install` |
| **Start Command** | `cd server && npm start` |

---

## Why This Happened

Render sometimes auto-detects the wrong root directory if it finds a `package.json` in a subdirectory. Make sure the **Root Directory** field is empty so it uses the repository root.

---

## After Fixing

The build should succeed and show:
```
==> Running build command: npm install && npm run build...
✓ 2156 modules transformed.
✓ built in 7.62s
==> Build successful!
```

Then your app will be live! 🎉
