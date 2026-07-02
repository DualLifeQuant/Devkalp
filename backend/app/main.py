"""
Devkalp Foundation — Main Application
"""
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import logging
import time

from app.config import settings
from app.database import init_db

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(name)s | %(levelname)s | %(message)s"
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup / shutdown events"""
    logger.info("🌱 Devkalp Foundation API starting up…")
    await init_db()
    logger.info("✅ Database initialised")
    yield
    logger.info("👋 Devkalp Foundation API shutting down")


from fastapi.staticfiles import StaticFiles
import os

app = FastAPI(
    title="Devkalp Foundation API",
    description="Secure multi-module platform — Matrimony · Donations · Campaigns · Jobs · Volunteers",
    version="2.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
    lifespan=lifespan,
)

static_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "static")
if not os.path.exists(static_dir):
    os.makedirs(static_dir)
app.mount("/static", StaticFiles(directory=static_dir), name="static")

# ── Middleware ────────────────────────────────────────────────

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://devkalp.org",
        "https://www.devkalp.org",
        settings.FRONTEND_URL,
        "http://localhost:3000",
        "http://localhost:3001",
    ],
    # allow_origin_regex=r"https://.*\.vercel\.app|https?://localhost(:\d+)?",
    allow_origin_regex=r"https://.*\.vercel\.app|https?://(localhost|127\.0\.0\.1|192\.168\.\d{1,3}\.\d{1,3}|10\.\d{1,3}\.\d{1,3}\.\d{1,3})(:\d+)?",
    allow_credentials=False,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=86400,
)


@app.middleware("http")
async def log_requests(request: Request, call_next):
    start = time.time()
    response = await call_next(request)
    duration = round((time.time() - start) * 1000, 2)
    logger.info(f"{request.method} {request.url.path} → {response.status_code} [{duration}ms]")
    return response


@app.middleware("http")
async def security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    return response


# ── Exception Handlers ───────────────────────────────────────

@app.exception_handler(404)
async def not_found(_request: Request, _exc):
    return JSONResponse(status_code=404, content={"detail": "Resource not found"})


@app.exception_handler(500)
async def server_error(_request: Request, exc):
    logger.error(f"Internal error: {exc}")
    return JSONResponse(status_code=500, content={"detail": "Internal server error"})


# ── Routers ──────────────────────────────────────────────────

from app.routers import auth, matrimony, donations, jobs, campaigns, volunteers, admin, enquiries, awards, csr, press, gallery, partners, instagram
from app.routers import counselors, family, emotional, campaign_sessions

API = "/api/v1"

app.include_router(auth.router,               prefix=API)
app.include_router(matrimony.router,          prefix=API)
app.include_router(donations.router,          prefix=API)
app.include_router(jobs.router,               prefix=API)
app.include_router(campaigns.router,          prefix=API)
app.include_router(volunteers.router,         prefix=API)
app.include_router(admin.router,              prefix=API)
app.include_router(counselors.router,         prefix=API)
app.include_router(family.router,             prefix=API)
app.include_router(emotional.router,          prefix=API)
app.include_router(campaign_sessions.router,  prefix=API)
app.include_router(enquiries.router,          prefix=API)
app.include_router(awards.router,             prefix=API)
app.include_router(csr.router,                prefix=API)
app.include_router(press.router,              prefix=API)
app.include_router(gallery.router,            prefix=API)
app.include_router(partners.router,           prefix=API)
app.include_router(instagram.router,          prefix=API)


# ── Health & Root ─────────────────────────────────────────────

@app.get("/", tags=["Root"])
async def root():
    return {
        "name": "Devkalp Foundation API",
        "version": "2.0.0",
        "status": "running",
        "docs": "/api/docs",
    }


@app.get("/health", tags=["Root"])
async def health():
    return {"status": "healthy", "environment": settings.APP_ENV}


# ── Dev: Create first admin ───────────────────────────────────

@app.post("/api/v1/setup/create-admin", include_in_schema=False)
async def create_admin(data: dict):
    """
    One-time endpoint to create admin accounts.
    Disable in production after setup.
    """
    if settings.APP_ENV == "production":
        return JSONResponse(status_code=403, content={"detail": "Disabled in production"})

    from app.database import AsyncSessionLocal
    from app.models import User, UserRole
    from app.core.security import get_password_hash
    from sqlalchemy import select

    async with AsyncSessionLocal() as db:
        existing = await db.execute(select(User).where(User.email == data["email"]))
        if existing.scalar_one_or_none():
            return {"message": "Admin already exists"}

        admin = User(
            full_name=data.get("full_name", "Admin"),
            email=data["email"],
            phone=data.get("phone"),
            hashed_password=get_password_hash(data["password"]),
            role=UserRole.ADMIN,
            is_active=True,
            is_verified=True,
        )
        db.add(admin)
        await db.commit()

    return {"message": "Admin created", "email": data["email"]}
