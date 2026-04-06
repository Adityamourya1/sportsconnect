# SportsNet - AI-Powered Sports Social Media Platform

A full-stack Instagram-like sports social media application with AI-powered content generation and personalized recommendations.

## 🎯 Features

### Core Features
- ✅ User authentication (JWT)
- ✅ Personalized feed based on interests and engagement
- ✅ Post creation with image/video support
- ✅ AI-powered content generation (captions, hashtags, images)
- ✅ Explore page with trending content
- ✅ Sports leagues management
- ✅ User profiles and follow system
- ✅ Real-time messaging
- ✅ Notifications system
- ✅ Search functionality

### AI & ML Features
- 🤖 Content-based recommendation system
- 🤖 AI caption generation (OpenAI)
- 🤖 AI hashtag generation
- 🤖 AI image generation
- 🤖 Sentiment analysis

### Tech Stack

**Frontend:**
- React 18
- React Router
- Tailwind CSS
- Axios
- Zustand (State Management)
- React Hot Toast
- Vite

**Backend:**
- FastAPI
- MongoDB (Motor/PyMongo)
- JWT Authentication
- Pydantic
- Scikit-learn (Recommendations)
- NumPy & Pandas

**DevOps & Deployment:**
- Vercel (Frontend)
- Render/Railway (Backend)
- MongoDB Atlas (Database)
- Cloudinary (Media Storage)
- OpenAI API (AI Features)

## 🚀 Quick Start

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Create .env file
cp .env.example .env

# Run server
uvicorn main:app --reload
```

Backend runs on: http://localhost:8000

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on: http://localhost:3000

## 📁 Project Structure

```
mysports/
├── backend/
│   ├── app/
│   │   ├── routes/
│   │   │   ├── auth.py
│   │   │   ├── users.py
│   │   │   ├── posts.py
│   │   │   ├── feed.py
│   │   │   ├── explore.py
│   │   │   ├── leagues.py
│   │   │   ├── notifications.py
│   │   │   ├── messages.py
│   │   │   └── ai.py
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   ├── db/
│   │   ├── config/
│   │   └── utils/
│   ├── main.py
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Sidebar.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── PostCard.jsx
│   │   │   └── CreatePostModal.jsx
│   │   ├── pages/
│   │   │   ├── HomePage.jsx
│   │   │   ├── ExplorePage.jsx
│   │   │   ├── LeaguesPage.jsx
│   │   │   ├── ProfilePage.jsx
│   │   │   └── LoginPage.jsx
│   │   ├── services/
│   │   ├── context/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── index.html
│
└── README.md
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh token
- `GET /api/auth/me` - Get current user

### Posts
- `POST /api/posts/{user_id}` - Create post
- `GET /api/posts/{post_id}` - Get post
- `POST /api/posts/{post_id}/like/{user_id}` - Like post
- `POST /api/posts/{post_id}/comment/{user_id}` - Add comment

### Feed
- `GET /api/feed/{user_id}` - Get personalized feed

### Explore
- `GET /api/explore/trending/posts` - Get trending posts
- `GET /api/explore/suggested-users/{user_id}` - Get suggested users
- `GET /api/explore/hashtags/trending` - Get trending hashtags
- `GET /api/explore/search?q=...` - Search content

### Users
- `GET /api/users/{user_id}` - Get user profile
- `PUT /api/users/{user_id}` - Update profile
- `POST /api/users/{user_id}/follow/{target_user_id}` - Follow user

### Leagues
- `GET /api/leagues/` - Get all leagues
- `POST /api/leagues/{league_id}/follow/{user_id}` - Follow league
- `GET /api/leagues/{league_id}/posts` - Get league posts

### AI
- `POST /api/ai/generate-caption` - Generate AI caption
- `POST /api/ai/generate-hashtags` - Generate hashtags
- `POST /api/ai/generate-image` - Generate image from prompt
- `POST /api/ai/analyze-sentiment` - Analyze sentiment

## 🎨 Design

- **Color Scheme**: Beige to Green gradient
- **Layout**: Instagram-like sidebar + feed design
- **Responsive**: Mobile, tablet, desktop support
- **Modern UI**: Clean, intuitive interface

## 🔐 Security

- JWT token-based authentication
- Password hashing with bcrypt
- CORS middleware
- Protected routes
- Environment variables for sensitive data

## 📊 Recommendation Algorithm

The system uses content-based filtering:
1. Extract features from posts (caption, hashtags)
2. Vectorize using TF-IDF
3. Calculate similarity with user interests
4. Weight by engagement (likes, comments)
5. Return top-N recommendations

## 🚢 Deployment

### Frontend (Vercel)
```bash
npm run build
vercel deploy
```

### Backend (Render/Railway)
```bash
# Push to GitHub
git push origin main

# Connect to Render/Railway and deploy
```

### Database (MongoDB Atlas)
1. Create cluster on MongoDB Atlas
2. Add connection string to `.env`

## 🛠️ Development

### Install Dependencies
```bash
# Backend
pip install -r requirements.txt

# Frontend
npm install
```

### Run Tests
```bash
# Backend
pytest

# Frontend
npm test
```

### Code Formatting
```bash
# Backend
black . && isort .

# Frontend
npm run format
```

## 📝 Environment Variables

### Backend (.env)
```
MONGO_URL=
SECRET_KEY=
ALGORITHM=HS256
OPENAI_API_KEY=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
ENVIRONMENT=development
DEBUG=True
```

### Frontend (.env.local)
```
VITE_API_URL=http://localhost:8000/api
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

AI Team

## 🙏 Acknowledgments

- Inspired by Instagram
- Built with ❤️ using FastAPI and React
- AI powered by OpenAI

---

**Happy Coding! 🚀**
