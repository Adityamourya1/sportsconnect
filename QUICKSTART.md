# 🚀 Quick Start Guide - SportsNet

Get the AI-powered sports social media app running in 5 minutes!

## Prerequisites

- Node.js 18+ ([Download](https://nodejs.org/))
- Python 3.9+ ([Download](https://www.python.org/))
- MongoDB ([Local](https://docs.mongodb.com/manual/installation/) or [Atlas](https://www.mongodb.com/cloud/atlas))
- Git

---

## ⚡ 5-Minute Setup

### Step 1: Clone & Navigate
```bash
cd c:\Users\DELL\OneDrive\Desktop\mysports
```

### Step 2: Start Backend

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv

# Activate environment
# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env

# Start server
uvicorn main:app --reload
```

✅ Backend running on: http://localhost:8000

### Step 3: Start Frontend

**In a new terminal:**

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

✅ Frontend running on: http://localhost:3000

---

## 🔥 Using Docker (Easiest)

### One-Command Setup

```bash
# From project root
docker-compose up -d

# Check status
docker-compose ps
```

✅ Everything running in Docker!

### Or with Docker Desktop

1. Open Docker Desktop
2. Run: `docker-compose up`
3. Frontend: http://localhost:3000
4. Backend: http://localhost:8000
5. MongoDB: localhost:27017

---

## 📝 Configuration

### Backend .env

Edit `backend/.env`:
```env
MONGO_URL=mongodb://localhost:27017/mysports
SECRET_KEY=your-secret-key-here
OPENAI_API_KEY=sk-...
CLOUDINARY_API_KEY=...
DEBUG=True
```

### Frontend .env

Create `frontend/.env.local`:
```env
VITE_API_URL=http://localhost:8000/api
```

---

## 🧪 Testing the API

### Using cURL

```bash
# Signup
curl -X POST http://localhost:8000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123",
    "interests": ["cricket"]
  }'

# Login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Using Postman

1. Import API collection (if available)
2. Set base URL to `http://localhost:8000`
3. Test endpoints

### Using Browser

1. Go to http://localhost:3000
2. Click "Sign Up"
3. Create account
4. Explore the app!

---

## 📚 Quick Reference

### Frontend Commands

```bash
cd frontend

# Development
npm run dev

# Build
npm run build

# Preview build
npm run preview

# Format code
npm run format

# Lint
npm run lint
```

### Backend Commands

```bash
cd backend

# Run with auto-reload
uvicorn main:app --reload

# Run with specific port
uvicorn main:app --port 8001

# Generate requirements
pip freeze > requirements.txt

# Run tests
pytest

# Format code
black app/ main.py
```

---

## 🐛 Troubleshooting

### "Port already in use"

```bash
# Find process on port 8000
lsof -i :8000  # Mac/Linux
netstat -ano | findstr :8000  # Windows

# Kill the process
kill -9 <PID>  # Mac/Linux
```

### "MongoDB connection refused"

```bash
# Start MongoDB locally
mongod

# Or use MongoDB Atlas
# Update MONGO_URL in .env
```

### "Module not found"

```bash
# Backend
pip install -r requirements.txt

# Frontend
npm install
```

### "CORS Error"

- Ensure backend is running on port 8000
- Check `settings.py` CORS_ORIGINS
- Frontend should be on http://localhost:3000

---

## 🎯 What to Test First

1. **Sign Up** - Create new account
2. **Login** - Log into account
3. **Create Post** - Add a post with text
4. **Like Post** - Like a post in feed
5. **Explore** - Browse trending content
6. **Profile** - View user profile
7. **Notifications** - Check notifications (if any)

---

## 📖 Full Documentation

- **[Complete README](./README.md)** - Project overview
- **[Architecture](./ARCHITECTURE.md)** - System design
- **[API Reference](./API_REFERENCE.md)** - All endpoints
- **[Setup Guide](./SETUP.md)** - Detailed setup
- **[Roadmap](./ROADMAP.md)** - Features & timeline

---

## 📂 Project Structure

```
mysports/
├── backend/              # FastAPI backend
│   ├── app/
│   │   ├── routes/       # API endpoints
│   │   ├── models/       # Database models
│   │   ├── services/     # Business logic
│   │   └── config/       # Configuration
│   ├── main.py          # Entry point
│   └── requirements.txt
│
├── frontend/             # React frontend
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── pages/        # Page components
│   │   ├── services/     # API services
│   │   └── context/      # State management
│   ├── package.json
│   └── index.html
│
├── docker-compose.yml    # Docker setup
├── README.md             # Project README
├── ARCHITECTURE.md       # System design
└── API_REFERENCE.md      # API docs
```

---

## 🚀 Next Steps

1. **Explore** the application
2. **Read** the full documentation
3. **Customize** for your needs
4. **Deploy** to production
5. **Invite** users

---

## 💡 Tips & Tricks

### Development
- Use `--reload` flag for auto-refresh
- Check browser console for errors
- Use browser DevTools to debug
- Check network tab for API calls

### Performance
- Clear browser cache if issues
- Restart backend if stuck
- Check MongoDB connection
- Monitor terminal for errors

### Debugging
- Backend logs: Terminal output
- Frontend logs: Browser console
- API docs: http://localhost:8000/docs
- Database: MongoDB Compass

---

## 🤝 Need Help?

- Check [documentation](./README.md)
- Review [setup guide](./SETUP.md)
- Check [API reference](./API_REFERENCE.md)
- Look in [troubleshooting](./SETUP.md#troubleshooting)

---

## 📞 Support

- **Issues**: Create GitHub issue
- **Questions**: Check documentation
- **Suggestions**: Start discussion
- **Bugs**: Report with details

---

## 🎉 You're Awesome!

Thanks for exploring SportsNet! We hope you enjoy building with this platform.

### Share Your Feedback
- What did you like?
- What could be better?
- Send feedback/suggestions

**Happy Coding! 🚀**

---

**Last Updated:** January 2024  
**Version:** 1.0.0  
**Status:** ✅ Ready to Use
