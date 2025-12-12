# Changelog

All notable changes to this project will be documented in this file.

## [1.1.0] - 2025-12-12

### Added - User Management System
- **Three-Tier Role System**: Hierarchical role-based access control (Administrator > Operator > User)
- **Interactive Dashboard**: Real-time statistics dashboard with quick actions and role badges
- **User Settings Module**: Complete settings management with theme, language, notifications, and timezone preferences
- **Activity Tracking System**: Comprehensive audit logging of all user actions with IP tracking and user agent information
- **Analytics Platform**: Multi-level analytics with personal, operator, and system-wide views
- **Role Badges**: Visual role indicators throughout the application
- **Protected Routes**: Role-based route protection for frontend pages

### Database Enhancements
- Added `role` column to users table with CHECK constraint (administrator, operator, user)
- Created `user_settings` table for user preferences
- Created `activity_logs` table for complete audit trail
- Created `analytics_events` table for event tracking
- Implemented `user_analytics_summary` materialized view for performance
- Added automatic triggers for timestamp updates
- Implemented cascading deletes for data integrity
- Created optimized indexes for all new tables

### Backend Features
- **New Middleware**:
  - `roleCheck.js` - Hierarchical role checking with helper functions
  - `activityLogger.js` - Automatic activity logging for all actions
  - Updated `auth.js` - Now includes role information in authentication
- **New Controllers**:
  - `settingsController.js` - User settings and system settings management
  - `activityController.js` - Activity logs and statistics
  - `analyticsController.js` - Multi-view analytics (personal, operator, system)
  - Updated `authController.js` - Role support in registration and login
- **New API Endpoints**:
  - `/api/settings` - GET/PUT user settings
  - `/api/settings/system` - GET system settings (Admin only)
  - `/api/activity/me` - GET personal activity logs
  - `/api/activity/all` - GET all activity logs (Operator+)
  - `/api/activity/stats` - GET activity statistics
  - `/api/analytics/me` - GET personal analytics
  - `/api/analytics/operator` - GET operator analytics (Operator+)
  - `/api/analytics/system` - GET system analytics (Admin only)
  - `/api/analytics/refresh` - POST refresh analytics (Admin only)

### Frontend Features
- **New Pages**:
  - `SettingsPage` - User settings with account and system tabs
  - `ActivityPage` - Activity logs with personal/all view toggle
  - `AnalyticsPage` - Analytics with personal/operator/system views
- **Enhanced Dashboard**:
  - Real-time statistics from API
  - Quick stats overview (activities, logins, active days, events)
  - Clickable navigation cards with gradient hover effects
  - Quick actions section for common tasks
  - Role badge in profile section
  - Last activity timestamp
- **New Components**:
  - `RoleBadge` - Color-coded role badges (purple for Admin, pink for Operator, blue for User)
  - `RoleRoute` - Protected route component with role checking
- **Updated Components**:
  - `Navbar` - Added role badge, Analytics, Activity, and Settings links
  - `useAuth` - Added role helper functions (hasRole, isAdmin, isOperator, isUser)
  - `api.js` - Added all new API endpoints

### Styling Improvements
- New CSS files: `RoleBadge.css`, `SettingsPage.css`, `ActivityPage.css`, `AnalyticsPage.css`
- Updated `Dashboard.css` with clickable cards, quick stats, and quick actions
- Gradient backgrounds and hover effects throughout
- Fully responsive design for mobile devices
- Smooth transitions and animations

### Security Enhancements
- Role-based access control at both API and UI levels
- Activity logging includes IP addresses for security auditing
- Hierarchical permission system prevents privilege escalation
- Protected endpoints verify user roles before granting access

### Performance Optimizations
- Materialized views for fast analytics queries
- Optimized database indexes on all new tables
- Parallel API calls for dashboard statistics
- Efficient query patterns for large datasets

### Documentation
- Updated README with user management system documentation
- Added database schema documentation
- Added user roles documentation
- Updated API endpoints documentation
- Updated frontend routes documentation
- Added v1.1.0 badge to README

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
