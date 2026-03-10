# Development Guide

Quick start guide for setting up and running the Proximity Alarm application.

## Prerequisites

Before starting, ensure you have installed:
- **Git**: https://git-scm.com/
- **Docker Desktop**: https://www.docker.com/products/docker-desktop
- **Python 3.11+**: https://www.python.org/downloads/
- **Node.js 18+**: https://nodejs.org/
- **VS Code**: https://code.visualstudio.com/

### Verify Installation

```bash
git --version
docker --version
python --version
node --version
npm --version
```

All should return version numbers.

## Quick Start (5 minutes)

### Option 1: One Command (Recommended)

```bash
make first-run
```

This runs: `clean` → `setup` → `up` and your app is live!

### Option 2: Step by Step

```bash
# 1. Clone repository
git clone https://github.com/yourusername/proximity-alarm-app.git
cd proximity-alarm-app

# 2. Setup backend and frontend
make setup

# 3. Start all services
make up

# 4. Verify it's working
curl http://localhost:8000/
# Should return: {"message": "Hello World from Proximity Alarm API! 🎯", ...}
```

## Access the Application

After running `make up`:

| Service | URL | Purpose |
|---------|-----|---------|
| API | http://localhost:8000 | Backend API |
| API Docs | http://localhost:8000/docs | Interactive API documentation |
| Health Check | http://localhost:8000/health | Service health status |
| PostgreSQL | localhost:5432 | Database (use `make psql`) |

## Development Workflow

### 1. Daily Start

```bash
# Start all services in background
make up

# Or start with logs visible
docker-compose up
```

### 2. Backend Development

```bash
# Terminal 1: Start backend with hot reload
make dev-backend
# or
cd backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
uvicorn src.main:app --reload
```

### 3. Frontend Development

```bash
# Terminal 2: Start frontend
make dev-frontend
# or
cd frontend
npx expo start
```

### 4. Request an API

```bash
# Create an alarm point
curl -X POST http://localhost:8000/api/alarms/points \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Home",
    "latitude": 40.7128,
    "longitude": -74.0060,
    "radius_meters": 200
  }'

# List alarm points
curl http://localhost:8000/api/alarms/points

# Get a specific alarm point
curl http://localhost:8000/api/alarms/points/1
```

## Testing

### Run All Tests

```bash
make test
```

### Backend Tests Only

```bash
make test-backend

# Or manually:
cd backend
source venv/bin/activate
pytest tests/unit/ -v           # Unit tests
pytest tests/integration/ -v    # Integration tests
pytest tests/ -v --cov          # With coverage
```

### Frontend Tests Only

```bash
make test-frontend

# Or manually:
cd frontend
npm test

# Watch mode (re-run on changes)
make test-watch-frontend
```

## Code Quality

### Lint Code

```bash
make lint
```

### Lint Backend Only
```bash
make lint-backend
# Checks with flake8, mypy
```

### Lint Frontend Only
```bash
make lint-frontend
```

## Database

### Access Database

```bash
make psql

# Inside psql:
\dt                    # List tables
SELECT * FROM alarm_points;  # Query data
\q                     # Quit
```

### Reset Database

```bash
make clean             # Clean everything including DB volumes
make up               # Restart with fresh database
```

### Seed Test Data

```bash
make db-seed
# This populates database with test alarm points
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
# Kill the process using port 8000
lsof -ti:8000 | xargs kill -9  # Mac/Linux
netstat -ano | findstr :8000   # Windows (find PID, then)
taskkill /PID <PID> /F
```

### "Docker daemon not running"

Start Docker Desktop or Docker service. On Linux:
```bash
sudo systemctl start docker
```

### "Permission denied" in database

```bash
make clean
make up
# This resets everything
```

### Tests failing locally but passing in CI

- Check Python version: `python --version`
- Check Node version: `node --version`
- Delete cache: `make clean`
- Reinstall: `make setup`

### Backend can't connect to database

```bash
# Check services are running
docker-compose ps

# View logs
docker-compose logs postgres
docker-compose logs backend

# Restart
make down && make up
```

## Development Tips

### Hot Reload

Both backend and frontend support live reloading:
- **Backend**: Changes to Python files auto-reload
- **Frontend**: Changes to React Native code auto-reload

### IDE Integration

**VS Code Extensions to Install:**
1. Python (ms-python.python)
2. Pylance (ms-python.vscode-pylance)
3. ES7+ React/Redux/React-Native snippets
4. Docker (ms-vscode.docker)
5. REST Client (humao.rest-client) - for testing APIs

### Debugging Backend

```python
# Add breakpoint in Python code
import pdb; pdb.set_trace()

# Or use debugger in VS Code (requires launch.json)
```

### Debugging Frontend

```tsx
// React Native debugging
console.log('Debug info:', variable);

// Or use Expo DevTools
```

## Common Tasks

### Update Dependencies

```bash
# Backend
cd backend
source venv/bin/activate
pip install --upgrade -r requirements.txt

# Frontend
cd frontend
npm update
```

### Format Code

```bash
# Backend (Python)
cd backend
source venv/bin/activate
black src/
isort src/

# Frontend (JavaScript)
cd frontend
npm run format
```

### Generate API Client SDK (Optional)

```bash
# Install openapi-generator
brew install openapi-generator

# Generate TypeScript client for frontend
openapi-generator generate \
  -i http://localhost:8000/openapi.json \
  -g typescript-axios \
  -o frontend/src/services/api-client
```

## Next Steps

1. ✅ Run `make first-run`
2. ✅ Visit http://localhost:8000/docs
3. ✅ Make your first API call
4. ✅ Run `make test` to see tests pass
5. ✅ Make a code change and commit
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
