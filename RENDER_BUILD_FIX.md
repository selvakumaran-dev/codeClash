# 🚨 CRITICAL FIX - Render Root Directory Issue

## The Problem
Render is using `/opt/render/project/src/` as root instead of `/opt/render/project/`

## ✅ IMMEDIATE FIX

### In Render Dashboard:

1. Go to your service → **Settings**
2. Find **"Root Directory"** field
3. **CRITICAL:** Make sure it shows **nothing** or just a dot `.`
4. If it shows `src` or anything else → **DELETE IT**
5. Save Changes

---

## If That Doesn't Work - Use This Build Command:

Update your **Build Command** to:

```bash
ls -la && npm install && npm run build && cd server && npm install
```

This will:
- Show directory contents (for debugging)
- Install from correct location
- Build frontend
- Install server deps

---

## Nuclear Option - Manual Configuration

If the issue persists, **DELETE the service** and recreate with these EXACT settings:

### Settings:
- **Name:** `codeclash`
- **Root Directory:** **(LEAVE COMPLETELY EMPTY)**
- **Build Command:** 
  ```
  npm install && npm run build && cd server && npm install
  ```
- **Start Command:**
  ```
  cd server && npm start
  ```

### Environment Variables:
- `NODE_ENV` = `production`
- `CORS_ORIGIN` = `*`
- `PISTON_API_URL` = `https://emkc.org/api/v2/piston`

---

## Why This Happens

Render auto-detects directories. Since you have a `src/` folder, it might think that's the root. The fix is to **explicitly tell Render to use the repository root**.

---

## Verification

After fixing, the build log should show:
```
==> Cloning from https://github.com/...
==> Running build command: npm install...
==> Installing dependencies from /opt/render/project/package.json
✓ Build successful
```

NOT:
```
==> Installing from /opt/render/project/src/package.json  ❌ WRONG
```
