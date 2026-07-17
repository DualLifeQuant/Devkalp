import time
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException, Response
from fastapi.concurrency import run_in_threadpool
from sqlalchemy import select, text

from app.config import settings
from app.database import AsyncSessionLocal
from app.models import Job, JobStatus
from app.utils.platform_settings import get_maintenance_status

router = APIRouter(tags=["System"])
# Sitemap/robots must be served from the site root (no /api/v1 prefix) for crawlers.
public_router = APIRouter(tags=["System"])

FRONTEND_ORIGIN = settings.FRONTEND_URL.rstrip("/")

STATIC_SITEMAP_PATHS = [
    ("/", "1.0", "weekly"),
    ("/about", "0.8", "monthly"),
    ("/contact", "0.6", "monthly"),
    ("/matrimony", "0.8", "weekly"),
    ("/donate", "0.9", "weekly"),
    ("/campaigns", "0.9", "weekly"),
    ("/jobs", "0.8", "daily"),
    ("/volunteer", "0.7", "monthly"),
    ("/80g", "0.5", "yearly"),
    ("/scholarship", "0.7", "monthly"),
    ("/csr", "0.7", "monthly"),
    ("/gallery", "0.6", "weekly"),
    ("/privacy", "0.2", "yearly"),
    ("/terms", "0.2", "yearly"),
]


@router.get("/system/status")
async def system_status():
    """Public endpoint the frontend polls to know whether the site is in maintenance mode."""
    maint = await get_maintenance_status()
    return {
        "maintenance_mode": maint["maintenance_mode"],
        "message": maint["message"],
    }


@router.get("/hidden/test", include_in_schema=False)
async def hidden_health_check(token: str = ""):
    """
    Diagnostic endpoint reporting the health of the DB, Cloudinary, and other
    integrations. Not linked from anywhere and excluded from the OpenAPI docs;
    still gated by a shared secret since it reports infra configuration state.
    """
    if not token or token != settings.SECRET_KEY:
        raise HTTPException(404, "Not found")

    checks: dict = {}

    start = time.monotonic()
    try:
        async with AsyncSessionLocal() as db:
            await db.execute(text("SELECT 1"))
        checks["database"] = {"status": "ok", "latency_ms": round((time.monotonic() - start) * 1000, 1)}
    except Exception as e:
        checks["database"] = {"status": "error", "detail": str(e)}

    if settings.CLOUDINARY_CLOUD_NAME:
        try:
            import cloudinary.api
            start = time.monotonic()
            await run_in_threadpool(cloudinary.api.ping)
            checks["cloudinary"] = {"status": "ok", "latency_ms": round((time.monotonic() - start) * 1000, 1)}
        except Exception as e:
            checks["cloudinary"] = {"status": "error", "detail": str(e)}
    else:
        checks["cloudinary"] = {"status": "not_configured"}

    checks["smtp"] = {"status": "configured" if settings.SMTP_USER and settings.SMTP_PASSWORD else "not_configured"}
    checks["razorpay"] = {"status": "configured" if settings.RAZORPAY_KEY_ID and settings.RAZORPAY_KEY_SECRET else "not_configured"}
    checks["whatsapp"] = {"status": "configured" if settings.WHATSAPP_ACCESS_TOKEN else "not_configured"}

    maint = await get_maintenance_status(use_cache=False)
    checks["maintenance_mode"] = maint["maintenance_mode"]

    overall_ok = all(
        c.get("status") in ("ok", "configured", "not_configured")
        for c in checks.values() if isinstance(c, dict)
    )

    return {
        "status": "ok" if overall_ok else "degraded",
        "app_env": settings.APP_ENV,
        "checked_at": datetime.now(timezone.utc).isoformat(),
        "checks": checks,
    }


@public_router.get("/robots.txt", include_in_schema=False)
async def robots_txt():
    lines = [
        "User-agent: *",
        "Allow: /",
        "Disallow: /admin",
        "Disallow: /dashboard",
        "Disallow: /auth",
        "Disallow: /api",
        "",
        f"Sitemap: {FRONTEND_ORIGIN}/sitemap.xml",
    ]
    return Response("\n".join(lines), media_type="text/plain")


@public_router.get("/sitemap.xml", include_in_schema=False)
async def sitemap_xml():
    urls = []
    for path, priority, changefreq in STATIC_SITEMAP_PATHS:
        urls.append((f"{FRONTEND_ORIGIN}{path}", priority, changefreq, None))

    async with AsyncSessionLocal() as db:
        result = await db.execute(select(Job).where(Job.status == JobStatus.OPEN))
        jobs = result.scalars().all()
        for job in jobs:
            updated = getattr(job, "updated_at", None) or getattr(job, "created_at", None)
            urls.append((f"{FRONTEND_ORIGIN}/jobs/{job.id}", "0.6", "weekly", updated))

    entries = []
    for loc, priority, changefreq, lastmod in urls:
        parts = [f"  <url>", f"    <loc>{loc}</loc>"]
        if lastmod:
            parts.append(f"    <lastmod>{lastmod.date().isoformat()}</lastmod>")
        parts.append(f"    <changefreq>{changefreq}</changefreq>")
        parts.append(f"    <priority>{priority}</priority>")
        parts.append("  </url>")
        entries.append("\n".join(parts))

    xml = (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
        + "\n".join(entries) +
        "\n</urlset>"
    )
    return Response(xml, media_type="application/xml")
