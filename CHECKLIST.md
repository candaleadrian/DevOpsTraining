# DevOps Learning Checklist & Tracker

Track your progress through the proximity alarm app project!

## 🎯 Project Goal
Build and deploy a complete mobile app with enterprise DevOps practices, from Hello World to production.

---

## PHASE 1: Setup & Hello World (1-2 weeks)

### 1.1 Prerequisites Setup
- [ ] Install Git
- [ ] Install Docker Desktop
- [ ] Install Python 3.11+
- [ ] Install Node.js 18+
- [ ] Install Azure CLI
- [ ] Install VS Code + extensions
- **Status**: ⏳ Not Started

### 1.2 Azure Setup
- [ ] Create Azure account
- [ ] Create Resource Group: `devops-learning-rg`
- [ ] Create Container Registry
- [ ] Create PostgreSQL server
- [ ] Create Storage Account
- [ ] Create Application Insights instance
- [ ] Run: `az login` and verify access
- **Status**: ⏳ Not Started

### 1.3 GitHub Setup
- [ ] Create GitHub repository: `proximity-alarm-app`
- [ ] Clone locally
- [ ] Add GitHub Secrets (Azure credentials)
- [ ] Set up branch protection on `main`
- [ ] Create environments: dev, staging, production
- **Status**: ⏳ Not Started

### 1.4 Backend Hello World
- [ ] Initialize project structure
- [ ] Create `backend/src/main.py` with FastAPI app
- [ ] Create `Dockerfile` for backend
- [ ] Create `docker-compose.yml` for local dev
- [ ] Test: `docker-compose up` → visit http://localhost:8000
- [ ] First commit: "chore: initialize project with hello world backend"
- **Status**: ⏳ Not Started

### 1.5 Frontend Hello World
- [x] Initialize React Native project with Expo
- [x] Create Hello World screen
- [ ] Create `Dockerfile` for frontend
- [ ] Update docker-compose for frontend
- [ ] Test: Frontend hot-reload works
- [ ] Commit: "feat: initialize React Native hello world app"
- **Status**: 🚧 In Progress

### 1.6 First Commits & Push
- [ ] Verify local: `make up` runs successfully
- [ ] Verify API docs at http://localhost:8000/docs
- [ ] Push to GitHub: `git push origin main`
- [ ] Confirm GitHub repo shows commits
- **Status**: ⏳ Not Started

**Phase 1 Complete?** ⏳ Not Started → 🟢 Complete

---

## PHASE 2: Development & Testing (2-3 weeks)

### 2.1 Backend Features
- [ ] Create database models (AlarmPoint, User, Notification)
- [ ] Add database migrations
- [ ] Create API endpoints:
  - [ ] POST `/api/alarms/points` - Create alarm
  - [ ] GET `/api/alarms/points` - List alarms
  - [ ] GET `/api/alarms/points/{id}` - Get alarm details
  - [ ] PUT `/api/alarms/points/{id}` - Update alarm
  - [ ] DELETE `/api/alarms/points/{id}` - Delete alarm
- [ ] Implement proximity calculation service
- [ ] Add geolocation endpoints
- **Status**: ⏳ Not Started

### 2.2 Backend Testing
- [ ] Write unit tests for proximity calculation
- [ ] Write unit tests for models
- [ ] Write integration tests for API endpoints
- [ ] Achieve 80%+ code coverage
- [ ] Run: `pytest tests/ -v --cov`
- [ ] All tests passing ✓
- **Commit**: "test: add unit and integration tests"
- **Status**: ⏳ Not Started

### 2.3 Frontend Features
- [ ] Create screens:
  - [x] HomeScreen - main dashboard
  - [x] MapScreen - map with alarm points
  - [x] AlarmDetailScreen - individual alarm details
  - [x] SettingsScreen - app settings
- [ ] Implement location tracking service
- [ ] Add map integration (react-native-maps)
- [ ] Create alarm notification system
- **Status**: 🚧 In Progress

### 2.4 Frontend Testing
- [ ] Write unit tests for components
- [ ] Write unit tests for services
- [ ] Write E2E tests with Detox (at least 3 scenarios)
- [ ] Run: `npm test`
- [ ] All tests passing ✓
- **Commit**: "test: add frontend unit and E2E tests"
- **Status**: ⏳ Not Started

### 2.5 API Integration
- [x] Connect frontend to backend API
- [x] Test API calls work from app
- [x] Add error handling for network failures
- [ ] Test with mock data
- **Commit**: "feat: integrate frontend with backend API"
- **Status**: 🚧 In Progress

### 2.6 Development Commits
- [ ] At least 5-10 commits with clear messages
- [ ] Each commit represents a logical change
- [ ] All commits follow conventional commits format
- **Status**: ⏳ Not Started

**Phase 2 Complete?** ⏳ Not Started → 🟢 Complete

---

## PHASE 3: CI/CD & DevOps (1-2 weeks)

### 3.1 GitHub Actions CI Pipeline
- [ ] Create `.github/workflows/ci-backend.yml`
  - [ ] Runs on push to main and PRs
  - [ ] Tests pass before merge
  - [ ] Linting passes (flake8, mypy)
  - [ ] Build Docker image
- [ ] Create `.github/workflows/ci-frontend.yml`
  - [ ] Runs ESLint, TypeScript checks
  - [ ] All tests pass
  - [ ] Build succeeds
- [ ] Test: Create PR → see workflows run
- **Status**: ⏳ Not Started

### 3.2 Infrastructure as Code
- [ ] Create `infra/bicep/main.bicep`
- [ ] Create `infra/bicep/network.bicep`
- [ ] Create `infra/bicep/database.bicep`
- [ ] Create `infra/bicep/container-apps.bicep`
- [ ] Create `infra/bicep/monitoring.bicep`
- [ ] Test Bicep validation: `az bicep validate`
- **Commit**: "infra: add Bicep infrastructure templates"
- **Status**: ⏳ Not Started

### 3.3 Deployment Workflows
- [ ] Create `.github/workflows/deploy-staging.yml`
  - [ ] Deploys on push to main (automatically)
  - [ ] Runs to Azure Container Apps
  - [ ] Includes smoke tests
- [ ] Create `.github/workflows/deploy-production.yml`
  - [ ] Manual approval before deployment
  - [ ] Uses workflow_dispatch
  - [ ] Health checks after deploy
- [ ] Test: Push commit → auto-deploy to staging
- **Status**: ⏳ Not Started

### 3.4 Environment Management
- [ ] Create 3 environments in GitHub:
  - [ ] development (auto-deploy)
  - [ ] staging (auto-deploy)
  - [ ] production (manual approval)
- [ ] Add environment secrets to each
- [ ] Test: PR merges flow to staging
- **Status**: ⏳ Not Started

### 3.5 Monitoring & Observability
- [ ] Add Application Insights SDK to backend
- [ ] Configure structured JSON logging
- [ ] Create diagnostics in frontend
- [ ] Set up Azure dashboards
- [ ] Create alerts for CPU, memory, errors
- [ ] Test: View telemetry in Application Insights
- **Status**: ⏳ Not Started

### 3.6 Security Scanning
- [ ] Create security scan workflow
- [ ] Add Trivy container scanning
- [ ] Add `npm audit` and `pip audit`
- [ ] Add SonarQube/Snyk (optional)
- [ ] Fix any critical vulnerabilities
- **Commit**: "ci: add security scanning to pipeline"
- **Status**: ⏳ Not Started

**Phase 3 Complete?** ⏳ Not Started → 🟢 Complete

---

## PHASE 4: Production Ready (1 week)

### 4.1 Pre-Production Checklist
- [ ] All tests passing locally and in CI
- [ ] No security vulnerabilities found
- [ ] API documentation complete (Swagger)
- [ ] Architecture documentation written
- [ ] Performance targets met (response times, throughput)
- [ ] Load tested (1000+ requests per second)
- **Status**: ⏳ Not Started

### 4.2 Documentation
- [ ] [ ] API documentation at `/docs` endpoint
- [ ] [ ] Architecture diagram (Mermaid or image)
- [ ] [ ] Deployment runbook created
- [ ] [ ] Basic incident response guide
- [ ] [ ] Environment setup guide (DEVELOPMENT.md) ✓
- [ ] [ ] DevOps learning plan (DEVOPS_LEARNING_PLAN.md) ✓
- **Status**: ⏳ Not Started

### 4.3 Hardening & Final Checks
- [ ] Security headers added (CORS, CSP, etc.)
- [ ] Database backups configured
- [ ] Secrets rotated and secure
- [ ] Rate limiting implemented
- [ ] Request validation on all endpoints
- [ ] Error handling doesn't leak sensitive info
- **Status**: ⏳ Not Started

### 4.4 Production Deployment
- [ ] Create git tag: `git tag -a v1.0.0`
- [ ] Manually trigger production deployment
- [ ] Verify app is live and healthy
- [ ] Monitor metrics for 24 hours
- [ ] Document any issues
- **Status**: ⏳ Not Started

### 4.5 Post-Launch
- [ ] Monitor Application Insights daily
- [ ] Set up on-call alerting (optional)
- [ ] Document learnings
- [ ] Plan Phase 2 features
- **Status**: ⏳ Not Started

**Phase 4 Complete?** ⏳ Not Started → 🟢 Complete

---

## 🚀 Overall Progress

```
Phase 1: Setup & Hello World          [░░░░░░░░░░] 0%
Phase 2: Development & Testing        [░░░░░░░░░░] 0%
Phase 3: CI/CD & DevOps               [░░░░░░░░░░] 0%
Phase 4: Production Ready             [░░░░░░░░░░] 0%
─────────────────────────────────────────────────
Total Progress:                        [░░░░░░░░░░] 0%
```

---

## 📊 Key Metrics to Track

### Development Metrics
- [ ] Code coverage: ____ % (target: 80%+)
- [ ] Number of commits: ____ (target: 20+)
- [ ] API endpoints created: ____ (target: 8+)
- [ ] Test cases written: ____ (target: 50+)

### DevOps Metrics
- [ ] CI pipeline pass rate: ____ % (target: 100%)
- [ ] Deployment success rate: ____ % (target: 100%)
- [ ] Time to deploy: ____ minutes (target: <5 min)
- [ ] API response time: ____ ms (target: <200 ms)

### Learning Metrics
- [ ] Git concepts learned: __/10
- [ ] Docker concepts learned: __/10
- [ ] CI/CD concepts learned: __/10
- [ ] Testing strategies learned: __/10
- [ ] Azure services learned: __/10

---

## 📝 Notes & Learnings

Use this section to document what you learn:

### Git & Version Control
- 

### Docker & Containerization
- 

### CI/CD Pipelines
- 

### Testing Strategies
- 

### Azure & Cloud Deployment
- 

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
