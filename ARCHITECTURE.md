# Architecture Overview

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Frontend (React)                    │
│  - Sidebar Navigation                                   │
│  - Feed Components                                      │
│  - Post Creation                                        │
│  - User Profiles                                        │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│              API Gateway / Proxy Layer                  │
│  - Request/Response Transformation                      │
│  - Rate Limiting                                        │
│  - CORS Handling                                        │
└──────────────────────┬──────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
        ▼              ▼              ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ Auth Routes  │ │ Feed Routes  │ │ AI Routes    │
│ - Login      │ │ - Timeline   │ │ - Caption    │
│ - Signup     │ │ - Posts      │ │ - Hashtags   │
│ - Logout     │ │ - Comments   │ │ - Images     │
└──────┬───────┘ └──────┬───────┘ └──────┬───────┘
       │                │                │
       └────────────────┼────────────────┘
                        │
                        ▼
          ┌─────────────────────────┐
          │   MongoDB Database      │
          │ - Users                 │
          │ - Posts                 │
          │ - Comments              │
          │ - Messages              │
          │ - Notifications         │
          │ - Recommendations       │
          └─────────────────────────┘
                        │
                        ▼
          ┌─────────────────────────┐
          │  External Services      │
          │ - OpenAI API            │
          │ - Cloudinary            │
          │ - Firebase              │
          └─────────────────────────┘
```

## Component Architecture

### Frontend Structure

```
App.jsx
├── Router
│   ├── Public Routes
│   │   └── LoginPage
│   └── Protected Routes
│       ├── HomePage
│       ├── ExplorePage
│       ├── LeaguesPage
│       ├── ProfilePage
│       ├── NotificationsPage
│       ├── MessagesPage
│       └── SettingsPage
│
├── Layout Components
│   ├── Sidebar (Navigation)
│   └── Navbar (Search & Actions)
│
└── Contexts
    ├── AuthStore (Zustand)
    ├── PostStore (Zustand)
    └── UserStore (Zustand)
```

### Backend Structure

```
main.py (FastAPI App)
├── Startup Events
│   └── Database Connection
│
├── Routes
│   ├── /auth (Authentication)
│   ├── /users (User Management)
│   ├── /posts (Post Operations)
│   ├── /feed (Personalized Feed)
│   ├── /explore (Trending Content)
│   ├── /leagues (League Management)
│   ├── /notifications (Notifications)
│   ├── /messages (Messaging)
│   └── /ai (AI Features)
│
├── Services
│   ├── RecommendationEngine
│   │   ├── Content-Based Filtering
│   │   └── Trending Posts
│   │
│   └── AIService
│       ├── Caption Generation
│       ├── Hashtag Generation
│       ├── Image Generation
│       └── Sentiment Analysis
│
├── Models (Database Models)
│   ├── User
│   ├── Post
│   ├── Comment
│   ├── Message
│   ├── Notification
│   ├── League
│   └── Recommendation
│
└── Database Connection
    └── MongoDB
```

## Data Models

### User Schema
```javascript
{
  _id: ObjectId,
  username: String,
  email: String,
  password_hash: String,
  bio: String,
  profile_picture: String,
  interests: [String],
  followers: [String],
  following: [String],
  created_at: Date,
  updated_at: Date,
  is_verified: Boolean,
  is_active: Boolean
}
```

### Post Schema
```javascript
{
  _id: ObjectId,
  user_id: String,
  caption: String,
  image_url: String,
  video_url: String,
  tags: [String],
  hashtags: [String],
  likes: [String],
  comments: [{
    user_id: String,
    text: String,
    likes: [String],
    created_at: Date
  }],
  shares: Number,
  ai_generated: Boolean,
  created_at: Date,
  updated_at: Date
}
```

## API Flow

### Authentication Flow

```
1. User Signup
   POST /auth/signup
   → Validate input
   → Hash password
   → Create user
   → Generate JWT tokens
   → Return tokens

2. User Login
   POST /auth/login
   → Validate credentials
   → Generate JWT tokens
   → Return tokens

3. Token Refresh
   POST /auth/refresh
   → Validate refresh token
   → Generate new access token
   → Return new access token
```

### Post Creation Flow

```
1. User Creates Post
   POST /posts/{user_id}
   ├── Validate input
   ├── Upload image to Cloudinary
   ├── Generate AI caption (optional)
   ├── Generate hashtags (optional)
   ├── Save post to database
   └── Return post data

2. AI Generation
   ├── Caption Generation
   │   └── Call OpenAI API
   │
   ├── Hashtag Generation
   │   └── Extract from caption + predefined lists
   │
   └── Image Generation
       └── Call OpenAI DALL-E API
```

### Feed Generation Flow

```
1. Get Personalized Feed
   GET /feed/{user_id}
   ├── Get user interests
   ├── Get user's following list
   ├── Query posts from following (primary)
   ├── If < limit posts
   │   └── Get recommendation engine results
   ├── Rank by engagement
   └── Return top N posts
```

## Recommendation Algorithm

```
Input: User ID, User Interests, All Posts

Process:
1. Extract Features
   ├── Caption text
   ├── Hashtags
   └── Tags

2. Vectorization (TF-IDF)
   ├── Convert text to vectors
   └── Create sparse matrix

3. Calculate Similarity
   ├── User interest vector vs Post vectors
   └── Cosine similarity

4. Engagement Scoring
   ├── Likes × 1.0
   ├── Comments × 2.0
   └── Shares × 3.0

5. Combined Score
   ├── 70% Content-based similarity
   └── 30% Engagement score

Output: Top N recommended post IDs
```

## Deployment Architecture

```
┌──────────────────────────────────────────────────────┐
│                    Vercel/Netlify                    │
│  ┌────────────────────────────────────────────────┐  │
│  │         Frontend (React SPA)                   │  │
│  │  - Static hosting                             │  │
│  │  - CDN distribution                           │  │
│  │  - Auto-scaling                               │  │
│  └────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────┘
                       ▼
┌──────────────────────────────────────────────────────┐
│                 Render/Railway                       │
│  ┌────────────────────────────────────────────────┐  │
│  │      Backend (FastAPI)                         │  │
│  │  - API server instances                        │  │
│  │  - Auto-scaling replicas                       │  │
│  │  - Load balancing                              │  │
│  └────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────┘
                       ▼
┌──────────────────────────────────────────────────────┐
│              MongoDB Atlas                           │
│  ┌────────────────────────────────────────────────┐  │
│  │    Managed Cloud Database                      │  │
│  │  - Automatic backups                           │  │
│  │  - Replication                                 │  │
│  │  - Built-in security                           │  │
│  └────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────┘
```

## Security Architecture

```
┌─────────────────────────────────────────┐
│         User Request                    │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│    CORS Middleware (Allowed Origins)    │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│   Rate Limiting (Optional)              │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│   Authentication (JWT Token)            │
│   - Verify token signature              │
│   - Check expiration                    │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│   Authorization (Permissions)           │
│   - Verify user rights                  │
│   - Check resource ownership            │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│    Input Validation & Sanitization      │
│   - Pydantic validation                 │
│   - XSS prevention                      │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│      Database Operation                 │
│   - Parameterized queries               │
│   - Connection pooling                  │
└─────────────────────────────────────────┘
```

## Performance Optimization

### Caching Strategy
- Frontend: Browser cache + localStorage
- API: Response caching headers
- Database: MongoDB indexing

### Database Indexing
```javascript
db.users.createIndex({ "username": 1 })
db.users.createIndex({ "email": 1 })
db.posts.createIndex({ "user_id": 1, "created_at": -1 })
db.posts.createIndex({ "hashtags": 1 })
db.notifications.createIndex({ "user_id": 1, "created_at": -1 })
```

### Frontend Optimization
- Code splitting with React Router
- Lazy loading components
- Image optimization
- Minification & compression

### Backend Optimization
- Async/await for I/O operations
- Connection pooling
- Query optimization
- Response pagination

## Monitoring & Logging

```
Frontend Errors
├── Console errors
├── Network requests
└── User analytics

Backend Logs
├── Request/Response logs
├── Error logs
├── API performance metrics
└── Database query logs

Database Monitoring
├── Query performance
├── Disk usage
├── Connection counts
└── Slow query logs
```
