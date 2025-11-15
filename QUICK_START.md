# Quick Start Guide - NWA Jumpers Deployment

## 🚀 Fast Track to Deployment

### Step 1: Prepare Environment Variables

**Frontend** (`frontend/.env`):
```env
VITE_API_BASE_URL=http://localhost:3001/api
```
For production, change to: `https://your-backend-url.com/api`

**Backend** (`node-api/.env`):
```env
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```
For production, change `FRONTEND_URL` to your frontend domain.

### Step 2: Test Production Builds Locally

```bash
# Terminal 1 - Build and run backend
cd node-api
npm run build
npm start

# Terminal 2 - Build and preview frontend
cd frontend
npm run build
npm run preview
```

Visit `http://localhost:4173` (Vite preview port) and test the app.

### Step 3: Deploy (Choose One)

#### Option A: Railway (Easiest - Full Stack)

1. Install Railway CLI: `npm i -g @railway/cli`
2. Login: `railway login`
3. Deploy backend:
   ```bash
   cd node-api
   railway init
   railway variables set FRONTEND_URL=https://your-frontend.railway.app
   railway up
   ```
4. Deploy frontend:
   ```bash
   cd frontend
   railway init
   railway variables set VITE_API_BASE_URL=https://your-backend.railway.app/api
   railway up
   ```

#### Option B: Vercel (Frontend) + Railway (Backend)

**Frontend:**
```bash
cd frontend
npm i -g vercel
vercel
# Set VITE_API_BASE_URL in Vercel dashboard
```

**Backend:** Use Railway (see Option A)

### Step 4: Update Environment Variables in Production

After deployment, update environment variables in your hosting platform's dashboard to point to production URLs.

### Step 5: Test Production

1. Visit your frontend URL
2. Create a test booking
3. Check admin dashboard
4. Test PDF download

## ✅ You're Live!

Your app is now deployed and accessible to the world. Update your README with the live links and share it!

## 📖 Full Documentation

See `DEPLOYMENT.md` for detailed instructions and troubleshooting.

