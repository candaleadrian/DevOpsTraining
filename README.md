# 📱 Proximity Alarm App - DevOps Learning Project

A complete, production-ready mobile application built from zero to deployment—designed as a hands-on DevOps learning experience.

## 🎯 What You'll Build

A **proximity alarm mobile app** that:
- Tracks user location in real-time
- Alerts users when they approach saved map points
- Sends notifications when within a configurable radius
- Displays alarms on an interactive map
- Syncs data with a secure backend API

**Technology**: React Native (iOS/Android) + Python FastAPI + Azure + Docker + GitHub Actions

## 🚀 Quick Start

```bash
# Complete setup in one command
make first-run

# Or manual setup
make setup
make up
```

Visit: **http://localhost:8000/docs** → see API docs with examples!

## 📚 What You'll Learn

### DevOps Fundamentals
✅ **Version Control**: Git workflows, commits, PRs, branching  
✅ **CI/CD Pipelines**: Automated testing & deployment with GitHub Actions  
✅ **Infrastructure as Code**: Deploy using Bicep templates  
✅ **Containerization**: Docker for reproducible environments  
✅ **Testing**: Unit, integration, E2E, load testing  
✅ **Monitoring**: Observability with Azure Application Insights  
✅ **Security**: Secret management, vulnerability scanning  
✅ **Cloud Deployment**: Multi-environment setup (dev/staging/prod)  

### Technology Stack
- **Frontend**: React Native / Expo
- **Backend**: FastAPI (Python)
- **Database**: PostgreSQL
- **Cloud**: Microsoft Azure
- **CI/CD**: GitHub Actions
- **Containers**: Docker & Docker Compose
- **IaC**: Azure Bicep
- **Monitoring**: Azure Application Insights

## 📖 Documentation

| Document | Purpose |
|----------|---------|
| **[DEVOPS_LEARNING_PLAN.md](./DEVOPS_LEARNING_PLAN.md)** | Complete 4-phase plan with all steps |
| **[DEVELOPMENT.md](./DEVELOPMENT.md)** | Quick start & daily workflow guide |
| **[Makefile](./Makefile)** | Common commands reference |
| **API Docs** | http://localhost:8000/docs (when running) |

## 🏗️ Project Structure

```
proximity-alarm-app/
├── backend/              # Python FastAPI server
├── frontend/             # React Native app
├── infra/                # Infrastructure as Code (Bicep)
├── .github/workflows/    # CI/CD pipelines
├── docs/                 # Additional documentation
├── docker-compose.yml    # Local development stack
├── Makefile              # Common commands
└── DEVOPS_LEARNING_PLAN.md  # Complete learning guide
```

## 🎓 4-Phase Learning Roadmap

### Phase 1: Setup & Hello World (1-2 weeks)
- Local environment setup
- Create Hello World backend & frontend
- Run in Docker
- First git commits
- Push to GitHub

### Phase 2: Development & Testing (2-3 weeks)
- Build proximity alarm features
- Write unit tests, integration tests, E2E tests
- Database models and migrations
- API endpoints for alarm management

### Phase 3: CI/CD & DevOps (1-2 weeks)
- GitHub Actions CI pipelines
- Automated testing on every commit
- Infrastructure as Code (Bicep)
- Deploy to Azure Container Apps
- Multi-environment setup (dev/staging/prod)

### Phase 4: Production Ready (1 week)
- Security scanning & hardening
- Monitoring & observability setup
- Performance testing
- Documentation & runbooks
- Go live! 🚀

## 🛠️ Common Commands

```bash
# Setup
make setup              # Install dependencies
make first-run         # Complete first-time setup

# Development
make up                # Start all services
make down              # Stop services
make logs              # View logs

# Testing
make test              # Run all tests
make test-backend      # Backend tests only
make lint              # Code quality checks

# Database
make psql              # Connect to PostgreSQL
make db-seed           # Add test data

# Git
make feature-branch    # Create feature branch
make ready-to-commit   # Prepare commit

# More commands
make help              # See all available commands
```

## Running the Backend Locally

To start the backend locally, follow these steps:

### Prerequisites
- Ensure Python 3.11 is installed on your system.
- Install `pip` for managing Python packages.

### Steps

1. **Set Up the Virtual Environment:**
   ```bash
   cd backend
   python3 -m venv venv
   source venv/bin/activate  # For Linux/Mac
   # On Windows:
   # venv\Scripts\activate
   ```

2. **Install Dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Run the Backend:**
   - Using `uvicorn`:
     ```bash
     uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
     ```
   - Or, if a `Makefile` is available:
     ```bash
     make dev-backend
     ```

4. **Run with Docker (Backend + PostgreSQL):**
    ```bash
    make up
    ```
    This starts:
    - FastAPI backend on port `8000`
    - PostgreSQL on port `5432`

5. **Access the Backend:**
   - Open your browser and navigate to:
     - API Root: [http://localhost:8000](http://localhost:8000)
     - API Docs: [http://localhost:8000/docs](http://localhost:8000/docs)

6. **Verify the Backend:**
   - Test the root endpoint:
     ```bash
     curl http://localhost:8000
     ```

## Running the Frontend Locally

The mobile app now uses Expo with TypeScript for the initial React Native setup.

### Why Expo for this step
- It gives you a working React Native baseline quickly.
- It keeps the first mobile milestone focused on app structure rather than native build plumbing.
- It is a good fit for learning because you can run the app on Android, iOS, or web from the same project.

### Prerequisites
- Use Node.js 20 LTS or newer. The generated Expo toolchain expects Node 20+.
- Keep Docker for the backend and PostgreSQL, but run the Expo dev server directly with npm.

### Steps

1. **Start the backend first**
   ```bash
   make up
   ```
   This keeps the API available while you work on the mobile app.

2. **Start the frontend dev server**
   ```bash
   cd frontend
   npm start
   ```
   Or from the project root:
   ```bash
   make dev-frontend
   ```

3. **Choose a target platform**
   - Press `a` in the Expo terminal for Android.
   - Press `i` for iOS on macOS.
   - Press `w` to open the web build in the browser.

4. **Verify the app**
   - You should see a simple "Frontend Hello World" screen for Proximity Alarm.
   - This confirms that the React Native project, TypeScript setup, and Expo runtime are all working.

### What this step gives you
- A real frontend project under `frontend/`
- A repeatable local workflow for mobile development
- A clean baseline before adding navigation, API integration, and location features

## ✅ Success Milestones

- [ ] ✅ Local environment running with `make up`
- [ ] ✅ First commit pushed to GitHub
- [ ] ✅ All tests passing (unit + integration + E2E)
- [ ] ✅ CI pipeline automatically runs on every commit
- [ ] ✅ Code deployed to staging after merge to main
- [ ] ✅ Production deployment with manual approval
- [ ] ✅ Monitoring dashboards set up
- [ ] ✅ Security scan passing
- [ ] ✅ Documentation complete
- [ ] ✅ App live in production! 🎉

## 🌐 Access Points (When Running)

| Component | URL | Port |
|-----------|-----|------|
| API | http://localhost:8000 | 8000 |
| API Docs (Swagger) | http://localhost:8000/docs | - |
| Health Check | http://localhost:8000/health | - |
| PostgreSQL | localhost:5432 | 5432 |

## 🚨 Troubleshooting

**Port already in use?**
```bash
lsof -ti:8000 | xargs kill -9  # Mac/Linux
```

**Docker not running?**
Start Docker Desktop or `sudo systemctl start docker` (Linux)

**Tests failing?**
```bash
make clean
make setup
make test
```

See [DEVELOPMENT.md](./DEVELOPMENT.md) for more troubleshooting.

## 🎯 Learning Objectives

After completing this project, you'll be able to:

1. ✅ Set up applications for local development with Docker
2. ✅ Write tests at multiple levels (unit, integration, E2E)
3. ✅ Create production-grade CI/CD pipelines
4. ✅ Deploy applications to the cloud (Azure)
5. ✅ Manage different environments (dev/staging/prod)
6. ✅ Monitor and debug production applications
7. ✅ Implement security best practices
8. ✅ Collaborate using Git and GitHub workflows
9. ✅ Use Infrastructure as Code for reproducible deployments
10. ✅ Scale applications based on demand

## 📚 Resources

- **DevOps Learning Plan**: [DEVOPS_LEARNING_PLAN.md](./DEVOPS_LEARNING_PLAN.md)
- **Development Setup**: [DEVELOPMENT.md](./DEVELOPMENT.md)
- **Getting Started**: See Phase 1 in learning plan
- **API Documentation**: http://localhost:8000/docs (after `make up`)

## 🤝 Contributing

This is a learning project. As you progress:
1. Create feature branches: `git checkout -b feat/feature-name`
2. Make commits with clear messages
3. Push and create pull requests
4. Get automated tests to pass
5. Merge to main and see automatic deployment

## 📞 Need Help?

1. Check [DEVELOPMENT.md](./DEVELOPMENT.md) troubleshooting section
2. View logs: `make logs`
3. Check database: `make psql`
4. Review [DEVOPS_LEARNING_PLAN.md](./DEVOPS_LEARNING_PLAN.md) for detailed explanations
5. Check GitHub Actions workflow logs
6. Review Azure Portal for deployment issues

## 🎉 Ready to Start?

```bash
# Get everything running:
make first-run

# Then:
# 1. Visit http://localhost:8000/docs
# 2. Read DEVOPS_LEARNING_PLAN.md for full plan
# 3. Complete Phase 1 tasks
# 4. Make your first commit!

echo "Happy learning! 🚀"
```

---

**Status**: 🟢 Ready for Development  
**Version**: 0.0.1 - Hello World  
**Last Updated**: 2025-03-10

---

### Next Steps
👉 Start with **[DEVOPS_LEARNING_PLAN.md](./DEVOPS_LEARNING_PLAN.md)**
