# Docker Compose Setup Guide

Complete guide to running LionPack Studio development environment with Docker.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Services Overview](#services-overview)
3. [Configuration](#configuration)
4. [Commands](#commands)
5. [Accessing Services](#accessing-services)
6. [Troubleshooting](#troubleshooting)
7. [Production Deployment](#production-deployment)

---

## Quick Start

### Prerequisites

- Docker Desktop (macOS, Windows) or Docker Engine (Linux)
- Docker Compose v2+
- Git

### Installation

```bash
# 1. Clone repository
git clone https://github.com/leonpagotto/lionpack-studio.git
cd lionpack-studio

# 2. Create environment file
cp .env.example .env.docker

# 3. Update environment variables (optional)
# Edit .env.docker with your configuration
nano .env.docker

# 4. Start all services
docker-compose up -d

# 5. Wait for services to be healthy
docker-compose ps

# 6. Run database migrations
docker exec lionpack-postgres psql -U postgres -d lionpack_dev \
  -f /docker-entrypoint-initdb.d/001_initial_schema.sql

# 7. Access application
open http://localhost:3000
```

---

## Services Overview

### 1. PostgreSQL Database (`postgres`)

**Purpose**: Main application database

- **Image**: `postgres:16-alpine`
- **Port**: `5432`
- **Volume**: `postgres_data:/var/lib/postgresql/data`
- **Default Credentials**:
  - User: `postgres`
  - Password: `postgres`
  - Database: `lionpack_dev`

**Connection String**:
```
postgresql://postgres:postgres@localhost:5432/lionpack_dev
```

### 2. Redis (`redis`)

**Purpose**: Caching, session storage, real-time collaboration

- **Image**: `redis:7-alpine`
- **Port**: `6379`
- **Volume**: `redis_data:/data`
- **Authentication**: `redis_dev_password`

**Connection String**:
```
redis://:redis_dev_password@localhost:6379
```

### 3. PgAdmin (`pgadmin`)

**Purpose**: PostgreSQL database management UI

- **Image**: `dpage/pgadmin4:latest`
- **Port**: `5050`
- **Access**: http://localhost:5050
- **Default Credentials**:
  - Email: `admin@lionpack.local`
  - Password: `admin`

### 4. Redis Commander (`redis-commander`)

**Purpose**: Redis database management UI

- **Image**: `rediscommander/redis-commander:latest`
- **Port**: `8081`
- **Access**: http://localhost:8081

---

## Configuration

### Environment Variables

Key environment variables in `.env.docker`:

```bash
# Database
DB_NAME=lionpack_dev
DB_USER=postgres
DB_PASSWORD=postgres
DB_PORT=5432

# Redis
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=redis_dev_password

# Application
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Customization

Edit `.env.docker` before starting services:

```bash
# Change database name
DB_NAME=my_database

# Change Redis password
REDIS_PASSWORD=my_secure_password

# Change PgAdmin credentials
PGADMIN_EMAIL=me@example.com
PGADMIN_PASSWORD=secure_password
```

Then restart services for changes to take effect.

---

## Commands

### Basic Operations

```bash
# Start all services
docker-compose up -d

# Start services with output logging
docker-compose up

# Stop all services
docker-compose down

# Stop services and remove volumes
docker-compose down -v

# View running services
docker-compose ps

# View service logs
docker-compose logs -f

# View logs for specific service
docker-compose logs -f postgres
docker-compose logs -f redis
```

### Database Operations

```bash
# Connect to PostgreSQL
docker exec -it lionpack-postgres psql -U postgres -d lionpack_dev

# Run SQL file
docker exec -it lionpack-postgres psql -U postgres -d lionpack_dev \
  -f /docker-entrypoint-initdb.d/001_initial_schema.sql

# Create new database
docker exec -it lionpack-postgres createdb -U postgres -d new_database

# Dump database
docker exec lionpack-postgres pg_dump -U postgres lionpack_dev > backup.sql

# Restore database
docker exec -i lionpack-postgres psql -U postgres < backup.sql
```

### Redis Operations

```bash
# Connect to Redis CLI
docker exec -it lionpack-redis redis-cli -a redis_dev_password

# Check Redis status
docker exec lionpack-redis redis-cli -a redis_dev_password PING

# Flush all data
docker exec lionpack-redis redis-cli -a redis_dev_password FLUSHALL

# Monitor commands
docker exec -it lionpack-redis redis-cli -a redis_dev_password MONITOR
```

### Service Management

```bash
# Restart a service
docker-compose restart postgres

# Rebuild image and restart
docker-compose up -d --build

# View service resource usage
docker stats

# Remove dangling images
docker image prune

# Clean up all stopped containers
docker container prune
```

---

## Accessing Services

### Application

- **URL**: http://localhost:3000
- **Description**: Next.js application

### PgAdmin (Database UI)

- **URL**: http://localhost:5050
- **User**: admin@lionpack.local
- **Password**: admin

**Setup in PgAdmin**:
1. Open http://localhost:5050
2. Login with credentials above
3. Click "Add New Server"
4. Name: `LionPack Dev`
5. Connection Tab:
   - Host: `postgres`
   - Port: `5432`
   - Username: `postgres`
   - Password: `postgres`
   - Database: `lionpack_dev`
6. Click Save

### Redis Commander (Cache UI)

- **URL**: http://localhost:8081
- **Description**: Visual Redis browser and management tool

---

## Troubleshooting

### Services Not Starting

```bash
# Check logs
docker-compose logs

# Check specific service
docker-compose logs postgres

# Verify Docker daemon is running
docker ps
```

### Database Connection Errors

```bash
# Verify PostgreSQL is running
docker exec lionpack-postgres pg_isready

# Check PostgreSQL logs
docker logs lionpack-postgres

# Reset database
docker-compose down -v
docker-compose up -d postgres
```

### Redis Connection Issues

```bash
# Test Redis connection
docker exec lionpack-redis redis-cli -a redis_dev_password PING

# Check Redis status
docker exec lionpack-redis redis-cli -a redis_dev_password INFO

# View Redis memory usage
docker exec lionpack-redis redis-cli -a redis_dev_password INFO memory
```

### Port Already in Use

```bash
# Find process using port
lsof -i :5432  # PostgreSQL
lsof -i :6379  # Redis
lsof -i :5050  # PgAdmin
lsof -i :8081  # Redis Commander

# Kill process
kill -9 <PID>

# Or change port in docker-compose.yml or .env.docker
```

### Permission Denied Errors

```bash
# Add user to docker group (Linux)
sudo usermod -aG docker $USER

# Restart Docker daemon
sudo systemctl restart docker
```

### Out of Disk Space

```bash
# Clean up Docker
docker system prune -a

# Remove unused volumes
docker volume prune

# Check disk usage
docker system df
```

---

## Production Deployment

### Environment Configuration

1. **Create production .env file**:

```bash
cp .env.docker .env.prod
```

2. **Update critical variables**:

```bash
NODE_ENV=production
SESSION_COOKIE_SECURE=true
SESSION_COOKIE_SAME_SITE=strict
DB_PASSWORD=strong_password_here
REDIS_PASSWORD=strong_password_here
PGADMIN_PASSWORD=strong_password_here
```

### Security Best Practices

1. **Use strong passwords**:

```bash
# Generate secure password
openssl rand -base64 32
```

2. **Enable SSL/TLS**:

```bash
# Update docker-compose.yml for SSL certificates
```

3. **Network isolation**:

```bash
# Create separate network for production
docker network create lionpack-prod
```

4. **Resource limits**:

```yaml
# Add to docker-compose.yml services
resources:
  limits:
    cpus: '2'
    memory: 1G
```

5. **Backup strategy**:

```bash
# Regular backups
0 2 * * * docker exec lionpack-postgres pg_dump -U postgres lionpack_dev > /backups/lionpack_$(date +\%Y\%m\%d_\%H\%M\%S).sql
```

### Scaling

```bash
# Scale API service (if configured)
docker-compose up -d --scale api=3

# Use load balancer (nginx, traefik)
# See production docker-compose.prod.yml
```

---

## Health Checks

Services include health checks. View status:

```bash
# Check service health
docker-compose ps

# Manual health check
docker exec lionpack-postgres pg_isready -U postgres
docker exec lionpack-redis redis-cli ping
```

All services will automatically restart if they become unhealthy.

---

## Documentation Links

- [Docker Docs](https://docs.docker.com)
- [Docker Compose Reference](https://docs.docker.com/compose/compose-file/)
- [PostgreSQL Docker Hub](https://hub.docker.com/_/postgres)
- [Redis Docker Hub](https://hub.docker.com/_/redis)
- [PgAdmin Docker Hub](https://hub.docker.com/r/dpage/pgadmin4)

---

## Next Steps

After services are running:

1. ✅ Apply database migrations
2. ✅ Configure GitHub OAuth
3. ✅ Setup Supabase project
4. ✅ Configure email service
5. ✅ Start development server

See `PHASE_1_QUICK_START.md` for development workflow.
