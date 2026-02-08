# ⚡ QUICK DEPLOY - Copy & Paste Values

## 🔴 BACKEND (Web Service)

**Service Type:** Web Service  
**Repository:** CodeClash

### Settings:
```
Name: codeclash-backend
Root Directory: server
Build Command: npm install
Start Command: npm start
```

### Environment Variables:
```
NODE_ENV=production
CORS_ORIGIN=*
PISTON_API_URL=https://emkc.org/api/v2/piston
```

**After deploy, COPY the URL!** You'll need it for frontend.

---

## 🔵 FRONTEND (Static Site)

**Service Type:** Static Site  
**Repository:** CodeClash (same repo)

### Settings:
```
Name: codeclash-frontend
Root Directory: (leave empty)
Build Command: npm install && npm run build
Publish Directory: dist
```

### Environment Variable:
```
VITE_SOCKET_URL=https://codeclash-backend-xxxx.onrender.com
```
⚠️ Replace `xxxx` with YOUR backend URL!

---

## 🔧 FINAL STEP

After both are deployed:

1. Go to **backend service** → Environment tab
2. Update `CORS_ORIGIN` from `*` to:
   ```
   https://codeclash-frontend.onrender.com
   ```
3. Save (auto-redeploys)

---

## ✅ Done!

Visit: **https://codeclash-frontend.onrender.com**

Your app is LIVE! 🎉
