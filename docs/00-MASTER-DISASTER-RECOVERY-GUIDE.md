# 🚨 Master Disaster Recovery & Setup Guide

**Use this guide if you need to rebuild the entire Kiddee Lab LMS infrastructure from scratch.**

This document outlines the sequential steps to restore the production environment, assuming you have access to the source code and AWS/Cloudflare accounts.

---

## 🛑 Phase 0: Prerequisites & Critical Access

Before starting, ensure you have login access to:
1.  **AWS Console** (us-east-1 region)
2.  **Cloudflare Dashboard** (Kiddee Lab account)
3.  **GitHub Repository** (Admin access to settings/secrets)
4.  **Neon/RDS Database Credentials** (Connection string)

---

## 🏗️ Phase 1: AWS Infrastructure (Launch Resources)

### 1.1 Launch EC2 Instance
- **AMI**: Ubuntu 22.04 LTS (x86_64)
- **Type**: t3.small (Recommended for prod) or t3.micro (Minimum)
- **Key Pair**: Create new or reuse `kdl-lms.pem`. **SAVE THE PRIVATE KEY**.
- **Security Group**: Allow Ports `22` (SSH), `80` (HTTP), `443` (HTTPS).
- **Public IP**: Allocate an Elastic IP and attach it (Recommended to keep IP static).

### 1.2 RDS (Database)
- Ensure your RDS PostgreSQL instance is running.
- **Security Group**: Allow inbound on Port `5432` from the **Security Group ID** of your new EC2 instance.

### 1.3 S3 Bucket
- Ensure `kiddee-lab-lms` bucket exists.
- Permission: Block all public access (Application uses IAM User keys).

---

## 🔒 Phase 2: Domain & Security (Cloudflare)

### 2.1 DNS Configuration
1.  Go to Cloudflare → DNS.
2.  Update the **A Record** for `@` or `registrar` to point to your **New EC2 Public IP**.
3.  Ensure Proxy status is **Proxied** (Orange Cloud).

### 2.2 SSL Certificates (Crucial)
1.  Go to SSL/TLS → **Origin Server**.
2.  Create Certificate (RSA 2048, 15 years).
3.  **SAVE** the Certificate and Private Key to your local machine (e.g., `cf_cert.pem`, `cf_key.pem`).
4.  Set SSL/TLS Mode to **Full (Strict)** in "Overview".

---

## ⚙️ Phase 3: Server Configuration (SSH)

SSH into your new instance:
```bash
ssh -i "path/to/key.pem" ubuntu@<NEW-IP-ADDRESS>
```

### 3.1 Install Docker & Nginx
Follow detailed steps in `docs/01-EC2-SETUP.md`.
Summary:
```bash
sudo apt update && sudo apt install -y docker.io docker-compose-v2 nginx
sudo systemctl enable docker nginx
sudo usermod -aG docker ubuntu
```
*(Log out and log back in for docker group changes)*

### 3.2 Install SSL Certificates
```bash
sudo mkdir -p /etc/ssl/certs /etc/ssl/private
sudo nano /etc/ssl/certs/cf_cert.pem   # Paste Certificate
sudo nano /etc/ssl/private/cf_key.pem  # Paste Private Key
sudo chmod 600 /etc/ssl/private/cf_key.pem
```

### 3.3 Configure Nginx
Create `/etc/nginx/sites-available/kdl-lms` with the config from `docs/01-EC2-SETUP.md`.
**Key Points:**
- Listen 443 SSL.
- Proxy `/api/s3-upload-url` to port 3000.
- Proxy `/api` to port 4000.
- Proxy `/` to port 3000.

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/kdl-lms /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 🚀 Phase 4: Application Deployment (GitHub Actions)

You do NOT need to manually copy code. GitHub Actions will do it.

### 4.1 Update GitHub Secrets
Go to `Settings` → `Secrets and variables` → `Actions` in both **Frontend** and **Backend** repos.

**YOU MUST ADD ALL THESE SECRETS:**

#### Frontend Secrets:
| Secret Name | Value Example |
|-------------|---------------|
| `DOCKER_HUB_USERNAME` | `noel770` |
| `DOCKER_HUB_ACCESS_TOKEN` | (Your Access Token) |
| `EC2_HOST` | `98.91.29.102` |
| `EC2_USERNAME` | `ubuntu` |
| `EC2_SSH_KEY` | (Content of `kdl-lms.pem`) |
| `NEXT_PUBLIC_BACKEND_URL` | `https://registrar.kiddeelab.co.th/api` |
| `NEXT_PUBLIC_API_URL` | `https://registrar.kiddeelab.co.th:4000` |
| `NEXT_PUBLIC_JWT_SECRET` | `123456` |
| `NEXT_PUBLIC_LIFF_ID` | `2008403698-g6d9DA22` |
| `AWS_ACCESS_KEY_ID` | (Your AWS Access Key) |
| `AWS_SECRET_ACCESS_KEY` | (Your AWS Secret Key) |
| `AWS_S3_BUCKET_NAME` | `kiddee-lab-lms` |

#### Backend Secrets:
| Secret Name | Value Example |
|-------------|---------------|
| `DOCKER_HUB_USERNAME` | `noel770` |
| `DOCKER_HUB_ACCESS_TOKEN` | (Your Token) |
| `EC2_HOST` | `98.91.29.102` |
| `EC2_USERNAME` | `ubuntu` |
| `EC2_SSH_KEY` | (Content of `kdl-lms.pem`) |
| `DATABASE_URL` | `postgresql://...` (RDS Endpoint) |
| `JWT_SECRET` | `123456` |
| `JWT_REFRESH_SECRET` | `refresh123456` |
| `Check README-DEVOPS.md` | **See README-DEVOPS.md for the full list of ~20 variables** including LINE, Resend, and Menus. |

### 4.2 Trigger Deployment
1.  Go to "Actions" tab in GitHub.
2.  Select "Deploy to EC2" workflow.
3.  Click "Run workflow" (or push a commit).

---

## ✅ Phase 5: Verification

1.  **Frontend**: Visit `https://registrar.kiddeelab.co.th`. Should load (Status 200).
2.  **Backend API**: Visit `https://registrar.kiddeelab.co.th/api/health` (Should return 404 or specific health JSON).
3.  **Login**: Try logging in to verify Database connection.
4.  **Uploads**: Try uploading an image to verify S3 permissions and API routing.

---

## 📂 Reference Documents
- [EC2 Setup](./01-EC2-SETUP.md)
- [Cloudflare SSL](./04-CLOUDFLARE-DOMAIN-SSL.md)
- [GitHub Actions](./03-GITHUB-ACTIONS-SETUP.md)
- [RDS Migration](./05-RDS-MIGRATION.md)
