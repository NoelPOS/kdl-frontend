# RDS Migration Guide for KDL Application

This guide walks you through migrating your KDL application from Neon PostgreSQL to AWS RDS for improved performance, reliability, and integration with your AWS infrastructure.

## Prerequisites
- AWS Account with billing enabled
- Current application running with Neon database
- Database backup and migration tools
- Basic understanding of PostgreSQL and AWS RDS

## Step 1: Planning the Migration

### 1.1 Assess Current Database
First, analyze your current Neon database:

```sql
-- Connect to your Neon database and run these queries
-- Check database size
SELECT pg_size_pretty(pg_database_size(current_database()));

-- List all tables and their sizes  
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname NOT IN ('information_schema', 'pg_catalog')
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Check number of connections
SELECT count(*) FROM pg_stat_activity;

-- Check PostgreSQL version
SELECT version();
```

### 1.2 Choose RDS Configuration
Based on your assessment, choose appropriate RDS settings:

**Recommended Configuration for KDL:**
- **Database Engine**: PostgreSQL
- **Version**: PostgreSQL 15.x (latest stable)
- **Instance Class**: 
  - Development: `db.t3.micro` (free tier)
  - Production: `db.t3.small` or `db.t3.medium`
- **Storage**: 
  - Type: `gp3` (General Purpose SSD)
  - Size: Start with 20 GB (auto-scaling enabled)
- **Multi-AZ**: Yes (for production)
- **Backup Retention**: 7 days (minimum)

## Step 2: Create RDS Instance

### 2.1 Create RDS Subnet Group
1. Go to AWS RDS Console
2. Click "Subnet groups" in the left sidebar
3. Click "Create DB subnet group"
4. **Name**: `kdl-db-subnet-group`
5. **Description**: `Subnet group for KDL database`
6. **VPC**: Select your default VPC
7. **Availability Zones**: Select at least 2 AZs
8. **Subnets**: Select subnets in different AZs
9. Click "Create"

### 2.2 Create Security Group for RDS
1. Go to EC2 Console → Security Groups
2. Click "Create security group"
3. **Name**: `kdl-rds-security-group`
4. **Description**: `Security group for KDL RDS database`
5. **VPC**: Select the same VPC as your EC2
6. **Inbound Rules**:
   - Type: `PostgreSQL`
   - Port: `5432`
   - Source: Your EC2 security group ID
   - Description: `Allow EC2 access to RDS`
7. **Outbound Rules**: Keep default (all traffic)
8. Click "Create security group"

### 2.3 Create RDS Instance
1. Go to RDS Console
2. Click "Create database"
3. **Engine Options**:
   - Engine type: `PostgreSQL`
   - Version: `PostgreSQL 15.4-R2` (or latest)
4. **Templates**: `Production` (or `Dev/Test` for development)
5. **Settings**:
   - DB instance identifier: `kdl-production-db`
   - Master username: `kdladmin`
   - Master password: Generate strong password (save it securely)
6. **Instance Configuration**:
   - DB instance class: `db.t3.small`
   - Storage type: `gp3`
   - Allocated storage: `20 GB`
   - Enable storage autoscaling: `Yes`
   - Maximum storage threshold: `100 GB`
7. **Connectivity**:
   - VPC: Select your VPC
   - Subnet group: `kdl-db-subnet-group`
   - Public access: `No`
   - VPC security groups: `kdl-rds-security-group`
   - Availability Zone: `No preference`
   - Database port: `5432`
8. **Database Authentication**: `Password authentication`
9. **Additional Configuration**:
   - Initial database name: `kdldb`
   - DB parameter group: `default.postgres15`
   - Backup retention period: `7 days`
   - Enable automatic backups: `Yes`
   - Backup window: `03:00-04:00 UTC`
   - Enable enhanced monitoring: `Yes`
   - Monitoring granularity: `60 seconds`
   - Enable Performance Insights: `Yes`
   - Maintenance window: `Sun:04:00-Sun:05:00 UTC`
   - Enable auto minor version upgrade: `Yes`
   - Deletion protection: `Enable`
10. Click "Create database"

### 2.4 Wait for RDS Instance
The RDS instance creation takes 10-20 minutes. Note down:
- **Endpoint**: `kdl-production-db.xxxxxxxxx.us-east-1.rds.amazonaws.com`
- **Port**: `5432`
- **Username**: `kdladmin`
- **Password**: (what you set or generated)

## Step 3: Prepare for Migration

### 3.1 Install PostgreSQL Client on EC2
SSH into your EC2 instance:
```bash
ssh -i "kdl-server-key.pem" ubuntu@YOUR_EC2_IP

# Install PostgreSQL client
sudo apt update
sudo apt install -y postgresql-client-15

# Verify installation
psql --version
```

### 3.2 Test RDS Connection
```bash
# Test connection to RDS
psql -h kdl-production-db.xxxxxxxxx.us-east-1.rds.amazonaws.com -U kdladmin -d kdldb

# If connection successful, you should see PostgreSQL prompt
# Type \q to exit
```

### 3.3 Create Migration Scripts Directory
```bash
mkdir -p /home/ubuntu/migration
cd /home/ubuntu/migration
```

## Step 4: Database Schema Migration

### 4.1 Export Schema from Neon
```bash
# Create schema export script
nano export-schema.sh
```

Add the following content:
```bash
#!/bin/bash

# Neon database connection details
NEON_HOST="ep-sweet-thunder-adl4wuxz-pooler.c-2.us-east-1.aws.neon.tech"
NEON_DB="neondb"
NEON_USER="neondb_owner"
NEON_PASSWORD="npg_xjoiqb6nT4WC"

# Export schema only (no data)
pg_dump \
  --host=$NEON_HOST \
  --username=$NEON_USER \
  --dbname=$NEON_DB \
  --schema-only \
  --no-owner \
  --no-privileges \
  --file=schema.sql

echo "Schema exported to schema.sql"

# Export data only
pg_dump \
  --host=$NEON_HOST \
  --username=$NEON_USER \
  --dbname=$NEON_DB \
  --data-only \
  --no-owner \
  --no-privileges \
  --file=data.sql

echo "Data exported to data.sql"
```

```bash
chmod +x export-schema.sh
./export-schema.sh
```

### 4.2 Import Schema to RDS
```bash
# Create import script
nano import-schema.sh
```

Add the following content:
```bash
#!/bin/bash

# RDS connection details
RDS_HOST="kdl-production-db.xxxxxxxxx.us-east-1.rds.amazonaws.com"
RDS_DB="kdldb"
RDS_USER="kdladmin"
RDS_PASSWORD="your-rds-password"

# Import schema
PGPASSWORD=$RDS_PASSWORD psql \
  --host=$RDS_HOST \
  --username=$RDS_USER \
  --dbname=$RDS_DB \
  --file=schema.sql

echo "Schema imported to RDS"
```

```bash
chmod +x import-schema.sh
./import-schema.sh
```

## Step 5: Data Migration

### 5.1 Create Data Migration Script
```bash
nano migrate-data.sh
```

Add the following content:
```bash
#!/bin/bash

# Connection details
NEON_HOST="ep-sweet-thunder-adl4wuxz-pooler.c-2.us-east-1.aws.neon.tech"
NEON_DB="neondb"
NEON_USER="neondb_owner"
NEON_PASSWORD="npg_xjoiqb6nT4WC"

RDS_HOST="kdl-production-db.xxxxxxxxx.us-east-1.rds.amazonaws.com"
RDS_DB="kdldb"
RDS_USER="kdladmin"
RDS_PASSWORD="your-rds-password"

echo "Starting data migration..."

# Method 1: Direct pipe (faster for smaller databases)
pg_dump \
  --host=$NEON_HOST \
  --username=$NEON_USER \
  --dbname=$NEON_DB \
  --data-only \
  --no-owner \
  --no-privileges \
  --verbose \
| PGPASSWORD=$RDS_PASSWORD psql \
  --host=$RDS_HOST \
  --username=$RDS_USER \
  --dbname=$RDS_DB

echo "Data migration completed!"
```

### 5.2 Alternative: Table-by-Table Migration
For larger databases or better control:
```bash
nano migrate-tables.sh
```

```bash
#!/bin/bash

# Connection details (same as above)
NEON_HOST="ep-sweet-thunder-adl4wuxz-pooler.c-2.us-east-1.aws.neon.tech"
# ... (same connection details)

# List of tables to migrate (customize based on your schema)
TABLES=(
    "users"
    "students"
    "teachers"
    "courses"
    "enrollments"
    "sessions"
    "invoices"
    "payments"
    # Add all your tables here
)

for table in "${TABLES[@]}"
do
    echo "Migrating table: $table"
    
    # Export table data
    pg_dump \
      --host=$NEON_HOST \
      --username=$NEON_USER \
      --dbname=$NEON_DB \
      --table=$table \
      --data-only \
      --no-owner \
      --no-privileges \
      --file="${table}_data.sql"
    
    # Import to RDS
    PGPASSWORD=$RDS_PASSWORD psql \
      --host=$RDS_HOST \
      --username=$RDS_USER \
      --dbname=$RDS_DB \
      --file="${table}_data.sql"
    
    echo "Completed: $table"
done

echo "All tables migrated!"
```

## Step 6: Application Configuration Update

### 6.1 Update Environment Variables
```bash
cd /home/ubuntu/kdl-app
nano backend.env
```

Update the DATABASE_URL:
```env
NODE_ENV=production
PORT=4000
DATABASE_ENABLED=true

# NEW RDS DATABASE URL
DATABASE_URL=postgresql://postgres:password123@kiddee-lab-lms.cijeais8s352.us-east-1.rds.amazonaws.com:5432/postgres

# Keep other variables the same
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

### 6.2 Update GitHub Actions Secrets
Update your backend repository secrets:
- `DATABASE_URL`: New RDS connection string

### 6.3 Test Application with RDS
```bash
# Restart backend with new database
docker compose stop backend
docker compose rm -f backend
docker compose up -d backend

# Check logs
docker compose logs backend

# Test database connection
docker compose exec backend npm run typeorm:check
```

## Step 7: Data Validation and Testing

### 7.1 Validate Data Migration
```bash
# Create validation script
nano validate-migration.sh
```

```bash
#!/bin/bash

echo "=== Data Migration Validation ==="

# Connection details
NEON_HOST="ep-sweet-thunder-adl4wuxz-pooler.c-2.us-east-1.aws.neon.tech"
RDS_HOST="kdl-production-db.xxxxxxxxx.us-east-1.rds.amazonaws.com"

# Compare record counts for each table
TABLES=("users" "students" "teachers" "courses" "enrollments" "sessions" "invoices")

for table in "${TABLES[@]}"
do
    echo "Checking table: $table"
    
    # Count from Neon
    NEON_COUNT=$(psql -h $NEON_HOST -U neondb_owner -d neondb -t -c "SELECT COUNT(*) FROM $table;")
    
    # Count from RDS  
    RDS_COUNT=$(PGPASSWORD=your-rds-password psql -h $RDS_HOST -U kdladmin -d kdldb -t -c "SELECT COUNT(*) FROM $table;")
    
    echo "  Neon: $NEON_COUNT | RDS: $RDS_COUNT"
    
    if [ "$NEON_COUNT" = "$RDS_COUNT" ]; then
        echo "  ✅ Match"
    else
        echo "  ❌ Mismatch!"
    fi
    echo ""
done
```

### 7.2 Application Testing
1. Test user authentication
2. Test CRUD operations
3. Test file uploads
4. Test report generation
5. Check all major features

### 7.3 Performance Testing
```bash
# Test database performance
nano performance-test.sh
```

```bash
#!/bin/bash

echo "=== Database Performance Test ==="

RDS_HOST="kdl-production-db.xxxxxxxxx.us-east-1.rds.amazonaws.com"

# Test connection time
time PGPASSWORD=your-rds-password psql -h $RDS_HOST -U kdladmin -d kdldb -c "SELECT 1;"

# Test query performance
PGPASSWORD=your-rds-password psql -h $RDS_HOST -U kdladmin -d kdldb -c "
EXPLAIN ANALYZE SELECT * FROM users LIMIT 100;
EXPLAIN ANALYZE SELECT * FROM students LIMIT 100;
"
```

## Step 8: Database Optimization

### 8.1 Create Database Indexes
```sql
-- Connect to RDS and create optimized indexes
-- Customize based on your queries

-- User authentication
CREATE INDEX CONCURRENTLY idx_users_email ON users(email);
CREATE INDEX CONCURRENTLY idx_users_role ON users(role);

-- Student queries
CREATE INDEX CONCURRENTLY idx_students_user_id ON students(user_id);
CREATE INDEX CONCURRENTLY idx_students_status ON students(status);

-- Enrollment queries
CREATE INDEX CONCURRENTLY idx_enrollments_student_id ON enrollments(student_id);
CREATE INDEX CONCURRENTLY idx_enrollments_course_id ON enrollments(course_id);
CREATE INDEX CONCURRENTLY idx_enrollments_status ON enrollments(status);

-- Session queries
CREATE INDEX CONCURRENTLY idx_sessions_date ON sessions(date);
CREATE INDEX CONCURRENTLY idx_sessions_teacher_id ON sessions(teacher_id);

-- Invoice queries
CREATE INDEX CONCURRENTLY idx_invoices_student_id ON invoices(student_id);
CREATE INDEX CONCURRENTLY idx_invoices_status ON invoices(status);
CREATE INDEX CONCURRENTLY idx_invoices_due_date ON invoices(due_date);
```

### 8.2 Configure RDS Parameters
1. Go to RDS Console → Parameter groups
2. Create new parameter group:
   - **Name**: `kdl-postgres-params`
   - **Family**: `postgres15`
3. Modify parameters:
   - `shared_preload_libraries`: `pg_stat_statements`
   - `log_statement`: `all` (for debugging, change to `none` later)
   - `log_min_duration_statement`: `1000` (log slow queries)
   - `work_mem`: `4MB`
   - `effective_cache_size`: `1GB` (adjust based on instance size)
4. Apply parameter group to your RDS instance

## Step 9: Backup and Recovery Setup

### 9.1 Configure Automated Backups
RDS automated backups are already configured, but verify:
1. Go to RDS Console → Your database
2. Check "Backup" section:
   - Backup retention: 7+ days
   - Backup window: Off-peak hours
   - Copy tags to snapshots: Enabled

### 9.2 Create Manual Snapshot
```bash
# Using AWS CLI (install if needed)
aws rds create-db-snapshot \
    --db-instance-identifier kdl-production-db \
    --db-snapshot-identifier kdl-migration-snapshot-$(date +%Y%m%d)
```

### 9.3 Set Up Backup Script
```bash
nano backup-rds.sh
```

```bash
#!/bin/bash

# Create manual database backup
RDS_HOST="kdl-production-db.xxxxxxxxx.us-east-1.rds.amazonaws.com"
BACKUP_DIR="/home/ubuntu/backups"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

echo "Creating database backup..."

PGPASSWORD=your-rds-password pg_dump \
  --host=$RDS_HOST \
  --username=kdladmin \
  --dbname=kdldb \
  --format=custom \
  --compress=9 \
  --file="$BACKUP_DIR/kdl_backup_$DATE.dump"

echo "Backup created: $BACKUP_DIR/kdl_backup_$DATE.dump"

# Keep only last 7 backups
find $BACKUP_DIR -name "kdl_backup_*.dump" -type f -mtime +7 -delete

echo "Old backups cleaned up"
```

## Step 10: Monitoring and Alerting

### 10.1 Enable CloudWatch Monitoring
1. Go to RDS Console → Your database → Monitoring
2. Enable Enhanced Monitoring
3. Set up CloudWatch alarms:
   - CPU Utilization > 80%
   - Database Connections > 80% of max
   - Free Storage Space < 2GB
   - Read/Write Latency > 200ms

### 10.2 Create Monitoring Script
```bash
nano monitor-rds.sh
```

```bash
#!/bin/bash

echo "=== RDS Health Check ==="
echo "Date: $(date)"

RDS_HOST="kdl-production-db.xxxxxxxxx.us-east-1.rds.amazonaws.com"

# Test connection
if PGPASSWORD=your-rds-password psql -h $RDS_HOST -U kdladmin -d kdldb -c "SELECT 1;" > /dev/null 2>&1; then
    echo "✅ Database connection: OK"
else
    echo "❌ Database connection: FAILED"
fi

# Check active connections
CONNECTIONS=$(PGPASSWORD=your-rds-password psql -h $RDS_HOST -U kdladmin -d kdldb -t -c "SELECT count(*) FROM pg_stat_activity;")
echo "Active connections: $CONNECTIONS"

# Check database size
SIZE=$(PGPASSWORD=your-rds-password psql -h $RDS_HOST -U kdladmin -d kdldb -t -c "SELECT pg_size_pretty(pg_database_size('kdldb'));")
echo "Database size: $SIZE"

echo "=== End Health Check ==="
```

## Step 11: Cleanup Old Neon Resources

### 11.1 Verify RDS is Working
Before cleaning up, ensure:
1. Application is fully functional with RDS
2. All data has been migrated successfully
3. Performance is acceptable
4. Backups are working

### 11.2 Update Documentation
Update all documentation and scripts to use RDS instead of Neon:
- Environment variable examples
- Deployment scripts
- Backup procedures
- Monitoring scripts

### 11.3 Remove Neon References (After Testing Period)
After 1-2 weeks of successful RDS operation:
1. Remove Neon database URL from all environments
2. Cancel Neon subscription (if applicable)
3. Update any hardcoded references

## Step 12: Future Optimizations

### 12.1 Consider Read Replicas
For high-traffic applications:
```bash
# Create read replica using AWS CLI
aws rds create-db-instance-read-replica \
    --db-instance-identifier kdl-production-db-read-replica \
    --source-db-instance-identifier kdl-production-db \
    --db-instance-class db.t3.small
```

### 12.2 Connection Pooling
Consider implementing connection pooling:
- **PgBouncer**: For connection pooling
- **RDS Proxy**: AWS managed connection pooling service

### 12.3 Multi-AZ Deployment
For production, enable Multi-AZ:
1. Go to RDS Console → Your database
2. Click "Modify"
3. Enable "Multi-AZ deployment"
4. Apply changes during maintenance window

## Troubleshooting

### Common Issues

1. **Connection Timeout**
   ```bash
   # Check security group rules
   # Verify RDS is in same VPC as EC2
   # Test with telnet
   telnet your-rds-endpoint 5432
   ```

2. **Migration Fails**
   ```bash
   # Check PostgreSQL versions compatibility
   # Verify sufficient disk space
   # Check network connectivity
   ```

3. **Performance Issues**
   ```bash
   # Check RDS instance class
   # Monitor CloudWatch metrics
   # Analyze slow queries
   PGPASSWORD=password psql -h endpoint -U user -d db -c "
   SELECT query, calls, total_time, mean_time 
   FROM pg_stat_statements 
   ORDER BY total_time DESC LIMIT 10;"
   ```

### Rollback Plan
If migration fails:
1. Stop application
2. Revert environment variables to Neon
3. Restart application
4. Investigate and fix issues
5. Retry migration

## Security Best Practices

1. **Use strong passwords**
2. **Enable encryption at rest**
3. **Use VPC security groups**
4. **Regularly rotate passwords**
5. **Enable CloudTrail logging**
6. **Use IAM database authentication** (advanced)

## Cost Optimization

1. **Right-size your instance** based on actual usage
2. **Use Reserved Instances** for predictable workloads
3. **Enable storage autoscaling** to avoid over-provisioning
4. **Monitor usage** with AWS Cost Explorer
5. **Schedule automated start/stop** for development environments

## Summary

After completing this migration, you will have:
- PostgreSQL database running on AWS RDS
- Improved performance and reliability
- Better integration with AWS services
- Automated backups and monitoring
- Scalability options for future growth

The migration provides better control, performance, and integration with your AWS infrastructure while maintaining the same PostgreSQL compatibility your application already uses.