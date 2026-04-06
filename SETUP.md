# Development Setup Guide

## Prerequisites

- Node.js 18+
- Python 3.9+
- MongoDB
- Git

## Local Setup

### 1. Clone Repository
```bash
git clone <repository-url>
cd mysports
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env

# Edit .env with your configuration
nano .env

# Start MongoDB (if local)
mongod

# Run server
uvicorn main:app --reload
```

Backend: http://localhost:8000
API Docs: http://localhost:8000/docs

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env.local
cp .env.example .env.local

# Run development server
npm run dev
```

Frontend: http://localhost:3000

## Docker Setup

### Run Everything with Docker Compose

```bash
# Copy environment file
cp backend/.env.example backend/.env

# Edit backend/.env with your credentials

# Build and run
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## Database

### MongoDB Local Setup

```bash
# Mac (Homebrew)
brew install mongodb-community
brew services start mongodb-community

# Windows
# Download from https://www.mongodb.com/try/download/community

# Linux
# Follow: https://docs.mongodb.com/manual/installation/
```

### MongoDB Atlas Setup

1. Go to https://www.mongodb.com/cloud/atlas
2. Create cluster
3. Get connection string
4. Add to `.env`: `MONGO_URL=mongodb+srv://...`

## API Testing

### Postman Collection

1. Import `postman_collection.json` into Postman
2. Set environment variables
3. Test endpoints

### cURL Examples

```bash
# Signup
curl -X POST http://localhost:8000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_cricket",
    "email": "john@example.com",
    "password": "securepassword",
    "interests": ["cricket", "football"]
  }'

# Login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "securepassword"
  }'
```

## IDE Setup

### VS Code Extensions

- Python
- Pylance
- ES7+ React/Redux/React-Native snippets
- Tailwind CSS IntelliSense
- Thunder Client (API testing)
- MongoDB for VS Code

### VS Code Settings

```json
{
  "editor.formatOnSave": true,
  "python.formatting.provider": "black",
  "python.linting.enabled": true,
  "python.linting.pylintEnabled": true
}
```

## Useful Commands

### Backend

```bash
# Format code
black app/ main.py
isort app/ main.py

# Lint
pylint app/

# Run tests
pytest

# Generate migration
# (if using Alembic)
alembic revision --autogenerate -m "Description"
alembic upgrade head
```

### Frontend

```bash
# Format code
npm run format

# Lint
npm run lint

# Build
npm run build

# Preview build
npm run preview
```

## Troubleshooting

### Port Already in Use

```bash
# Find process on port
lsof -i :8000  # Mac/Linux
netstat -ano | findstr :8000  # Windows

# Kill process
kill -9 <PID>  # Mac/Linux
taskkill /PID <PID> /F  # Windows
```

### MongoDB Connection Error

```bash
# Check if MongoDB is running
sudo service mongodb status

# Start MongoDB
sudo service mongodb start

# Check logs
cat /var/log/mongodb/mongod.log
```

### Frontend Port Conflict

Change port in `vite.config.js`:
```javascript
server: {
  port: 3001,
}
```

## Performance Tips

1. **Backend**
   - Enable caching
   - Use async operations
   - Index MongoDB collections

2. **Frontend**
   - Code splitting
   - Lazy loading
   - Image optimization

## Security Checklist

- [ ] Change `SECRET_KEY` in production
- [ ] Use environment variables
- [ ] Enable HTTPS
- [ ] Add rate limiting
- [ ] Validate/sanitize inputs
- [ ] Use CORS properly
- [ ] Keep dependencies updated

## Additional Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Documentation](https://react.dev/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Tailwind CSS](https://tailwindcss.com/)

## Support

For issues:
1. Check logs
2. Search existing issues
3. Create new issue with details
