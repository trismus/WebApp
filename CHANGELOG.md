# Changelog

All notable changes to this project will be documented in this file.

## [1.0.0] - 2025-12-12

### Added
- Full-stack web application with React, Node.js, Express, and PostgreSQL
- JWT-based user authentication system
- Responsive landing page with feature showcase
- User dashboard with profile information
- Docker and Docker Compose setup for easy deployment
- Nginx reverse proxy for HTTP (80) and HTTPS (443) access
- Self-signed SSL certificate for development HTTPS
- GitHub Actions CI/CD pipeline
  - Automated testing on push and pull requests
  - Docker image building and caching
  - Deployment to production servers
- Complete API with user registration and login
- PostgreSQL database with automatic initialization
- Environment-based configuration
- Comprehensive documentation

### Features
- **Frontend**: React 18 with React Router, custom hooks, and modern UI
- **Backend**: Node.js/Express with RESTful API endpoints
- **Database**: PostgreSQL with proper schema and indexes
- **Authentication**: Secure JWT tokens with bcrypt password hashing
- **Reverse Proxy**: Nginx with SSL/TLS support and security headers
- **DevOps**: Complete Docker setup with development and production configurations
- **CI/CD**: Automated testing, building, and deployment via GitHub Actions
- **Data Persistence**: PostgreSQL data stored in `./PostgreData/data/` directory

### Architecture
- Multi-container Docker setup (Frontend, Backend, Database, Nginx)
- Internal service communication via Docker network
- All external access through Nginx reverse proxy on ports 80/443
- Frontend and Backend not directly exposed to host

### Security
- Passwords hashed with bcryptjs
- JWT token-based authentication
- CORS enabled
- Input validation on all endpoints
- Security headers via Nginx (X-Frame-Options, X-Content-Type-Options, etc.)
- Rate limiting configured in Nginx
- Self-signed SSL for development, production-ready SSL support

### Database
- Users table with email uniqueness constraint
- Automatic timestamp updates
- Database initialization scripts
- Sample test users for development

### Documentation
- Comprehensive README with setup instructions
- CI/CD documentation with deployment guide
- API endpoint documentation
- Environment variable reference
- Troubleshooting guide
- Production deployment instructions

### Default Test Users
- `test@example.com` / `password123`
- `demo@example.com` / `password123`

## Access
- **HTTP**: http://localhost
- **HTTPS**: https://localhost (self-signed certificate)
- **Health Check**: http://localhost/health
- **API**: http://localhost/api/*
