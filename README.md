# Devkalp Foundation Platform

A production-ready, full-stack web platform for Devkalp Foundation — a non-profit organisation working across matrimony counseling, health campaigns, donations, employment, and community volunteering.

---

## Quick Start (Local Development)

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd devkalp

# 2. Run setup
bash setup.sh

# 3. Start backend (Terminal 1)
cd backend && source venv/bin/activate
uvicorn app.main:app --reload --port 8000

# 4. Start frontend (Terminal 2)
cd frontend && npm run dev

# 5. Open http://localhost:3000
```

**First-time admin creation** (run once after backend starts):
```bash
curl -X POST http://localhost:8000/api/v1/setup/create-admin \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@devkalp.org","password":"Admin@123","full_name":"Super Admin"}'
```

---

## Tech Stack

| Layer     | Technology                                     |
|-----------|------------------------------------------------|
| Frontend  | Next.js 14 (App Router), TypeScript, Tailwind  |
| Backend   | FastAPI (Python), SQLAlchemy (async)           |
| Database  | SQLite (dev) / PostgreSQL (production)         |
| Auth      | JWT (access + refresh tokens)                  |
| Storage   | Cloudinary (images/docs) — optional in dev     |
| Payments  | Razorpay — mock mode in dev                    |
| Email     | SMTP (Gmail) — logs to console in dev          |
| WhatsApp  | Meta Cloud API — optional                      |

---

## User Roles

| Role        | Access                                                  |
|-------------|----------------------------------------------------------|
| `admin`     | Full platform control — all modules                      |
| `counselor` | Matrimony profiles, counseling sessions, notes           |
| `matrimony` | Own profile, matches, family details, emotional eval     |
| `candidate` | Job listings, applications, interview status             |
| `donor`     | Donation history, campaigns                              |
| `volunteer` | Task assignments, contribution tracking                  |

---

## Platform Modules

### 💍 Matrimony
- Private profile creation (multi-step form)
- Admin review and approval workflow
- Counselor-led session system with confidential notes
- Manual match suggestion by admin
- Both-party interest/decline response system
- Emotional readiness questionnaire (15 questions, 5 categories)
- Family member management with consent tracking

### 💰 Donations
- Campaign-based and general donations
- Razorpay payment integration (mock mode in dev)
- Auto-receipt generation with 80G details
- Full transparency dashboard — funds raised vs used
- Donor history with downloadable receipts

### 🏥 Health Campaigns
- Campaign creation and management
- Session-level tracking (school name, facilitator, duration)
- Bulk attendance recording (girls, boys, teachers)
- Impact analytics per campaign
- Photo gallery per session

### 💼 Jobs & Hiring
- Job postings by admin
- Candidate application with cover letter
- Resume upload
- Application pipeline: Applied → Shortlisted → Interview Scheduled → Selected/Rejected
- Email + WhatsApp interview notifications

### 🙋 Volunteers
- Volunteer self-registration with interests and availability
- Admin approval workflow
- Task assignment by admin
- Contribution tracking (hours, tasks completed)

---

## Project Structure

```
devkalp/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app entry point
│   │   ├── config.py            # Environment settings
│   │   ├── database.py          # DB engine (SQLite/PostgreSQL)
│   │   ├── models/__init__.py   # All SQLAlchemy models
│   │   ├── core/
│   │   │   ├── security.py      # JWT auth, password hashing
│   │   │   ├── email.py         # Email templates + SMTP
│   │   │   └── notifications.py # WhatsApp notifications
│   │   ├── routers/
│   │   │   ├── auth.py          # Registration, login, refresh
│   │   │   ├── matrimony.py     # Profile, matches, admin
│   │   │   ├── donations.py     # Campaigns, Razorpay, receipts
│   │   │   ├── jobs.py          # Listings, applications, interviews
│   │   │   ├── campaigns.py     # Events, registrations
│   │   │   ├── campaign_sessions.py  # Attendance tracking
│   │   │   ├── volunteers.py    # Registration, tasks
│   │   │   ├── counselors.py    # Sessions, notes, profiles
│   │   │   ├── family.py        # Family members, participation
│   │   │   ├── emotional.py     # Readiness questionnaire
│   │   │   └── admin.py         # Stats, users, activity logs
│   │   └── utils/
│   │       └── storage.py       # Cloudinary upload helpers
│   ├── .env                     # Local dev environment
│   └── requirements.txt
│
└── frontend/
    ├── app/                     # Next.js App Router pages
    │   ├── page.tsx             # Home page
    │   ├── about/               # About Devkalp
    │   ├── contact/             # Contact form
    │   ├── volunteer/           # Public volunteer page
    │   ├── donate/              # Donation page
    │   ├── campaigns/           # Campaign listings
    │   ├── jobs/                # Job listings + [id] detail
    │   ├── matrimony/register/  # Multi-step profile form
    │   ├── auth/                # Login, Register, Forgot Password
    │   ├── dashboard/           # Role-based dashboards
    │   │   ├── matrimony/       # Profile, matches, eval, family
    │   │   ├── counselor/       # Overview, clients, sessions
    │   │   ├── jobs/            # Candidate applications
    │   │   ├── donate/          # Donor history
    │   │   └── volunteer/       # Tasks, contributions
    │   └── admin/               # Admin panel (9 sections)
    ├── components/
    │   ├── layout/
    │   │   ├── Navbar.tsx
    │   │   ├── Footer.tsx
    │   │   ├── DashboardLayout.tsx
    │   │   └── AdminLayout.tsx
    │   └── ui/index.tsx         # Button, Card, Badge, Input...
    ├── lib/
    │   ├── api.ts               # Axios client + all API methods
    │   └── store.ts             # Zustand auth store
    └── .env.local               # Frontend env
```

---

## API Documentation

Interactive Swagger UI: `http://localhost:8000/api/docs`

Key endpoints:

```
POST /api/v1/auth/register          Register new user
POST /api/v1/auth/login             Login
GET  /api/v1/auth/me                Current user info

POST /api/v1/matrimony/profile      Create matrimony profile
GET  /api/v1/matrimony/my-matches   Get suggested matches
POST /api/v1/matrimony/admin/suggest-match   Admin: suggest match

POST /api/v1/donations/initiate     Start donation flow
POST /api/v1/donations/mock-complete  Dev: complete without Razorpay
GET  /api/v1/donations/transparency  Public transparency data

GET  /api/v1/jobs/                  List open jobs
POST /api/v1/jobs/{id}/apply        Apply for job
POST /api/v1/jobs/admin/schedule-interview  Admin: schedule interview

POST /api/v1/campaign-sessions/     Create campaign session
POST /api/v1/campaign-sessions/{id}/bulk-attendance  Record attendance

GET  /api/v1/admin/dashboard/stats  Admin statistics
```

---

## Environment Variables

### Backend (`backend/.env`)

```env
# App
SECRET_KEY=your-secret-key-min-32-chars
APP_ENV=development

# Database (SQLite for dev, PostgreSQL for production)
DATABASE_URL=sqlite+aiosqlite:///./devkalp_dev.db

# Email (leave empty to skip — logs to console in dev)
SMTP_USER=
SMTP_PASSWORD=

# Razorpay (leave empty for mock mode in dev)
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=

# Cloudinary (leave empty for placeholder URLs in dev)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

### Frontend (`frontend/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_XXXXX
```

---

## Production Deployment (Hostinger VPS)

### Backend

```bash
# 1. SSH into your VPS
ssh root@your-server-ip

# 2. Install Python 3.11+
apt update && apt install python3.11 python3.11-venv nginx certbot -y

# 3. Clone and setup
git clone your-repo /var/www/devkalp
cd /var/www/devkalp/backend
python3.11 -m venv venv && source venv/bin/activate
pip install -r requirements.txt

# 4. Configure production .env
cp .env .env.production
# Edit .env.production:
#   DATABASE_URL=postgresql+asyncpg://user:pass@localhost/devkalp_db
#   SECRET_KEY=<64-char-random-string>
#   APP_ENV=production
#   RAZORPAY_KEY_ID=rzp_live_XXXXX
#   SMTP_USER=your@email.com
#   CLOUDINARY_CLOUD_NAME=your-cloud

# 5. Create PostgreSQL database
apt install postgresql -y
sudo -u postgres createuser devkalp_user
sudo -u postgres createdb devkalp_db
sudo -u postgres psql -c "ALTER USER devkalp_user WITH PASSWORD 'strong-password';"

# 6. Create systemd service
cat > /etc/systemd/system/devkalp-api.service << EOF
[Unit]
Description=Devkalp Foundation API
After=network.target

[Service]
User=www-data
WorkingDirectory=/var/www/devkalp/backend
Environment="PATH=/var/www/devkalp/backend/venv/bin"
EnvironmentFile=/var/www/devkalp/backend/.env.production
ExecStart=/var/www/devkalp/backend/venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
Restart=always

[Install]
WantedBy=multi-user.target
EOF

systemctl enable devkalp-api && systemctl start devkalp-api

# 7. Nginx config
cat > /etc/nginx/sites-available/devkalp-api << EOF
server {
    listen 80;
    server_name api.devkalpfoundation.org;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        client_max_body_size 20M;
    }
}
EOF

ln -s /etc/nginx/sites-available/devkalp-api /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx

# 8. SSL certificate
certbot --nginx -d api.devkalpfoundation.org
```

### Frontend

```bash
# On your VPS (or deploy to Vercel/Netlify for zero-config)

cd /var/www/devkalp/frontend

# Create production .env.local
cat > .env.local << EOF
NEXT_PUBLIC_API_URL=https://api.devkalpfoundation.org/api/v1
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_XXXXX
EOF

npm install && npm run build

# PM2 to keep it running
npm install -g pm2
pm2 start npm --name "devkalp-web" -- start -- -p 3000
pm2 save && pm2 startup

# Nginx config for frontend
cat > /etc/nginx/sites-available/devkalp-web << EOF
server {
    listen 80;
    server_name devkalpfoundation.org www.devkalpfoundation.org;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }
}
EOF

ln -s /etc/nginx/sites-available/devkalp-web /etc/nginx/sites-enabled/
certbot --nginx -d devkalpfoundation.org -d www.devkalpfoundation.org
```

---

## Test Flows

### Matrimony
1. Register with role `matrimony` → `/auth/register`
2. Create profile → `/matrimony/register`
3. Login as admin → approve profile → `/admin/matrimony`
4. Register second matrimony user, create their profile, approve
5. Admin suggests match → both users respond → match goes to `interested`

### Jobs
1. Admin posts job → `/admin/jobs`
2. Register with role `candidate`, apply for job
3. Admin shortlists → schedules interview (email sent)
4. Status updates through pipeline

### Donations
1. Visit `/donate`, choose campaign
2. Click "Donate", fill details
3. In dev: payment creates mock order → call `/donations/mock-complete`
4. Receipt number generated, campaign total updated

### Campaign Attendance
1. Admin creates campaign → `/admin/campaigns`
2. Add session (school, date, facilitator)
3. Record bulk attendance (girls/boys/teachers)
4. View analytics per campaign

---

## Support

For technical issues or queries: `tech@devkalpfoundation.org`
