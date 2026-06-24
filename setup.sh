#!/bin/bash
# =============================================================
# Devkalp Foundation Platform — Local Setup Script
# Run this once from the project root directory.
# =============================================================

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_step() { echo -e "\n${BLUE}▶ $1${NC}"; }
print_ok()   { echo -e "${GREEN}✅ $1${NC}"; }
print_note() { echo -e "${YELLOW}ℹ  $1${NC}"; }

echo ""
echo "=================================================="
echo "   Devkalp Foundation — Development Setup"
echo "=================================================="

# ── BACKEND ─────────────────────────────────────────
print_step "Setting up Python backend..."

cd backend

# Create virtual environment if not exists
if [ ! -d "venv" ]; then
  python3 -m venv venv
  print_ok "Virtual environment created"
fi

# Activate venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt -q
print_ok "Python dependencies installed"

# .env is already present with SQLite config
if [ ! -f ".env" ]; then
  cp .env.example .env
  print_note ".env created from example — using SQLite (no PostgreSQL needed)"
fi

cd ..

# ── FRONTEND ─────────────────────────────────────────
print_step "Setting up Next.js frontend..."

cd frontend
npm install --legacy-peer-deps -q
print_ok "Node dependencies installed"

# .env.local is already present
if [ ! -f ".env.local" ]; then
  cp .env.local.example .env.local
  print_note ".env.local created"
fi

cd ..

echo ""
echo "=================================================="
echo -e "${GREEN}   ✅ Setup Complete!${NC}"
echo "=================================================="
echo ""
echo "To start the platform, open two terminals:"
echo ""
echo "  Terminal 1 — Backend:"
echo "    cd backend"
echo "    source venv/bin/activate"
echo "    uvicorn app.main:app --reload --port 8000"
echo ""
echo "  Terminal 2 — Frontend:"
echo "    cd frontend"
echo "    npm run dev"
echo ""
echo "  Then open: http://localhost:3000"
echo "  API Docs:  http://localhost:8000/api/docs"
echo ""
echo "  First-time admin setup (run once after starting backend):"
echo '    curl -X POST http://localhost:8000/api/v1/setup/create-admin \'
echo '      -H "Content-Type: application/json" \'
echo '      -d '"'"'{"email":"admin@devkalp.org","password":"Admin@123","full_name":"Super Admin"}'"'"
echo ""
