# 🚀 Deployment Checklist

Use this checklist to ensure a smooth deployment to Render.

## 📋 Pre-Deployment

### Code Preparation
- [ ] All features tested locally
- [ ] No console errors in browser
- [ ] All power-ups working correctly
- [ ] Mobile responsiveness verified
- [ ] Code execution tested (Piston API)
- [ ] WebSocket connections stable
- [ ] No hardcoded localhost URLs in code

### Repository Setup
- [ ] Code pushed to GitHub/GitLab/Bitbucket
- [ ] `.gitignore` excludes `.env` files
- [ ] `.env.example` included for reference
- [ ] `README.md` updated with deployment info
- [ ] All dependencies in `package.json`
- [ ] Server dependencies in `server/package.json`

### Build Testing
- [ ] `npm run build` succeeds locally
- [ ] `npm run build:all` completes without errors
- [ ] Production build tested with `test-production.ps1` or `.sh`
- [ ] Static files served correctly from `/dist`
- [ ] API routes accessible at `/api/*`

## 🌐 Render Configuration

### Account Setup
- [ ] Render account created
- [ ] Payment method added (even for free tier)
- [ ] Email verified

### Service Creation
- [ ] New Web Service created
- [ ] Repository connected
- [ ] Correct branch selected (usually `main`)
- [ ] Service name chosen (e.g., `codeclash`)
- [ ] Region selected (closest to users)

### Build Settings
- [ ] **Build Command:** `npm install && npm run build && cd server && npm install`
- [ ] **Start Command:** `cd server && npm start`
- [ ] **Root Directory:** (leave empty)
- [ ] **Runtime:** Node
- [ ] **Instance Type:** Free (or paid)

### Environment Variables
- [ ] `NODE_ENV` = `production`
- [ ] `PORT` = `3001` (Render overrides automatically)
- [ ] `CORS_ORIGIN` = `*` (temporary, update after deploy)
- [ ] `PISTON_API_URL` = `https://emkc.org/api/v2/piston`

### Advanced Settings
- [ ] Health Check Path: `/api/health`
- [ ] Auto-Deploy: Enabled
- [ ] Pull Request Previews: Enabled (optional)

## 🚀 Deployment

### Initial Deploy
- [ ] Click "Create Web Service"
- [ ] Monitor build logs for errors
- [ ] Wait for "Live" status (2-5 minutes)
- [ ] Note your Render URL (e.g., `https://codeclash.onrender.com`)

### Post-Deploy Verification
- [ ] Visit Render URL - frontend loads
- [ ] Landing page displays correctly
- [ ] Create room works
- [ ] Join room works
- [ ] Battle arena loads
- [ ] Code editor functional
- [ ] WebSocket connection established
- [ ] Code execution works (submit code)
- [ ] Power-ups unlock after tests pass
- [ ] Sabotages work correctly
- [ ] Spectator mode accessible
- [ ] Health endpoint responds: `/api/health`
- [ ] Rooms API responds: `/api/rooms`

### CORS Update
- [ ] Update `CORS_ORIGIN` to actual Render URL
- [ ] Format: `https://your-app-name.onrender.com` (no trailing slash)
- [ ] Save changes (triggers redeploy)
- [ ] Verify CORS errors resolved

## 🔧 Post-Deployment

### Performance
- [ ] Page load time acceptable
- [ ] WebSocket latency acceptable
- [ ] Code execution response time good
- [ ] No memory leaks (monitor Render metrics)

### Monitoring
- [ ] Check Render logs for errors
- [ ] Monitor health check status
- [ ] Set up uptime monitoring (optional)
- [ ] Configure alerts (optional)

### Documentation
- [ ] Update README with live URL
- [ ] Share deployment URL with team
- [ ] Document any deployment issues
- [ ] Create runbook for common issues

## 🎯 Optional Enhancements

### Custom Domain
- [ ] Domain purchased
- [ ] DNS records configured
- [ ] Custom domain added in Render
- [ ] SSL certificate verified
- [ ] `CORS_ORIGIN` updated to custom domain

### Upgrades
- [ ] Consider paid tier for:
  - [ ] No spin-down (24/7 uptime)
  - [ ] Better performance
  - [ ] More resources
  - [ ] Priority support

### Monitoring Tools
- [ ] Set up error tracking (e.g., Sentry)
- [ ] Add analytics (e.g., Google Analytics)
- [ ] Configure uptime monitoring (e.g., UptimeRobot)
- [ ] Set up performance monitoring

## 🐛 Troubleshooting

### Build Fails
- [ ] Check build logs in Render
- [ ] Verify `package.json` syntax
- [ ] Test build locally first
- [ ] Check for missing dependencies

### App Won't Start
- [ ] Check server logs
- [ ] Verify `PORT` environment variable
- [ ] Ensure server listens on `process.env.PORT`
- [ ] Check for runtime errors

### CORS Errors
- [ ] Verify `CORS_ORIGIN` matches exactly
- [ ] No trailing slash in URL
- [ ] Check Socket.IO CORS settings
- [ ] Try `*` temporarily for debugging

### WebSocket Issues
- [ ] Check Socket.IO connection logs
- [ ] Verify CORS settings
- [ ] Ensure Render service is running
- [ ] Check for firewall issues

## ✅ Final Checks

- [ ] Application fully functional
- [ ] No console errors
- [ ] Mobile responsive
- [ ] All features working
- [ ] Performance acceptable
- [ ] Documentation updated
- [ ] Team notified
- [ ] Deployment documented

## 🎉 Success!

Your CodeClash application is now live! 

**Next Steps:**
1. Share your URL with users
2. Monitor performance and errors
3. Gather user feedback
4. Plan future enhancements
5. Consider upgrading to paid tier

---

**Deployment Date:** _____________

**Render URL:** _____________

**Custom Domain:** _____________

**Deployed By:** _____________

**Notes:** 
_____________________________________________
_____________________________________________
_____________________________________________
