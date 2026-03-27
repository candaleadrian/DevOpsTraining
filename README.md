# 📱 Proximity Alarm App — DevOps Learning Project

A hands-on DevOps learning project: build a proximity alarm app from scratch, containerize it, add CI/CD, and deploy to the cloud.

## 🎯 What It Does

A **cross-platform proximity alarm app** (web + Android) that:
- Shows an interactive map (Leaflet on web, Google Maps on Android)
- Lets you tap to place an alarm point with a configurable radius
- Tracks your location via GPS (browser geolocation on web, expo-location on Android)
- Triggers alarms (Web Audio on web, vibration + push notifications on Android)
- Alarm preferences (mode, sound, volume) configurable in Settings
- Single codebase, platform-specific code resolved automatically via Metro bundler

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React Native / Expo (Web + Android), Leaflet (web), react-native-maps (Android), TypeScript |
| **Backend** | FastAPI (Python 3.11), JWT auth (python-jose, passlib) |
| **Database** | PostgreSQL 15 |
| **Containers** | Docker & Docker Compose |
| **CI/CD** | GitHub Actions (backend CI, frontend CI, infra Terraform, Android APK build) |
| **Cloud** | Microsoft Azure (Container Apps, ACR, PostgreSQL, App Insights) |
| **IaC** | Terraform (azurerm v4.65.0) |

## 🚀 Quick Start

```bash
# One command to set up and run everything
make first-run

# Or step by step
make setup
make up
```

| Service | URL |
|---------|-----|
| Frontend (Map) | http://localhost:8081 |
| Backend API | http://localhost:8000 |
| API Docs (Swagger) | http://localhost:8000/docs |
| Health Check | http://localhost:8000/health |

## 🗺️ Current Features

### Map Screen
- Interactive map (Leaflet/OpenStreetMap on web, Google Maps on Android)
- Tap to set an alarm point (marker + radius circle)
- Adjust radius with configurable ± step buttons
- Start/Stop location monitoring (browser GPS on web, expo-location on Android)
- Background location tracking on Android (expo-task-manager foreground service)
- Visual proximity status ("X m away" or "🔔 ALARM")
- Location search bar with geocoding (search by address/place name)
- Locate-me button (⦿) to center map on current GPS position
- Custom zoom controls (web: bottom-right Leaflet controls, Android: custom +/− buttons)
- Save multiple named alarm zones with CRUD operations
- Inline zone editing (rename, resize radius, reposition on map)
- Zone selection: tap a zone to highlight and pan to it on the map
- Edit (✏️) and Delete (✕) buttons per zone row
- Collapsible zone list panel (▼/▲ toggle)
- Delete confirmation flow
- Toast notifications for action feedback
- Alarm history logging to backend

### User Authentication
- Login / Register with email + password (JWT tokens)
- Per-user data isolation — each user's zones are private and synced across devices
- Guest mode — use the app without an account (up to 3 zones, stored locally on device)
- Auth screen as entry point with "Continue as Guest" option
- Account section in Settings (email display, sign out, sign in)

### Settings Screen
- **Alarm mode**: Notification only, Sound only, or Both
- **Sound**: Beep, Siren, or Chime (Web Audio API on web, vibration patterns on Android)
- **Volume**: 20% – 100%
- **Radius step**: Preset chips (10/25/50/100/250/500m) or custom value
- Test Alarm button to preview your selection

### Backend API
- `GET /` — Hello World
- `GET /health` — Health check
- `POST /auth/register` — Create account
- `POST /auth/login` — Sign in (returns JWT)
- `GET /auth/me` — Current user info (requires auth)
- `POST /set-location` — Set alarm point + radius
- `POST /check-location` — Check proximity (Haversine formula)
- All zone & event endpoints support optional JWT for per-user data isolation
- `GET /docs` — Swagger UI

## 📖 Documentation

| Document | Purpose |
|----------|---------|
| [CHECKLIST.md](CHECKLIST.md) | Progress tracker with checkboxes |
| [DEVOPS_LEARNING_PLAN.md](DEVOPS_LEARNING_PLAN.md) | Full 4-phase learning roadmap |
| [DEVELOPMENT.md](DEVELOPMENT.md) | Setup & daily workflow guide |
| [Makefile](Makefile) | All available `make` commands |

## 🏗️ Project Structure

```
proximity-alarm-app/
├── backend/                # Python FastAPI server
│   ├── Dockerfile
│   ├── requirements.txt
│   └── src/
│       ├── main.py         # API endpoints + Haversine logic
│       ├── auth.py          # JWT utilities + FastAPI auth dependencies
│       ├── database.py      # SQLAlchemy engine + session
│       └── models/          # User, AlarmZone, AlarmEvent
├── frontend/               # Expo React Native app (Web + Android)
│   ├── Dockerfile
│   ├── eas.json            # EAS Build config (Android APK/AAB)
│   ├── src/
│   │   ├── components/     # PlatformMap (Leaflet on web, react-native-maps on Android)
│   │   │                   # LocationSearch (geocoding search bar)
│   │   ├── screens/        # MapScreen, HomeScreen, HistoryScreen, SettingsScreen, AuthScreen
│   │   ├── context/        # AuthContext (login state, guest mode)
│   │   ├── services/       # zonesApi, historyApi, authApi, guestZonesApi, alarmTrigger, etc.
│   │   ├── config/         # apiClient (shared Axios with JWT interceptor), theme
│   │   ├── navigation/     # Tab + stack navigation (emoji icons)
│   │   └── ui/             # Shared layout components
│   └── app.json            # Expo config (incl. background location permissions)
├── infra/terraform/        # Azure IaC (Terraform modules)
├── .github/workflows/      # CI/CD: backend, frontend, infra, Android APK
├── docker-compose.yml      # PostgreSQL + backend + frontend
├── Makefile                # Dev commands
└── *.md                    # Documentation
```

## 📋 Roadmap

### ✅ Done
- [x] Hello World backend + frontend in Docker
- [x] Interactive map (Leaflet/OpenStreetMap)
- [x] Proximity detection (Haversine)
- [x] Alarm trigger (sound + notification)
- [x] User preferences (Settings screen)
- [x] Dynamic URL configuration (no hardcoded localhost in deployed apps)
- [x] Infrastructure-level CORS via Terraform
- [x] Terraform azurerm provider upgraded to v4.65.0
- [x] Backend auto-runs DB migrations on startup
- [x] Global exception handler for reliable CORS on errors
- [x] Cross-platform architecture (web + Android) from single codebase
- [x] Platform-specific map (Leaflet / react-native-maps), location, alarm, and storage services
- [x] EAS Build configuration for Android APK generation
- [x] Location search with geocoding
- [x] Zone CRUD (create, edit, reposition, delete with confirmation)
- [x] Configurable radius step (presets + custom value)
- [x] Background location tracking on Android (expo-task-manager)
- [x] Locate-me button on web and Android
- [x] Custom zoom controls on both platforms
- [x] Zone selection with map panning and highlight
- [x] Collapsible zone list panel
- [x] GitHub Actions Android APK build pipeline (workflow_dispatch, master only)
- [x] ACR image purge automation
- [x] User authentication — JWT login/register with per-user data isolation
- [x] Guest mode — local-only zones (max 3) without account

### 🔜 Next Steps
1. **Monitoring** — Application Insights integration + Azure dashboards
2. **Security scanning** — Trivy container scanning, npm/pip audit
3. **Staging environment** — deploy on push to main with manual prod approval

## 🎓 Learning Phases

| Phase | Focus | Status |
|-------|-------|--------|
| 1. Setup & Hello World | Docker, Git, project scaffolding | ✅ Complete |
| 2. Development & Testing | Features, tests, DB integration, auth | ✅ ~98% |
| 3. CI/CD & DevOps | GitHub Actions, IaC, deployment, CORS | ✅ ~85% |
| 4. Production Ready | Security, monitoring, go-live | ⏳ Not started |
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

2. **Set the frontend API base URL**
   ```bash
   cd frontend
   cp .env.example .env
   ```
   `EXPO_PUBLIC_API_BASE_URL` tells the mobile app where the FastAPI server lives. For web on the same machine, `http://localhost:8000` is correct.

3. **Start the frontend dev server**
   ```bash
   cd frontend
   npm start
   ```
   Or from the project root:
   ```bash
   make dev-frontend
   ```

4. **Choose a target platform**
   - Press `a` in the Expo terminal for Android.
   - Press `i` for iOS on macOS.
   - Press `w` to open the web build in the browser.

5. **Verify the app**
   - The Home screen now performs a backend health check.
   - If the backend is running, you should see the status resolve to `healthy`.
   - If it fails, the screen surfaces the error so you can debug configuration or networking first.

### What this step gives you
- A real frontend project under `frontend/`
- A repeatable local workflow for mobile development
- A clean baseline before adding navigation, API integration, and location features

## Frontend Architecture Baseline

The frontend is no longer a single Expo starter screen. It now has the first professional structural layer:

- Bottom-tab navigation for `Home`, `Map`, and `Settings`
- A stack route for `Alarm Detail`
- Separate screen files under `frontend/src/screens`
- Shared layout primitives under `frontend/src/ui`
- Central navigation wiring under `frontend/src/navigation`

This matters because mobile apps become hard to maintain very quickly if navigation, business logic, and rendering are all mixed in one file.

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
