# KDL Education Platform - Complete DevOps Setup Guide

This repository contains comprehensive documentation for setting up a complete CI/CD pipeline and production infrastructure for the KDL Education Platform.

## 🎯 Overview

This guide will help you set up:
- ✅ AWS EC2 production server
- ✅ Docker Hub repositories for containerized deployment
- ✅ GitHub Actions CI/CD pipelines
- ✅ Custom domain with SSL certificates via Cloudflare
- ✅ Database migration from Neon to AWS RDS

## 📋 Prerequisites

Before starting, ensure you have:
- AWS Account with billing enabled
- GitHub account with frontend and backend repositories
- Docker Hub account
- Cloudflare account
- Domain name (can be purchased through Cloudflare)
- Basic understanding of Docker, CI/CD, and cloud services

## 🚀 Quick Start

Follow these guides in order for a complete setup:

### 1. [EC2 Server Setup](./docs/01-EC2-SETUP.md)
Set up your AWS EC2 instance with Docker, Nginx, and all necessary dependencies.

**What you'll accomplish:**
- Launch and configure EC2 instance
- Install Docker and Docker Compose
- Configure Nginx as reverse proxy
- Set up security groups and firewall
- Create deployment scripts

**Time required:** ~2-3 hours

### 2. [Docker Hub Setup](./docs/02-DOCKER-HUB-SETUP.md)
Create Docker repositories and configure container registry for your applications.

**What you'll accomplish:**
- Create Docker Hub repositories for frontend and backend
- Generate access tokens for CI/CD
- Configure multi-architecture builds
- Set up image optimization and security scanning

**Time required:** ~1 hour

### 3. [GitHub Actions CI/CD](./docs/03-GITHUB-ACTIONS-SETUP.md)
Implement automated build, test, and deployment pipelines.

**What you'll accomplish:**
- Configure GitHub secrets for both repositories
- Set up automated testing and linting
- Create Docker build and push workflows
- Implement automated deployment to EC2
- Configure branch protection rules

**Time required:** ~2-3 hours

### 4. [Domain & SSL Setup](./docs/04-CLOUDFLARE-DOMAIN-SSL.md)
Configure custom domain with SSL certificates and CDN optimization.

**What you'll accomplish:**
- Set up custom domain with Cloudflare
- Configure DNS records and SSL certificates
- Implement security and performance optimizations
- Update application configuration for HTTPS
- Set up monitoring and analytics

**Time required:** ~2-4 hours

### 5. [Database Migration to RDS](./docs/05-RDS-MIGRATION.md)
Migrate from Neon to AWS RDS for better performance and integration.

**What you'll accomplish:**
- Create and configure AWS RDS PostgreSQL instance
- Migrate schema and data from Neon
- Update application configuration
- Set up backups and monitoring
- Optimize database performance

**Time required:** ~3-4 hours

## 🏗️ Architecture Overview

After completing all guides, your architecture will look like this:

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Developer     │────│   GitHub Repo    │────│  GitHub Actions │
│                 │    │  (Frontend/      │    │   CI/CD         │
└─────────────────┘    │   Backend)       │    └─────────────────┘
                       └──────────────────┘             │
                                                        │ Build & Push
                                                        ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   End Users     │────│   Cloudflare     │────│   Docker Hub    │
│                 │    │   (CDN + SSL)    │    │  (Container     │
└─────────────────┘    └──────────────────┘    │   Registry)     │
         │                        │             └─────────────────┘
         │ HTTPS                  │ HTTP/HTTPS           │
         ▼                        ▼                      │ Pull Images
┌─────────────────┐    ┌──────────────────┐             │
│  your-domain    │────│   AWS EC2        │◄────────────┘
│  .com           │    │   (Nginx +       │
└─────────────────┘    │    Docker)       │
                       └──────────────────┘
                                │
                                │ Database Connection
                                ▼
                       ┌──────────────────┐
                       │   AWS RDS        │
                       │  (PostgreSQL)    │
                       └──────────────────┘
```

## 📚 Repository Structure

```
kdl-frontend/
├── docs/
│   ├── 01-EC2-SETUP.md              # EC2 server configuration
│   ├── 02-DOCKER-HUB-SETUP.md       # Docker repository setup
│   ├── 03-GITHUB-ACTIONS-SETUP.md   # CI/CD pipeline configuration
│   ├── 04-CLOUDFLARE-DOMAIN-SSL.md  # Domain and SSL setup
│   └── 05-RDS-MIGRATION.md          # Database migration guide
├── .github/
│   └── workflows/
│       └── deploy.yml               # GitHub Actions workflow (to be created)
├── Dockerfile                       # Container configuration
├── docker-compose.yml              # Local development setup
├── frontend.env                     # Environment variables
└── README.md                       # This file
```

## 🔧 Environment Configuration

### Frontend Repository Secrets
Configure these secrets in your frontend GitHub repository:
```
# Docker & Deployment
DOCKER_HUB_USERNAME=noel770
DOCKER_HUB_ACCESS_TOKEN=your_token
EC2_HOST=98.91.29.102
EC2_USERNAME=ubuntu
EC2_SSH_KEY=your_private_key_content

# App Config
NEXT_PUBLIC_BACKEND_URL=https://registrar.kiddeelab.co.th/api
NEXT_PUBLIC_API_URL=https://registrar.kiddeelab.co.th:4000
NEXT_PUBLIC_JWT_SECRET=123456
NEXT_PUBLIC_LIFF_ID=2008403698-g6d9DA22
ANALYZE=false
NEXT_PUBLIC_FORCE_INSECURE_COOKIES=true

# AWS S3 (For Uploads)
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=kiddee-lab-lms
NEXT_PUBLIC_AWS_S3_BUCKET_NAME=kiddee-lab-lms
```

### Backend Repository Secrets
Configure these secrets in your backend GitHub repository:
```
# Docker & Deployment
DOCKER_HUB_USERNAME=noel770
DOCKER_HUB_ACCESS_TOKEN=your_token
EC2_HOST=98.91.29.102
EC2_USERNAME=ubuntu
EC2_SSH_KEY=your_private_key_content

# Database & App
DATABASE_URL=postgresql://... (RDS Endpoint)
JWT_SECRET=123456
JWT_EXPIRATION=1d
JWT_REFRESH_SECRET=refresh123456
JWT_REFRESH_EXPIRATION=7d
THROTTLE_TTL=60
THROTTLE_LIMIT=100
SWAGGER_ENABLED=true

# External Services
RESEND_API_KEY=your_resend_key
RESEND_FROM_EMAIL=noreply@noelpos.tech

# Integration (LINE)
LINE_CHANNEL_ACCESS_TOKEN=your_line_token
LINE_CHANNEL_SECRET=your_line_secret
LINE_LIFF_ID=2008403698-g6d9DA22
UNVERIFIED_MENU_ID=richmenu-7d03576ea166ce848e8a070d7cebf20f
VERIFIED_MENU_ID=richmenu-e5c3660093c845ffbac1a5c3f4afc12e

# App Security & CORS
FRONTEND_URL=https://registrar.kiddeelab.co.th
CORS_ORIGINS=https://registrar.kiddeelab.co.th,http://localhost:3000

# AWS S3
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_REGION=us-east-1
AWS_S3_BUCKET=kiddee-lab-lms
```

## 🚦 Deployment Workflow

Once set up, your deployment process will be:

1. **Developer pushes code** to main/master branch
2. **GitHub Actions triggers** automatically
3. **Tests run** (linting, type checking, unit tests)
4. **Docker image builds** with optimized layers
5. **Image pushes** to Docker Hub
6. **EC2 deployment** via SSH
7. **Health checks** verify deployment
8. **Notifications** sent on completion

## 📊 Monitoring and Maintenance

After setup, monitor these aspects:

### Application Health
- Frontend availability: `https://your-domain.com`
- Backend API: `https://your-domain.com/api/health`
- Database connectivity and performance

### Infrastructure Monitoring
- EC2 instance resources (CPU, memory, disk)
- Docker container status and logs
- SSL certificate expiration
- DNS resolution and CDN performance

### Security Monitoring
- Cloudflare security events
- AWS security groups and access logs
- Docker image vulnerability scans
- Database connection auditing

## 🛠️ Troubleshooting

### Common Issues and Solutions

1. **GitHub Actions failing**
   - Check all secrets are configured correctly
   - Verify Docker Hub access token permissions
   - Ensure EC2 security group allows SSH

2. **SSL certificate issues**
   - Wait up to 24 hours for certificate provisioning
   - Verify DNS records are proxied (orange cloud in Cloudflare)
   - Check domain nameservers are pointing to Cloudflare

3. **Database connection problems**
   - Verify RDS security group allows EC2 access
   - Check database credentials and connection string
   - Ensure RDS instance is in same VPC as EC2

4. **Application not loading**
   - Check Docker container status: `docker compose ps`
   - Review application logs: `docker compose logs`
   - Verify Nginx configuration: `sudo nginx -t`

## 🔄 Maintenance Schedule

### Weekly
- Review GitHub Actions workflow runs
- Check application and server logs
- Monitor disk space and resource usage

### Monthly
- Update Docker base images
- Review and rotate access credentials
- Analyze performance metrics
- Update dependencies

### Quarterly
- Review and update security configurations
- Optimize database performance
- Evaluate infrastructure costs
- Plan capacity scaling

## 📈 Scaling Considerations

As your application grows, consider:

### Performance Optimization
- **CDN**: Leverage Cloudflare's global CDN
- **Database**: Implement read replicas and connection pooling
- **Caching**: Add Redis for application-level caching
- **Load Balancing**: Multiple EC2 instances with ALB

### Infrastructure Scaling
- **Auto Scaling**: EC2 Auto Scaling Groups
- **Container Orchestration**: Amazon ECS or EKS
- **Database**: RDS Multi-AZ and read replicas
- **Monitoring**: Enhanced CloudWatch monitoring

### Cost Optimization
- **Reserved Instances**: For predictable workloads
- **Spot Instances**: For non-critical workloads
- **Storage Optimization**: Lifecycle policies for S3
- **Resource Right-sizing**: Regular capacity planning

## 🤝 Contributing

When making changes to the infrastructure:

1. **Test in staging** environment first
2. **Document changes** in relevant guide files
3. **Update scripts** and configuration examples
4. **Notify team members** of infrastructure changes

## 📞 Support

For issues with this setup:

1. **Check troubleshooting sections** in each guide
2. **Review logs** from GitHub Actions, Docker, and application
3. **Verify configurations** against the documentation
4. **Test components individually** to isolate issues

## 📝 Next Steps

After completing the basic setup:

1. **Set up staging environment** with subdomain
2. **Implement comprehensive monitoring** with CloudWatch
3. **Create disaster recovery plan** and test backups
4. **Set up log aggregation** with ELK stack or CloudWatch Logs
5. **Implement automated testing** strategies
6. **Plan for high availability** with multi-region deployment

## 🏁 Conclusion

This complete setup provides you with:
- **Production-ready infrastructure** on AWS
- **Automated CI/CD pipeline** with GitHub Actions
- **Secure HTTPS access** with custom domain
- **Scalable database solution** with RDS
- **Monitoring and maintenance** procedures

The infrastructure is designed to be:
- **Secure**: SSL certificates, private networking, access controls
- **Scalable**: Can grow with your application needs
- **Reliable**: Automated backups, health checks, monitoring
- **Cost-effective**: Optimized resource usage and scaling

Follow each guide step-by-step, and you'll have a professional-grade deployment pipeline for your KDL Education Platform.

---

**Happy Deploying! 🚀**