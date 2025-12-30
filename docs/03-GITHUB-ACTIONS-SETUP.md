# GitHub Actions CI/CD Setup Guide for KDL Application

This guide walks you through setting up CI/CD pipelines for both your frontend and backend repositories using GitHub Actions.

## Prerequisites
- GitHub account with both frontend and backend repositories
- Docker Hub account with repositories set up
- EC2 instance configured and running
- Basic understanding of GitHub Actions

## Step 1: Setup GitHub Secrets

You'll need to configure secrets in both repositories for secure CI/CD operations.

### 1.1 Frontend Repository Secrets
Go to your frontend repository → Settings → Secrets and variables → Actions

Add the following secrets:

**Docker Hub Secrets:**
- `DOCKER_HUB_USERNAME`: Your Docker Hub username (e.g., `noel770`)
- `DOCKER_HUB_ACCESS_TOKEN`: Your Docker Hub access token

**EC2 Deployment Secrets:**
- `EC2_HOST`: Your EC2 public IP address
- `EC2_USERNAME`: `ubuntu`
- `EC2_SSH_KEY`: Your EC2 private key (.pem file content)

**Environment Variables:**
- `NEXT_PUBLIC_BACKEND_URL`: `http://YOUR_EC2_IP/api`
- `NEXT_PUBLIC_JWT_SECRET`: `123456`
- `AWS_ACCESS_KEY_ID`: Your AWS access key
- `AWS_SECRET_ACCESS_KEY`: Your AWS secret key
- `AWS_S3_BUCKET_NAME`: `kdl-image`

### 1.2 Backend Repository Secrets
Go to your backend repository → Settings → Secrets and variables → Actions

Add the following secrets:

**Docker Hub Secrets:**
- `DOCKER_HUB_USERNAME`: Your Docker Hub username (e.g., `noel770`)
- `DOCKER_HUB_ACCESS_TOKEN`: Your Docker Hub access token

**EC2 Deployment Secrets:**
- `EC2_HOST`: Your EC2 public IP address
- `EC2_USERNAME`: `ubuntu`
- `EC2_SSH_KEY`: Your EC2 private key (.pem file content)

**Environment Variables:**
- `DATABASE_URL`: Your Neon database URL
- `JWT_SECRET`: `123456`
- `JWT_REFRESH_SECRET`: `refresh123456`
- `RESEND_API_KEY`: Your Resend API key
- `RESEND_FROM_EMAIL`: `noreply@noelpos.tech`

## Step 2: Frontend GitHub Actions Workflow

### 2.1 Create Workflow Directory
In your frontend repository, create:
```
.github/
  workflows/
    deploy.yml
```

### 2.2 Frontend Workflow Configuration
Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy Frontend to EC2

on:
  push:
    branches: [ main, master ]
  pull_request:
    branches: [ main, master ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
      
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20'
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Run linting
      run: npm run lint
      
    - name: Run type checking
      run: npm run type-check
      
    - name: Run tests
      run: npm run test
      env:
        NEXT_PUBLIC_BACKEND_URL: ${{ secrets.NEXT_PUBLIC_BACKEND_URL }}
        NEXT_PUBLIC_JWT_SECRET: ${{ secrets.NEXT_PUBLIC_JWT_SECRET }}

  build-and-deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main' || github.ref == 'refs/heads/master'
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
      
    - name: Set up Docker Buildx
      uses: docker/setup-buildx-action@v3
      
    - name: Login to Docker Hub
      uses: docker/login-action@v3
      with:
        username: ${{ secrets.DOCKER_HUB_USERNAME }}
        password: ${{ secrets.DOCKER_HUB_ACCESS_TOKEN }}
        
    - name: Build and push Docker image
      uses: docker/build-push-action@v5
      with:
        context: .
        push: true
        tags: |
          ${{ secrets.DOCKER_HUB_USERNAME }}/kdl-frontend:latest
          ${{ secrets.DOCKER_HUB_USERNAME }}/kdl-frontend:${{ github.sha }}
        build-args: |
          NEXT_PUBLIC_BACKEND_URL=${{ secrets.NEXT_PUBLIC_BACKEND_URL }}
          NEXT_PUBLIC_JWT_SECRET=${{ secrets.NEXT_PUBLIC_JWT_SECRET }}
          NEXT_PUBLIC_AWS_S3_BUCKET_NAME=${{ secrets.AWS_S3_BUCKET_NAME }}
        cache-from: type=gha
        cache-to: type=gha,mode=max
        
    - name: Deploy to EC2
      uses: appleboy/ssh-action@v1.0.0
      with:
        host: ${{ secrets.EC2_HOST }}
        username: ${{ secrets.EC2_USERNAME }}
        key: ${{ secrets.EC2_SSH_KEY }}
        script: |
          cd /home/ubuntu/kdl-app
          
          # Update frontend environment variables
          cat > frontend.env << EOF
          NODE_ENV=production
          PORT=3000
          NEXT_PUBLIC_BACKEND_URL=${{ secrets.NEXT_PUBLIC_BACKEND_URL }}
          NEXT_PUBLIC_JWT_SECRET=${{ secrets.NEXT_PUBLIC_JWT_SECRET }}
          ANALYZE=false
          NEXT_PUBLIC_FORCE_INSECURE_COOKIES=true
          AWS_REGION=us-east-1
          AWS_ACCESS_KEY_ID=${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY=${{ secrets.AWS_SECRET_ACCESS_KEY }}
          AWS_S3_BUCKET_NAME=${{ secrets.AWS_S3_BUCKET_NAME }}
          NEXT_PUBLIC_AWS_S3_BUCKET_NAME=${{ secrets.AWS_S3_BUCKET_NAME }}
          EOF
          
          # Stop frontend container
          docker compose stop frontend
          docker compose rm -f frontend
          
          # Remove old image
          docker image rm ${{ secrets.DOCKER_HUB_USERNAME }}/kdl-frontend:latest 2>/dev/null || true
          
          # Pull latest image
          docker pull ${{ secrets.DOCKER_HUB_USERNAME }}/kdl-frontend:latest
          
          # Start frontend container
          docker compose up -d frontend
          
          # Wait and check health
          sleep 10
          docker compose logs --tail=20 frontend
          
          echo "✅ Frontend deployment completed!"

  notify:
    needs: [test, build-and-deploy]
    runs-on: ubuntu-latest
    if: always()
    
    steps:
    - name: Notify deployment status
      run: |
        if [ "${{ needs.build-and-deploy.result }}" == "success" ]; then
          echo "🎉 Frontend deployment successful!"
        else
          echo "❌ Frontend deployment failed!"
          exit 1
        fi
```

## Step 3: Backend GitHub Actions Workflow

### 3.1 Create Workflow Directory
In your backend repository, create:
```
.github/
  workflows/
    deploy.yml
```

### 3.2 Backend Workflow Configuration
Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy Backend to EC2

on:
  push:
    branches: [ main, master ]
  pull_request:
    branches: [ main, master ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
      
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20'
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Run linting
      run: npm run lint
      
    - name: Run tests
      run: npm run test
      env:
        DATABASE_URL: ${{ secrets.DATABASE_URL }}
        JWT_SECRET: ${{ secrets.JWT_SECRET }}
        
    - name: Build application
      run: npm run build

  build-and-deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main' || github.ref == 'refs/heads/master'
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
      
    - name: Set up Docker Buildx
      uses: docker/setup-buildx-action@v3
      
    - name: Login to Docker Hub
      uses: docker/login-action@v3
      with:
        username: ${{ secrets.DOCKER_HUB_USERNAME }}
        password: ${{ secrets.DOCKER_HUB_ACCESS_TOKEN }}
        
    - name: Build and push Docker image
      uses: docker/build-push-action@v5
      with:
        context: .
        push: true
        tags: |
          ${{ secrets.DOCKER_HUB_USERNAME }}/kdl-backend:latest
          ${{ secrets.DOCKER_HUB_USERNAME }}/kdl-backend:${{ github.sha }}
        cache-from: type=gha
        cache-to: type=gha,mode=max
        
    - name: Deploy to EC2
      uses: appleboy/ssh-action@v1.0.0
      with:
        host: ${{ secrets.EC2_HOST }}
        username: ${{ secrets.EC2_USERNAME }}
        key: ${{ secrets.EC2_SSH_KEY }}
        script: |
          cd /home/ubuntu/kdl-app
          
          # Update backend environment variables
          # Update backend environment variables
          cat > backend.env << EOF
          NODE_ENV=production
          PORT=4000
          DATABASE_ENABLED=true
          DATABASE_URL=${{ secrets.DATABASE_URL }}
          JWT_SECRET=${{ secrets.JWT_SECRET }}
          JWT_EXPIRATION=1d
          JWT_REFRESH_SECRET=${{ secrets.JWT_REFRESH_SECRET }}
          JWT_REFRESH_EXPIRATION=7d
          THROTTLE_TTL=60
          THROTTLE_LIMIT=100
          RESEND_API_KEY=${{ secrets.RESEND_API_KEY }}
          RESEND_FROM_EMAIL=${{ secrets.RESEND_FROM_EMAIL }}
          FRONTEND_URL=https://registrar.kiddeelab.co.th
          CORS_ORIGINS=https://registrar.kiddeelab.co.th,http://localhost:3000
          LINE_CHANNEL_ACCESS_TOKEN=${{ secrets.LINE_CHANNEL_ACCESS_TOKEN }}
          LINE_CHANNEL_SECRET=${{ secrets.LINE_CHANNEL_SECRET }}
          LINE_LIFF_ID=${{ secrets.LINE_LIFF_ID }}
          UNVERIFIED_MENU_ID=${{ secrets.UNVERIFIED_MENU_ID }}
          VERIFIED_MENU_ID=${{ secrets.VERIFIED_MENU_ID }}
          AWS_ACCESS_KEY_ID=${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY=${{ secrets.AWS_SECRET_ACCESS_KEY }}
          AWS_REGION=us-east-1
          AWS_S3_BUCKET=${{ secrets.AWS_S3_BUCKET }}
          EOF
          
          # Stop backend container
          docker compose stop backend
          docker compose rm -f backend
          
          # Remove old image
          docker image rm ${{ secrets.DOCKER_HUB_USERNAME }}/kdl-backend:latest 2>/dev/null || true
          
          # Pull latest image
          docker pull ${{ secrets.DOCKER_HUB_USERNAME }}/kdl-backend:latest
          
          # Start backend container
          docker compose up -d backend
          
          # Wait and check health
          sleep 15
          docker compose logs --tail=20 backend
          
          # Test API health
          curl -f http://localhost:4000/api/health || echo "Health check endpoint not available"
          
          echo "✅ Backend deployment completed!"

  notify:
    needs: [test, build-and-deploy]
    runs-on: ubuntu-latest
    if: always()
    
    steps:
    - name: Notify deployment status
      run: |
        if [ "${{ needs.build-and-deploy.result }}" == "success" ]; then
          echo "🎉 Backend deployment successful!"
        else
          echo "❌ Backend deployment failed!"
          exit 1
        fi
```

## Step 4: Setup Branch Protection Rules

### 4.1 Frontend Repository Protection
1. Go to Settings → Branches
2. Add rule for `main` or `master` branch:
   - Require status checks to pass before merging
   - Require branches to be up to date before merging
   - Required status checks: `test`, `build-and-deploy`
   - Restrict pushes that create files

### 4.2 Backend Repository Protection
1. Go to Settings → Branches  
2. Add rule for `main` or `master` branch:
   - Require status checks to pass before merging
   - Require branches to be up to date before merging
   - Required status checks: `test`, `build-and-deploy`
   - Restrict pushes that create files

## Step 5: Advanced Workflow Features (Optional)

### 5.1 Environment-based Deployments
Create different workflows for staging and production:

**.github/workflows/deploy-staging.yml:**
```yaml
name: Deploy to Staging

on:
  push:
    branches: [ develop, staging ]

# Similar to production workflow but with staging environment variables
```

### 5.2 Manual Deployment Trigger
Add manual trigger to your workflows:
```yaml
on:
  push:
    branches: [ main, master ]
  workflow_dispatch:
    inputs:
      environment:
        description: 'Environment to deploy'
        required: true
        default: 'production'
        type: choice
        options:
        - production
        - staging
```

### 5.3 Rollback Workflow
Create rollback capability:
```yaml
name: Rollback Deployment

on:
  workflow_dispatch:
    inputs:
      image_tag:
        description: 'Docker image tag to rollback to'
        required: true
        default: 'latest'

jobs:
  rollback:
    runs-on: ubuntu-latest
    steps:
    - name: Rollback to previous version
      uses: appleboy/ssh-action@v1.0.0
      with:
        host: ${{ secrets.EC2_HOST }}
        username: ${{ secrets.EC2_USERNAME }}
        key: ${{ secrets.EC2_SSH_KEY }}
        script: |
          cd /home/ubuntu/kdl-app
          docker pull ${{ secrets.DOCKER_HUB_USERNAME }}/kdl-frontend:${{ github.event.inputs.image_tag }}
          docker compose up -d
```

## Step 6: Monitoring and Notifications

### 6.1 Slack Notifications (Optional)
Add Slack notifications to your workflows:
```yaml
- name: Notify Slack
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    channel: '#deployments'
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
  if: always()
```

### 6.2 Email Notifications
GitHub automatically sends email notifications for failed workflows to repository owners.

## Step 7: Testing the Pipeline

### 7.1 Test Frontend Pipeline
1. Make a small change to your frontend code
2. Commit and push to main/master branch
3. Go to Actions tab to watch the workflow
4. Verify the deployment on your EC2 instance

### 7.2 Test Backend Pipeline
1. Make a small change to your backend code
2. Commit and push to main/master branch
3. Go to Actions tab to watch the workflow
4. Verify the API is working on your EC2 instance

## Step 8: Workflow Optimization

### 8.1 Caching Strategy
Your workflows already include caching for:
- npm dependencies
- Docker build layers
- GitHub Actions cache

### 8.2 Parallel Execution
Consider running independent jobs in parallel:
```yaml
jobs:
  test:
    # Test job
  
  security-scan:
    runs-on: ubuntu-latest
    steps:
    - name: Run security audit
      run: npm audit --audit-level high
    
  build-and-deploy:
    needs: [test, security-scan]
    # Deploy job
```

## Step 9: Troubleshooting

### Common Issues

1. **Docker login fails**
   - Check Docker Hub username and token
   - Verify token has write permissions

2. **SSH connection fails**
   - Verify EC2 security group allows SSH from GitHub Actions IPs
   - Check SSH private key format (should include BEGIN/END lines)

3. **Build fails**
   - Check all required secrets are set
   - Verify Dockerfile exists and is correct

4. **Deployment fails**
   - Check EC2 instance has enough disk space
   - Verify Docker is running on EC2

### Debug Commands
Add debugging steps to your workflows:
```yaml
- name: Debug environment
  run: |
    echo "Current directory: $(pwd)"
    echo "Available space: $(df -h)"
    echo "Docker version: $(docker --version)"
```

## Step 10: Security Best Practices

### 10.1 Secret Management
- Use GitHub Secrets for all sensitive data
- Rotate secrets regularly
- Use least privilege principle for access tokens

### 10.2 Image Security
- Scan images for vulnerabilities
- Use specific base image versions
- Remove sensitive data from images

### 10.3 Access Control
- Limit who can trigger deployments  
- Use protected branches
- Require reviews for critical changes

## Next Steps

Once your CI/CD pipelines are working:
1. Set up domain and SSL with Cloudflare
2. Configure monitoring and alerting
3. Plan for database migration to RDS
4. Set up staging environment
5. Implement automated testing strategies

## Workflow Files Summary

After completing this guide, you should have:
- `.github/workflows/deploy.yml` in your frontend repository
- `.github/workflows/deploy.yml` in your backend repository
- All required secrets configured in both repositories
- Branch protection rules enabled
- Working CI/CD pipeline that builds, tests, and deploys automatically

The pipeline will:
1. Trigger on push to main/master
2. Run tests and linting
3. Build Docker images
4. Push to Docker Hub
5. Deploy to EC2
6. Verify deployment health