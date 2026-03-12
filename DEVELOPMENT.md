# Development Guide

Quick start guide for setting up and running the Proximity Alarm application.

## Prerequisites

- **Git**: https://git-scm.com/
- **Docker Desktop**: https://www.docker.com/products/docker-desktop
- **Make**: Available by default on Linux/macOS

```bash
git --version
docker --version
docker compose version
make --version
```

> **Note**: You do NOT need Python or Node.js installed locally — everything runs inside Docker containers.

## Quick Start

```bash
# 1. Clone repository
git clone <repo-url>
cd proximity-alarm-app

# 2. Build and start all services
make up

# 3. Verify
curl http://localhost:8000/health
# → {"status":"ok"}
```

Open http://localhost:8081 in your browser to use the app.

## Access Points

| Service | URL | Purpose |
|---------|-----|---------|
| Frontend | http://localhost:8081 | Expo Web app (Leaflet map) |
| API | http://localhost:8000 | FastAPI backend |
| API Docs | http://localhost:8000/docs | Interactive Swagger docs |
| Health Check | http://localhost:8000/health | Service health status |
| PostgreSQL | localhost:5432 | Database (`make psql`) |

## Development Workflow

### Daily Start

```bash
# Start all services in background
make up

# Or start with logs visible
docker-compose up
```

### 2. Development with Docker (Recommended)

Everything runs in Docker with hot-reload:

```bash
# Start all services (postgres, backend, frontend)
make up

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Rebuild after Dockerfile changes
make docker-build
```

- **Backend**: Python files in `backend/src/` are volume-mounted → auto-reload via uvicorn
- **Frontend**: `frontend/` is volume-mounted → Expo Web auto-reloads on save

### 3. Frontend (Web)

The frontend runs as **Expo Web** (NOT native mobile). Open http://localhost:8081 in your browser.

Key points:
- Uses **Leaflet + OpenStreetMap** for the interactive map (react-native-maps does not work on Expo Web)
- Browser geolocation requires `localhost` or HTTPS — access the app via `localhost:8081`, not an IP address
- To simulate GPS position, use Chrome DevTools → Sensors → Location

### 4. Frontend Structure

```
frontend/src/
├── navigation/     # AppNavigator (bottom tabs + stack)
├── screens/        # MapScreen, SettingsScreen, HomeScreen, AlarmDetailScreen
├── services/       # alarmPreferences, alarmTrigger, locationService, health
├── ui/             # Reusable layout primitives
├── config/         # Theme, constants
└── hooks/          # Custom hooks
```

### 5. API Endpoints

The backend currently provides:

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/` | Root message |
| `GET` | `/health` | Health check |
| `POST` | `/set-location` | Set alarm point (lat, lng, radius) |
| `POST` | `/check-location` | Check proximity (returns alarm + distance) |

```bash
# Set an alarm point
curl -X POST http://localhost:8000/set-location \
  -H "Content-Type: application/json" \
  -d '{"latitude": 44.4268, "longitude": 26.1025, "radius": 500}'

# Check if a position is within the radius
curl -X POST http://localhost:8000/check-location \
  -H "Content-Type: application/json" \
  -d '{"latitude": 44.4270, "longitude": 26.1030}'
```

> **Note**: The backend currently stores the alarm point in memory (global variable). Database persistence is planned.

## Testing

> Tests are not yet implemented. This is on the roadmap.

```bash
make test           # Run all tests (placeholder)
make test-backend   # Backend tests (planned: pytest)
make test-frontend  # Frontend tests (planned: Jest)
```

## Code Quality

```bash
make lint           # Lint all
make lint-backend   # flake8, mypy
make lint-frontend  # eslint
```

## Database

PostgreSQL is running in Docker but **no tables have been created yet**. The backend uses in-memory state. Database persistence is on the roadmap.

```bash
make psql           # Connect to the database

# Inside psql:
\dt                 # List tables (none yet)
\q                  # Quit
```

To reset everything:
```bash
make clean && make up
```

## Git Workflow

### Create a Feature Branch

```bash
# Option 1: Using make
make feature-branch
# Prompts for feature name

# Option 2: Manual
git checkout -b feat/your-feature-name
```

### Make Your First Commit

```bash
# Edit some files...
make ready-to-commit
# Follow prompts to create commit

# Or manually:
git add .
git commit -m "feat: your feature description"
git push origin feat/your-feature-name
```

### Commit Convention

Use conventional commits:

```
feat: add new feature
fix: correct a bug
docs: documentation changes
test: add or update tests
chore: infrastructure/tooling changes
style: code style (no logic change)
refactor: restructure code (no feature change)
```

Example:
```bash
git commit -m "feat: add proximity calculation service

- Implement Haversine formula for distance calculation
- Add unit tests for distance calculation
- Add documentation"
```

## Troubleshooting

### "Port 8000 already in use"

```bash
lsof -ti:8000 | xargs kill -9
```

### "Docker daemon not running"

```bash
sudo systemctl start docker
```

### Map not showing / blank page

- Make sure you access via `http://localhost:8081` (not an IP)
- Leaflet CSS/JS is loaded from CDN — you need internet access
- Check browser console for errors

### Geolocation not working

- Browser blocks geolocation on non-HTTPS origins (except `localhost`)
- Use Chrome DevTools → Sensors → Location to simulate coordinates
- Make sure the browser has location permission for the page

### Backend can't connect to database

```bash
docker-compose ps           # Check services
docker-compose logs postgres  # Check DB logs
make down && make up        # Restart
```

## Development Tips

### Hot Reload

Both services support live reloading when running via Docker:
- **Backend**: Changes to `backend/src/` Python files auto-reload (uvicorn `--reload`)
- **Frontend**: Changes to `frontend/src/` auto-reload (Expo Web)

### Debugging Backend

Visit http://localhost:8000/docs for interactive Swagger UI to test endpoints.

```bash
# View backend logs
docker-compose logs -f backend
```

### Debugging Frontend

Open browser DevTools (F12) → Console for React errors, network requests, and geolocation issues.

## Common Tasks

### Rebuild Containers

```bash
make docker-build && make up
```

### View All Logs

```bash
make logs
# or
docker-compose logs -f
```

### Stop Everything

```bash
make down
```

### Clean Everything (including DB data)

```bash
make clean
```
6. ✅ Push to GitHub: `git push origin feat/your-feature`
7. 📖 Read [DEVOPS_LEARNING_PLAN.md](./DEVOPS_LEARNING_PLAN.md) for the full plan

## Getting Help

- **API Documentation**: http://localhost:8000/docs
- **Logs**: `make logs` or `docker-compose logs -f`
- **Database**: `make psql`
- **Services Status**: `make status`
- **Deep Dive**: See [DEVOPS_LEARNING_PLAN.md](./DEVOPS_LEARNING_PLAN.md)

---

**Happy coding! 🚀**
