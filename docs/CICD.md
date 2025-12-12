# CI/CD Pipeline Documentation

This project uses GitHub Actions for automated testing, building, and deployment.

## Overview

The CI/CD pipeline consists of two main workflows:

1. **CI Pipeline** (`ci.yml`) - Continuous Integration
2. **CD Pipeline** (`cd.yml`) - Continuous Deployment

## CI Pipeline

**Triggers:**
- Push to `master`, `main`, or `develop` branches
- Pull requests to `master`, `main`, or `develop` branches

**Jobs:**

### 1. Test Backend
- Sets up PostgreSQL service for testing
- Installs dependencies
- Runs linting (if configured)
- Runs tests (if configured)
- Environment: Node.js 18

### 2. Test Frontend
- Installs dependencies
- Runs linting (if configured)
- Runs tests (if configured)
- Builds production bundle
- Environment: Node.js 18

### 3. Build Docker Images
- Builds backend Docker image
- Builds frontend Docker image
- Uses Docker layer caching for faster builds
- Runs only if tests pass

### 4. Docker Compose Test
- Starts all services using docker-compose
- Verifies services are healthy
- Tests API endpoints
- Ensures the complete stack works together

## CD Pipeline

**Triggers:**
- Push to `master` or `main` branches
- Git tags matching `v*` (e.g., v1.0.0)
- Manual workflow dispatch

**Jobs:**

### 1. Build and Push Images
- Builds Docker images for backend and frontend
- Tags images with:
  - Branch name
  - Commit SHA
  - Semantic version (for tags)
- Pushes to GitHub Container Registry (ghcr.io)
- Optionally pushes to Docker Hub (if configured)

### 2. Deploy to Server
- Copies deployment files to production server
- Pulls latest Docker images
- Restarts services using docker-compose
- Cleans up old images
- **Only runs for master/main branch**

## Setup Instructions

### 1. Enable GitHub Actions

GitHub Actions should be enabled by default. Verify in your repository settings:
- Go to Settings → Actions → General
- Ensure "Allow all actions and reusable workflows" is selected

### 2. Configure GitHub Container Registry

Images are automatically pushed to GitHub Container Registry. To make them public:

1. Go to your repository on GitHub
2. Navigate to Packages (right sidebar)
3. Click on the package (backend or frontend)
4. Click "Package settings"
5. Change visibility to Public (optional)

### 3. Set Up Deployment (Optional)

To enable automatic deployment to a server, add these secrets to your GitHub repository:

**Repository Secrets** (Settings → Secrets and variables → Actions):

| Secret Name | Description | Example |
|-------------|-------------|---------|
| `SSH_HOST` | Server IP or hostname | `192.168.1.100` or `example.com` |
| `SSH_USER` | SSH username | `ubuntu` or `deploy` |
| `SSH_PRIVATE_KEY` | SSH private key | Contents of `~/.ssh/id_rsa` |
| `SSH_PORT` | SSH port (optional) | `22` (default) |
| `DOCKER_USERNAME` | Docker Hub username (optional) | `yourusername` |
| `DOCKER_PASSWORD` | Docker Hub token (optional) | `dckr_pat_...` |

### 4. Generate SSH Key for Deployment

On your local machine:

```bash
# Generate SSH key
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/github_actions

# Copy public key to server
ssh-copy-id -i ~/.ssh/github_actions.pub user@your-server

# Copy private key content for GitHub secret
cat ~/.ssh/github_actions
```

Add the private key content to the `SSH_PRIVATE_KEY` secret.

### 5. Prepare Production Server

On your production server:

```bash
# Create deployment directory
sudo mkdir -p /opt/webapp
sudo chown $USER:$USER /opt/webapp
cd /opt/webapp

# Install Docker and Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Create .env file
cp .env.production.example .env
nano .env  # Edit with production values
```

**Important:** Update `.env` with secure values:
- Strong `POSTGRES_PASSWORD`
- Unique `JWT_SECRET` (use: `openssl rand -base64 64`)
- Correct `REACT_APP_API_URL`

## Production Deployment

### Manual Deployment

1. **Build images locally:**
```bash
docker-compose -f docker-compose.prod.yml build
```

2. **Push to registry:**
```bash
docker tag webapp-backend:latest ghcr.io/trismus/webapp/backend:latest
docker tag webapp-frontend:latest ghcr.io/trismus/webapp/frontend:latest
docker push ghcr.io/trismus/webapp/backend:latest
docker push ghcr.io/trismus/webapp/frontend:latest
```

3. **Deploy on server:**
```bash
cd /opt/webapp
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d
```

### Automatic Deployment

Push to master/main branch:
```bash
git push origin master
```

The CD pipeline will automatically:
1. Build and push Docker images
2. Deploy to configured server
3. Restart services with zero downtime

### Version Releases

Create a version tag:
```bash
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0
```

This triggers the CD pipeline with semantic versioning.

## Docker Compose Files

### Development: `docker-compose.yml`
- Hot reloading enabled
- Volume mounts for live code updates
- Development environment variables
- Exposed database port for debugging

### Production: `docker-compose.prod.yml`
- Pre-built images from registry
- No volume mounts (immutable containers)
- Production environment variables
- Nginx reverse proxy with SSL support
- Health checks and restart policies
- Network isolation

## Nginx Reverse Proxy

The production setup includes Nginx for:
- **Reverse proxying** frontend and backend
- **SSL/TLS termination** (when configured)
- **Rate limiting** to prevent abuse
- **Security headers** for enhanced security
- **Load balancing** (when scaled)

### SSL Configuration

To enable HTTPS:

1. **Obtain SSL certificate:**
```bash
# Using Let's Encrypt (recommended)
sudo apt-get install certbot
sudo certbot certonly --standalone -d your-domain.com
```

2. **Copy certificates:**
```bash
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem /opt/webapp/nginx/ssl/cert.pem
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem /opt/webapp/nginx/ssl/key.pem
```

3. **Update nginx.conf:**
Uncomment the HTTPS server block in `nginx/nginx.conf`

4. **Restart Nginx:**
```bash
docker-compose -f docker-compose.prod.yml restart nginx
```

## Monitoring and Logs

### View logs:
```bash
# All services
docker-compose -f docker-compose.prod.yml logs -f

# Specific service
docker-compose -f docker-compose.prod.yml logs -f backend

# Last 100 lines
docker-compose -f docker-compose.prod.yml logs --tail=100
```

### Check service health:
```bash
docker-compose -f docker-compose.prod.yml ps
curl http://localhost/api/health
```

### Container resource usage:
```bash
docker stats
```

## Troubleshooting

### Pipeline Failures

**Tests failing:**
- Check test logs in GitHub Actions
- Ensure all dependencies are installed
- Verify database connectivity for backend tests

**Docker build failing:**
- Check Dockerfile syntax
- Ensure base images are accessible
- Verify build context includes necessary files

**Deployment failing:**
- Verify SSH secrets are correct
- Check server disk space
- Ensure Docker is running on server
- Verify network connectivity

### Production Issues

**Services not starting:**
```bash
docker-compose -f docker-compose.prod.yml logs
docker-compose -f docker-compose.prod.yml ps
```

**Database connection errors:**
- Verify `DATABASE_URL` in `.env`
- Check PostgreSQL container is healthy
- Ensure database is initialized

**Cannot pull images:**
- Verify registry authentication
- Check image tags exist
- Ensure network connectivity

## Rollback Procedure

If deployment fails:

```bash
# List available images
docker images

# Tag previous working image
docker tag ghcr.io/trismus/webapp/backend:sha-abc123 ghcr.io/trismus/webapp/backend:latest

# Restart with previous version
docker-compose -f docker-compose.prod.yml up -d
```

## Environment Variables

### Required for Production:
- `POSTGRES_PASSWORD` - Strong database password
- `JWT_SECRET` - Unique secret key for JWT signing
- `REACT_APP_API_URL` - Public API URL

### Optional:
- `IMAGE_TAG` - Specific image version (default: latest)
- `HTTP_PORT` - HTTP port (default: 80)
- `HTTPS_PORT` - HTTPS port (default: 443)

## Security Best Practices

1. **Never commit `.env` files** - Use `.env.example` templates
2. **Rotate secrets regularly** - Update JWT_SECRET, passwords
3. **Use HTTPS in production** - Configure SSL certificates
4. **Keep images updated** - Regularly rebuild with security patches
5. **Limit SSH access** - Use key-based authentication only
6. **Monitor logs** - Watch for suspicious activity
7. **Use rate limiting** - Nginx configuration includes rate limits
8. **Regular backups** - Backup database and configuration

## Backup and Restore

### Backup database:
```bash
docker exec webapp_postgres_prod pg_dump -U webapp_user webapp_db > backup.sql
```

### Restore database:
```bash
cat backup.sql | docker exec -i webapp_postgres_prod psql -U webapp_user -d webapp_db
```

### Backup volumes:
```bash
docker run --rm -v webapp_postgres_data_prod:/data -v $(pwd):/backup alpine tar czf /backup/postgres-backup.tar.gz /data
```

## Performance Optimization

1. **Docker layer caching** - GitHub Actions caches layers
2. **Multi-stage builds** - Reduces image size
3. **Resource limits** - Configure in docker-compose
4. **Database connection pooling** - Already configured
5. **Nginx caching** - Can be enabled for static assets

## Scaling

To scale services:

```bash
# Scale backend to 3 instances
docker-compose -f docker-compose.prod.yml up -d --scale backend=3

# Update Nginx upstream for load balancing
```

## Support

For issues or questions:
- Check GitHub Actions logs
- Review application logs
- Consult main README.md
- Open GitHub issue
