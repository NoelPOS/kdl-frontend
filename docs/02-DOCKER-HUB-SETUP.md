# Docker Hub Setup Guide for KDL Application

This guide walks you through setting up Docker Hub repositories for your KDL frontend and backend applications.

## Prerequisites
- Docker Hub account (free tier is sufficient)
- Basic understanding of Docker concepts
- GitHub account for linking repositories

## Step 1: Create Docker Hub Account

### 1.1 Sign Up for Docker Hub
1. Go to [Docker Hub](https://hub.docker.com/)
2. Click "Sign Up" if you don't have an account
3. Verify your email address
4. Note down your Docker Hub username (e.g., `noel770`)

## Step 2: Create Repositories

### 2.1 Create Frontend Repository
1. Log into Docker Hub
2. Click "Create Repository"
3. **Repository Name**: `kdl-frontend`
4. **Visibility**: Public (free tier) or Private (paid)
5. **Description**: "KDL Education Platform - Next.js Frontend"
6. Click "Create"

### 2.2 Create Backend Repository
1. Click "Create Repository" again
2. **Repository Name**: `kdl-backend`
3. **Visibility**: Public (free tier) or Private (paid)
4. **Description**: "KDL Education Platform - NestJS Backend API"
5. Click "Create"

## Step 3: Generate Access Token

### 3.1 Create Personal Access Token
1. Go to Docker Hub Settings
2. Click "Security" tab
3. Click "New Access Token"
4. **Token Description**: `GitHub Actions CI/CD`
5. **Access permissions**: Read, Write, Delete
6. Click "Generate"
7. **IMPORTANT**: Copy the token immediately - you won't see it again!

### 3.2 Store Token Securely
Save this token securely as you'll need it for GitHub Actions:
```
Token Name: GitHub Actions CI/CD
Token: dckr_pat_[YOUR_GENERATED_TOKEN]
```

## Step 4: Test Local Docker Build and Push

### 4.1 Login to Docker Hub Locally
```bash
docker login
# Enter your Docker Hub username and password/token
```

### 4.2 Test Frontend Build and Push
Navigate to your frontend directory:
```bash
cd /path/to/your/kdl-frontend

# Build the image
docker build -t noel770/kdl-frontend:latest .

# Test the image locally
docker run -p 3000:3000 noel770/kdl-frontend:latest

# Push to Docker Hub
docker push noel770/kdl-frontend:latest
```

### 4.3 Test Backend Build and Push
Navigate to your backend directory:
```bash
cd /path/to/your/kdl-backend

# Build the image
docker build -t noel770/kdl-backend:latest .

# Test the image locally
docker run -p 4000:4000 noel770/kdl-backend:latest

# Push to Docker Hub
docker push noel770/kdl-backend:latest
```

## Step 5: Configure Repository Settings

### 5.1 Frontend Repository Settings
1. Go to your `kdl-frontend` repository on Docker Hub
2. Click "Settings" tab
3. **General Settings**:
   - Repository description: "KDL Education Platform - Next.js Frontend Application"
   - Categories: Education, Web Application
4. **Webhooks** (optional):
   - Can be used to trigger deployments when new images are pushed

### 5.2 Backend Repository Settings
1. Go to your `kdl-backend` repository on Docker Hub
2. Click "Settings" tab
3. **General Settings**:
   - Repository description: "KDL Education Platform - NestJS Backend API"
   - Categories: Education, API, Backend
4. **Webhooks** (optional):
   - Can be used to trigger deployments when new images are pushed

## Step 6: Setup Multi-Architecture Builds (Optional but Recommended)

### 6.1 Enable Docker Buildx
```bash
# Create a new builder instance
docker buildx create --name kdl-builder --use

# Bootstrap the builder
docker buildx inspect --bootstrap
```

### 6.2 Build Multi-Architecture Images
For frontend:
```bash
cd /path/to/your/kdl-frontend

# Build for multiple architectures
docker buildx build --platform linux/amd64,linux/arm64 -t noel770/kdl-frontend:latest --push .
```

For backend:
```bash
cd /path/to/your/kdl-backend

# Build for multiple architectures
docker buildx build --platform linux/amd64,linux/arm64 -t noel770/kdl-backend:latest --push .
```

## Step 7: Repository Management Best Practices

### 7.1 Tagging Strategy
Use semantic versioning for your images:
```bash
# Latest (always latest stable)
docker tag noel770/kdl-frontend:latest noel770/kdl-frontend:latest

# Version tags
docker tag noel770/kdl-frontend:latest noel770/kdl-frontend:v1.0.0
docker tag noel770/kdl-frontend:latest noel770/kdl-frontend:v1.0

# Environment tags
docker tag noel770/kdl-frontend:latest noel770/kdl-frontend:production
docker tag noel770/kdl-frontend:latest noel770/kdl-frontend:staging

# Push all tags
docker push noel770/kdl-frontend --all-tags
```

### 7.2 Image Optimization
Add these to your Dockerfiles for smaller images:

**Frontend Dockerfile additions:**
```dockerfile
# Add these for smaller images
RUN npm ci --only=production && npm cache clean --force

# Use multi-stage builds (already implemented)
# Remove unnecessary files
RUN rm -rf .git .gitignore README.md docs/
```

**Backend Dockerfile additions:**
```dockerfile
# Add these for smaller images
RUN npm ci --only=production && npm cache clean --force

# Remove unnecessary files
RUN rm -rf src/ test/ .git .gitignore README.md docs/
```

## Step 8: Security Configuration

### 8.1 Enable Vulnerability Scanning
1. Go to your repository on Docker Hub
2. Click "Settings" tab
3. Enable "Security Scanning" if available
4. This will scan your images for known vulnerabilities

### 8.2 Access Control (For Private Repositories)
1. Go to "Collaborators" tab
2. Add team members with appropriate permissions:
   - **Read**: Can pull images
   - **Write**: Can push and pull images
   - **Admin**: Full repository management

## Step 9: Setup Repository Webhooks (Optional)

### 9.1 Configure Webhook for Auto-deployment
1. Go to repository "Settings" > "Webhooks"
2. **Webhook URL**: Your EC2 deployment endpoint
3. **Events**: Image push
4. This can trigger automatic deployments when new images are pushed

Example webhook payload:
```json
{
  "push_data": {
    "pushed_at": 1234567890,
    "tag": "latest"
  },
  "repository": {
    "name": "kdl-frontend",
    "namespace": "noel770"
  }
}
```

## Step 10: Monitoring and Analytics

### 10.1 Repository Analytics
Monitor your repository usage:
1. **Pulls**: Track how many times your images are downloaded
2. **Stars**: Community engagement
3. **Activity**: Recent pushes and pulls

### 10.2 Size Monitoring
Keep track of image sizes:
```bash
# Check image sizes
docker images noel770/kdl-frontend
docker images noel770/kdl-backend

# Use dive to analyze image layers
docker run --rm -it -v /var/run/docker.sock:/var/run/docker.sock wagoodman/dive:latest noel770/kdl-frontend:latest
```

## Step 11: Automated Cleanup (Optional)

### 11.1 Retention Policy
Set up retention policies to manage old images:
1. Go to repository "Settings" > "General"
2. Set retention rules:
   - Keep last 10 tags
   - Delete untagged images after 7 days

### 11.2 Local Cleanup Script
Create a cleanup script for local development:
```bash
#!/bin/bash
# cleanup.sh

echo "🧹 Cleaning up Docker images..."

# Remove dangling images
docker image prune -f

# Remove old kdl images (keep last 3)
docker images noel770/kdl-frontend --format "table {{.Repository}}:{{.Tag}}\t{{.ID}}\t{{.CreatedAt}}" | tail -n +4 | head -n -3 | awk '{print $2}' | xargs -r docker rmi

docker images noel770/kdl-backend --format "table {{.Repository}}:{{.Tag}}\t{{.ID}}\t{{.CreatedAt}}" | tail -n +4 | head -n -3 | awk '{print $2}' | xargs -r docker rmi

echo "✅ Cleanup complete!"
```

## Troubleshooting

### Common Issues

1. **Authentication Failed**
   ```bash
   docker logout
   docker login
   # Use your username and access token (not password)
   ```

2. **Push Denied**
   - Check repository name matches exactly
   - Verify you have push permissions
   - Ensure access token has write permissions

3. **Image Too Large**
   ```bash
   # Use .dockerignore file
   echo "node_modules" >> .dockerignore
   echo ".git" >> .dockerignore
   echo "*.md" >> .dockerignore
   ```

4. **Build Failures**
   ```bash
   # Check Docker build context
   docker build --no-cache -t test-image .
   
   # Check available space
   docker system df
   ```

## Repository URLs

After setup, your repositories will be available at:
- Frontend: `https://hub.docker.com/r/noel770/kdl-frontend`
- Backend: `https://hub.docker.com/r/noel770/kdl-backend`

Your images can be pulled with:
```bash
docker pull noel770/kdl-frontend:latest
docker pull noel770/kdl-backend:latest
```

## Next Steps

Once your Docker Hub repositories are set up:
1. Configure GitHub Actions to build and push images automatically
2. Update your EC2 deployment scripts to use the new images
3. Test the complete CI/CD pipeline
4. Set up monitoring and alerts for failed builds

## Security Best Practices

- Use access tokens instead of passwords
- Regularly rotate access tokens
- Enable two-factor authentication on Docker Hub
- Use private repositories for sensitive applications
- Regularly scan images for vulnerabilities
- Keep base images updated