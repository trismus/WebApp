# Full-Stack Web Application

[![CI Pipeline](https://github.com/trismus/WebApp/workflows/CI%20Pipeline/badge.svg)](https://github.com/trismus/WebApp/actions)
[![CD Pipeline](https://github.com/trismus/WebApp/workflows/CD%20Pipeline/badge.svg)](https://github.com/trismus/WebApp/actions)
[![Version](https://img.shields.io/badge/version-1.1.0-blue.svg)](https://github.com/trismus/WebApp/releases)

A modern full-stack web application built with React, Node.js, PostgreSQL, and Docker with automated CI/CD pipeline and comprehensive user management system.

## Features

### Core Features
- **User Authentication**: JWT-based authentication with secure password hashing
- **Role-Based Access Control**: Hierarchical 3-tier role system (Administrator > Operator > User)
- **Interactive Dashboard**: Real-time statistics and quick actions
- **REST API**: Full-featured backend API with Express.js
- **Database**: PostgreSQL database with proper schema design and materialized views
- **Responsive UI**: Modern, responsive frontend built with React
- **Docker Ready**: Complete Docker setup for easy deployment
- **CI/CD Pipeline**: Automated testing, building, and deployment with GitHub Actions
- **Production Ready**: Nginx reverse proxy, SSL support, and health checks
- **Landing Page**: Beautiful landing page with feature showcase

### User Management System (v1.1.0)
- **Three-Tier Role System**:
  - **Administrator**: Full system access, user management, system settings, all analytics
  - **Operator**: Monitoring & reports, view all activity logs, analytics overview
  - **User**: Basic access, personal profile, own activity logs, personal analytics
- **User Settings**: Theme selection, notifications, language preferences, timezone
- **Activity Tracking**: Complete audit log of all user actions with IP tracking
- **Analytics Dashboard**:
  - Personal analytics with login history and activity trends
  - Operator overview with active user metrics
  - System-wide analytics for administrators
- **Profile Management**: User profiles with role badges and activity statistics

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
- GitHub Actions CI/CD
- Nginx reverse proxy
- Automated testing and deployment

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
- **Application**: http://localhost (Port 80)
- **Application (HTTPS)**: https://localhost (Port 443)
- Backend API: Internal only (proxied through Nginx)
- Frontend: Internal only (proxied through Nginx)
- PostgreSQL: localhost:5432

### First Run

The database will be automatically initialized with:
- Users table with role-based access control
- Activity logs, user settings, and analytics tables
- Materialized views for performance
- Indexes for optimal query performance
- First registered user automatically becomes Administrator

**Note**: Database files are stored in `./PostgreData/data/` for easy backup and portability.

### Test User Account

After installation, create a test admin account:

```bash
curl -X POST http://localhost/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Admin User","email":"admin@example.com","password":"SecurePass123"}'
```

The first registered user will automatically be assigned the **Administrator** role.

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

### Access Points

**Web Application**:
- HTTP: http://localhost
- HTTPS: https://localhost (self-signed certificate)

**Health Check**:
- http://localhost/health
- http://localhost/api/health

### API Endpoints

All API requests are proxied through Nginx and accessible via `/api/*`

#### Public Endpoints
- `GET /api/health` - Health check
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

#### Protected Endpoints (Authenticated Users)
- `GET /api/auth/me` - Get current user information
- `GET /api/settings` - Get user settings
- `PUT /api/settings` - Update user settings
- `GET /api/activity/me` - Get personal activity logs
- `GET /api/activity/stats` - Get activity statistics
- `GET /api/analytics/me` - Get personal analytics

#### Operator/Admin Endpoints
- `GET /api/activity/all` - Get all user activity logs (Operator+)
- `GET /api/analytics/operator` - Get operator analytics overview (Operator+)

#### Administrator Endpoints
- `GET /api/settings/system` - Get system settings (Admin only)
- `GET /api/analytics/system` - Get system-wide analytics (Admin only)
- `POST /api/analytics/refresh` - Refresh analytics data (Admin only)

### Frontend Routes

- `/` - Landing page
- `/login` - Login page
- `/register` - Registration page
- `/dashboard` - User dashboard (protected)
- `/settings` - User settings and preferences (protected)
- `/activity` - Activity logs and tracking (protected)
- `/analytics` - Analytics and insights (protected)

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
│       ├── 01-init.sql     # Database initialization
│       └── 02-add-roles-and-features.sql  # User roles and features
├── nginx/
│   ├── nginx.dev.conf      # Nginx config for development
│   ├── nginx.conf          # Nginx config for production
│   └── ssl/                # SSL certificates (gitignored)
├── PostgreData/
│   └── data/               # PostgreSQL data directory (gitignored)
├── docker-compose.yml      # Development setup
├── docker-compose.prod.yml # Production setup
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

### Database Schema

The application uses a comprehensive PostgreSQL schema:

**Core Tables:**
- `users` - User accounts with role-based access control
- `user_settings` - User preferences (theme, language, notifications, timezone)
- `activity_logs` - Complete audit trail of user actions with IP tracking
- `analytics_events` - Event tracking for analytics

**Views:**
- `user_analytics_summary` - Materialized view for fast analytics queries

**Key Features:**
- Automatic timestamp updates
- Cascading deletes for data integrity
- Optimized indexes for performance
- Role-based constraints (administrator, operator, user)

## User Roles

### Administrator
- Full system access
- User management capabilities
- View and edit system settings
- Access to all analytics data
- Can view all user activities

### Operator
- Monitoring and reporting access
- View all activity logs
- Access to operator analytics
- Read-only system overview
- Cannot modify system settings

### User
- Basic application access
- Personal profile management
- Own activity history
- Personal analytics only
- Customizable user settings

## API Testing

You can test the API using curl or tools like Postman:

### Register a new user:
```bash
curl -X POST http://localhost/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"password123"}'
```

### Login:
```bash
curl -X POST http://localhost/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'
```

### Get current user (with token):
```bash
curl http://localhost/api/auth/me \
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
| `REACT_APP_API_URL` | API URL for frontend | `/api` (relative, proxied through Nginx) |

## CI/CD Pipeline

This project includes automated CI/CD pipelines using GitHub Actions:

### Continuous Integration (CI)
- Automated testing on every push and pull request
- Backend and frontend tests with PostgreSQL service
- Docker image building and validation
- Full stack integration testing

### Continuous Deployment (CD)
- Automatic deployment to production on master/main branch
- Docker images pushed to GitHub Container Registry
- Zero-downtime deployments
- Automatic rollback on failure

### Getting Started with CI/CD

1. **Automatic Testing**: Push code to trigger automated tests
2. **View Pipeline**: Check Actions tab in GitHub repository
3. **Deploy to Production**: See [docs/CICD.md](docs/CICD.md) for deployment setup

For detailed CI/CD documentation, see **[docs/CICD.md](docs/CICD.md)**

## Production Deployment

### Quick Production Setup

1. **On your server:**
```bash
mkdir -p /opt/webapp
cd /opt/webapp
git clone https://github.com/trismus/WebApp.git .
cp .env.production.example .env
# Edit .env with secure production values
docker-compose -f docker-compose.prod.yml up -d
```

2. **Configure GitHub Secrets** for automatic deployment:
   - `SSH_HOST` - Your server IP/hostname
   - `SSH_USER` - SSH username
   - `SSH_PRIVATE_KEY` - SSH private key

See [docs/CICD.md](docs/CICD.md) for complete deployment instructions.

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

### CI/CD Pipeline Issues
- Check GitHub Actions logs
- Verify secrets are configured correctly
- See [docs/CICD.md](docs/CICD.md) for troubleshooting

## Documentation

- [CI/CD Pipeline Documentation](docs/CICD.md) - Complete CI/CD setup and deployment guide
- [API Documentation](#api-endpoints) - API endpoint reference
- [Environment Variables](#environment-variables) - Configuration options

## License

MIT

## Contributing

Feel free to submit issues and enhancement requests!
