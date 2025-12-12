# Full-Stack Web Application

A modern full-stack web application built with React, Node.js, PostgreSQL, and Docker.

## Features

- **User Authentication**: JWT-based authentication with secure password hashing
- **REST API**: Full-featured backend API with Express.js
- **Database**: PostgreSQL database with proper schema design
- **Responsive UI**: Modern, responsive frontend built with React
- **Docker Ready**: Complete Docker setup for easy deployment
- **Landing Page**: Beautiful landing page with feature showcase

## Tech Stack

### Frontend
- React 18
- React Router v6
- Axios for API calls
- Custom hooks for authentication

### Backend
- Node.js & Express
- PostgreSQL database
- JWT for authentication
- bcryptjs for password hashing
- express-validator for input validation

### DevOps
- Docker & Docker Compose
- Multi-container setup (Frontend, Backend, Database)

## Getting Started

### Prerequisites

- Docker and Docker Compose installed
- Git (optional)

### Installation

1. Clone or navigate to the project directory:
```bash
cd BaseWebApp
```

2. Create environment file:
```bash
cp .env.example .env
```

3. (Optional) Edit `.env` file to customize settings:
- Update `JWT_SECRET` with a secure random string
- Change database credentials if needed

4. Start the application:
```bash
npm run dev:build
```

This will build and start all containers:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- PostgreSQL: localhost:5432

### First Run

The database will be automatically initialized with:
- Users table with proper schema
- Indexes for performance
- A test user account (optional to use):
  - Email: `test@example.com`
  - Password: `password123`

## Usage

### Starting the Application

```bash
# Start all services
npm run dev

# Start with rebuild
npm run dev:build

# Stop all services
npm run down

# Stop and remove volumes (clean slate)
npm run clean
```

### API Endpoints

#### Public Endpoints
- `GET /` - API information
- `GET /api/health` - Health check
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

#### Protected Endpoints
- `GET /api/auth/me` - Get current user (requires JWT token)

### Frontend Routes

- `/` - Landing page
- `/login` - Login page
- `/register` - Registration page
- `/dashboard` - User dashboard (protected)

## Project Structure

```
BaseWebApp/
├── backend/
│   ├── src/
│   │   ├── config/         # Database configuration
│   │   ├── controllers/    # Route controllers
│   │   ├── middleware/     # Custom middleware
│   │   ├── routes/         # API routes
│   │   ├── utils/          # Utility functions
│   │   └── server.js       # Entry point
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom hooks
│   │   ├── services/       # API services
│   │   ├── styles/         # CSS files
│   │   ├── App.js
│   │   └── index.js
│   ├── Dockerfile
│   └── package.json
├── database/
│   └── init/
│       └── 01-init.sql     # Database initialization
├── docker-compose.yml
├── .env.example
├── .gitignore
└── README.md
```

## Development

### Backend Development

The backend runs with nodemon for hot reloading. Any changes to backend files will automatically restart the server.

### Frontend Development

React app runs in development mode with hot module replacement. Changes will be reflected immediately.

### Database Access

Connect to PostgreSQL:
```bash
docker exec -it webapp_postgres psql -U webapp_user -d webapp_db
```

## API Testing

You can test the API using curl or tools like Postman:

### Register a new user:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"password123"}'
```

### Login:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'
```

### Get current user (with token):
```bash
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Security

- Passwords are hashed using bcryptjs before storage
- JWT tokens are used for authentication
- Environment variables for sensitive data
- Input validation on all endpoints
- CORS enabled for cross-origin requests

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Backend port | `5000` |
| `POSTGRES_USER` | Database user | `webapp_user` |
| `POSTGRES_PASSWORD` | Database password | `changeme123` |
| `POSTGRES_DB` | Database name | `webapp_db` |
| `DATABASE_URL` | Full database URL | (auto-generated) |
| `JWT_SECRET` | Secret for JWT signing | (change in production) |
| `JWT_EXPIRE` | Token expiration time | `7d` |
| `REACT_APP_API_URL` | API URL for frontend | `http://localhost:5000/api` |

## Troubleshooting

### Containers won't start
```bash
# Clean everything and start fresh
npm run clean
npm run dev:build
```

### Database connection errors
- Ensure PostgreSQL container is healthy: `docker ps`
- Check logs: `docker logs webapp_postgres`

### Frontend can't connect to backend
- Verify backend is running: `docker logs webapp_backend`
- Check REACT_APP_API_URL in .env

## License

MIT

## Contributing

Feel free to submit issues and enhancement requests!
