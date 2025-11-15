# NWA Jumpers - Deployment Guide

This guide will help you deploy the NWA Jumpers booking system to production.

## 🎯 Pre-Deployment Checklist

### ✅ Completed
- [x] Environment variable system for API URLs
- [x] CORS configuration for production
- [x] Centralized API configuration
- [x] Production build scripts

### 📋 Before Deploying

1. **Test locally first**
   ```bash
   # Backend
   cd node-api
   npm run build
   npm start
   
   # Frontend (in another terminal)
   cd frontend
   npm run build
   npm run preview
   ```

2. **Environment Variables**
   - Create `.env` files from `.env.example` in both `frontend/` and `node-api/`
   - Update with production URLs before deploying

## 🚀 Deployment Options

### Option 1: Railway (Recommended for Full-Stack)

**Why Railway?**
- Easy deployment for both frontend and backend
- SQLite works out of the box
- Automatic HTTPS
- Free tier available

**Steps:**

1. **Deploy Backend:**
   ```bash
   cd node-api
   # Install Railway CLI
   npm i -g @railway/cli
   
   # Login and initialize
   railway login
   railway init
   
   # Set environment variables
   railway variables set FRONTEND_URL=https://your-frontend.railway.app
   railway variables set PORT=3001
   railway variables set NODE_ENV=production
   
   # Deploy
   railway up
   ```

2. **Deploy Frontend:**
   ```bash
   cd frontend
   railway init
   
   # Set environment variable (use your backend Railway URL)
   railway variables set VITE_API_BASE_URL=https://your-backend.railway.app/api
   
   # Deploy
   railway up
   ```

### Option 2: Vercel (Frontend) + Railway (Backend)

**Frontend on Vercel:**

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Deploy:
   ```bash
   cd frontend
   vercel
   ```

3. Set environment variable in Vercel dashboard:
   - `VITE_API_BASE_URL` = your backend URL

**Backend on Railway:** (Follow Option 1 backend steps)

### Option 3: Render (Alternative)

**Backend:**
1. Create new Web Service on Render
2. Connect your GitHub repo
3. Set:
   - Build Command: `cd node-api && npm install && npm run build`
   - Start Command: `cd node-api && npm start`
   - Environment Variables:
     - `FRONTEND_URL` = your frontend URL
     - `NODE_ENV` = production

**Frontend:**
1. Create new Static Site on Render
2. Connect your GitHub repo
3. Set:
   - Build Command: `cd frontend && npm install && npm run build`
   - Publish Directory: `frontend/dist`
   - Environment Variable:
     - `VITE_API_BASE_URL` = your backend URL

## 📝 Environment Variables Reference

### Frontend (`.env`)
```env
VITE_API_BASE_URL=https://your-api-domain.com/api
```

### Backend (`.env`)
```env
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://your-frontend-domain.com
```

## 🔧 Production Build Commands

### Backend
```bash
cd node-api
npm run build    # Compiles TypeScript to dist/
npm start        # Runs production server
```

### Frontend
```bash
cd frontend
npm run build    # Creates optimized build in dist/
npm run preview  # Test production build locally
```

## 🗄️ Database Considerations

**Current Setup:** SQLite (file-based database)

**For Production:**
- SQLite works for MVP, but has limitations:
  - File-based (can be lost if server restarts)
  - Limited concurrent writes
  - Not ideal for scaling

**Future Migration Options:**
- PostgreSQL (recommended)
- MySQL
- MongoDB

**For now:** SQLite is fine for MVP deployment. The database file (`bookings.db`) will be created automatically on first run.

## 🔒 Security Notes

1. **CORS:** Already configured to allow your frontend domain
2. **Environment Variables:** Never commit `.env` files (already in `.gitignore`)
3. **API Keys:** If you add payment processing later, use environment variables
4. **HTTPS:** Most hosting platforms provide HTTPS automatically

## 🧪 Testing After Deployment

1. **Health Check:**
   - Visit: `https://your-api-domain.com/api/health`
   - Should return: `{"status":"ok","message":"NWA Jumpers API is running"}`

2. **Frontend:**
   - Visit your frontend URL
   - Try creating a booking
   - Check admin dashboard

3. **API Endpoints:**
   - Test booking creation
   - Test availability checks
   - Test PDF generation

## 🐛 Troubleshooting

### CORS Errors
- Make sure `FRONTEND_URL` in backend matches your actual frontend domain
- Check for trailing slashes (should be none)

### API Not Found
- Verify `VITE_API_BASE_URL` includes `/api` at the end
- Check that backend is running and accessible

### Database Issues
- SQLite file is created automatically
- Make sure the server has write permissions in the `node-api` directory

## 📊 Monitoring

Consider adding:
- Error tracking (Sentry, LogRocket)
- Analytics (Google Analytics, Plausible)
- Uptime monitoring (UptimeRobot, Pingdom)

## 🎉 Post-Deployment

Once deployed:
1. Update README with live demo links
2. Add screenshots to README
3. Update your resume/portfolio
4. Share on LinkedIn/Twitter

## 📚 Additional Resources

- [Railway Docs](https://docs.railway.app/)
- [Vercel Docs](https://vercel.com/docs)
- [Render Docs](https://render.com/docs)

