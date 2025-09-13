# EC2 Setup Guide for KDL Application

This guide walks you through setting up an EC2 instance to host your KDL frontend and backend applications.

## Prerequisites
- AWS Account with billing enabled
- Basic understanding of Linux commands
- SSH client (PuTTY for Windows or built-in SSH for Mac/Linux)

## Step 1: Launch EC2 Instance

### 1.1 Go to AWS Console
1. Log into AWS Console
2. Navigate to EC2 Dashboard
3. Click "Launch Instance"

### 1.2 Configure Instance
1. **Name**: `kdl-production-server`
2. **AMI**: Ubuntu Server 22.04 LTS (Free tier eligible)
3. **Instance Type**: t2.medium (recommended) or t3.medium for better performance
4. **Key Pair**: 
   - Create new key pair named `kdl-server-key`
   - Download the `.pem` file and keep it secure
5. **Network Settings**:
   - Create security group named `kdl-security-group`
   - Allow SSH (port 22) from your IP
   - Allow HTTP (port 80) from anywhere (0.0.0.0/0)
   - Allow HTTPS (port 443) from anywhere (0.0.0.0/0)
   - Allow Custom TCP (port 3000) from anywhere (for testing)
   - Allow Custom TCP (port 4000) from anywhere (for testing)
6. **Storage**: 20 GB gp3 (minimum recommended)

### 1.3 Launch Instance
1. Review settings
2. Click "Launch Instance"
3. Wait for instance to be in "running" state
4. Note down the **Public IPv4 address**

## Step 2: Connect to EC2 Instance

### 2.1 SSH Connection (Linux/Mac)
```bash
chmod 400 kdl-server-key.pem
ssh -i "kdl-server-key.pem" ubuntu@YOUR_EC2_PUBLIC_IP
```

### 2.2 SSH Connection (Windows - using PuTTY)
1. Convert .pem to .ppk using PuTTYgen
2. Use PuTTY to connect:
   - Host: ubuntu@YOUR_EC2_PUBLIC_IP
   - Port: 22
   - Connection > SSH > Auth: Browse to your .ppk file

## Step 3: Initial Server Setup

### 3.1 Update System
```bash
sudo apt update && sudo apt upgrade -y
```

### 3.2 Install Essential Packages
```bash
sudo apt install -y curl wget git unzip software-properties-common apt-transport-https ca-certificates gnupg lsb-release
```

## Step 4: Install Docker

### 4.1 Install Docker Engine
```bash
# Add Docker's official GPG key
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Add Docker repository
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Update package index
sudo apt update

# Install Docker Engine
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

### 4.2 Configure Docker
```bash
# Add current user to docker group
sudo usermod -aG docker ubuntu

# Enable Docker to start on boot
sudo systemctl enable docker
sudo systemctl enable docker

# Log out and log back in for group changes to take effect
exit
```

**Important**: Log back into your EC2 instance after this step.

### 4.3 Verify Docker Installation
```bash
docker --version
docker compose version
```

## Step 5: Install Nginx

### 5.1 Install Nginx
```bash
sudo apt install -y nginx
```

### 5.2 Configure Nginx
```bash
# Remove default configuration
sudo rm /etc/nginx/sites-enabled/default

# Create new configuration
sudo nano /etc/nginx/sites-available/kdl-app
```

Add the following configuration:
```nginx
server {
    listen 80;
    server_name YOUR_DOMAIN_OR_IP;

    # Increase client body size for file uploads
    client_max_body_size 10M;

    # Frontend routes
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header Cookie $http_cookie;
        proxy_pass_header Set-Cookie;
        proxy_buffering off;
        proxy_read_timeout 120s;
    }

    # API routes - backend
    location /api/v1/ {
        proxy_pass http://localhost:4000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header Cookie $http_cookie;
        proxy_pass_header Set-Cookie;
        proxy_set_header Authorization $http_authorization;
        proxy_buffering off;
        proxy_read_timeout 120s;
    }
}
```

### 5.3 Enable Configuration
```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/kdl-app /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx
```

## Step 5.5: Configure SSL with Cloudflare Origin Certificates (Recommended)

### 5.5.1 Generate Cloudflare Origin Certificate
1. Go to your Cloudflare dashboard
2. Navigate to SSL/TLS → Origin Server
3. Click "Create Certificate"
4. Select "Let Cloudflare generate a private key and CSR"
5. Add your hostname: `registrar.kiddeelab.co.th` (or use `*.kiddeelab.co.th` for wildcard)
6. Choose key type: RSA (2048)
7. Certificate validity: 15 years
8. Click "Create"

### 5.5.2 Install Origin Certificate on Server
```bash
# Create SSL directory for Cloudflare certificates
sudo mkdir -p /etc/ssl/cloudflare

# Create certificate file
sudo nano /etc/ssl/cloudflare/cert.pem
```
Paste the certificate content from Cloudflare dashboard.

```bash
# Create private key file
sudo nano /etc/ssl/cloudflare/key.pem
```
Paste the private key content from Cloudflare dashboard.

```bash
# Set proper permissions
sudo chmod 600 /etc/ssl/cloudflare/key.pem
sudo chmod 644 /etc/ssl/cloudflare/cert.pem
```

### 5.5.3 Update Nginx Configuration for SSL
```bash
sudo nano /etc/nginx/sites-available/kdl-app
```

Replace the entire configuration with:
```nginx
server {
    listen 80;
    listen 443 ssl http2;
    server_name registrar.kiddeelab.co.th;

    # Cloudflare Origin Certificate
    ssl_certificate /etc/ssl/cloudflare/cert.pem;
    ssl_certificate_key /etc/ssl/cloudflare/key.pem;
    
    # SSL Settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Increase client body size for file uploads
    client_max_body_size 10M;

    # Frontend routes
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header Cookie $http_cookie;
        proxy_pass_header Set-Cookie;
        proxy_buffering off;
        proxy_read_timeout 120s;
    }

    # API routes - backend
    location /api/v1/ {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header Cookie $http_cookie;
        proxy_pass_header Set-Cookie;
        proxy_set_header Authorization $http_authorization;
        proxy_buffering off;
        proxy_read_timeout 120s;
    }
}
```

### 5.5.4 Test and Restart Nginx
```bash
# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

### 5.5.5 Configure Cloudflare SSL Settings
1. Go to Cloudflare dashboard → SSL/TLS → Overview
2. Set encryption mode to **"Full (strict)"**
3. Go to SSL/TLS → Edge Certificates
4. Enable "Always Use HTTPS"
5. Enable "Automatic HTTPS Rewrites"

## Step 6: Setup Application Directory

### 6.1 Create Application Directory
```bash
# Create directory for your application
sudo mkdir -p /home/ubuntu/kdl-app
cd /home/ubuntu/kdl-app

# Set proper permissions
sudo chown -R ubuntu:ubuntu /home/ubuntu/kdl-app
```

### 6.2 Create Docker Compose File
```bash
nano docker-compose.yml
```

Add the following content:
```yaml
version: '3.8'

services:
  frontend:
    image: noel770/kdl-frontend:latest
    container_name: kdl-frontend
    ports:
      - "3000:3000"
    env_file:
      - frontend.env
    restart: unless-stopped

  backend:
    image: noel770/kdl-backend:latest
    container_name: kdl-backend
    ports:
      - "4000:4000"
    env_file:
      - backend.env
    restart: unless-stopped
```

### 6.3 Create Environment Files
```bash
# Create frontend environment file
nano frontend.env
```

Add your frontend environment variables:
```env
NODE_ENV=production
PORT=3000
NEXT_PUBLIC_BACKEND_URL=http://YOUR_EC2_IP/api
NEXT_PUBLIC_JWT_SECRET=123456
ANALYZE=false
NEXT_PUBLIC_FORCE_INSECURE_COOKIES=true
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=YOUR_AWS_ACCESS_KEY
AWS_SECRET_ACCESS_KEY=YOUR_AWS_SECRET_KEY
AWS_S3_BUCKET_NAME=kdl-image
NEXT_PUBLIC_AWS_S3_BUCKET_NAME=kdl-image
```

```bash
# Create backend environment file
nano backend.env
```

Add your backend environment variables:
```env
NODE_ENV=production
PORT=4000
DATABASE_ENABLED=true
DATABASE_URL=postgresql://neondb_owner:npg_xjoiqb6nT4WC@ep-sweet-thunder-adl4wuxz-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
JWT_SECRET=123456
JWT_EXPIRATION=1d
JWT_REFRESH_SECRET=refresh123456
JWT_REFRESH_EXPIRATION=7d
THROTTLE_TTL=60
THROTTLE_LIMIT=100
SWAGGER_ENABLED=true
RESEND_API_KEY=re_iieK64V7_MExBzdaFKmHY2xMoBtZ8nJ7R
RESEND_FROM_EMAIL="noreply@noelpos.tech"
```

## Step 7: Initial Deployment Test

### 7.1 Pull and Start Services
```bash
# Pull latest images
docker pull noel770/kdl-frontend:latest
docker pull noel770/kdl-backend:latest

# Start services
docker compose up -d

# Check status
docker compose ps
docker compose logs
```

### 7.2 Verify Deployment
1. Open browser and go to `http://YOUR_EC2_IP`
2. Check frontend is loading
3. Test API endpoints at `http://YOUR_EC2_IP/api`

## Step 8: Setup Deployment Script

### 8.1 Create Deployment Script
```bash
nano deploy.sh
```

Add the following content:
```bash
#!/bin/bash

echo "🚀 Starting KDL Deployment..."

# Stop existing containers
echo "📋 Stopping existing containers..."
docker compose down --volumes --remove-orphans

# Remove old images
echo "🗑️ Removing old images..."
docker image rm noel770/kdl-frontend:latest noel770/kdl-backend:latest 2>/dev/null || true

# Clean up Docker system
echo "🧹 Cleaning Docker system..."
docker system prune -f
docker volume prune -f

# Pull latest images
echo "📥 Pulling latest images..."
docker pull noel770/kdl-frontend:latest
docker pull noel770/kdl-backend:latest

# Start services
echo "🔄 Starting services..."
docker compose up -d

# Wait for services to start
echo "⏳ Waiting for services to start..."
sleep 10

# Check service status
echo "📊 Checking service status..."
docker compose logs --tail=20

echo "✅ Deployment complete!"
echo "🌍 Frontend available at: http://$(curl -s ifconfig.me)"
echo "📡 Backend API available at: http://$(curl -s ifconfig.me)/api"
```

### 8.2 Make Script Executable
```bash
chmod +x deploy.sh
```

## Step 9: Configure Firewall (Optional but Recommended)

### 9.1 Setup UFW
```bash
# Install UFW if not installed
sudo apt install -y ufw

# Configure UFW
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable UFW
sudo ufw --force enable

# Check status
sudo ufw status
```

## Step 10: Setup Monitoring (Optional)

### 10.1 Create Health Check Script
```bash
nano health-check.sh
```

Add the following content:
```bash
#!/bin/bash

echo "=== KDL Health Check ==="
echo "Date: $(date)"
echo ""

echo "🐳 Docker Status:"
docker compose ps

echo ""
echo "📊 System Resources:"
free -h
df -h /

echo ""
echo "🌐 Service Health:"
curl -s -o /dev/null -w "Frontend Status: %{http_code}\n" http://localhost:3000
curl -s -o /dev/null -w "Backend Status: %{http_code}\n" http://localhost:4000/api/health

echo ""
echo "📝 Recent Logs:"
docker compose logs --tail=5
```

### 10.2 Make Health Check Executable
```bash
chmod +x health-check.sh
```

## Step 11: Setup Auto-restart (Optional)

### 11.1 Create Systemd Service
```bash
sudo nano /etc/systemd/system/kdl-app.service
```

Add the following content:
```ini
[Unit]
Description=KDL Application
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/home/ubuntu/kdl-app
ExecStart=/usr/bin/docker compose up -d
ExecStop=/usr/bin/docker compose down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
```

### 11.2 Enable Service
```bash
sudo systemctl daemon-reload
sudo systemctl enable kdl-app.service
```

## Troubleshooting

### Common Issues

1. **Docker permission denied**
   ```bash
   sudo usermod -aG docker ubuntu
   # Then logout and login again
   ```

2. **Port already in use**
   ```bash
   sudo netstat -tulpn | grep :80
   sudo systemctl stop apache2  # if Apache is running
   ```

3. **Nginx configuration error**
   ```bash
   sudo nginx -t
   sudo systemctl status nginx
   ```

4. **Container not starting**
   ```bash
   docker compose logs frontend
   docker compose logs backend
   ```

## Next Steps

Once your EC2 instance is set up and running:
1. Proceed to GitHub Actions setup for CI/CD
2. Configure domain and SSL with Cloudflare
3. Set up monitoring and alerts
4. Plan for RDS migration

## Security Notes

- Regularly update your system: `sudo apt update && sudo apt upgrade`
- Monitor your application logs
- Set up proper backup procedures
- Consider using AWS Systems Manager for patch management
- Regularly rotate your SSH keys and access credentials