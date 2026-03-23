# DevOps Learning Checklist & Tracker

Track your progress through the proximity alarm app project!

## 🎯 Project Goal
Build and deploy a complete mobile app with enterprise DevOps practices, from Hello World to production.

---

## PHASE 1: Setup & Hello World ✅

### 1.1 Prerequisites Setup
- [x] Install Git
- [x] Install Docker Desktop
- [x] Install Python 3.11+
- [x] Install Node.js 20+
- [x] Install Azure CLI
- [x] Install VS Code + extensions
- **Status**: ✅ Complete

### 1.2 Azure Setup
- [x] Create Azure account
- [x] Create Resource Group: `rg-proximity-alarm-dev`
- [x] Create Container Registry (ACR Basic SKU)
- [x] Create PostgreSQL server (Flexible Server v15)
- [x] Create Storage Account (for Terraform state)
- [x] Create Application Insights instance
- [x] Run: `az login` and verify access
- **Status**: ✅ Complete

### 1.3 GitHub Setup
- [x] Create GitHub repository
- [x] Clone locally
- [x] Add GitHub Secrets (Azure credentials)
- [ ] Set up branch protection on `main`
- [x] Create environments: dev
- **Status**: 🟡 Mostly Complete

### 1.4 Backend Hello World
- [x] Initialize project structure
- [x] Create `backend/src/main.py` with FastAPI app
- [x] Create `Dockerfile` for backend
- [x] Create `docker-compose.yml` for local dev
- [x] Test: `docker compose up` → visit http://localhost:8000
- [x] Health endpoint: GET `/health` returns `{"status":"ok"}`
- [x] CORS middleware configured for frontend
- [x] First commit pushed
- **Status**: ✅ Complete

### 1.5 Frontend Hello World
- [x] Initialize React Native project with Expo
- [x] Create navigation (Home, Map, Settings tabs)
- [x] Create `Dockerfile` for frontend
- [x] Update docker-compose for frontend service
- [x] Test: Frontend hot-reload works on http://localhost:8081
- [x] Commit pushed
- **Status**: ✅ Complete

### 1.6 First Commits & Push
- [x] Verify local: `make up` runs all services successfully
- [x] Verify API docs at http://localhost:8000/docs
- [x] Push to GitHub: `git push origin main`
- [x] Confirm GitHub repo shows commits
- **Status**: ✅ Complete

**Phase 1 Complete?** ✅ Yes

---

## PHASE 2: Development & Testing 🚧

### 2.1 Backend Features
- [x] Proximity calculation service (Haversine formula)
- [x] POST `/set-location` — set alarm point + radius
- [x] POST `/check-location` — check if user is inside radius
- [x] GET `/health` — health check
- [x] Database models (AlarmZone, AlarmEvent)
- [x] Database migrations with Alembic (0001 + 0002)
- [x] CRUD endpoints for alarm zones:
  - [x] POST `/api/zones` — create alarm zone
  - [x] GET `/api/zones` — list alarm zones
  - [x] GET `/api/zones/{id}` — get alarm zone
  - [x] PATCH `/api/zones/{id}` — update alarm zone
  - [x] DELETE `/api/zones/{id}` — delete alarm zone
- [x] Alarm history endpoints:
  - [x] POST `/api/alarm-events` — log alarm event
  - [x] GET `/api/alarm-events` — list history (filterable)
  - [x] DELETE `/api/alarm-events` — clear history
- [x] Multi-zone proximity check: POST `/api/zones/check`
- **Status**: ✅ Complete

### 2.2 Backend Testing
- [x] Write unit tests for proximity calculation
- [x] Write unit tests for API endpoints (17 tests)
- [x] Write integration tests with test database (SQLite in-memory via conftest.py)
- [ ] Achieve 80%+ code coverage (currently 60%+ enforced in CI)
- [x] Run: `pytest tests/ -v --tb=short`
- **Status**: 🟡 Mostly Complete

### 2.3 Frontend Features
- [x] HomeScreen — main dashboard with backend health status
- [x] MapScreen — interactive Leaflet/OpenStreetMap on Expo Web
  - [x] Tap to set alarm point
  - [x] Adjustable radius (± 100m buttons)
  - [x] User position marker (green dot)
  - [x] Proximity detection (Haversine client-side)
  - [x] Visual radius circle on map
  - [x] Start/Stop monitoring (browser geolocation)
- [x] SettingsScreen — alarm preferences
  - [x] Alarm mode: notification / sound / both
  - [x] Sound choice: beep / siren / chime
  - [x] Volume control (20%–100%)
  - [x] Test alarm button
- [x] AlarmDetailScreen — placeholder
- [x] Alarm trigger system
  - [x] Web Audio API sound synthesis
  - [x] Browser Notification API
  - [x] Cooldown to prevent spam
  - [x] Preferences stored in localStorage
- [x] Save multiple alarm zones (frontend CRUD via zonesApi)
- [x] Alarm history display (HistoryScreen with auto-refresh)
- [x] Toast notifications for add/delete feedback
- [x] Delete confirmation flow
- **Status**: ✅ Complete

### 2.4 Frontend Testing
- [x] Write unit tests for services (zonesApi, historyApi, alarmPreferences — 17 tests)
- [ ] Write unit tests for components
- [x] Run: `npm test`
- **Status**: 🟡 Mostly Complete (component tests deferred)

### 2.5 API Integration
- [x] Frontend calls backend `/health` endpoint
- [x] CORS configured between frontend and backend
- [x] Frontend CRUD for alarm zones via backend API
- [x] Alarm event logging from MapScreen to backend
- [x] Error handling for network failures
- **Status**: ✅ Complete

**Phase 2 Complete?** 🟡 Mostly (component tests deferred)

---

## PHASE 3: CI/CD & DevOps (upcoming)

### 3.1 GitHub Actions CI Pipeline
- [x] Create `.github/workflows/ci-backend.yml`
  - [x] Ruff lint + format check
  - [x] pytest with PostgreSQL service container
  - [x] Coverage threshold (60%)
  - [x] Push Docker image to ACR on master merge
- [x] Create `.github/workflows/ci-frontend.yml`
  - [x] TypeScript type check (`tsc --noEmit`)
  - [x] Expo web build (`expo export --platform web`)
  - [x] Dependency audit
  - [x] Jest test suite (17 tests — zonesApi, historyApi, alarmPreferences)
  - [x] Pipeline order: TypeCheck + Lint → Build → Tests
  - [x] Push Docker image to ACR on master merge
- [x] Workflows trigger on push to master and PRs
- [x] Path filters so backend changes only trigger backend CI
- [x] Linting passes locally (ruff + tsc)
- [x] All CI pipelines passing on GitHub
- **Status**: ✅ Complete

### 3.2 Infrastructure as Code (Terraform)
- [x] Create Terraform project structure (`infra/terraform/`)
- [x] Root config: providers.tf, variables.tf, main.tf, outputs.tf
- [x] Module: `network` — VNet, subnets, Private DNS
- [x] Module: `database` — PostgreSQL Flexible Server v15
- [x] Module: `container_registry` — ACR (Basic SKU)
- [x] Module: `container_apps` — Backend + Frontend Container Apps
- [x] Module: `monitoring` — Log Analytics + Application Insights
- [x] Environment-specific tfvars (dev, production)
- [x] Remote state backend (Azure Storage)
- [x] Microsoft.App resource provider registration
- [x] CI/CD pipeline (`.github/workflows/infra-terraform.yml`)
  - [x] Stage 1: Init — `terraform init`
  - [x] Stage 2: Format — `terraform fmt -check`
  - [x] Stage 3: Validate — `terraform validate`
  - [x] Stage 4: Plan — `terraform plan` + artifact + PR comment
  - [x] Stage 5: Apply — apply plan artifact, save state on failure
  - [x] Stage 6: Deploy — sync state snapshot to Azure Storage
- [x] All Azure resources deployed successfully
- [x] Backend + Frontend Container Apps running in Azure
- **Status**: ✅ Complete

### 3.3 Deployment Workflows
- [ ] Deploy to staging on push to main
- [ ] Manual approval for production
- **Status**: ⏳ Not Started

### 3.4 Monitoring & Observability
- [ ] Add Application Insights to backend
- [ ] Structured logging
- [ ] Azure dashboards
- **Status**: ⏳ Not Started

### 3.5 Security Scanning
- [ ] Trivy container scanning
- [ ] `npm audit` and `pip audit`
- **Status**: ⏳ Not Started

**Phase 3 Complete?** � ~75% (CI + IaC + deployment done, monitoring/security next)

---

## PHASE 4: Production Ready (upcoming)

### 4.1 Pre-Production Checklist
- [ ] All tests passing locally and in CI
- [ ] No security vulnerabilities
- [ ] API documentation complete
- **Status**: ⏳ Not Started

### 4.2 Documentation
- [ ] Architecture diagram
- [ ] Deployment runbook
- [ ] Incident response guide
- **Status**: ⏳ Not Started

### 4.3 Production Deployment
- [ ] Create git tag: `git tag -a v1.0.0`
- [ ] Deploy to production
- [ ] Monitor for 24 hours
- **Status**: ⏳ Not Started

**Phase 4 Complete?** ⏳ Not Started

---

## 🚀 Overall Progress

```
Phase 1: Setup & Hello World          [██████████] 100%
Phase 2: Development & Testing        [█████████░] 90%
Phase 3: CI/CD & DevOps               [███████░░░] 75%
Phase 4: Production Ready             [░░░░░░░░░░]  0%
─────────────────────────────────────────────────
Total Progress:                        [███████░░░] 66%
```

---

## 📋 Next Steps (Immediate)

1. **Monitoring** — Add Application Insights SDK to backend, structured logging
2. **Security scanning** — Trivy container scanning, npm/pip audit in CI
3. **Staging environment** — Deploy on push to main, manual approval for production
4. **Branch protection** — Require PR reviews before merging to main

---

## 📝 Notes & Learnings

### Docker & Containerization
- `docker compose up -d` starts services in background
- Volume mounts enable hot-reload during development
- `docker compose up -d --build` rebuilds images before starting
- `.dockerignore` prevents `node_modules` from being copied into images

### Frontend (Expo Web)
- `react-native-maps` does NOT work on Expo Web — use Leaflet + OpenStreetMap instead
- Leaflet CSS must be injected manually (Metro doesn't handle CSS imports)
- Leaflet marker icons need explicit URLs (defaults break in bundlers)
- Browser geolocation requires `localhost` or HTTPS
- Web Audio API can synthesize alarm sounds without audio files

### Backend (FastAPI)
- CORS middleware must be imported separately: `from fastapi.middleware.cors import CORSMiddleware`
- Haversine formula calculates great-circle distance between GPS coordinates
- Global state (`selected_location`) works for prototyping but needs a database for production

### DevOps Best Practices
- 

---

## 🎓 Knowledge Check

After each phase, ask yourself:

**Phase 1:**
- [ ] Can I start services with one command?
- [ ] Can I make changes and see them reflected locally?
- [ ] Do I understand the project structure?

**Phase 2:**
- [ ] Can I write unit tests for new code?
- [ ] Can I add new API endpoints?
- [ ] Do my tests pass consistently?

**Phase 3:**
- [ ] Do I understand how CI pipelines work?
- [ ] Can I explain Infrastructure as Code?
- [ ] Do I understand the deployment flow?

**Phase 4:**
- [ ] Can I deploy to production safely?
- [ ] Do I know how to monitor the app?
- [ ] Could I explain this project to someone else?

---

## 📚 Resources by Phase

### Phase 1
- [DEVELOPMENT.md](./DEVELOPMENT.md)
- [Docker Documentation](https://docs.docker.com/)
- [Git Book](https://git-scm.com/book)

### Phase 2
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Native Docs](https://reactnative.dev/)
- [pytest Documentation](https://docs.pytest.org/)
- [Jest Documentation](https://jestjs.io/)

### Phase 3
- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Bicep Documentation](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/)
- [Azure Container Apps](https://learn.microsoft.com/en-us/azure/container-apps/)

### Phase 4
- [Azure Application Insights](https://learn.microsoft.com/en-us/azure/azure-monitor/app/app-insights-overview)
- [Security Best Practices](https://learn.microsoft.com/en-us/azure/security/)

---

## ✅ Reflection Questions

Answer these as you complete each phase:

1. What was the most challenging part of this phase?
2. What DevOps concept did you find most valuable?
3. What would you do differently next time?
4. Which tool/technology would you like to learn more about?
5. How does this project compare to real-world scenarios?

---

**Last Updated**: 2025-03-10  
**Current Phase**: 🟢 Phase 1 Starting  
**Estimated Completion**: 2025-05-10

Good luck! 🚀
