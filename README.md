# QuestPath - Full-Stack Learning Platform

A full-stack application built to learn backend development, infrastructure, and deployment. Self-taught project covering everything from API design to production deployment on AWS.

#####
https://questpath.live/
####

   
## 🎯 What's Inside

**Backend & Infrastructure:**
- **Backend**: FastAPI with async Python, SQLAlchemy 2.0 for database operations
- **DevOps**: AWS EC2 deployment, Docker containers, Nginx reverse proxy, SSL/TLS setup
- **CI/CD**: GitHub Actions for automated deployments
- **Database**: PostgreSQL with migrations, Redis for caching
- **Production**: Running live on AWS with proper SSL, monitoring, and deployment automation

## 🏗️ Architecture

### Infrastructure & DevOps
```
AWS EC2 (Ubuntu 24.04)
├── Nginx (reverse proxy + SSL termination)
│   ├── HTTP → HTTPS redirect
│   ├── Let's Encrypt SSL/TLS certificates
│   ├── Proxy routing to backend & frontend
│   └── Security headers & compression
├── Docker Compose orchestration
│   ├── Backend container (FastAPI)
│   ├── Frontend container (Next.js)
│   ├── PostgreSQL 15 (persistent volumes)
│   └── Redis 7 (caching layer)
├── GitHub Actions CI/CD
│   ├── Automated Docker builds
│   ├── Image push to Docker Hub
│   ├── SSH deployment to EC2
│   └── Zero-downtime container restarts
└── SSL Certificate Management
    ├── Certbot automation
    └── Auto-renewal hooks
```

### Backend Stack
```
FastAPI (Python 3.13)
├── Async/await patterns throughout
├── SQLAlchemy 2.0 (async ORM)
│   ├── Connection pooling
│   ├── Lazy/eager loading strategies
│   └── Transaction management
├── Alembic migrations (version control)
├── Redis caching layer
│   ├── Leaderboard caching (60s TTL)
│   └── Session management
├── JWT authentication + OAuth 2.0
├── Pydantic validation schemas
├── OpenAI API integration (GPT-4)
├── Stripe payment processing
└── Rate limiting & middleware
```

### Frontend Stack
```
Next.js 16 (TypeScript)
├── App Router with SSR
├── NextAuth.js integration
└── TailwindCSS styling
```

## 🚀 Technical Implementation

### 1. **DevOps & Deployment Pipeline**
```yaml
GitHub Actions Workflow:
1. Push to main branch
2. Build Docker images (backend + frontend)
3. Push to Docker Hub
4. SSH into EC2 instance
5. Pull latest images
6. Restart containers with zero downtime
7. Restart Nginx
```

### 6. **Docker Orchestration**
- **Multi-container Setup**: Nginx, Frontend, Backend, PostgreSQL, Redis
- **Volume Mounting**: Persistent data for database and SSL certificates
- **Network Configuration**: Internal Docker network for service communication
- **Learning**: Container orchestration, network isolation, service mesh basics

### 3. **HTTPS Certificate Management**

## 📦 Project Structure

```
questpath-monorepo/
├── backend/
│   ├── app/
│   │   ├── ai_service.py          # OpenAI GPT-4 integration
│   │   ├── auth.py                # JWT & OAuth handlers
│   │   ├── cache.py               # Redis caching layer
│   │   ├── db.py                  # Async database session
│   │   ├── models.py              # SQLAlchemy models
│   │   ├── schemas.py             # Pydantic schemas
│   │   ├── goals.py               # Goals endpoints
│   │   ├── progression.py         # XP & leaderboard
│   │   ├── quizzes.py             # Quiz generation
│   │   ├── payment_processer.py   # Stripe integration
│   │   └── middleware.py          # Request/response middleware
│   ├── migrations/                # Alembic migrations
│   ├── docker-compose.yml         # Container orchestration
│   ├── Dockerfile                 # Backend container
│   ├── nginx.production.conf      # Nginx configuration
│   └── requirements.txt           # Python dependencies
│
└── frontend/
    ├── app/
    │   ├── (auth)/                # Authentication pages
    │   ├── api/auth/              # NextAuth API routes
    │   ├── dashboard/             # Main dashboard
    │   ├── goals/                 # Goal management
    │   ├── leaderboard/           # User rankings
    │   ├── pricing/               # Premium features
    │   ├── profile/               # User profile
    │   └── about/                 # About page
    ├── components/                # Reusable React components
    ├── contexts/                  # React Context providers
    ├── lib/                       # Utility functions & API client
    └── Dockerfile                 # Frontend container
```

### CI/CD Pipeline
Push to main triggers automated deployment:
- Build Docker images for backend and frontend
- Push to Docker Hub
- SSH into EC2 and restart containers

## 🛠️ Technical Challenges Solved

### 1. **Nginx Routing Complexity**
- **Challenge**: Route `/api/auth/*` to both backend (register/me) and frontend (NextAuth callbacks)
- **Problem**: Conflicting location blocks causing 502 errors
- **Solution**: 
  - Explicit location blocks for backend endpoints (`/api/auth/register`, `/api/auth/me`)
  - Catch-all regex for NextAuth: `location ~ ^/api/auth/.*`
  - Nginx location priority: exact match > prefix > regex
- **Learning**: Nginx location block ordering and matching rules

### 2. **Docker Multi-Container Networking**
- **Challenge**: Service discovery between containers without hardcoded IPs
- **Problem**: Backend couldn't connect to PostgreSQL, frontend couldn't reach backend
- **Solution**: 
  - Docker Compose creates default network `questpath_network`
  - Services communicate via container names as DNS (e.g., `db:5432`, `backend:8000`)
  - Exposed ports only for Nginx (80, 443), internal services isolated
- **Learning**: Container orchestration, network isolation, service mesh basics

### 3. **HTTPS Certificate Management**
- **Challenge**: SSL certificate acquisition and renewal without downtime
- **Problem**: Certbot standalone mode requires port 80, conflicts with Nginx
- **Solution**: 
  - Initial setup: Stop Nginx, run Certbot standalone
  - Renewal: Configured renewal hooks to reload Nginx
  - Cron job for automatic renewal checks twice daily
  - Certificate stored in Docker volume for persistence
- **Learning**: Let's Encrypt ACME protocol, certificate lifecycle management

### 4. **Async Database Connection Pooling**
- **Challenge**: Optimal connection management for async operations under load
- **Problem**: Connection exhaustion under concurrent requests, timeout errors
- **Solution**: 
  - SQLAlchemy async engine with pool size 5-20
  - Pool pre-ping for connection health checks
  - Pool recycle after 3600 seconds
  - Proper session cleanup with `async with` context managers
- **Learning**: Connection pooling strategies, async context management

### 5. **CI/CD Zero-Downtime Deployment**
- **Challenge**: Deploy new versions without service interruption
- **Problem**: `docker compose down` causes downtime
- **Solution**: 
  - Pull new images first
  - Use `docker compose up -d` to recreate only changed containers
  - Health checks ensure new containers are ready before old ones stop
  - Nginx reload without dropping connections
- **Learning**: Blue-green deployment patterns, rolling updates

### 6. **OAuth Flow Across Domains**
- **Challenge**: Google OAuth callback handling between frontend and backend
- **Problem**: Token exchange, user creation, session management across services
- **Solution**: 
  - NextAuth handles OAuth flow in frontend
  - Frontend receives Google token
  - Exchanges with backend for JWT
  - Backend creates/updates user in database
  - Returns JWT for subsequent API calls
- **Learning**: OAuth 2.0 authorization code flow, token exchange patterns

### 7. **Database Migration in Production**
- **Challenge**: Apply schema changes without data loss or downtime
- **Problem**: Manual SQL risky, no version control
- **Solution**: 
  - Alembic for versioned migrations
  - Generated migrations reviewed before apply
  - `alembic upgrade head` in deployment pipeline
  - Backup before major migrations
  - Rollback capability via `alembic downgrade`
- **Learning**: Database versioning, migration safety practices

### 8. **Secret Management**
- **Challenge**: Manage environment variables across dev/staging/prod
- **Problem**: Accidentally committed secrets to Git (caught by GitHub scanning)
- **Solution**: 
  - `.env.example` templates in repo
  - `.env*` in `.gitignore`
  - Production secrets in EC2 instance only
  - GitHub Actions secrets for CI/CD
  - Removed secrets from Git history
- **Learning**: Secret management best practices, Git history rewriting

## 📊 Performance

- Redis caching for leaderboard (60s TTL)
- Database indexes on frequently queried columns
- Nginx gzip compression
- SQLAlchemy connection pooling

## 🔒 Security

- HTTPS with HSTS headers
- JWT tokens with refresh rotation
- ORM to prevent SQL injection
- XSS protection headers
- CORS setup
- Rate limiting on endpoints
- Secrets in environment variables only

## 📈 What I Learned

### Infrastructure & DevOps
- AWS EC2: provisioning instances, security groups, SSH management
- Nginx: reverse proxy setup, location blocks, SSL termination
- Docker: multi-stage builds, volumes, networking between containers
- CI/CD: GitHub Actions workflows, automated deployments via SSH
- SSL/TLS: Let's Encrypt certificates, renewal automation

### Backend
- Async Python: `async/await` patterns, non-blocking database operations
- SQLAlchemy 2.0: async ORM, connection pooling, query optimization
- Database migrations: Alembic for version-controlled schema changes
- API design: RESTful endpoints, error handling, rate limiting
- Redis caching: TTL-based expiration, cache invalidation

### Real Problems Solved
- Nginx routing: conflicting location blocks, proper priority ordering
- Docker networking: container communication without hardcoded IPs
- SSL certificates: renewal without downtime
- Database connections: pool exhaustion under load
- Secret management: keeping API keys out of Git (learned the hard way)
- Zero-downtime deployments: container restart strategies

## 🔗 Links

- **Live Application**: https://questpath.live
- **GitHub**: https://github.com/shaxb
- **Telegram**: https://t.me/ShaxbozAbduxalilov

## 👨‍💻 Author

**Abduxalilov Shaxboz**  
Self-taught developer from Uzbekistan

Built this to learn how everything works under the hood - from writing APIs to deploying on real servers.





## 💻 Local Development Setup

### Prerequisites
- Node.js 18+ & npm
- Python 3.13+
- Docker & Docker Compose
- Git

### Backend Setup
```bash
cd backend
python -m venv .venv
source .venv/Scripts/activate  # Windows
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Add: DATABASE_URL, JWT_SECRET, OPENAI_API_KEY, STRIPE_SECRET_KEY

# Start dependencies
docker compose up -d db redis

# Run migrations
alembic upgrade head

# Start server
uvicorn main:app --reload --port 8000
```

### Frontend Setup
```bash
cd frontend
npm install

# Configure environment
# Create .env.local with:
# NEXTAUTH_URL=http://localhost:3000
# NEXTAUTH_SECRET=your-secret
# NEXT_PUBLIC_API_URL=http://localhost:8000

npm run dev
```

## 🌐 Production Deployment

### Infrastructure Setup
1. **AWS EC2 Instance**: Ubuntu 24.04, t2.micro (free tier)
2. **Domain Configuration**: DNS A record pointing to EC2 public IP
3. **SSL Certificate**: Let's Encrypt with Certbot
4. **Docker Installation**: Docker Engine + Docker Compose v2

### Deployment Process
```bash
# On EC2 instance
git clone <repository>
cd questpath-monorepo/backend

# Configure production environment
nano .env.production

# Obtain SSL certificate
sudo certbot certonly --standalone -d questpath.live

# Start all services
docker compose up -d

# Verify deployment
curl -I https://questpath.live
```