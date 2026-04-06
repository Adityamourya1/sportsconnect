# API Reference - SportsNet

Complete API documentation for the SportsNet backend.

## BaseURL
```
Development: http://localhost:8000
Production: https://api.sportsnet.com
```

## Authentication

All protected endpoints require a JWT token in the header:
```
Authorization: Bearer {access_token}
```

---

## Authentication Endpoints

### 1. Signup
Create a new user account.

**Endpoint:** `POST /api/auth/signup`

**Request Body:**
```json
{
  "username": "john_cricket",
  "email": "john@example.com",
  "password": "securepassword123",
  "interests": ["cricket", "football", "fitness"]
}
```

**Response (201 Created):**
```json
{
  "access_token": "eyJ...",
  "refresh_token": "eyJ...",
  "token_type": "bearer",
  "user_id": "507f1f77bcf86cd799439011"
}
```

**Error Response (400 Bad Request):**
```json
{
  "detail": "Email already registered"
}
```

---

### 2. Login
Authenticate user and get tokens.

**Endpoint:** `POST /api/auth/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response (200 OK):**
```json
{
  "access_token": "eyJ...",
  "refresh_token": "eyJ...",
  "token_type": "bearer",
  "user_id": "507f1f77bcf86cd799439011"
}
```

**Error Response (401 Unauthorized):**
```json
{
  "detail": "Invalid email or password"
}
```

---

### 3. Refresh Token
Get a new access token using refresh token.

**Endpoint:** `POST /api/auth/refresh`

**Request Body:**
```json
{
  "refresh_token": "eyJ..."
}
```

**Response (200 OK):**
```json
{
  "access_token": "eyJ...",
  "token_type": "bearer"
}
```

---

### 4. Get Current User
Get logged-in user information.

**Endpoint:** `GET /api/auth/me`

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response (200 OK):**
```json
{
  "id": "507f1f77bcf86cd799439011",
  "username": "john_cricket",
  "email": "john@example.com",
  "bio": "Cricket lover"
}
```

---

## User Endpoints

### 1. Get User Profile
Retrieve user profile information.

**Endpoint:** `GET /api/users/{user_id}`

**Response (200 OK):**
```json
{
  "id": "507f1f77bcf86cd799439011",
  "username": "john_cricket",
  "email": "john@example.com",
  "bio": "Cricket enthusiast",
  "profile_picture": "https://example.com/pic.jpg",
  "interests": ["cricket", "football"],
  "followers_count": 125,
  "following_count": 50,
  "posts_count": 42,
  "created_at": "2024-01-15T10:30:00Z"
}
```

---

### 2. Update Profile
Update user profile information.

**Endpoint:** `PUT /api/users/{user_id}`

**Headers:**
```
Authorization: Bearer {access_token}
```

**Request Body:**
```json
{
  "username": "john_cricket",
  "bio": "Cricket fan and fitness enthusiast",
  "interests": ["cricket", "fitness", "sports"],
  "profile_picture": "https://cloudinary.com/image.jpg"
}
```

**Response (200 OK):**
```json
{
  "id": "507f1f77bcf86cd799439011",
  "username": "john_cricket",
  "email": "john@example.com",
  "bio": "Cricket fan and fitness enthusiast",
  "profile_picture": "https://cloudinary.com/image.jpg",
  "interests": ["cricket", "fitness", "sports"],
  "followers_count": 125,
  "following_count": 50,
  "posts_count": 42,
  "created_at": "2024-01-15T10:30:00Z"
}
```

---

### 3. Follow User
Follow another user.

**Endpoint:** `POST /api/users/{user_id}/follow/{target_user_id}`

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response (200 OK):**
```json
{
  "message": "User followed successfully"
}
```

---

### 4. Unfollow User
Unfollow a user.

**Endpoint:** `POST /api/users/{user_id}/unfollow/{target_user_id}`

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response (200 OK):**
```json
{
  "message": "User unfollowed successfully"
}
```

---

### 5. Get Followers
Get list of user's followers.

**Endpoint:** `GET /api/users/{user_id}/followers?skip=0&limit=20`

**Response (200 OK):**
```json
[
  {
    "id": "507f1f77bcf86cd799439012",
    "username": "jane_football",
    "profile_picture": "https://example.com/jane.jpg"
  },
  {
    "id": "507f1f77bcf86cd799439013",
    "username": "mike_basketball",
    "profile_picture": "https://example.com/mike.jpg"
  }
]
```

---

### 6. Get Following
Get list of users that user is following.

**Endpoint:** `GET /api/users/{user_id}/following?skip=0&limit=20`

**Response (200 OK):**
```json
[
  {
    "id": "507f1f77bcf86cd799439012",
    "username": "virat_kohli",
    "profile_picture": "https://example.com/virat.jpg"
  }
]
```

---

## Post Endpoints

### 1. Create Post
Create a new post.

**Endpoint:** `POST /api/posts/{user_id}`

**Headers:**
```
Authorization: Bearer {access_token}
```

**Request Body:**
```json
{
  "caption": "Amazing cricket match! What a day! 🏏⚡",
  "image_url": "https://cloudinary.com/post.jpg",
  "video_url": null,
  "tags": ["#cricket", "#india"],
  "hashtags": ["cricket", "india", "match"],
  "ai_generated": false
}
```

**Response (201 Created):**
```json
{
  "id": "507f1f77bcf86cd799439020",
  "message": "Post created successfully"
}
```

---

### 2. Get Post
Retrieve a specific post.

**Endpoint:** `GET /api/posts/{post_id}`

**Response (200 OK):**
```json
{
  "id": "507f1f77bcf86cd799439020",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "username": "john_cricket",
    "profile_picture": "https://example.com/john.jpg"
  },
  "caption": "Amazing cricket match! What a day! 🏏⚡",
  "image_url": "https://cloudinary.com/post.jpg",
  "hashtags": ["cricket", "india", "match"],
  "likes_count": 245,
  "comments_count": 32,
  "created_at": "2024-01-15T10:30:00Z"
}
```

---

### 3. Like Post
Like a post.

**Endpoint:** `POST /api/posts/{post_id}/like/{user_id}`

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response (200 OK):**
```json
{
  "message": "Post liked",
  "likes_count": 246
}
```

---

### 4. Unlike Post
Remove like from post.

**Endpoint:** `POST /api/posts/{post_id}/unlike/{user_id}`

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response (200 OK):**
```json
{
  "message": "Post unliked",
  "likes_count": 245
}
```

---

### 5. Add Comment
Add comment to a post.

**Endpoint:** `POST /api/posts/{post_id}/comment/{user_id}`

**Headers:**
```
Authorization: Bearer {access_token}
```

**Request Body:**
```json
{
  "text": "Amazing performance! 🎉"
}
```

**Response (200 OK):**
```json
{
  "message": "Comment added",
  "comments_count": 33
}
```

---

### 6. Get User Posts
Get all posts by a user.

**Endpoint:** `GET /api/posts/{user_id}/posts?skip=0&limit=20`

**Response (200 OK):**
```json
[
  {
    "id": "507f1f77bcf86cd799439020",
    "caption": "Amazing cricket match!",
    "image_url": "https://cloudinary.com/post.jpg",
    "likes_count": 245,
    "comments_count": 32,
    "created_at": "2024-01-15T10:30:00Z"
  }
]
```

---

## Feed Endpoints

### 1. Get Personalized Feed
Get user's personalized feed.

**Endpoint:** `GET /api/feed/{user_id}?skip=0&limit=20`

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response (200 OK):**
```json
[
  {
    "id": "507f1f77bcf86cd799439020",
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "username": "john_cricket",
      "profile_picture": "https://example.com/john.jpg"
    },
    "caption": "Amazing cricket match!",
    "image_url": "https://cloudinary.com/post.jpg",
    "hashtags": ["cricket", "india"],
    "likes_count": 245,
    "comments_count": 32,
    "is_liked": false,
    "created_at": "2024-01-15T10:30:00Z"
  }
]
```

---

## Explore Endpoints

### 1. Get Trending Posts
Get trending posts across platform.

**Endpoint:** `GET /api/explore/trending/posts?limit=20`

**Response (200 OK):**
```json
[
  {
    "id": "507f1f77bcf86cd799439020",
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "username": "john_cricket"
    },
    "caption": "Amazing cricket match!",
    "image_url": "https://cloudinary.com/post.jpg",
    "likes_count": 245,
    "comments_count": 32
  }
]
```

---

### 2. Get Suggested Users
Get suggested users to follow.

**Endpoint:** `GET /api/explore/suggested-users/{user_id}?limit=10`

**Response (200 OK):**
```json
[
  {
    "id": "507f1f77bcf86cd799439012",
    "username": "virat_kohli",
    "profile_picture": "https://example.com/virat.jpg",
    "bio": "Professional cricket player",
    "mutual_interests": ["cricket", "sports"]
  }
]
```

---

### 3. Get Trending Hashtags
Get trending hashtags.

**Endpoint:** `GET /api/explore/hashtags/trending?limit=20`

**Response (200 OK):**
```json
[
  {
    "hashtag": "cricket",
    "count": 5234
  },
  {
    "hashtag": "ipl",
    "count": 3421
  },
  {
    "hashtag": "india",
    "count": 2890
  }
]
```

---

### 4. Search Content
Search for users, posts, or hashtags.

**Endpoint:** `GET /api/explore/search?q=cricket&search_type=all`

**Query Parameters:**
- `q` (string): Search query
- `search_type` (string): "all", "users", "posts", or "hashtags"

**Response (200 OK):**
```json
{
  "users": [
    {
      "id": "507f1f77bcf86cd799439011",
      "username": "john_cricket",
      "profile_picture": "https://example.com/john.jpg"
    }
  ],
  "posts": [
    {
      "id": "507f1f77bcf86cd799439020",
      "caption": "Amazing cricket match!",
      "image_url": "https://cloudinary.com/post.jpg"
    }
  ],
  "hashtags": ["cricket", "cricketlove", "cricketworldcup"]
}
```

---

## League Endpoints

### 1. Get All Leagues
Get list of all sports leagues.

**Endpoint:** `GET /api/leagues/?skip=0&limit=50`

**Response (200 OK):**
```json
[
  {
    "id": "507f1f77bcf86cd799439030",
    "name": "IPL",
    "sport": "cricket",
    "description": "Indian Premier League",
    "followers_count": 50000,
    "posts_count": 1200
  }
]
```

---

### 2. Follow League
Follow a league.

**Endpoint:** `POST /api/leagues/{league_id}/follow/{user_id}`

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response (200 OK):**
```json
{
  "message": "League followed successfully"
}
```

---

### 3. Get League Posts
Get posts from a league.

**Endpoint:** `GET /api/leagues/{league_id}/posts?skip=0&limit=20`

**Response (200 OK):**
```json
[
  {
    "id": "507f1f77bcf86cd799439020",
    "caption": "IPL match update!",
    "image_url": "https://cloudinary.com/post.jpg",
    "likes_count": 500,
    "comments_count": 120
  }
]
```

---

## Notification Endpoints

### 1. Get Notifications
Get user notifications.

**Endpoint:** `GET /api/notifications/{user_id}?skip=0&limit=20`

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response (200 OK):**
```json
[
  {
    "id": "507f1f77bcf86cd799439040",
    "type": "like",
    "actor_id": "507f1f77bcf86cd799439012",
    "message": "jane_football liked your post",
    "is_read": false,
    "created_at": "2024-01-15T10:30:00Z"
  }
]
```

---

### 2. Mark as Read
Mark notification as read.

**Endpoint:** `PUT /api/notifications/{notification_id}/read`

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response (200 OK):**
```json
{
  "message": "Notification marked as read"
}
```

---

### 3. Get Unread Count
Get count of unread notifications.

**Endpoint:** `GET /api/notifications/{user_id}/unread-count`

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response (200 OK):**
```json
{
  "unread_count": 5
}
```

---

## Message Endpoints

### 1. Send Message
Send a message.

**Endpoint:** `POST /api/messages/send`

**Headers:**
```
Authorization: Bearer {access_token}
```

**Request Body:**
```json
{
  "sender_id": "507f1f77bcf86cd799439011",
  "receiver_id": "507f1f77bcf86cd799439012",
  "chat_id": "chat_507f1f77bcf86cd799439011_507f1f77bcf86cd799439012",
  "text": "Hey! How are you?",
  "image_url": null
}
```

**Response (201 Created):**
```json
{
  "id": "507f1f77bcf86cd799439050",
  "message": "Message sent successfully"
}
```

---

### 2. Get Chat Messages
Get messages from a chat.

**Endpoint:** `GET /api/messages/{chat_id}?skip=0&limit=50`

**Response (200 OK):**
```json
[
  {
    "id": "507f1f77bcf86cd799439050",
    "sender_id": "507f1f77bcf86cd799439011",
    "text": "Hey! How are you?",
    "image_url": null,
    "is_read": true,
    "created_at": "2024-01-15T10:30:00Z"
  }
]
```

---

### 3. Get Conversations
Get all conversations for a user.

**Endpoint:** `GET /api/messages/{user_id}/conversations`

**Response (200 OK):**
```json
[
  {
    "chat_id": "chat_507f1f77bcf86cd799439011_507f1f77bcf86cd799439012",
    "last_message": "See you tomorrow!",
    "last_message_time": "2024-01-15T10:30:00Z"
  }
]
```

---

## AI Endpoints

### 1. Generate Caption
Generate AI caption for post.

**Endpoint:** `POST /api/ai/generate-caption`

**Request Body:**
```json
{
  "sport": "cricket",
  "context": "Just won an important match"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": "🏏 What a match! The team played brilliantly today. #cricket #victory"
}
```

---

### 2. Generate Hashtags
Generate hashtags for post.

**Endpoint:** `POST /api/ai/generate-hashtags`

**Request Body:**
```json
{
  "caption": "Amazing cricket match!",
  "sport": "cricket"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": "cricket,ipl,sport,india,match,victory"
}
```

---

### 3. Generate Image
Generate image from prompt.

**Endpoint:** `POST /api/ai/generate-image`

**Request Body:**
```json
{
  "prompt": "A cricket player hitting a six at sunset",
  "sport": "cricket"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": "https://cloudinary.com/generated-image-url"
}
```

---

### 4. Analyze Sentiment
Analyze sentiment of text.

**Endpoint:** `POST /api/ai/analyze-sentiment`

**Request Body:**
```json
{
  "text": "This was an amazing performance! I loved every moment!"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "sentiment": "positive",
  "score": 0.85
}
```

---

## Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Request succeeded |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - Authorization failed |
| 404 | Not Found - Resource not found |
| 500 | Server Error - Internal server error |

---

## Error Response Format

```json
{
  "detail": "Error message describing what went wrong"
}
```

---

## Rate Limiting

Rate limits are applied per user:
- Authenticated users: 100 requests/minute
- Unauthenticated users: 10 requests/minute

Headers returned:
- `X-RateLimit-Limit`: Total requests allowed
- `X-RateLimit-Remaining`: Remaining requests
- `X-RateLimit-Reset`: Unix timestamp when limit resets

---

## Pagination

Use `skip` and `limit` query parameters:
```
GET /api/posts/{user_id}/posts?skip=0&limit=20
```

- `skip`: Number of items to skip (default: 0)
- `limit`: Number of items to return (default: 20, max: 100)

---

## Webhooks (Future)

Webhooks will be available for:
- New post created
- Comment added
- User followed
- Message received
- Notification triggered

Configure webhooks in Settings page.

---

## Rate Limiting and Best Practices

1. **Cache responses** when possible
2. **Use pagination** for large datasets
3. **Batch requests** to reduce API calls
4. **Handle rate limiting** gracefully
5. **Implement exponential backoff** for retries

---

## Support

For API issues:
- Email: api-support@sportsnet.com
- GitHub Issues: [issues-link]
- Documentation: [docs-link]
