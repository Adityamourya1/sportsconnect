# SportsConnect Deployment Guide

Deploy your app so anyone can access it from anywhere. Here are your best options:

---

## **Option 1: EASIEST - Railway.app (Recommended)**

**Pros:** Free tier available, automatic deployments from Git, handles databases easily, production-ready
**Time:** ~15 minutes

### Steps:

1. **Push code to GitHub** (already done ✓)

2. **Create Railway account**
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub
   - Authorize Railway to access your repos

3. **Create Project**
   - Click "New Project" → "Deploy from GitHub repo"
   - Select `sportsconnect` repo
   - Railway auto-detects your services

4. **Add MongoDB**
   - In Railway dashboard → "Add" → "Add from Marketplace"
   - Select "MongoDB"
   - It auto-connects to your backend

5. **Add Redis**
   - Click "Add" → "Add from Marketplace" → "Redis"
   - Railway links it automatically

6. **Set Environment Variables**
   - Go to Backend service settings
   - Add variables from `backend/.env.example`:
     ```
     MONGODB_URL=provided by Railway
     REDIS_URL=provided by Railway
     SECRET_KEY=your-secret-key-here
     ```

7. **Frontend Build**
   - Railway auto-builds from `npm run build`
   - Add to Frontend service:
     ```
     VITE_API_URL=https://your-backend-url.railway.app
     ```

8. **Deploy**
   - Push to main branch → Railway auto-deploys
   - Get public URL from Railway dashboard

**Cost:** Free tier ($5/month for added services), then pay-as-you-go (~$20-30/month for small app)

---

## **Option 2: Render.com**

**Pros:** Very beginner-friendly, free tier for static sites, clear pricing
**Time:** ~20 minutes

### Steps:

1. **Create Render account**
   - Go to [render.com](https://render.com)
   - Connect GitHub

2. **Deploy Backend**
   - New service → GitHub repo → Python
   - Build command: `pip install -r backend/requirements.txt`
   - Start command: `cd backend && uvicorn main:app --host 0.0.0.0`
   - Add environment variables

3. **Deploy MongoDB**
   - External database (MongoDB Atlas) - free tier at [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)
   - Create cluster → get connection string
   - Add to backend env vars

4. **Deploy Frontend**
   - New static site from GitHub
   - Root directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `dist`

**Cost:** Free for static frontend, ~$10-15/month for backend

---

## **Option 3: Docker + Cloud Hosting (More Control)**

**Pros:** Full control, works with any cloud provider, scalable
**Time:** ~30 minutes

### Providers:
- **DigitalOcean App Platform** - $12/month starter
- **AWS Lightsail** - ~$5-20/month
- **Google Cloud Run** - Pay per request (very cheap)
- **Fly.io** - $6/month generous free tier

### Basic Steps (DigitalOcean):

1. **Prepare Docker files**
   - Your `docker-compose.yml` is ready
   - Need `Dockerfile` for frontend (if not exists)

2. **Create DigitalOcean App**
   - Connect GitHub repo
   - Upload docker-compose.yml
   - DigitalOcean deploys all services

3. **Configure Database**
   - Use DigitalOcean Managed MongoDB
   - Or use MongoDB Atlas (free tier)

4. **Access and Update DNS**
   - Get public URL from DigitalOcean
   - Point domain if you have one

**Cost:** ~$12-20/month

---

## **Option 4: Quick & Free - ngrok (Testing Only)**

**Pros:** Instant public URL without hosting cost
**Cons:** URL changes if you restart, slow, for testing only
**Time:** ~5 minutes

### Steps:

1. **Install ngrok**
   ```powershell
   # Download from ngrok.com
   # Or: choco install ngrok (if using Chocolatey)
   ```

2. **Start ngrok tunnel**
   ```powershell
   ngrok http 3000  # Frontend
   ```
   Share the URL: `https://xxxxx.ngrok.io`

3. **Update backend URL in frontend**
   ```javascript
   // src/services/apiClient.js
   const API_URL = "https://your-ngrok-backend.ngrok.io"
   ```

4. **Run backend**
   ```powershell
   cd backend
   python -m uvicorn main:app --reload
   ```

**Cost:** Free (1 URL limit) or $15/month for premium

---

## **Option 5: Your Home Computer (Not Recommended for Production)**

**Pros:** Free, full control
**Cons:** Requires port forwarding, unstable, security risks, ISP may block

### Only if hosting from home:

1. **Port Forward**
   - Router settings → forward ports 80/443 to your PC
   - Find your home IP: [whatismyipaddress.com](https://whatismyipaddress.com)

2. **Use Domain**
   - Get free domain: [noip.com](https://noip.com)
   - Point to your home IP
   - Keep updater running if IP changes

3. **HTTPS Certificate**
   - Use Let's Encrypt (free)
   - Or use ngrok above

**This is NOT production-ready and NOT recommended**

---

## **RECOMMENDED DEPLOYMENT FLOW**

### For Testing & Development:
```
ngrok (Option 4) → Share with friends immediately
```

### For Production (Anyone Globally):
```
Railway (Option 1) OR Render (Option 2)
↓
MongoDB Atlas (free tier database)
↓
Your app is live & accessible
```

### For Maximum Control & Scale:
```
DigitalOcean / AWS (Option 3)
↓
Custom domain + HTTPS
↓
Unlimited scaling
```

---

## **QUICK ACTION PLAN (Recommended)**

### Step 1: Set up MongoDB Atlas (Free)
```
1. Go to mongodb.com/cloud/atlas
2. Create account
3. Create free cluster
4. Get connection string
5. Add to backend environment variables
```

### Step 2: Set up Redis
```
Option A: Railway/Render manage this
Option B: Use upstash.com (free tier Redis)
Option C: Comment out Redis in backend if not critical
```

### Step 3: Deploy to Railway
```
1. Create railway.app account
2. Connect your GitHub repo
3. Add MongoDB Atlas URL to environment
4. Add Redis URL if using Upstash
5. Click Deploy
6. Share the Railway URL with friends
```

### Step 4: Update Frontend
```
1. Add backend URL to environment variables:
   VITE_API_URL=https://your-railway-url.railway.app
2. Rebuild frontend
3. Frontend auto-deploys
```

### Step 5: Share with Friends
```
Send them: https://your-railway-frontend-url.railway.app
```

---

## **Environment Variables Template**

### Backend (.env)
```
MONGODB_URL=mongodb+srv://user:pass@cluster.mongodb.net/mysports
REDIS_URL=redis://default:password@upstash-redis-url:6379
SECRET_KEY=your-super-secret-key-min-32-chars
ENVIRONMENT=production
```

### Frontend (.env)
```
VITE_API_URL=https://your-backend-url.com
```

---

## **Estimated Monthly Costs**

| Option | Cost | Pros |
|--------|------|------|
| Railway | $15-30 | Easiest, most reliable |
| Render | $10-20 | Very beginner-friendly |
| DigitalOcean | $12-20 | Good control |
| AWS | $5-30 | Highly scalable |
| Fly.io | $6-15 | Great for containers |
| **ngrok** | **Free** | Instant (testing only) |

---

## **Next Steps**

1. **Choose a hosting option** (Railway recommended)
2. **Run `npm run build` in frontend/** to ensure it builds
3. **Test backend locally** with correct environment variables
4. **Create accounts** on chosen platform
5. **Deploy and share URL** with friends!

Need help with any specific step? Ask!
