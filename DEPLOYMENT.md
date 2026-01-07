# 🚀 DEPLOYMENT GUIDE

## Complete Deployment Configuration for Candidate 360° NPS Platform

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Docker Configuration](#docker-configuration)
3. [Environment Variables](#environment-variables)
4. [Build Commands](#build-commands)
5. [Hosting Providers](#hosting-providers)
6. [Network Architecture](#network-architecture)
7. [CI/CD Pipeline](#cicd-pipeline)
8. [Scaling Recommendations](#scaling-recommendations)
9. [Security Best Practices](#security-best-practices)
10. [Monitoring & Logging](#monitoring--logging)

---

## 🔧 Prerequisites

### Required Tools
- Docker 24+ & Docker Compose 2+
- Node.js 20+
- PostgreSQL 16+
- Redis 7+
- Git

### Required Accounts (Production)
- Domain name registrar
- SSL certificate provider (Let's Encrypt recommended)
- Container registry (GitHub Container Registry, Docker Hub, or AWS ECR)
- Cloud hosting provider
- Monitoring service (optional: Sentry, DataDog)

---

## 🐳 Docker Configuration

### Files Created

```
✅ backend/Dockerfile              - Backend API image
✅ backend/Dockerfile.worker       - Background workers image
✅ frontend/Dockerfile             - Frontend (React + Nginx) image
✅ frontend/nginx.conf             - Nginx configuration
✅ docker-compose.prod.yml         - Production compose file
```

### Multi-Stage Builds

All Dockerfiles use multi-stage builds for:
- ✅ Smaller image sizes (production images exclude dev dependencies)
- ✅ Faster builds (layer caching)
- ✅ Better security (no source code in final image)

### Image Sizes (Approximate)
- Backend: ~150 MB
- Worker: ~150 MB
- Frontend: ~30 MB (with Nginx)

---

## 🔐 Environment Variables

### Files Created

```
✅ .env.example                    - Development template
✅ .env.production.example         - Production template
```

### Critical Variables to Set

**Security (Generate Secure Values)**
```bash
# Generate JWT secret
openssl rand -base64 32

# Generate database password
openssl rand -base64 24

# Generate Redis password
openssl rand -base64 24
```

**Required for Production**
- `JWT_SECRET` - 32+ character random string
- `POSTGRES_PASSWORD` - Strong database password
- `REDIS_PASSWORD` - Strong Redis password
- `DATABASE_URL` - Full PostgreSQL connection string
- `FRONTEND_URL` - Your domain (https://your-domain.com)
- `VITE_API_URL` - API URL (https://api.your-domain.com)

**Optional (but recommended)**
- `RESEND_API_KEY` - For email notifications
- `TWILIO_ACCOUNT_SID` - For SMS notifications
- `TWILIO_AUTH_TOKEN` - For SMS notifications
- `SENTRY_DSN` - For error tracking

---

## 🏗️ Build Commands

### Local Development
```bash
# Start infrastructure only
docker-compose up -d

# Install dependencies
npm install --workspaces

# Run migrations
cd backend && npm run migrate

# Seed database
cd backend && npm run seed

# Start development servers
npm run dev                    # In root (starts all)
# OR
cd backend && npm run dev      # Backend only
cd backend && npm run dev:workers  # Workers only
cd frontend && npm run dev     # Frontend only
```

### Production Build (Local)
```bash
# Build all services
docker-compose -f docker-compose.prod.yml build

# Start all services
docker-compose -f docker-compose.prod.yml up -d

# Run migrations
docker-compose -f docker-compose.prod.yml exec backend npx prisma migrate deploy

# Seed database (optional)
docker-compose -f docker-compose.prod.yml exec backend npm run seed

# View logs
docker-compose -f docker-compose.prod.yml logs -f
```

### Production Build (CI/CD)
```bash
# Build backend image
docker build -t candidate-nps-backend:latest -f backend/Dockerfile .

# Build worker image
docker build -t candidate-nps-worker:latest -f backend/Dockerfile.worker .

# Build frontend image
docker build -t candidate-nps-frontend:latest -f frontend/Dockerfile ./frontend

# Push to registry
docker tag candidate-nps-backend:latest registry.example.com/candidate-nps-backend:latest
docker push registry.example.com/candidate-nps-backend:latest
```

---

## ☁️ Hosting Providers

### Recommended Providers

#### 1. **AWS (Amazon Web Services)** ⭐ Recommended for Enterprise

**Services to Use:**
- **ECS (Fargate)** - Container orchestration (serverless)
- **RDS (PostgreSQL)** - Managed database
- **ElastiCache (Redis)** - Managed Redis
- **ALB** - Application Load Balancer
- **S3** - File storage (uploads)
- **CloudFront** - CDN for frontend
- **Route 53** - DNS management
- **ACM** - Free SSL certificates

**Estimated Cost:** $200-500/month (small-medium scale)

**Pros:**
- ✅ Fully managed services
- ✅ Auto-scaling
- ✅ High availability
- ✅ Enterprise-grade security

**Setup Steps:**
```bash
# 1. Create RDS PostgreSQL instance
# 2. Create ElastiCache Redis cluster
# 3. Push Docker images to ECR
# 4. Create ECS Fargate services (backend, worker, frontend)
# 5. Configure ALB with SSL
# 6. Setup CloudFront for frontend
```

---

#### 2. **DigitalOcean** ⭐ Recommended for Startups

**Services to Use:**
- **App Platform** - Managed container hosting
- **Managed Database (PostgreSQL)** - Database
- **Managed Redis** - Cache & queue
- **Spaces** - Object storage
- **Load Balancer** - Traffic distribution

**Estimated Cost:** $50-150/month (small scale)

**Pros:**
- ✅ Simple setup
- ✅ Affordable pricing
- ✅ Good documentation
- ✅ Easy scaling

**Setup Steps:**
```bash
# 1. Create Managed Database (PostgreSQL + Redis)
# 2. Deploy via App Platform (auto-deploy from GitHub)
# 3. Configure environment variables
# 4. Setup custom domain + SSL
```

---

#### 3. **Google Cloud Platform (GCP)**

**Services to Use:**
- **Cloud Run** - Serverless containers
- **Cloud SQL** - Managed PostgreSQL
- **Memorystore** - Managed Redis
- **Cloud Load Balancing** - Load balancer
- **Cloud CDN** - Content delivery

**Estimated Cost:** $150-400/month

---

#### 4. **Railway.app** ⭐ Recommended for MVP/Testing

**Pros:**
- ✅ Extremely simple
- ✅ Auto-deploy from GitHub
- ✅ Built-in database + Redis
- ✅ Free tier available

**Estimated Cost:** $5-20/month (hobby), $50-100/month (production)

---

#### 5. **Vercel + Render** (Hybrid Approach)

**Split Services:**
- **Vercel** - Frontend (React)
- **Render** - Backend + Worker + Database

**Estimated Cost:** $40-100/month

---

### Comparison Table

| Provider | Setup Complexity | Cost | Scalability | Managed Services |
|----------|-----------------|------|-------------|------------------|
| AWS | ⭐⭐⭐⭐ | $$$$ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| DigitalOcean | ⭐⭐ | $$ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| GCP | ⭐⭐⭐⭐ | $$$ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Railway | ⭐ | $ | ⭐⭐⭐ | ⭐⭐⭐ |
| Vercel+Render | ⭐⭐ | $$ | ⭐⭐⭐⭐ | ⭐⭐⭐ |

---

## 🌐 Network Architecture

### Recommended Production Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                       Internet                              │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│              CloudFlare / CloudFront (CDN)                  │
│  - DDoS Protection                                          │
│  - SSL/TLS Termination                                      │
│  - Static Asset Caching                                     │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│           Application Load Balancer (ALB/NGINX)             │
│  - HTTPS → HTTP forwarding                                  │
│  - Path-based routing                                       │
│  - Health checks                                            │
└──────────────┬──────────────────────┬───────────────────────┘
               │                      │
               ▼                      ▼
    ┌──────────────────┐   ┌──────────────────────┐
    │   Frontend       │   │   Backend API        │
    │   (React + Nginx)│   │   (Node.js + Express)│
    │   Port: 80       │   │   Port: 4000         │
    │   Instances: 2+  │   │   Instances: 2+      │
    └──────────────────┘   └──────────┬───────────┘
                                      │
                     ┌────────────────┼────────────────┐
                     ▼                ▼                ▼
          ┌──────────────┐  ┌──────────────┐  ┌─────────────┐
          │ Worker Pool  │  │ PostgreSQL   │  │ Redis       │
          │ (BullMQ)     │  │ (Primary +   │  │ (Primary +  │
          │ Instances: 2+│  │  Replica)    │  │  Replica)   │
          └──────────────┘  └──────────────┘  └─────────────┘
                                   │
                                   ▼
                          ┌──────────────────┐
                          │ S3 / Object Store│
                          │ (File uploads)   │
                          └──────────────────┘
```

### Security Layers

1. **CDN Layer** (CloudFlare/CloudFront)
   - DDoS protection
   - WAF (Web Application Firewall)
   - Rate limiting

2. **Load Balancer Layer**
   - SSL/TLS termination
   - Path-based routing
   - Health checks

3. **Application Layer**
   - JWT authentication
   - RBAC authorization
   - Input validation

4. **Database Layer**
   - VPC isolation
   - Encrypted connections
   - Automated backups

---

## 🔄 CI/CD Pipeline

### File Created
```
✅ .github/workflows/ci-cd.yml    - GitHub Actions workflow
```

### Pipeline Stages

#### 1. **Test & Lint**
- Install dependencies
- Run ESLint
- TypeScript type checking
- Run unit tests
- Run integration tests

#### 2. **Build Docker Images**
- Build backend image
- Build worker image
- Build frontend image
- Push to container registry

#### 3. **Deploy to Staging**
- Pull latest images
- Run migrations
- Deploy to staging environment
- Run smoke tests

#### 4. **Deploy to Production**
- Manual approval required
- Pull latest images
- Run migrations
- Deploy to production
- Run smoke tests
- Notify team

### Additional CI/CD Tools

**Alternative to GitHub Actions:**
- **GitLab CI/CD** - Built-in to GitLab
- **CircleCI** - Popular, easy to use
- **Jenkins** - Self-hosted, highly customizable
- **Travis CI** - Simple configuration

### Deployment Strategies

**1. Blue-Green Deployment**
```bash
# Deploy to "green" environment
docker-compose -f docker-compose.green.yml up -d

# Run tests on green
./run-tests.sh green

# Switch traffic from blue to green
# (update load balancer)

# Keep blue as backup for quick rollback
```

**2. Rolling Deployment**
```bash
# Update one instance at a time
docker-compose up -d --no-deps --scale backend=4 backend
```

**3. Canary Deployment**
```bash
# Deploy to 10% of traffic first
# Monitor metrics
# Gradually increase to 100%
```

---

## 📈 Scaling Recommendations

### Vertical Scaling (Single Server)

**Small Scale (< 1,000 users)**
```yaml
Backend: 2 GB RAM, 2 vCPU
Worker: 2 GB RAM, 2 vCPU
Frontend: 1 GB RAM, 1 vCPU
Database: 4 GB RAM, 2 vCPU
Redis: 1 GB RAM, 1 vCPU
```

**Medium Scale (1,000 - 10,000 users)**
```yaml
Backend: 4 GB RAM, 4 vCPU (2 instances)
Worker: 4 GB RAM, 4 vCPU (2 instances)
Frontend: 2 GB RAM, 2 vCPU (2 instances)
Database: 8 GB RAM, 4 vCPU (with read replica)
Redis: 2 GB RAM, 2 vCPU (with replica)
```

**Large Scale (10,000+ users)**
```yaml
Backend: 8 GB RAM, 8 vCPU (4+ instances)
Worker: 8 GB RAM, 8 vCPU (4+ instances)
Frontend: 4 GB RAM, 4 vCPU (3+ instances)
Database: 16 GB RAM, 8 vCPU (primary + 2 replicas)
Redis: 4 GB RAM, 4 vCPU (clustered)
```

### Horizontal Scaling

#### Backend API
- ✅ Stateless design (ready for horizontal scaling)
- ✅ Add more instances behind load balancer
- ✅ No session affinity required

#### Workers
- ✅ BullMQ naturally distributes jobs
- ✅ Add more worker instances as needed
- ✅ Each worker processes jobs from same Redis queue

#### Database
- ✅ Read replicas for read-heavy operations
- ✅ Connection pooling (already configured in Prisma)
- ✅ Consider sharding for extreme scale

#### Redis
- ✅ Redis Cluster for high availability
- ✅ Separate Redis instances for cache vs. queue

### Auto-Scaling Configuration

**AWS ECS Auto-Scaling Example:**
```yaml
# Target: 70% CPU utilization
min_capacity: 2
max_capacity: 10
target_cpu: 70
target_memory: 80
```

**Kubernetes HPA Example:**
```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: backend-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: backend
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

---

## 🔒 Security Best Practices

### Application Security
- ✅ Use environment variables for secrets (never commit)
- ✅ Rotate JWT secrets regularly
- ✅ Use strong database passwords
- ✅ Enable HTTPS only (no HTTP)
- ✅ Implement rate limiting (already configured)
- ✅ Use helmet.js for security headers (already configured)
- ✅ Validate all inputs with Zod (already configured)
- ✅ Implement CORS properly (already configured)

### Infrastructure Security
- ✅ Use private subnets for database/Redis
- ✅ Enable VPC flow logs
- ✅ Use security groups/firewall rules
- ✅ Enable database encryption at rest
- ✅ Enable Redis AUTH
- ✅ Regular security updates (Docker images)
- ✅ Automated vulnerability scanning

### Secrets Management

**Recommended Tools:**
- **AWS Secrets Manager** - For AWS deployments
- **HashiCorp Vault** - Self-hosted, enterprise-grade
- **Doppler** - Developer-friendly secrets management
- **Kubernetes Secrets** - For K8s deployments

---

## 📊 Monitoring & Logging

### Recommended Monitoring Stack

#### Application Monitoring
- **Sentry** - Error tracking
- **DataDog** - APM & infrastructure monitoring
- **New Relic** - APM
- **Prometheus + Grafana** - Self-hosted metrics

#### Log Aggregation
- **DataDog Logs** - Centralized logging
- **ELK Stack** (Elasticsearch, Logstash, Kibana) - Self-hosted
- **Papertrail** - Simple log management
- **CloudWatch Logs** - For AWS

#### Uptime Monitoring
- **Pingdom** - Uptime monitoring
- **UptimeRobot** - Free uptime checks
- **StatusCake** - Status page + monitoring

### Key Metrics to Monitor

**Application Metrics:**
- Response time (p50, p95, p99)
- Error rate
- Request throughput
- Active users

**Infrastructure Metrics:**
- CPU usage
- Memory usage
- Disk usage
- Network throughput

**Business Metrics:**
- NPS score trends
- Survey response rates
- Active cohorts
- Action completion rates

---

## 🚀 Quick Deployment Guide

### Option 1: DigitalOcean (Simplest)

1. **Create Droplet**
```bash
# SSH into droplet
ssh root@your-server-ip

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Clone repository
git clone https://github.com/your-org/candidate-360-nps.git
cd candidate-360-nps
```

2. **Configure Environment**
```bash
# Copy and edit production env
cp .env.production.example .env.production
nano .env.production
# Set all required variables
```

3. **Deploy**
```bash
# Build and start
docker-compose -f docker-compose.prod.yml up -d

# Run migrations
docker-compose -f docker-compose.prod.yml exec backend npx prisma migrate deploy

# Check logs
docker-compose -f docker-compose.prod.yml logs -f
```

4. **Setup SSL (Let's Encrypt)**
```bash
# Install certbot
apt install certbot

# Get SSL certificate
certbot certonly --standalone -d your-domain.com -d api.your-domain.com

# Update nginx config to use SSL
```

---

### Option 2: AWS ECS (Enterprise)

1. **Create Infrastructure**
   - Create VPC
   - Create RDS PostgreSQL
   - Create ElastiCache Redis
   - Create ECR repositories

2. **Push Images**
```bash
# Login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin YOUR_ECR_URL

# Build and push
docker build -t candidate-nps-backend -f backend/Dockerfile .
docker tag candidate-nps-backend:latest YOUR_ECR_URL/candidate-nps-backend:latest
docker push YOUR_ECR_URL/candidate-nps-backend:latest
```

3. **Create ECS Services**
   - Create task definitions (backend, worker, frontend)
   - Create ECS services
   - Configure ALB
   - Setup auto-scaling

---

### Option 3: Railway (MVP/Testing)

1. **Connect GitHub**
   - Connect Railway to your GitHub repository

2. **Add Services**
   - Add PostgreSQL database
   - Add Redis
   - Add Backend service (auto-deploy from GitHub)
   - Add Worker service
   - Add Frontend service

3. **Configure Environment**
   - Set environment variables in Railway dashboard

4. **Deploy**
   - Push to GitHub → Auto-deploy

---

## ✅ Deployment Checklist

- [ ] Environment variables configured
- [ ] Secrets generated (JWT, passwords)
- [ ] Database created and migrated
- [ ] Redis configured
- [ ] SSL certificate installed
- [ ] Domain DNS configured
- [ ] Firewall rules set
- [ ] Monitoring enabled
- [ ] Backups configured
- [ ] Error tracking (Sentry) configured
- [ ] CI/CD pipeline tested
- [ ] Load testing performed
- [ ] Security scan completed
- [ ] Documentation updated

---

## 📞 Support & Troubleshooting

### Common Issues

**Database Connection Failed**
- Check DATABASE_URL is correct
- Verify database is accessible from container
- Check security group/firewall rules

**Redis Connection Failed**
- Check REDIS_HOST and REDIS_PORT
- Verify Redis password (if set)
- Check network connectivity

**Frontend Can't Reach API**
- Check VITE_API_URL is correct
- Verify CORS_ORIGIN includes frontend URL
- Check load balancer routing

---

**Deployment Configuration Complete!** ✅

All files created and ready for deployment. Awaiting your confirmation to proceed.

