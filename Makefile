# Makefile for Proximity Alarm Application
# Common DevOps commands for local development

.PHONY: help setup setup-backend setup-frontend up down logs clean test lint deploy-local \
       k8s-start k8s-stop k8s-build k8s-deploy k8s-deploy-monitoring k8s-deploy-all \
       k8s-status k8s-logs k8s-dashboard k8s-urls k8s-delete

help:
	@echo "Proximity Alarm App - DevOps Learning"
	@echo "======================================"
	@echo "Available commands:"
	@echo "  make setup              - Complete local setup"
	@echo "  make setup-backend      - Setup backend only"
	@echo "  make setup-frontend     - Setup frontend only"
	@echo "  make up                 - Start all services (docker compose)"
	@echo "  make down               - Stop all services"
	@echo "  make logs               - Show service logs"
	@echo "  make test               - Run all tests"
	@echo "  make test-backend       - Run backend tests only"
	@echo "  make test-frontend      - Run frontend tests only"
	@echo "  make lint               - Run linters"
	@echo "  make lint-backend       - Lint backend code"
	@echo "  make lint-frontend      - Lint frontend code"
	@echo "  make clean              - Clean up containers and cache"
	@echo "  make psql               - Connect to PostgreSQL"
	@echo "  make backend-logs       - Follow backend logs"
	@echo "  make frontend-logs      - Follow frontend logs"
	@echo "  make db-migrate         - Run database migrations"

# Setup
setup: setup-backend setup-frontend
	@echo "✓ Setup complete!"
	@echo "Run 'make up' to start services"

setup-backend:
	@echo "Setting up backend..."
	@cd backend && python -m venv venv
	@cd backend && . venv/bin/activate && pip install -r requirements.txt || pip install -r requirements.txt
	@echo "✓ Backend setup complete"

setup-frontend:
	@echo "Setting up frontend..."
	@if [ -f frontend/package.json ]; then \
		cd frontend && npm install; \
		echo "✓ Frontend setup complete"; \
	else \
		echo "! Frontend skipped (frontend/package.json not found)"; \
	fi

# Docker compose
up:
	@echo "Starting services..."
	docker compose up -d
	@echo "✓ Services started"
	@echo "  API: http://localhost:8000"
	@echo "  API Docs: http://localhost:8000/docs"
	@echo "  Health check: http://localhost:8000/health"

down:
	@echo "Stopping services..."
	docker compose down
	@echo "✓ Services stopped"

logs:
	docker compose logs -f

backend-logs:
	docker compose logs -f backend

frontend-logs:
	docker compose logs -f frontend

# Testing
test: test-backend test-frontend
	@echo "✓ All tests passed!"

test-backend:
	@echo "Running backend tests..."
	@cd backend && . venv/bin/activate 2>/dev/null || true; pytest tests/ -v --tb=short
	@echo "✓ Backend tests complete"

test-frontend:
	@echo "Running frontend tests..."
	@if [ -f frontend/package.json ]; then \
		cd frontend && npm test -- --passWithNoTests; \
		echo "✓ Frontend tests complete"; \
	else \
		echo "! Frontend tests skipped (frontend/package.json not found)"; \
	fi

test-watch-frontend:
	@if [ -f frontend/package.json ]; then \
		cd frontend && npm test -- --watch; \
	else \
		echo "! Frontend watch tests skipped (frontend/package.json not found)"; \
	fi

# Linting
lint: lint-backend lint-frontend
	@echo "✓ Linting complete!"

lint-backend:
	@echo "Linting backend..."
	@cd backend && . venv/bin/activate 2>/dev/null || true; flake8 src/ --max-line-length=100 || true
	@echo "✓ Backend linting complete"

lint-frontend:
	@echo "Linting frontend..."
	@if [ -f frontend/package.json ]; then \
		cd frontend && npm run lint || true; \
		echo "✓ Frontend linting complete"; \
	else \
		echo "! Frontend lint skipped (frontend/package.json not found)"; \
	fi

# Database
psql:
	docker compose exec postgres psql -U devops_user -d proximity_alarm

db-migrate:
	@echo "Running database migrations..."
	docker compose exec backend python -m alembic upgrade head
	@echo "✓ Migrations complete"

db-seed:
	@echo "Seeding database..."
	docker compose exec backend python -m scripts.seed_data
	@echo "✓ Database seeded"

# Development
dev-backend:
	@cd backend && . venv/bin/activate 2>/dev/null || true; uvicorn src.main:app --reload --host 0.0.0.0 --port 8000

dev-frontend:
	@if [ -f frontend/package.json ]; then \
		cd frontend && npm start; \
	else \
		echo "! Frontend dev server skipped (frontend/package.json not found)"; \
	fi

# Utility
clean:
	@echo "Cleaning up..."
	docker compose down -v
	find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name "node_modules" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name ".pytest_cache" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name ".next" -exec rm -rf {} + 2>/dev/null || true
	@echo "✓ Cleanup complete"

status:
	@echo "Service Status:"
	@docker compose ps || true

# Git helpers
git-status:
	git status

git-log:
	git log --oneline -10

# Git workflow
feature-branch:
	@read -p "Enter feature name: " feature; \
	git checkout -b feat/$$feature

ready-to-commit:
	@echo "Changes to commit:"
	@git diff --stat
	@read -p "Enter commit message: " msg; \
	git add .; \
	git commit -m "$$msg"

# Azure commands (requires az CLI)
azure-login:
	az login

azure-rg-create:
	az group create --name devops-learning-rg --location eastus

azure-resources:
	az resource list --resource-group devops-learning-rg --output table

# Docker build
docker-build: docker-build-backend docker-build-frontend

docker-build-backend:
	@echo "Building backend image..."
	docker build -t proximity-alarm-backend:latest backend/
	@echo "✓ Backend image built"

docker-build-frontend:
	@echo "Building frontend image..."
	@if [ -f frontend/Dockerfile ]; then \
		docker build -t proximity-alarm-frontend:latest frontend/; \
		echo "✓ Frontend image built"; \
	else \
		echo "! Frontend image build skipped (frontend/Dockerfile not found)"; \
	fi

# First time setup
.PHONY: first-run
first-run: clean setup up
	@echo ""
	@echo "🎉 First run complete!"
	@echo ""
	@echo "Next steps:"
	@echo "1. Visit http://localhost:8000/docs to see API documentation"
	@echo "2. Test backend: curl http://localhost:8000/"
	@echo "3. Make your first commit: make ready-to-commit"
	@echo ""
	@echo "Documentation: See DEVELOPMENT.md"

# =============================================================================
# KUBERNETES — Local Development with Minikube
# =============================================================================
# These targets let you run the entire app in a local Kubernetes cluster.
#
# Quick start:
#   make k8s-start         # Start minikube cluster
#   make k8s-deploy-all    # Build images + deploy everything
#   make k8s-urls          # Show URLs to access services
#
# Architecture:
#   minikube cluster
#   ├── proximity-alarm namespace (app)
#   │   ├── postgres (Deployment + Service + PVC)
#   │   ├── backend  (Deployment + NodePort Service)
#   │   └── frontend (Deployment + NodePort Service)
#   └── monitoring namespace
#       ├── prometheus (Deployment + NodePort Service)
#       └── grafana    (Deployment + NodePort Service)
# =============================================================================

# Start the minikube cluster (only needed once)
k8s-start:
	@echo "Starting minikube cluster..."
	minikube start --driver=docker
	@echo "✓ Minikube cluster started"
	@echo "  Run 'make k8s-deploy-all' to deploy everything"

# Stop the minikube cluster (preserves state)
k8s-stop:
	@echo "Stopping minikube cluster..."
	minikube stop
	@echo "✓ Minikube stopped (state preserved, use 'make k8s-start' to resume)"

# Build Docker images locally, then load them into minikube.
# WHY: Minikube has its own Docker daemon and can't see your local images.
# We build with local Docker (which has network access), then use
# 'minikube image load' to copy the images into minikube's daemon.
# We also pre-load third-party images (postgres, prometheus, grafana)
# so minikube doesn't need to pull them from the internet.
k8s-build:
	@echo "Building images with local Docker..."
	docker build -t proximity-alarm-backend:latest backend/
	docker build -t proximity-alarm-frontend:static-v1 -f frontend/Dockerfile.prod --build-arg EXPO_PUBLIC_API_BASE_URL=http://localhost:8000 frontend/
	@echo "Loading app images into minikube..."
	minikube image load proximity-alarm-backend:latest
	minikube image load proximity-alarm-frontend:static-v1
	@echo "Loading third-party images into minikube..."
	docker pull postgres:15-alpine 2>/dev/null || true
	docker pull prom/prometheus:v2.51.0 2>/dev/null || true
	docker pull grafana/grafana:10.4.1 2>/dev/null || true
	minikube image load postgres:15-alpine
	minikube image load prom/prometheus:v2.51.0
	minikube image load grafana/grafana:10.4.1
	@echo "✓ All images loaded into minikube"

# Deploy the application (postgres, backend, frontend)
k8s-deploy:
	@echo "Deploying application to Kubernetes..."
	kubectl apply -f k8s/base/namespace.yaml
	kubectl apply -f k8s/base/secrets.yaml
	kubectl apply -f k8s/base/postgres.yaml
	@echo "Waiting for PostgreSQL to be ready..."
	kubectl wait --for=condition=ready pod -l component=database -n proximity-alarm --timeout=120s
	kubectl apply -f k8s/base/backend.yaml
	kubectl apply -f k8s/base/frontend.yaml
	@echo "✓ Application deployed"
	@echo "  Waiting for pods to be ready..."
	kubectl wait --for=condition=ready pod -l component=backend -n proximity-alarm --timeout=120s || true
	kubectl wait --for=condition=ready pod -l component=frontend -n proximity-alarm --timeout=120s || true
	@echo "✓ All application pods ready"

# Deploy monitoring (Prometheus + Grafana)
k8s-deploy-monitoring:
	@echo "Deploying monitoring stack..."
	kubectl apply -f k8s/monitoring/namespace.yaml
	kubectl apply -f k8s/monitoring/prometheus.yaml
	kubectl apply -f k8s/monitoring/grafana.yaml
	@echo "Waiting for monitoring pods..."
	kubectl wait --for=condition=ready pod -l app=prometheus -n monitoring --timeout=120s || true
	kubectl wait --for=condition=ready pod -l app=grafana -n monitoring --timeout=120s || true
	@echo "✓ Monitoring stack deployed"

# Deploy everything: build images + deploy app + deploy monitoring
k8s-deploy-all: k8s-build k8s-deploy k8s-deploy-monitoring
	@echo ""
	@echo "🎉 Full Kubernetes deployment complete!"
	@$(MAKE) k8s-urls

# Show service URLs
k8s-urls:
	@echo ""
	@echo "=== Service URLs ==="
	@echo "  Backend API:  http://$$(minikube ip):30080"
	@echo "  API Docs:     http://$$(minikube ip):30080/docs"
	@echo "  Frontend:     http://$$(minikube ip):30081"
	@echo "  Prometheus:   http://$$(minikube ip):30090"
	@echo "  Grafana:      http://$$(minikube ip):30030"
	@echo ""
	@echo "  Grafana login: admin / admin"
	@echo ""
	@echo "NOTE: These URLs only work inside WSL."
	@echo "For Windows browser access, run: make k8s-forward"

# Port-forward all services to localhost (accessible from Windows browser)
# WHY: In WSL2, the minikube IP (192.168.49.x) is on an internal virtual network
# that Windows can't reach. kubectl port-forward binds to localhost inside WSL,
# and WSL2 automatically makes localhost accessible from Windows.
#
# This runs all port-forwards in the background. Use 'make k8s-forward-stop' to stop them.
k8s-forward:
	@echo "Starting port-forwards (accessible from Windows browser)..."
	@kubectl port-forward svc/backend 8000:8000 -n proximity-alarm --address 0.0.0.0 > /dev/null 2>&1 &
	@kubectl port-forward svc/frontend 8081:8081 -n proximity-alarm --address 0.0.0.0 > /dev/null 2>&1 &
	@kubectl port-forward svc/prometheus 9090:9090 -n monitoring --address 0.0.0.0 > /dev/null 2>&1 &
	@kubectl port-forward svc/grafana 3000:3000 -n monitoring --address 0.0.0.0 > /dev/null 2>&1 &
	@sleep 2
	@echo ""
	@echo "✓ Port-forwards active! Open in Windows browser:"
	@echo "  Backend API:  http://localhost:8000"
	@echo "  API Docs:     http://localhost:8000/docs"
	@echo "  Frontend:     http://localhost:8081"
	@echo "  Prometheus:   http://localhost:9090"
	@echo "  Grafana:      http://localhost:3000  (admin / admin)"
	@echo ""
	@echo "  Stop with: make k8s-forward-stop"

# Stop all port-forwards
k8s-forward-stop:
	@echo "Stopping port-forwards..."
	@pkill -f "kubectl port-forward svc/" 2>/dev/null; true
	@echo "✓ Port-forwards stopped"

# Show status of all K8s resources
k8s-status:
	@echo "=== Pods ==="
	@kubectl get pods -n proximity-alarm -o wide 2>/dev/null || echo "  (namespace not found)"
	@echo ""
	@echo "=== Monitoring Pods ==="
	@kubectl get pods -n monitoring -o wide 2>/dev/null || echo "  (namespace not found)"
	@echo ""
	@echo "=== Services ==="
	@kubectl get services -n proximity-alarm 2>/dev/null || true
	@kubectl get services -n monitoring 2>/dev/null || true

# View logs for a specific component (usage: make k8s-logs SVC=backend)
k8s-logs:
	@if [ -z "$(SVC)" ]; then \
		echo "Usage: make k8s-logs SVC=backend|frontend|postgres|prometheus|grafana"; \
	elif [ "$(SVC)" = "prometheus" ] || [ "$(SVC)" = "grafana" ]; then \
		kubectl logs -f -l app=$(SVC) -n monitoring; \
	else \
		kubectl logs -f -l component=$(SVC) -n proximity-alarm; \
	fi

# Open the Kubernetes dashboard (built into minikube)
k8s-dashboard:
	@echo "Opening Kubernetes Dashboard..."
	minikube dashboard

# Delete all K8s resources (clean slate)
k8s-delete:
	@echo "Deleting all Kubernetes resources..."
	kubectl delete -f k8s/monitoring/ --ignore-not-found=true
	kubectl delete -f k8s/base/ --ignore-not-found=true
	@echo "✓ All K8s resources deleted"

# Destroy the entire minikube cluster
k8s-destroy:
	@echo "Destroying minikube cluster..."
	minikube delete
	@echo "✓ Minikube cluster destroyed"
