# Makefile for Proximity Alarm Application
# Common DevOps commands for local development

.PHONY: help setup setup-backend setup-frontend up down logs clean test lint deploy-local

help:
	@echo "Proximity Alarm App - DevOps Learning"
	@echo "======================================"
	@echo "Available commands:"
	@echo "  make setup              - Complete local setup"
	@echo "  make setup-backend      - Setup backend only"
	@echo "  make setup-frontend     - Setup frontend only"
	@echo "  make up                 - Start all services (docker-compose)"
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
	@cd frontend && npm install
	@echo "✓ Frontend setup complete"

# Docker compose
up:
	@echo "Starting services..."
	docker-compose up -d
	@echo "✓ Services started"
	@echo "  API: http://localhost:8000"
	@echo "  API Docs: http://localhost:8000/docs"
	@echo "  Health check: http://localhost:8000/health"

down:
	@echo "Stopping services..."
	docker-compose down
	@echo "✓ Services stopped"

logs:
	docker-compose logs -f

backend-logs:
	docker-compose logs -f backend

frontend-logs:
	docker-compose logs -f frontend

# Testing
test: test-backend test-frontend
	@echo "✓ All tests passed!"

test-backend:
	@echo "Running backend tests..."
	@cd backend && . venv/bin/activate 2>/dev/null || true; pytest tests/ -v --tb=short
	@echo "✓ Backend tests complete"

test-frontend:
	@echo "Running frontend tests..."
	@cd frontend && npm test -- --passWithNoTests
	@echo "✓ Frontend tests complete"

test-watch-frontend:
	@cd frontend && npm test -- --watch

# Linting
lint: lint-backend lint-frontend
	@echo "✓ Linting complete!"

lint-backend:
	@echo "Linting backend..."
	@cd backend && . venv/bin/activate 2>/dev/null || true; flake8 src/ --max-line-length=100 || true
	@echo "✓ Backend linting complete"

lint-frontend:
	@echo "Linting frontend..."
	@cd frontend && npm run lint || true
	@echo "✓ Frontend linting complete"

# Database
psql:
	docker-compose exec postgres psql -U devops_user -d proximity_alarm

db-migrate:
	@echo "Running database migrations..."
	docker-compose exec backend python -m alembic upgrade head
	@echo "✓ Migrations complete"

db-seed:
	@echo "Seeding database..."
	docker-compose exec backend python -m scripts.seed_data
	@echo "✓ Database seeded"

# Development
dev-backend:
	@cd backend && . venv/bin/activate 2>/dev/null || true; uvicorn src.main:app --reload --host 0.0.0.0 --port 8000

dev-frontend:
	@cd frontend && npm start

# Utility
clean:
	@echo "Cleaning up..."
	docker-compose down -v
	find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name "node_modules" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name ".pytest_cache" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name ".next" -exec rm -rf {} + 2>/dev/null || true
	@echo "✓ Cleanup complete"

status:
	@echo "Service Status:"
	@docker-compose ps || true

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
	docker build -t proximity-alarm-frontend:latest frontend/
	@echo "✓ Frontend image built"

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
