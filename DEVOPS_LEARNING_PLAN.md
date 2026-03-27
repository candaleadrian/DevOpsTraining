# DevOps Learning Plan: Proximity Alarm Mobile App 📱🎯

**Goal**: Build a production-ready React Native + Python/FastAPI mobile app with enterprise-grade DevOps practices, from Hello World to committed code reflected in live app.

**Stack**: 
- **Frontend**: React Native (Expo) — Web + Android from single codebase (Leaflet on web, react-native-maps on Android)
- **Backend**: Python/FastAPI
- **Infrastructure**: Azure (Container Apps, PostgreSQL) — deployed ✅
- **CI/CD**: GitHub + GitHub Actions ✅ (backend + frontend + infra pipelines active)
- **Containerization**: Docker + Docker Compose
- **IaC**: Terraform (azurerm v4.65.0) ✅
- **Observability**: Azure Application Insights — planned
- **Database**: PostgreSQL 15 (running, Alembic migrations auto-run on deploy)
- **Version Control**: Git/GitHub

---

## 📊 Project Phases Overview

```
PHASE 1        PHASE 2          PHASE 3              PHASE 4
Setup & Learn  Development      CI/CD & Ops          Production Ready
(1-2 weeks)    (2-3 weeks)      (1-2 weeks)          (1 week)
     ↓              ↓                 ↓                    ↓
Hello World   Feature Build     Pipeline Build       Go Live & Monitor
```

---

## 🏗️ PHASE 1: Setup & Learn (1-2 weeks)

Goal: Establish foundation, learn tools, create "Hello World" app that commits and deploys.

### 1.1 Prerequisites & Local Environment Setup

#### Install Required Tools
- [x] **Git**: `git --version`
- [x] **Docker Desktop**: `docker --version`
- [x] **Node.js 20+**: `node -v && npm -v` (runs in Docker)
- [x] **Python 3.11+**: `python --version` (runs in Docker)
- [ ] **Azure CLI**: `az --version` (not yet needed)
- [ ] **GitHub CLI**: `gh --version` (not yet needed)
- [x] **VS Code** + Extensions

#### Azure Setup (Future — Phase 3/4)
- [ ] Create Azure account (free tier)
- [ ] Create Resource Group: `devops-learning-rg`
- [ ] Create Container Registry
- [ ] Create PostgreSQL server (flexible server)
- [ ] Create Application Insights instance

#### GitHub Setup
- [x] Create GitHub repo
- [ ] Set up branch protection rules (main branch)
- [ ] Create environments: `development`, `staging`, `production`
- [ ] Set up GitHub Secrets for Azure credentials

### 1.2 Repository Structure (Current)

```
proximity-alarm-app/
├── .github/
│   └── workflows/
│       ├── ci-backend.yml          # Backend CI: lint (ruff) + test (pytest + PostgreSQL)
│       ├── ci-frontend.yml         # Frontend CI: typecheck + lint → build → test
│       ├── build-android.yml       # Android APK build (workflow_dispatch, master only)
│       └── infra-terraform.yml     # Terraform plan/apply pipeline
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── alembic.ini
│   ├── alembic/
│   │   ├── env.py
│   │   └── versions/
│   │       ├── 0001_create_alarm_zones.py
│   │       └── 0002_create_alarm_events.py
│   ├── tests/
│   │   ├── conftest.py             # SQLite in-memory DB override for tests
│   │   └── test_api.py             # 17 API tests (CRUD, proximity, events)
│   └── src/
│       ├── main.py                 # FastAPI app (all endpoints)
│       ├── database.py             # SQLAlchemy engine + session
│       └── models/
│           ├── alarm_zone.py       # AlarmZone model
│           └── alarm_event.py      # AlarmEvent model
├── frontend/
│   ├── Dockerfile
│   ├── package.json
│   ├── app.json                    # Expo config (incl. background location permissions)
│   ├── eas.json                    # EAS Build config (Android APK/AAB)
│   ├── jest.config.js              # Jest configuration (ts-jest)
│   └── src/
│       ├── components/
│       │   ├── PlatformMap.tsx         # Web map (Leaflet + custom zoom/locate controls)
│       │   ├── PlatformMap.native.tsx  # Android map (react-native-maps + custom controls)
│       │   ├── PlatformMap.types.ts   # Shared map types and zone colours
│       │   └── LocationSearch.tsx      # Geocoding search bar
│       ├── navigation/
│       │   └── AppNavigator.tsx        # Bottom tabs + stack (emoji icons)
│       ├── screens/
│       │   ├── HomeScreen.tsx
│       │   ├── MapScreen.tsx           # Map + zone CRUD + monitoring + editing
│       │   ├── HistoryScreen.tsx       # Alarm history log
│       │   ├── SettingsScreen.tsx      # Alarm prefs + radius step config
│       │   └── AlarmDetailScreen.tsx
│       ├── services/
│       │   ├── zonesApi.ts             # Zone CRUD API client
│       │   ├── historyApi.ts           # Alarm events API client
│       │   ├── alarmPreferences.ts     # localStorage preference store (web)
│       │   ├── alarmPreferences.native.ts # AsyncStorage (Android)
│       │   ├── alarmTrigger.ts         # Web Audio + Notification API
│       │   ├── alarmTrigger.native.ts  # Vibration + expo-notifications (Android)
│       │   ├── locationTracker.ts      # Browser geolocation (web)
│       │   ├── locationTracker.native.ts # expo-location + background task (Android)
│       │   ├── locationService.js      # Legacy API calls
│       │   ├── health.ts               # Health check service
│       │   └── __tests__/
│       │       ├── zonesApi.test.ts        # 7 tests
│       │       ├── historyApi.test.ts      # 5 tests
│       │       ├── alarmPreferences.test.ts # 5 tests
│       │       └── LocationSearch.test.ts  # 9 tests
│       ├── ui/                     # Reusable layout primitives
│       ├── config/                 # Theme, constants
│       └── hooks/                  # Custom hooks
├── infra/
│   └── terraform/              # Azure IaC (modules: network, database, container_apps, etc.)
├── docker-compose.yml              # 3 services: postgres, backend, frontend
├── Makefile                        # Common commands
├── DEVOPS_LEARNING_PLAN.md         # This file
├── DEVELOPMENT.md                  # Development guide
├── CHECKLIST.md                    # Progress checklist
└── README.md
```

### 1.3 Hello World - Backend (First Commit)

#### Step 1: Initialize Backend Project
```bash
mkdir proximity-alarm-app && cd proximity-alarm-app
mkdir backend && cd backend
python -m venv venv
source venv/bin/activate  # or `venv\Scripts\activate` on Windows

pip install fastapi uvicorn python-dotenv sqlalchemy psycopg2-binary pydantic
touch requirements.txt
```

#### Step 2: Create Initial FastAPI App
**File: `backend/src/main.py`**
```python
from fastapi import FastAPI
from fastapi.responses import JSONResponse
import os
from datetime import datetime

app = FastAPI(
    title="Proximity Alarm API",
    description="API for proximity-based alarm system",
    version="0.0.1"
)

@app.get("/")
async def root():
    return {
        "message": "Hello World from Proximity Alarm API! 🎯",
        "version": "0.0.1",
        "timestamp": datetime.utcnow().isoformat(),
        "environment": os.getenv("ENVIRONMENT", "development")
    }

@app.get("/health")
async def health():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

#### Step 3: Create Configuration
**File: `backend/.env.example`**
```
ENVIRONMENT=development
DATABASE_URL=postgresql://user:password@localhost:5432/proximity_alarm
AZURE_CONNECTION_STRING=
LOG_LEVEL=INFO
```

#### Step 4: Dockerfile
**File: `backend/Dockerfile`**
```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY src/ ./src/

EXPOSE 8000

CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

#### Step 5: Docker Compose for Local Dev
**File: `docker-compose.yml` (root)**
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: devops_user
      POSTGRES_PASSWORD: devops_password
      POSTGRES_DB: proximity_alarm
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U devops_user"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      DATABASE_URL: postgresql://devops_user:devops_password@postgres:5432/proximity_alarm
      ENVIRONMENT: development
    depends_on:
      postgres:
        condition: service_healthy
    volumes:
      - ./backend/src:/app/src
    command: uvicorn src.main:app --host 0.0.0.0 --port 8000 --reload

volumes:
  postgres_data:
```

#### Step 6: Git Initialization & First Commit
```bash
cd /path/to/proximity-alarm-app
git init
git add .
git commit -m "chore: initialize project structure with hello world backend

- Initialize FastAPI hello world app
- Set up Docker and docker-compose for local development
- Create PostgreSQL service
- Add environment configuration"

git remote add origin https://github.com/yourusername/proximity-alarm-app.git
git branch -M main
git push -u origin main
```

**Checkpoint**: Run `docker-compose up` and visit `http://localhost:8000` → see Hello World! ✅

### 1.4 Hello World - Frontend (Second Commit)

#### Step 1: Initialize React Native Project
```bash
npx create-expo-app frontend
cd frontend
npm install @react-navigation/native @react-navigation/bottom-tabs
npm install axios zustand
npm install -D jest @testing-library/react-native
```

#### Step 2: Create Hello World Screen
**File: `frontend/src/App.tsx`**
```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hello World! 🎯</Text>
      <Text style={styles.subtitle}>Proximity Alarm App</Text>
      <Text style={styles.version}>v0.0.1</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
  },
  version: {
    fontSize: 14,
    color: '#999',
  },
});
```

#### Step 3: Frontend Dockerfile
**File: `frontend/Dockerfile`**
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

EXPOSE 8081

CMD ["npm", "start"]
```

#### Step 4: Commit
```bash
git add frontend/
git commit -m "feat: initialize React Native hello world app

- Set up Expo-based React Native project
- Create Hello World screen component
- Add navigation and state management dependencies
- Add Docker support for frontend"
```

### 1.5 GitHub Repository Setup

#### Step 1: Set Up GitHub Secrets (for CI/CD later)
In GitHub repo → Settings → Secrets and variables → Actions:
```
AZURE_CLIENT_ID: <your-client-id>
AZURE_CLIENT_SECRET: <your-client-secret>
AZURE_SUBSCRIPTION_ID: <your-subscription-id>
AZURE_TENANT_ID: <your-tenant-id>
REGISTRY_LOGIN_SERVER: devopslearningacr.azurecr.io
REGISTRY_USERNAME: <username>
REGISTRY_PASSWORD: <password>
```

#### Step 2: Create Branch Protection Rules
Settings → Branches → Add rule for `main`:
- ✅ Require pull request reviews before merging (1 reviewer)
- ✅ Require status checks to pass before merging (CI tests)
- ✅ Require branches to be up to date

#### Step 3: Add PR Template
**File: `.github/pull_request_template.md`**
```markdown
## Description
Brief summary of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing Done
- [ ] Unit tests added/updated
- [ ] Integration tests passed
- [ ] Manual testing completed

## Checklist
- [ ] Code follows project style
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No new warnings generated
```

---

## 🧪 PHASE 2: Development & Testing (2-3 weeks)

Goal: Build proximity alarm feature with comprehensive testing.

### 2.1 Backend Development

#### Status: Partially Complete

**Done:**
- [x] FastAPI app with CORS middleware
- [x] Haversine distance calculation (`calculate_distance`)
- [x] `POST /set-location` — set alarm point (lat, lng, radius)
- [x] `POST /check-location` — check proximity, returns `{alarm: bool, distance: float}`
- [x] `GET /health` — health check
- [x] Pydantic models for request validation (`LocationData`, `UserLocation`)

**TODO:**
- [ ] Database models for alarm zones (AlarmPoint table with SQLAlchemy)
- [ ] Database connection layer (get_db session dependency)
- [ ] CRUD API endpoints: `POST /api/alarms`, `GET /api/alarms`, `DELETE /api/alarms/{id}`
- [ ] Replace in-memory `selected_location` global with database persistence
- [ ] Alembic migrations
- [ ] Unit tests with pytest
- [ ] Integration tests with TestClient

#### Backend Tests (Planned)

```bash
# Unit tests
pytest backend/tests/unit/ -v

# Integration tests
pytest backend/tests/integration/ -v
```

### 2.2 Frontend Development

#### Status: Core Features Complete

**Done:**
- [x] Expo Web app running in Docker (port 8081)
- [x] Bottom tab navigation (Home, Map, Settings)
- [x] Interactive Leaflet map with OpenStreetMap tiles
- [x] Tap to set alarm point + blue radius circle
- [x] Radius adjustment (± 100m buttons)
- [x] Browser geolocation (Start/Stop monitoring)
- [x] Client-side Haversine proximity detection
- [x] Alarm trigger system: Web Audio API (beep/siren/chime) + Browser Notification API
- [x] Alarm preferences UI (mode, sound, volume) with localStorage persistence
- [x] Test alarm button in Settings

**TODO:**
- [x] Display saved alarm zones from DB (backend CRUD + frontend zonesApi)
- [x] Multiple simultaneous alarm zones (multi-zone CRUD + proximity check)
- [ ] Simulation mode for testing without real GPS
- [x] Unit tests with Jest (17 tests — zonesApi, historyApi, alarmPreferences)

### 2.3 Testing Summary

| Test Type | Framework | Status | Command |
|-----------|-----------|--------|---------|
| Backend Unit | pytest | ✅ Done (17 tests) | `pytest tests/ -v --tb=short` |
| Backend Integration | TestClient + SQLite | ✅ Done | `pytest tests/ -v` |
| Frontend Unit | Jest + ts-jest | ✅ Done (17 tests) | `npm test` |
| Frontend E2E | Playwright/Cypress | Planned | TBD |
| Load Testing | Locust | Planned | TBD |

### 2.4 Lessons Learned So Far

- **react-native-maps doesn't work on Expo Web** — solved with platform-specific file resolution: Leaflet on web + react-native-maps on Android
- **Two files with same screen name** caused confusion — keep one canonical export per screen
- **CORSMiddleware must be explicitly imported** from `fastapi.middleware.cors`
- **Browser geolocation requires localhost or HTTPS** — Docker port-mapping must use localhost
- **Web Audio API** can synthesize sounds without audio files — beep, siren, chime all generated in code

---

## 🚀 PHASE 3: CI/CD Pipeline & DevOps (1-2 weeks)

Goal: Automate testing, building, and deployment.

### 3.1 GitHub Actions CI/CD Workflows

#### 3.1.1 Backend CI Pipeline
**File: `.github/workflows/ci-backend.yml`**
```yaml
name: Backend CI

on:
  push:
    branches: [main]
    paths: ['backend/**']
  pull_request:
    branches: [main]
    paths: ['backend/**']

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15-alpine
        env:
          POSTGRES_USER: test_user
          POSTGRES_PASSWORD: test_pass
          POSTGRES_DB: test_db
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'
          cache: 'pip'
      
      - name: Install dependencies
        run: |
          cd backend
          pip install -r requirements.txt
          pip install pytest pytest-cov pytest-asyncio
      
      - name: Lint with flake8
        run: |
          cd backend
          flake8 src/ --max-line-length=100
      
      - name: Type check with mypy
        run: |
          cd backend
          mypy src/
      
      - name: Run unit tests
        run: |
          cd backend
          pytest tests/unit/ -v --cov=src
      
      - name: Run integration tests
        env:
          DATABASE_URL: postgresql://test_user:test_pass@localhost:5432/test_db
        run: |
          cd backend
          pytest tests/integration/ -v
      
      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          files: ./backend/coverage.xml
          fail_ci_if_error: false

  build:
    needs: test
    runs-on: ubuntu-latest
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Login to Azure Container Registry
        run: |
          az acr login --name devopslearningacr \
            --username ${{ secrets.REGISTRY_USERNAME }} \
            --password ${{ secrets.REGISTRY_PASSWORD }}
      
      - name: Build and push Docker image
        run: |
          docker build -t devopslearningacr.azurecr.io/proximity-alarm-backend:${{ github.sha }} backend/
          docker push devopslearningacr.azurecr.io/proximity-alarm-backend:${{ github.sha }}
          docker tag devopslearningacr.azurecr.io/proximity-alarm-backend:${{ github.sha }} \
                     devopslearningacr.azurecr.io/proximity-alarm-backend:latest
          docker push devopslearningacr.azurecr.io/proximity-alarm-backend:latest
```

#### 3.1.2 Frontend CI Pipeline
**File: `.github/workflows/ci-frontend.yml`**
```yaml
name: Frontend CI

on:
  push:
    branches: [main]
    paths: ['frontend/**']
  pull_request:
    branches: [main]
    paths: ['frontend/**']

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
          cache-dependency-path: 'frontend/package-lock.json'
      
      - name: Install dependencies
        run: |
          cd frontend
          npm ci
      
      - name: Lint
        run: |
          cd frontend
          npm run lint
      
      - name: Run unit tests
        run: |
          cd frontend
          npm run test -- --coverage
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./frontend/coverage/coverage-final.json

  build:
    needs: test
    runs-on: ubuntu-latest
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Build
        run: |
          cd frontend
          npm run build
      
      - name: Build Docker image for web
        run: |
          docker build -t devopslearningacr.azurecr.io/proximity-alarm-frontend:${{ github.sha }} frontend/
          docker push devopslearningacr.azurecr.io/proximity-alarm-frontend:${{ github.sha }}
```

### 3.2 Infrastructure as Code (Bicep)

#### 3.2.1 Main Bicep Template
**File: `infra/bicep/main.bicep`**
```bicep
targetScope = 'subscription'

param resourceGroupName string = 'devops-learning-rg'
param location string = 'eastus'
param environment string = 'development'
param appName string = 'proximity-alarm'

resource rg 'Microsoft.Resources/resourceGroups@2021-04-01' = {
  name: resourceGroupName
  location: location
}

module network 'network.bicep' = {
  name: 'network'
  scope: rg
  params: {
    location: location
    environment: environment
    appName: appName
  }
}

module database 'database.bicep' = {
  name: 'database'
  scope: rg
  params: {
    location: location
    environment: environment
    appName: appName
  }
}

module containerApps 'container-apps.bicep' = {
  name: 'containerApps'
  scope: rg
  params: {
    location: location
    environment: environment
    appName: appName
    containerRegistryUrl: 'devopslearningacr.azurecr.io'
  }
  dependsOn: [network, database]
}

module monitoring 'monitoring.bicep' = {
  name: 'monitoring'
  scope: rg
  params: {
    location: location
    environment: environment
    appName: appName
  }
}

output resourceGroupId string = rg.id
output resourceGroupName string = rg.name
```

### 3.3 Deployment Workflows

#### 3.3.1 Deploy to Staging
**File: `.github/workflows/deploy-staging.yml`**
```yaml
name: Deploy to Staging

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: staging
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Azure Login
        uses: azure/login@v1
        with:
          creds: ${{ secrets.AZURE_CREDENTIALS }}
      
      - name: Deploy Bicep Infrastructure
        run: |
          az deployment sub create \
            --template-file infra/bicep/main.bicep \
            --parameters environment=staging \
            --location eastus
      
      - name: Deploy Backend to Container Apps
        run: |
          az containerapp update \
            --resource-group devops-learning-rg \
            --name proximity-alarm-backend-staging \
            --image devopslearningacr.azurecr.io/proximity-alarm-backend:${{ github.sha }}
      
      - name: Run Smoke Tests
        run: |
          curl -f https://proximity-alarm-staging.azurecontainerapps.io/health || exit 1
```

#### 3.3.2 Deploy to Production (Manual Approval)
**File: `.github/workflows/deploy-production.yml`**
```yaml
name: Deploy to Production

on:
  workflow_dispatch:  # Manual trigger
    inputs:
      version:
        description: 'Version to deploy'
        required: true

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: 
      name: production
      url: https://proximity-alarm.azurecontainerapps.io
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Azure Login
        uses: azure/login@v1
        with:
          creds: ${{ secrets.AZURE_CREDENTIALS }}
      
      - name: Create Deployment
        run: |
          echo "Deploying version ${{ github.event.inputs.version }}"
          az containerapp update \
            --resource-group devops-learning-rg \
            --name proximity-alarm-backend-prod \
            --image devopslearningacr.azurecr.io/proximity-alarm-backend:${{ github.event.inputs.version }}
      
      - name: Health Check
        run: |
          for i in {1..30}; do
            STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://proximity-alarm.azurecontainerapps.io/health)
            if [ $STATUS -eq 200 ]; then
              echo "✅ Production deployment healthy"
              exit 0
            fi
            echo "Waiting... ($i/30)"
            sleep 10
          done
          exit 1
```

### 3.4 Monitoring & Observability Setup

#### 3.4.1 Application Insights Configuration
**File: `backend/src/config.py`**
```python
from azure.monitor.opentelemetry import configure_azure_monitor
from opentelemetry import trace, metrics

def setup_monitoring(environment: str):
    configure_azure_monitor(
        connection_string=os.getenv("APPLICATIONINSIGHTS_CONNECTION_STRING"),
        metric_export_interval=5000,
        sampler=trace.ProbabilitySampler(0.5 if environment == "production" else 1.0)
    )
```

#### 3.4.2 Structured Logging
```python
import logging
from pythonjsonlogger import jsonlogger

logger = logging.getLogger(__name__)
handler = logging.StreamHandler()
formatter = jsonlogger.JsonFormatter()
handler.setFormatter(formatter)
logger.addHandler(handler)

logger.info("Alarm point created", extra={"point_id": 123, "user_id": 456})
```

---

## 🎯 PHASE 4: Production Ready & Going Live (1 week)

Goal: Final polish, security, documentation, go live!

### 4.1 Pre-Production Checklist

- [ ] **Security Scanning**
  - [ ] Run `npm audit` and `pip audit`
  - [ ] SAST: Run SonarQube or Snyk
  - [ ] Container scanning: `az acr scan`
  - [ ] Secret scanning: GitHub secret scanner
  
- [ ] **Performance Testing**
  - [ ] Run load tests: `locust`
  - [ ] Monitor metrics in Application Insights
  - [ ] Review response times and throughput

- [ ] **Documentation**
  - [ ] [ ] API documentation (Swagger/OpenAPI)
  - [ ] [ ] Architecture diagrams
  - [ ] [ ] Runbook for incidents
  - [ ] [ ] Disaster recovery procedures

- [ ] **Monitoring & Alerting**
  - [ ] [ ] Set up critical alerts
  - [ ] [ ] Create dashboards
  - [ ] [ ] Configure log retention
  - [ ] [ ] Set up status page

### 4.2 Security Hardening

**File: `.github/workflows/security-scan.yml`**
```yaml
name: Security Scan

on: [pull_request, push]

jobs:
  security:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'fs'
          scan-ref: '.'
          format: 'sarif'
          output: 'trivy-results.sarif'
      
      - name: Upload to GitHub Security tab
        uses: github/codeql-action/upload-sarif@v2
        with:
          sarif_file: 'trivy-results.sarif'
```

### 4.3 Final Deployment & Launch

```bash
# Tag release
git tag -a v1.0.0 -m "Release version 1.0.0 - Hello World Proximity Alarm App"
git push origin v1.0.0

# Manually trigger production deployment via GitHub UI
# OR via CLI:
gh workflow run deploy-production.yml -f version=v1.0.0
```

---

## 📚 Key DevOps Concepts You'll Learn

| Concept | Phase | Tool | What You'll Learn |
|---------|-------|------|------------------|
| **Version Control** | 1 | Git/GitHub | Branching, commits, PRs, tagging |
| **CI/CD Pipelines** | 3 | GitHub Actions | Automated testing & deployment |
| **Testing Pyramid** | 2 | pytest, Jest, Detox | Unit → Integration → E2E tests |
| **Infrastructure as Code** | 3 | Bicep | Reproducible infrastructure |
| **Containerization** | 1 | Docker | Container images & running services |
| **Environment Management** | 3 | .env, GitHub Actions | Config management across environments |
| **Monitoring & Logging** | 4 | App Insights | Observability & debugging |
| **Secrets Management** | 3 | GitHub Secrets | Secure credential storage |
| **Load Balancing** | 3 | Azure Container Apps | Scalability & reliability |
| **Database Management** | 2 | PostgreSQL | Data persistence & migrations |
| **Security Scanning** | 4 | Trivy, SonarQube | Vulnerability detection |

---

## 🛠️ Tools & Technology Stack

### Development
- **IDE**: VS Code
- **Version Control**: Git + GitHub
- **Languages**: Python 3.11, TypeScript, JavaScript

### Backend
- **Framework**: FastAPI (Python)
- **Database**: PostgreSQL 15
- **Testing**: pytest, pytest-cov
- **Linting**: flake8, mypy
- **Container**: Docker

### Frontend
- **Framework**: React Native (Expo Web)
- **Map**: Leaflet + OpenStreetMap on web, react-native-maps (Google Maps) on Android — via PlatformMap component
- **Audio**: Web Audio API (synthesized sounds)
- **Notifications**: Browser Notification API
- **State**: localStorage (for alarm preferences)
- **Testing**: Jest (planned)
- **Package Manager**: npm

### DevOps & Infrastructure
- **IaC**: Bicep
- **Cloud**: Microsoft Azure
- **Container Registry**: Azure Container Registry
- **CI/CD**: GitHub Actions
- **Container Runtime**: Azure Container Apps
- **Monitoring**: Azure Application Insights
- **Logging**: JSON structured logs

### Testing (Planned)
- **Unit Tests**: pytest (backend), Jest (frontend)
- **Integration Tests**: TestClient (backend)
- **E2E Tests**: Playwright or Cypress (web)
- **Load Testing**: Locust
- **Security Scanning**: Trivy, Snyk

---

## 📋 Command Reference

### Local Development
```bash
# Start all services
docker-compose up

# Backend only
cd backend && pip install -r requirements.txt
uvicorn src.main:app --reload

# Frontend only
cd frontend && npm install
npx expo start

# Run all tests
cd backend && pytest -v
cd frontend && npm test
```

### Git Workflow
```bash
# Create feature branch
git checkout -b feat/alarm-notifications

# Make changes & commit
git add .
git commit -m "feat: add alarm notifications"

# Push and create PR
git push -u origin feat/alarm-notifications

# Merge after approval
git checkout main && git pull
git merge feat/alarm-notifications
git push origin main
```

### Azure Deployment
```bash
# Login to Azure
az login

# View deployed resources
az resource list --resource-group devops-learning-rg

# Scale container app
az containerapp update \
  --resource-group devops-learning-rg \
  --name proximity-alarm-backend \
  --min-replicas 2 --max-replicas 5
```

---

## 🎓 Learning Resources

- **Git**: https://git-scm.com/book
- **Docker**: https://docs.docker.com/
- **FastAPI**: https://fastapi.tiangolo.com/
- **React Native**: https://reactnative.dev/
- **Azure**: https://learn.microsoft.com/en-us/azure/
- **GitHub Actions**: https://docs.github.com/en/actions
- **Bicep**: https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/

---

## ✅ Success Criteria

- ✅ Local docker-compose environment runs without errors
- ✅ All tests pass (unit + integration + e2e)
- ✅ CI/CD pipeline passes all checks before merge
- ✅ Commits are automatically deployed to development environment
- ✅ Production deployment requires manual approval
- ✅ Application Insights shows telemetry & logs
- ✅ Can scale application via Container Apps
- ✅ Security scan passes (no critical vulnerabilities)
- ✅ API documentation available at `/docs`
- ✅ Monitoring dashboards created and alert rules configured

---

## 📞 Getting Help

If you get stuck:
1. Check workflow logs in GitHub Actions
2. View container logs: `az containerapp logs show ...`
3. Check Application Insights in Azure Portal
4. Review error codes in Azure docs

**Happy Learning! 🚀🎓**
