# FREE Deployment Guide - No Credit Card Required

Deploy SportsConnect completely FREE so anyone can access it globally.

---

## **Best FREE Option: Render + MongoDB Atlas + Upstash**

**Total Cost:** $0 / month
**Time:** ~20 minutes
**Limitations:** Fair usage limits, but fine for personal/learning projects

### **Step 1: Free MongoDB Database**

1. Go to [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)
2. Click "Sign up with GitHub" (use your GitHub account)
3. Create a cluster:
   - Organization name: "SportsConnect"
   - Cluster name: "mysports"
   - **Select FREE tier (M0)**
   - Region: closest to you
   - Create cluster

4. Create Database User:
   - Username: `admin`
   - Password: Generate secure password
   - **Save this password!**

5. Get Connection String:
   - Cluster → Connect button
   - "Drivers" → "Python"
   - Copy connection string
   - Replace `<password>` with your password
   - Replace `<database>` with `mysports`
   
   **Example:**
   ```
   mongodb+srv://admin:yourpassword@mysports.xxxxx.mongodb.net/mysports?retryWrites=true&w=majority
   ```

6. **Whitelist All IPs** (for free tier):
   - Network Access → Add IP Address
   - Click "Allow Access from Anywhere" (0.0.0.0/0)
   - Confirm

---

### **Step 2: Free Redis Cache**

1. Go to [upstash.com](https://upstash.com)
2. Sign up with GitHub
3. Create database:
   - Name: "sportsconnect-redis"
   - Select **FREE tier**
   - Region: closest to you
   - Create

4. Copy Redis URL:
   - Details tab → copy the **UPSTASH_REDIS_REST_URL**
   - Format: `redis://default:password@host:port`
   - Actually, use the "Redis CLI" URL provided

---

### **Step 3: Deploy Backend to Render (FREE)**

1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. Create New → Web Service
4. Connect your `sportsconnect` GitHub repo
5. Fill in details:
   - **Name:** sportsconnect-backend
   - **Environment:** Python 3
   - **Build Command:** `pip install -r backend/requirements.txt`
   - **Start Command:** `cd backend && gunicorn main:app --workers 1`
   - **Plan:** Free

6. Add Environment Variables:
   - Click "Advanced" → Environment
   - Add these:
   ```
   MONGODB_URL=mongodb+srv://admin:yourpassword@mysports.xxxxx.mongodb.net/mysports
   REDIS_URL=your-upstash-redis-url
   SECRET_KEY=generate-random-32-char-string
   ENVIRONMENT=production
   ```

7. Create Web Service
   - Render deploys automatically
   - Get public URL: `https://sportsconnect-backend.onrender.com`

**Save this URL!**

---

### **Step 4: Deploy Frontend to Render (FREE)**

1. Create New → Static Site
2. Connect GitHub repo
3. Fill in:
   - **Name:** sportsconnect-frontend
   - **Build Command:** `cd frontend && npm run build`
   - **Publish Directory:** `frontend/dist`

4. Before deploying, set environment variable:
   - Click "Environment"
   - Add: `VITE_API_URL=https://sportsconnect-backend.onrender.com`

5. Deploy
   - Get frontend URL: `https://sportsconnect-frontend.onrender.com`

---

## **ALTERNATIVE: Deploy Backend to Google Cloud Run (FREE)**

Google Cloud Run is completely FREE for small apps (up to 2M requests/month)

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create new project → "sportsconnect"
3. Setup billing (they give $300 free credit, won't charge)
4. Enable Cloud Run API
5. Create service:
   - Deploy container image
   - Select "GitHub repository"
   - Choose your `sportsconnect` repo
   - Source type: Dockerfile
   - Build info:
     - Path: `backend/Dockerfile`
     - Variables: Add MongoDB URL, Redis URL
   - Deploy

---

## **ALTERNATIVE: Deploy Frontend to GitHub Pages (FREE, Static Only)**

If you only want to show the frontend:

1. Go to your repo settings → Pages
2. Select branch: `main` (or create `gh-pages` branch)
3. Build and deploy:
   ```powershell
   cd frontend
   npm run build
   # Copy dist/ folder to gh-pages branch
   ```

Your site appears at: `https://yourusername.github.io/sportsconnect`

---

## **Complete FREE Stack Summary**

| Component | Provider | Cost | Notes |
|-----------|----------|------|-------|
| Backend API | Render | FREE | Free tier, includes 1 free web service |
| Frontend | Render | FREE | Free tier static hosting |
| Database | MongoDB Atlas | FREE | 512MB storage |
| Redis Cache | Upstash | FREE | Limited, but sufficient |
| Domain | None | FREE | Use render.com/upstash URLs |
| SSL/HTTPS | Auto | FREE | Automatic |
| **TOTAL** | **All Free** | **$0** | **Production ready** |

---

## **Step-by-Step Quick Setup (15 min)**

### 1️⃣ MongoDB Atlas Setup (5 min)
```
✓ Sign up with GitHub
✓ Create free cluster
✓ Create user: admin/password
✓ Whitelist 0.0.0.0/0
✓ Copy connection string
```

### 2️⃣ Upstash Redis Setup (3 min)
```
✓ Sign up with GitHub
✓ Create free Redis
✓ Copy Redis URL
```

### 3️⃣ Render Backend Deploy (4 min)
```
✓ Connect GitHub
✓ Web Service → Python
✓ Build: pip install -r backend/requirements.txt
✓ Start: cd backend && gunicorn main:app --workers 1
✓ Add environment variables
✓ Deploy
```

### 4️⃣ Render Frontend Deploy (3 min)
```
✓ Static Site
✓ Build: cd frontend && npm run build
✓ Publish: frontend/dist
✓ Add VITE_API_URL env var
✓ Deploy
```

---

## **Environment Variables to Collect**

Before deploying, gather these:

```
MONGODB_URL = mongodb+srv://admin:PASSWORD@cluster.mongodb.net/mysports
REDIS_URL = redis://default:PASSWORD@host:port
SECRET_KEY = (generate random string - min 32 chars)
VITE_API_URL = https://sportsconnect-backend.onrender.com
```

---

## **Limitations of Free Tier**

| Limit | Render | MongoDB | Upstash |
|-------|--------|---------|---------|
| Monthly requests | Unlimited | Unlimited | 100k/month |
| Requests/day | Unlimited | Unlimited | ~3,300/day |
| Database size | - | 512 MB | - |
| Uptime | 99.9% | 99.95% | 99% |
| Cold start | ~30 sec after inactivity | Instant | Instant |

**Good for:** Personal projects, learning, testing, small user groups
**Not ideal for:** High-traffic production (but upgrade anytime)

---

## **Gotchas & Fixes**

### ⚠️ If Render backend goes to sleep:
- First request takes 30 seconds
- Solution: Keep it awake with periodic health checks (Uptime Robot)

### ⚠️ MongoDB connection timeout:
- Make sure IP whitelist is set to 0.0.0.0/0
- Connection string is correct

### ⚠️ Redis connection fails:
- Double-check Upstash URL format
- Make sure URL includes password

### ⚠️ Frontend can't reach backend:
- Check VITE_API_URL is set correctly
- Rebuild frontend: `npm run build`
- Check CORS in backend is enabled

---

## **Testing Your Deployment**

1. **Visit frontend URL:**
   ```
   https://sportsconnect-frontend.onrender.com
   ```

2. **Try to login** - should work if backend is running

3. **Create a post** - tests backend API

4. **Check logs** if anything fails:
   - Render dashboard → your service → Logs
   - See errors and fix them

---

## **Next: Upgrade Anytime**

When you outgrow free tier, upgrade to:
- **Render Pro:** $7-25/month
- **MongoDB paid:** $57+/month
- **Upstash paid:** $10+/month

---

## **TLDR - Absolute Cheapest**

```
1. MongoDB Atlas (FREE) → Get connection string
2. Upstash (FREE) → Get Redis URL
3. Render (FREE) → Deploy both services
4. Done! Share URL with friends
```

**Total time: 20 minutes**
**Total cost: $0**
**Anyone can access from any device globally**

---

Ready? Start with MongoDB Atlas sign up! Let me know if you get stuck on any step.
