# 🚀 QUICK DEPLOYMENT CHECKLIST

Use this checklist when deploying the Candidate 360° NPS Platform.

---

## ☁️ PRE-DEPLOYMENT

### Infrastructure Setup
- [ ] Domain registered and DNS configured
- [ ] SSL certificate obtained (Let's Encrypt or cloud provider)
- [ ] Cloud account created (AWS/GCP/DigitalOcean)
- [ ] Container registry set up (ECR/GHCR/Docker Hub)
- [ ] PostgreSQL database provisioned
- [ ] Redis instance provisioned
- [ ] Object storage configured (S3/Spaces)

### Repository Setup
- [ ] Code pushed to Git repository
- [ ] `.env.production` file created (not committed)
- [ ] All secrets generated securely
- [ ] CI/CD pipeline configured
- [ ] Branch protection rules enabled

---

## 🔐 SECURITY CONFIGURATION

### Generate Secrets
```bash
# JWT Secret (copy output to .env)
openssl rand -base64 32

# Database Password
openssl rand -base64 24

# Redis Password
openssl rand -base64 24
```

### Environment Variables
- [ ] `JWT_SECRET` - Set to 32+ character random string
- [ ] `POSTGRES_PASSWORD` - Set to strong password
- [ ] `REDIS_PASSWORD` - Set to strong password
- [ ] `DATABASE_URL` - PostgreSQL connection string
- [ ] `FRONTEND_URL` - Your domain (https://...)
- [ ] `VITE_API_URL` - API URL (https://api....)
- [ ] `CORS_ORIGIN` - Frontend URL for CORS
- [ ] `RESEND_API_KEY` - Email service (optional)
- [ ] `TWILIO_*` - SMS service (optional)

---

## 🐳 DOCKER BUILD & PUSH

### Build Images
```bash
# Backend
docker build -t candidate-nps-backend:v1.0.0 -f backend/Dockerfile .

# Worker
docker build -t candidate-nps-worker:v1.0.0 -f backend/Dockerfile.worker .

# Frontend
docker build -t candidate-nps-frontend:v1.0.0 -f frontend/Dockerfile ./frontend
```

### Tag & Push
```bash
# Replace with your registry URL
REGISTRY=your-registry.com

docker tag candidate-nps-backend:v1.0.0 $REGISTRY/candidate-nps-backend:v1.0.0
docker tag candidate-nps-worker:v1.0.0 $REGISTRY/candidate-nps-worker:v1.0.0
docker tag candidate-nps-frontend:v1.0.0 $REGISTRY/candidate-nps-frontend:v1.0.0

docker push $REGISTRY/candidate-nps-backend:v1.0.0
docker push $REGISTRY/candidate-nps-worker:v1.0.0
docker push $REGISTRY/candidate-nps-frontend:v1.0.0
```

---

## 🗄️ DATABASE SETUP

### Run Migrations
```bash
# If using Docker Compose
docker-compose -f docker-compose.prod.yml exec backend npx prisma migrate deploy

# If using Kubernetes
kubectl exec -it <backend-pod-name> -n candidate-nps -- npx prisma migrate deploy

# If SSH to server
cd /path/to/app/backend
npx prisma migrate deploy
```

### Seed Database (Optional)
```bash
# Only for initial setup or demo
npm run seed
```

### Verify Database
```bash
# Connect to database and check tables
psql $DATABASE_URL -c "\dt"

# Should see 18 tables
```

---

## 🚀 DEPLOYMENT

### Option 1: Docker Compose (VPS/Droplet)
```bash
# Copy production compose file
scp docker-compose.prod.yml user@server:/app/

# SSH to server
ssh user@server

# Navigate to app directory
cd /app

# Pull latest images (if using registry)
docker-compose -f docker-compose.prod.yml pull

# Start services
docker-compose -f docker-compose.prod.yml up -d

# Check logs
docker-compose -f docker-compose.prod.yml logs -f
```

### Option 2: Kubernetes
```bash
# Create namespace
kubectl create namespace candidate-nps

# Create secrets
kubectl create secret generic app-secrets \
  --from-literal=JWT_SECRET=$JWT_SECRET \
  --from-literal=DATABASE_URL=$DATABASE_URL \
  --from-literal=REDIS_PASSWORD=$REDIS_PASSWORD \
  -n candidate-nps

# Apply manifests
kubectl apply -f k8s/

# Check status
kubectl get pods -n candidate-nps
kubectl get services -n candidate-nps
kubectl get ingress -n candidate-nps
```

### Option 3: Cloud-Specific (AWS ECS Example)
```bash
# Create task definitions
aws ecs register-task-definition --cli-input-json file://task-def-backend.json

# Create services
aws ecs create-service --cluster candidate-nps --service-name backend --task-definition backend --desired-count 2

# Check status
aws ecs describe-services --cluster candidate-nps --services backend
```

---

## ✅ POST-DEPLOYMENT VERIFICATION

### Health Checks
```bash
# Backend health
curl https://api.your-domain.com/health
# Expected: {"status":"ok","timestamp":"..."}

# Frontend
curl https://your-domain.com
# Expected: HTML content

# Redis connection
redis-cli -h redis-host -p 6379 -a password ping
# Expected: PONG

# Database connection
psql $DATABASE_URL -c "SELECT 1;"
# Expected: 1
```

### Smoke Tests
- [ ] Can access frontend at https://your-domain.com
- [ ] Can login with seeded credentials
- [ ] Dashboard loads with data
- [ ] API responds at https://api.your-domain.com/health
- [ ] Background workers are running
- [ ] Redis is accessible
- [ ] Database is accessible
- [ ] File uploads work (if configured)

### Functional Tests
- [ ] Login/Logout works
- [ ] Dashboard displays metrics
- [ ] Trends page shows charts
- [ ] Cohorts page loads
- [ ] Geographic map renders
- [ ] Actions can be created/edited
- [ ] Surveys can be managed
- [ ] Admin settings accessible (admin only)
- [ ] User management works (admin only)

---

## 📊 MONITORING SETUP

### Application Monitoring
- [ ] Sentry configured for error tracking
- [ ] APM tool connected (DataDog/New Relic)
- [ ] Log aggregation configured
- [ ] Uptime monitoring enabled

### Infrastructure Monitoring
- [ ] CPU/Memory metrics tracked
- [ ] Disk usage monitored
- [ ] Network metrics tracked
- [ ] Database performance monitored

### Alerts Configured
- [ ] High error rate alert
- [ ] API response time alert
- [ ] Database connection alert
- [ ] Disk space alert
- [ ] SSL certificate expiry alert

---

## 🔄 CI/CD VERIFICATION

### GitHub Actions (or alternative)
- [ ] Pipeline runs successfully on push
- [ ] Tests pass
- [ ] Docker images build successfully
- [ ] Images pushed to registry
- [ ] Deployment triggered (if auto-deploy)

### Manual Deployment Trigger
```bash
# Trigger workflow manually
gh workflow run ci-cd.yml --ref main

# Check status
gh run list --workflow=ci-cd.yml
```

---

## 🔒 SECURITY HARDENING

### SSL/TLS
- [ ] HTTPS enabled and working
- [ ] HTTP redirects to HTTPS
- [ ] SSL certificate valid
- [ ] TLS 1.2+ only

### Firewall Rules
- [ ] Only necessary ports open
- [ ] Database not publicly accessible
- [ ] Redis not publicly accessible
- [ ] SSH key-only authentication

### Application Security
- [ ] All secrets in environment variables
- [ ] JWT secret is strong and unique
- [ ] Database passwords are strong
- [ ] CORS configured correctly
- [ ] Rate limiting enabled
- [ ] Security headers configured

---

## 📋 BACKUP CONFIGURATION

### Database Backups
- [ ] Automated daily backups enabled
- [ ] Backup retention policy set (30 days)
- [ ] Backup restoration tested
- [ ] Point-in-time recovery enabled (if available)

### Application Backups
- [ ] Environment variables backed up securely
- [ ] Docker images tagged and stored
- [ ] Configuration files versioned in Git

---

## 📈 SCALING PREPARATION

### Auto-Scaling
- [ ] Auto-scaling rules configured
- [ ] Min/max instances set
- [ ] Target CPU utilization configured
- [ ] Target memory utilization configured

### Load Balancer
- [ ] Health checks configured
- [ ] SSL termination configured
- [ ] Session persistence disabled (stateless app)

---

## 📝 DOCUMENTATION

### Team Documentation
- [ ] Deployment runbook created
- [ ] Rollback procedures documented
- [ ] Troubleshooting guide created
- [ ] On-call contact information documented

### User Documentation
- [ ] User guide available
- [ ] Admin guide available
- [ ] API documentation available (if public API)

---

## 🎉 LAUNCH CHECKLIST

### Pre-Launch
- [ ] All tests passing
- [ ] Performance tested (load testing)
- [ ] Security scan completed
- [ ] Backup and restore tested
- [ ] Monitoring dashboards created
- [ ] Team trained on deployment process

### Launch
- [ ] DNS updated to production
- [ ] SSL certificate applied
- [ ] Initial data seeded (if needed)
- [ ] Admin users created
- [ ] Team notified of launch

### Post-Launch
- [ ] Monitor error rates
- [ ] Monitor performance metrics
- [ ] Check user feedback
- [ ] Review logs for issues
- [ ] Verify all features working

---

## 🐛 ROLLBACK PROCEDURE

If something goes wrong:

### Docker Compose
```bash
# Stop current deployment
docker-compose -f docker-compose.prod.yml down

# Pull previous version
docker-compose -f docker-compose.prod.yml pull

# Start with previous version
docker-compose -f docker-compose.prod.yml up -d
```

### Kubernetes
```bash
# Rollback deployment
kubectl rollout undo deployment/backend -n candidate-nps
kubectl rollout undo deployment/worker -n candidate-nps
kubectl rollout undo deployment/frontend -n candidate-nps

# Check status
kubectl rollout status deployment/backend -n candidate-nps
```

### Database Rollback
```bash
# If migrations need to be rolled back
npx prisma migrate resolve --rolled-back <migration-name>
```

---

## 📞 SUPPORT CONTACTS

- **DevOps Lead**: [Name/Email]
- **Backend Lead**: [Name/Email]
- **Frontend Lead**: [Name/Email]
- **Database Admin**: [Name/Email]
- **Security Lead**: [Name/Email]

---

## ✅ DEPLOYMENT COMPLETE

When all items are checked:
- [ ] Application is live and accessible
- [ ] All features working correctly
- [ ] Monitoring enabled and alerting
- [ ] Backups configured
- [ ] Documentation complete
- [ ] Team notified

**Status**: 🎉 **PRODUCTION READY**

---

**Last Updated**: [Date]  
**Deployed By**: [Name]  
**Version**: v1.0.0

