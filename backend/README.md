# Backend - SportsNet

FastAPI backend for the sports social media platform.

## Setup

### Prerequisites
- Python 3.9+
- MongoDB (local or Atlas)

### Installation
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### Configuration
Create `.env` file:
```
MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/mysports
SECRET_KEY=your-secret-key-change-in-production
OPENAI_API_KEY=your-openai-api-key
CLOUDINARY_API_KEY=your-cloudinary-key
```

## Running

### Development
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Production
```bash
gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app --bind 0.0.0.0:8000
```

## API Documentation
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Project Structure
```
backend/
├── app/
│   ├── routes/              # API endpoints
│   ├── models/              # Pydantic models
│   ├── schemas/             # Request/Response schemas
│   ├── services/            # Business logic
│   │   ├── recommendation.py
│   │   └── ai_service.py
│   ├── db/                  # Database configuration
│   ├── config/              # App configuration
│   └── utils/               # Helper functions
├── main.py                  # FastAPI app entry
└── requirements.txt         # Dependencies
```

## Features
- User authentication (JWT)
- Post creation and management
- Personalized feed generation
- AI content generation (captions, hashtags, images)
- Content recommendations
- Real-time notifications
- Direct messaging
- League management
