# Cloudflare Domain & SSL Setup Guide for KDL Application

This guide walks you through setting up a custom domain with SSL certificates using Cloudflare for your KDL application hosted on EC2.

## Prerequisites
- Cloudflare account (free tier is sufficient)
- Domain name (you can purchase through Cloudflare or transfer existing domain)
- EC2 instance running with your application
- Basic understanding of DNS concepts

## Step 1: Domain Setup

### 1.1 Purchase or Transfer Domain to Cloudflare

**Option A: Purchase New Domain**
1. Log into Cloudflare dashboard
2. Go to "Domain Registration"
3. Search for your desired domain (e.g., `kdleducation.com`)
4. Complete purchase process

**Option B: Transfer Existing Domain**
1. Log into Cloudflare dashboard
2. Click "Add Site"
3. Enter your domain name
4. Follow the setup wizard
5. Update nameservers at your current registrar

### 1.2 Add Domain to Cloudflare (If not purchased through Cloudflare)
1. Log into Cloudflare dashboard
2. Click "Add a Site"
3. Enter your domain name (e.g., `kdleducation.com`)
4. Select the Free plan
5. Cloudflare will scan your existing DNS records
6. Review and import the records
7. Update your domain's nameservers to:
   ```
   alba.ns.cloudflare.com
   finn.ns.cloudflare.com
   ```
   (Note: Your specific nameservers will be provided by Cloudflare)

**Note**: Since you're using a subdomain for your registration system and the root domain for your landing page, you'll only need to add DNS records for your subdomain in the next step.

## Step 2: DNS Configuration

### 2.1 Configure DNS Records
In your Cloudflare dashboard → DNS → Records:

**Add A Records for Registration System Subdomain:**

1. **Registration System Subdomain (A Record)**
   - Type: `A`
   - Name: `app` (or `register`, `admin`, `system` - choose your preferred subdomain)
   - IPv4 Address: `YOUR_EC2_PUBLIC_IP`
   - TTL: `Auto`
   - Proxy Status: `Proxied` (orange cloud)

**Example subdomains you could use:**
- `app.kdleducation.com` (recommended)
- `register.kdleducation.com`
- `admin.kdleducation.com`
- `system.kdleducation.com`

**Note**: Your root domain (`kdleducation.com`) will continue to point to your landing page server, and only the subdomain will point to your EC2 instance with the registration system.

### 2.2 Configure Additional Subdomains (Optional)
If you need additional subdomains for different environments:

**Staging Environment:**
```
Type: A
Name: staging
IPv4 Address: YOUR_STAGING_EC2_IP (if different)
Proxy Status: Proxied
```

**API Subdomain (if you want separate API access):**
```
Type: CNAME
Name: api
Target: app.kdleducation.com
Proxy Status: Proxied
```

## Step 3: SSL/TLS Configuration

### 3.1 Configure SSL/TLS Settings
Go to SSL/TLS → Overview:

1. **Encryption Mode**: Select `Flexible` (initially)
   - This allows HTTPS between user and Cloudflare
   - HTTP between Cloudflare and your server

2. **Always Use HTTPS**: Enable this setting
   - SSL/TLS → Edge Certificates → Always Use HTTPS: `On`

3. **Automatic HTTPS Rewrites**: Enable
   - SSL/TLS → Edge Certificates → Automatic HTTPS Rewrites: `On`

### 3.2 Configure Edge Certificates
Go to SSL/TLS → Edge Certificates:

1. **Universal SSL**: Should be enabled by default
2. **Always Use HTTPS**: `On`
3. **HTTP Strict Transport Security (HSTS)**: 
   - Enable HSTS: `On`
   - Max Age Header: `6 months`
   - Include Subdomains: `On`
   - Preload: `On`

## Step 4: Update Application Configuration

### 4.1 Update Frontend Environment Variables
SSH into your EC2 instance and update the frontend environment file:

```bash
ssh -i "kdl-server-key.pem" ubuntu@YOUR_EC2_IP
cd /home/ubuntu/kdl-app
nano frontend.env
```

Update the following variables:
```env
NODE_ENV=production
PORT=3000
NEXT_PUBLIC_BACKEND_URL=https://app.your-domain.com/api
NEXT_PUBLIC_JWT_SECRET=123456
ANALYZE=false

# Remove this line for HTTPS
# NEXT_PUBLIC_FORCE_INSECURE_COOKIES=true

# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=YOUR_AWS_ACCESS_KEY
AWS_SECRET_ACCESS_KEY=YOUR_AWS_SECRET_KEY
AWS_S3_BUCKET_NAME=kdl-image
NEXT_PUBLIC_AWS_S3_BUCKET_NAME=kdl-image
```

### 4.2 Update Backend Environment Variables
```bash
nano backend.env
```

No changes needed for backend, but verify:
```env
NODE_ENV=production
PORT=4000
DATABASE_ENABLED=true
DATABASE_URL=your_neon_database_url
JWT_SECRET=123456
JWT_EXPIRATION=1d
JWT_REFRESH_SECRET=refresh123456
JWT_REFRESH_EXPIRATION=7d
THROTTLE_TTL=60
THROTTLE_LIMIT=100
SWAGGER_ENABLED=true
RESEND_API_KEY=your_resend_key
RESEND_FROM_EMAIL="noreply@your-domain.com"
```

## Step 5: Update Nginx Configuration

### 5.1 Update Nginx Configuration for HTTPS
```bash
sudo nano /etc/nginx/sites-available/kdl-app
```

Replace the configuration with:
```nginx
server {
    listen 80;
    server_name app.your-domain.com;

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
        
        # Cookie handling
        proxy_set_header Cookie $http_cookie;
        proxy_pass_header Set-Cookie;
        
        # Disable buffering for real-time features
        proxy_buffering off;
        proxy_read_timeout 120s;
    }

    # API routes - backend
    location /api/ {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Critical: Preserve cookies and headers
        proxy_set_header Cookie $http_cookie;
        proxy_pass_header Set-Cookie;
        proxy_set_header Authorization $http_authorization;
        
        # CORS headers for cookie support
        add_header 'Access-Control-Allow-Origin' '$http_origin' always;
        add_header 'Access-Control-Allow-Credentials' 'true' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'Accept,Authorization,Cache-Control,Content-Type,DNT,If-Modified-Since,Keep-Alive,Origin,User-Agent,X-Requested-With' always;
        
        # Handle preflight requests
        if ($request_method = 'OPTIONS') {
            add_header 'Access-Control-Allow-Origin' '$http_origin';
            add_header 'Access-Control-Allow-Credentials' 'true';
            add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS';
            add_header 'Access-Control-Allow-Headers' 'Accept,Authorization,Cache-Control,Content-Type,DNT,If-Modified-Since,Keep-Alive,Origin,User-Agent,X-Requested-With';
            add_header 'Access-Control-Max-Age' 1728000;
            add_header 'Content-Type' 'text/plain; charset=utf-8';
            add_header 'Content-Length' 0;
            return 204;
        }
        
        proxy_buffering off;
        proxy_read_timeout 120s;
    }
}
```

### 5.2 Test and Restart Nginx
```bash
# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

## Step 6: Restart Application with New Configuration

### 6.1 Restart Docker Containers
```bash
cd /home/ubuntu/kdl-app

# Stop containers
docker compose down

# Pull latest images (if updated)
docker pull noel770/kdl-frontend:latest
docker pull noel770/kdl-backend:latest

# Start with new configuration
docker compose up -d

# Check status
docker compose ps
docker compose logs
```

## Step 7: Cloudflare Performance Optimization

### 7.1 Configure Caching Rules
Go to Caching → Configuration:

1. **Caching Level**: `Standard`
2. **Browser Cache TTL**: `4 hours`
3. **Always Online**: `On`

### 7.2 Configure Page Rules
Go to Rules → Page Rules:

**Rule 1: Cache Static Assets**
- URL Pattern: `app.your-domain.com/*.css`
- Settings:
  - Cache Level: `Cache Everything`
  - Edge Cache TTL: `1 month`
  - Browser Cache TTL: `1 month`

**Rule 2: Cache Images**
- URL Pattern: `app.your-domain.com/*.jpg`
- Settings:
  - Cache Level: `Cache Everything`
  - Edge Cache TTL: `1 month`

**Rule 3: Cache API Responses (Optional)**
- URL Pattern: `app.your-domain.com/api/public/*`
- Settings:
  - Cache Level: `Cache Everything`
  - Edge Cache TTL: `5 minutes`

### 7.3 Configure Speed Optimization
Go to Speed → Optimization:

1. **Auto Minify**: Enable HTML, CSS, JS
2. **Rocket Loader**: `Off` (can cause issues with React/Next.js)
3. **Mirage**: `On`
4. **Polish**: `Lossless`

## Step 8: Security Configuration

### 8.1 Configure Security Settings
Go to Security → Settings:

1. **Security Level**: `Medium`
2. **Challenge Passage**: `30 minutes`
3. **Browser Integrity Check**: `On`

### 8.2 Configure Firewall Rules (Optional)
Go to Security → WAF:

Create rules to protect your application:
```
Rule 1: Block malicious countries
Expression: (ip.geoip.country in {"CN" "RU"}) and not (http.user_agent contains "GoogleBot")
Action: Block

Rule 2: Rate limiting for subdomain
Expression: (http.host eq "app.your-domain.com") and (http.request.uri.path contains "/api/")
Action: Challenge
Rate: 100 requests per minute
```

## Step 9: Configure Origin Server (Optional but Recommended)

For enhanced security, configure Origin CA certificates:

### 9.1 Generate Origin Certificate
Go to SSL/TLS → Origin Server:

1. Click "Create Certificate"
2. Select "Let Cloudflare generate a private key and CSR"
3. List hostnames: `app.your-domain.com` (or use `*.your-domain.com` for all subdomains)
4. Choose key type: `RSA (2048)`
5. Certificate validity: `15 years`
6. Click "Create"

### 9.2 Install Origin Certificate on Server
```bash
# Create SSL directory
sudo mkdir -p /etc/ssl/cloudflare

# Save the certificate
sudo nano /etc/ssl/cloudflare/cert.pem
# Paste the certificate content

# Save the private key
sudo nano /etc/ssl/cloudflare/key.pem
# Paste the private key content

# Set proper permissions
sudo chmod 600 /etc/ssl/cloudflare/key.pem
sudo chmod 644 /etc/ssl/cloudflare/cert.pem
```

### 9.3 Update Nginx for Full SSL
```bash
sudo nano /etc/nginx/sites-available/kdl-app
```

Add HTTPS server block:
```nginx
server {
    listen 80;
    server_name app.your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name app.your-domain.com;
    
    ssl_certificate /etc/ssl/cloudflare/cert.pem;
    ssl_certificate_key /etc/ssl/cloudflare/key.pem;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;

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
        proxy_set_header X-Forwarded-Proto https;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header Cookie $http_cookie;
        proxy_pass_header Set-Cookie;
        proxy_buffering off;
        proxy_read_timeout 120s;
    }

    # API routes - backend
    location /api/ {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header Cookie $http_cookie;
        proxy_pass_header Set-Cookie;
        proxy_set_header Authorization $http_authorization;
        proxy_buffering off;
        proxy_read_timeout 120s;
    }
}
```

## Step 10: Update GitHub Actions Secrets

Update your GitHub repository secrets:

**Frontend Repository:**
- `NEXT_PUBLIC_BACKEND_URL`: `https://app.your-domain.com/api`

**Backend Repository:**
- `RESEND_FROM_EMAIL`: `noreply@your-domain.com` (can still use root domain for email)

## Step 11: Testing and Verification

### 11.1 Test Domain Resolution
```bash
# Test DNS resolution for your subdomain
nslookup app.your-domain.com
dig app.your-domain.com

# Test HTTPS
curl -I https://app.your-domain.com
```

### 11.2 Test SSL Certificate
1. Visit `https://app.your-domain.com` in browser
2. Check for green lock icon
3. Use SSL testing tools:
   - SSL Labs: https://www.ssllabs.com/ssltest/
   - Cloudflare SSL test

### 11.3 Test Application Functionality
1. Frontend: `https://app.your-domain.com`
2. Backend API: `https://app.your-domain.com/api`
3. Test all major features
4. Check browser console for errors

### 11.4 Performance Testing
1. Use PageSpeed Insights: https://pagespeed.web.dev/
2. Check Cloudflare Analytics
3. Monitor application performance

## Step 12: Monitoring and Maintenance

### 12.1 Configure Cloudflare Analytics
1. Go to Analytics & Logs → Web Analytics
2. Enable Web Analytics
3. Monitor traffic, performance, and security events

### 12.2 Set Up Health Monitoring
Create a simple health monitoring script:
```bash
#!/bin/bash
# health-monitor.sh

SUBDOMAIN="app.your-domain.com"
EMAIL="your-email@example.com"

# Check registration system health
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" https://$SUBDOMAIN)

if [ $RESPONSE -ne 200 ]; then
    echo "Registration system down! HTTP Status: $RESPONSE" | mail -s "Registration System Alert" $EMAIL
fi

# Check API health
API_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" https://$SUBDOMAIN/api/health)

if [ $API_RESPONSE -ne 200 ]; then
    echo "Registration API down! HTTP Status: $API_RESPONSE" | mail -s "API Alert" $EMAIL
fi
```

### 12.3 Regular Maintenance Tasks
- Monitor SSL certificate expiration
- Review Cloudflare security logs
- Update DNS records if EC2 IP changes
- Review and optimize caching rules

## Troubleshooting

### Common Issues

1. **502 Bad Gateway**
   - Check if containers are running: `docker compose ps`
   - Check Nginx configuration: `sudo nginx -t`
   - Check container logs: `docker compose logs`

2. **SSL Certificate Issues**
   - Wait up to 24 hours for SSL provisioning
   - Check Cloudflare SSL/TLS settings
   - Verify DNS records are proxied (orange cloud)

3. **Mixed Content Warnings**
   - Ensure all resources use HTTPS
   - Check for hardcoded HTTP URLs in code
   - Enable "Automatic HTTPS Rewrites" in Cloudflare

4. **CORS Issues**
   - Update CORS settings in backend
   - Check Nginx proxy headers
   - Verify domain matches in environment variables

### Debug Commands
```bash
# Check DNS resolution
dig app.your-domain.com

# Check SSL certificate
openssl s_client -connect app.your-domain.com:443 -servername app.your-domain.com

# Check Nginx configuration
sudo nginx -t

# Check container status
docker compose ps
docker compose logs --tail=50
```

## Security Best Practices

1. **Enable all Cloudflare security features**
2. **Use strong SSL/TLS configuration**
3. **Regularly update SSL certificates**
4. **Monitor security logs**
5. **Use Web Application Firewall (WAF) rules**
6. **Enable DDoS protection**
7. **Configure rate limiting**

## Next Steps

Once your domain and SSL are configured:
1. Test the complete application workflow
2. Set up monitoring and alerting
3. Plan for RDS database migration
4. Implement backup and disaster recovery
5. Consider CDN optimization for static assets
6. Set up staging environment with subdomain

## Summary

After completing this guide, you should have:
- Custom domain pointing to your EC2 instance
- SSL/TLS encryption with automatic certificate management
- Cloudflare security and performance optimizations
- Proper application configuration for HTTPS
- Monitoring and maintenance procedures in place

Your application will be accessible at:
- Registration System: `https://app.your-domain.com`
- API: `https://app.your-domain.com/api`
- Admin panel: `https://app.your-domain.com/admin` (if applicable)
- Landing page: `https://your-domain.com` (remains on your existing server)