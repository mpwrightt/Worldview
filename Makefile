.PHONY: help install dev deploy convex convex-deploy seed

help:
	@echo "WorldView OSINT - Convex + Vercel"
	@echo ""
	@echo "Setup:"
	@echo "  make install      - Install dependencies"
	@echo "  make setup        - Initial project setup"
	@echo ""
	@echo "Development:"
	@echo "  make convex       - Start Convex dev server"
	@echo "  make dev          - Start frontend dev server"
	@echo "  make seed         - Seed sample data"
	@echo ""
	@echo "Deployment:"
	@echo "  make convex-deploy - Deploy Convex to production"
	@echo "  make deploy       - Deploy frontend to Vercel"

install:
	cd frontend && npm install

setup:
	chmod +x setup.sh && ./setup.sh

convex:
	npx convex dev

convex-deploy:
	npx convex deploy

dev:
	cd frontend && npm run dev

seed:
	npx convex run seed:seedSampleData

deploy:
	cd frontend && vercel --prod
