# 🚀 Deploying CodeClash to Render

This guide will walk you through deploying CodeClash to Render, a modern cloud platform with free tier support.

## 📋 Prerequisites

- A [Render account](https://render.com) (free tier available)
- Your CodeClash code pushed to a Git repository (GitHub, GitLab, or Bitbucket)

## 🎯 Deployment Steps

### 1. Prepare Your Repository

Make sure your code is pushed to GitHub/GitLab/Bitbucket:

```bash
git add .
git commit -m "Prepare for Render deployment"
git push origin main
```

### 2. Create a New Web Service on Render

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Web Service"**
3. Connect your Git repository
4. Select the CodeClash repository

### 3. Configure Build Settings

Fill in the following settings:

| Setting | Value |
|---------|-------|
| **Name** | `codeclash` (or your preferred name) |
| **Region** | Choose closest to your users |
| **Branch** | `main` (or your default branch) |
| **Root Directory** | Leave empty |
| **Runtime** | `Node` |
| **Build Command** | `npm install && npm run build && cd server && npm install` |
| **Start Command** | `cd server && npm start` |
| **Instance Type** | `Free` (or paid for better performance) |

### 4. Set Environment Variables

Click **"Advanced"** → **"Add Environment Variable"** and add:

| Key | Value | Notes |
|-----|-------|-------|
| `NODE_ENV` | `production` | Required |
| `PORT` | `3001` | Render will override this automatically |
| `CORS_ORIGIN` | `*` | Or your specific domain after deployment |
| `PISTON_API_URL` | `https://emkc.org/api/v2/piston` | Free code execution API |

**Important:** After your first deployment, update `CORS_ORIGIN` to your actual Render URL (e.g., `https://codeclash.onrender.com`)

### 5. Deploy!

1. Click **"Create Web Service"**
2. Render will automatically:
   - Clone your repository
   - Install dependencies
   - Build your frontend
   - Start your server
3. Wait for the build to complete (usually 2-5 minutes)

### 6. Access Your Application

Once deployed, Render will provide you with a URL like:
```
https://codeclash.onrender.com
```

Visit this URL to see your live application! 🎉

## 🔧 Post-Deployment Configuration

### Update CORS Settings

After your first deployment, update the environment variable:

1. Go to your service in Render Dashboard
2. Click **"Environment"** tab
3. Update `CORS_ORIGIN` to your actual URL:
   ```
   https://your-app-name.onrender.com
   ```
4. Save changes (this will trigger a redeploy)

### Custom Domain (Optional)

To use a custom domain:

1. Go to **"Settings"** → **"Custom Domain"**
2. Add your domain (e.g., `codeclash.yourdomain.com`)
3. Update DNS records as instructed by Render
4. Update `CORS_ORIGIN` environment variable to match your custom domain

## 📊 Monitoring & Logs

### View Logs

1. Go to your service in Render Dashboard
2. Click **"Logs"** tab
3. View real-time logs and debug issues

### Health Checks

Render automatically monitors your service. You can also check:

- **Health Endpoint**: `https://your-app.onrender.com/api/health`
- **Rooms API**: `https://your-app.onrender.com/api/rooms`

## ⚡ Performance Optimization

### Free Tier Limitations

- **Spin Down**: Free tier services spin down after 15 minutes of inactivity
- **Spin Up**: Takes ~30 seconds to wake up on first request
- **Solution**: Upgrade to paid tier for 24/7 uptime

### Recommended Upgrades

For production use, consider:

- **Starter Plan** ($7/month): No spin down, better performance
- **Standard Plan** ($25/month): More resources, faster builds

## 🔄 Continuous Deployment

Render automatically redeploys when you push to your connected branch:

```bash
git add .
git commit -m "Update feature"
git push origin main
```

Render will detect the push and redeploy automatically!

## 🐛 Troubleshooting

### Build Fails

**Error**: `npm install` fails
- **Solution**: Check `package.json` for syntax errors
- **Solution**: Ensure all dependencies are listed correctly

**Error**: `vite build` fails
- **Solution**: Check for TypeScript/ESLint errors locally first
- **Solution**: Run `npm run build` locally to reproduce

### Application Won't Start

**Error**: "Application failed to respond"
- **Solution**: Check logs for errors
- **Solution**: Verify `PORT` environment variable is set
- **Solution**: Ensure server listens on `process.env.PORT`

### CORS Errors

**Error**: "CORS policy blocked"
- **Solution**: Update `CORS_ORIGIN` environment variable
- **Solution**: Set to `*` temporarily for testing
- **Solution**: Use exact URL (no trailing slash)

### WebSocket Connection Fails

**Error**: Socket.IO connection refused
- **Solution**: Ensure frontend connects to correct backend URL
- **Solution**: Check that Socket.IO CORS settings match
- **Solution**: Verify Render service is running (check logs)

## 📝 Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NODE_ENV` | ✅ | `development` | Set to `production` |
| `PORT` | ✅ | `3001` | Server port (Render sets automatically) |
| `CORS_ORIGIN` | ✅ | `*` | Allowed origin for CORS |
| `PISTON_API_URL` | ✅ | `https://emkc.org/api/v2/piston` | Code execution API |

## 🎯 Quick Deployment Checklist

- [ ] Code pushed to Git repository
- [ ] Render account created
- [ ] Web Service created and configured
- [ ] Environment variables set
- [ ] Build completed successfully
- [ ] Application accessible via Render URL
- [ ] CORS_ORIGIN updated to production URL
- [ ] WebSocket connections working
- [ ] Code execution working (test a battle)
- [ ] Custom domain configured (optional)

## 🆘 Need Help?

- **Render Docs**: https://render.com/docs
- **Render Community**: https://community.render.com
- **CodeClash Issues**: Check your repository's Issues tab

## 🎉 Success!

Your CodeClash application is now live and accessible to users worldwide! Share your URL and start battling! 🥊💻
