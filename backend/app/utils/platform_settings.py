import time
from sqlalchemy import select

from app.database import AsyncSessionLocal
from app.models import PlatformSetting

_CACHE_TTL_SECONDS = 5
_cache = {"value": None, "expires_at": 0.0}


async def _get_or_create_row(db) -> PlatformSetting:
    result = await db.execute(select(PlatformSetting))
    row = result.scalars().first()
    if not row:
        row = PlatformSetting(maintenance_mode=False)
        db.add(row)
        await db.commit()
        await db.refresh(row)
    return row


async def get_maintenance_status(use_cache: bool = True) -> dict:
    if use_cache and _cache["value"] is not None and time.monotonic() < _cache["expires_at"]:
        return _cache["value"]

    async with AsyncSessionLocal() as db:
        row = await _get_or_create_row(db)
        value = {
            "maintenance_mode": row.maintenance_mode,
            "message": row.maintenance_message,
            "updated_at": row.updated_at,
        }
        _cache["value"] = value
        _cache["expires_at"] = time.monotonic() + _CACHE_TTL_SECONDS
        return value


async def set_maintenance_status(maintenance_mode: bool, message: str = None, updated_by: str = None) -> dict:
    async with AsyncSessionLocal() as db:
        row = await _get_or_create_row(db)
        row.maintenance_mode = maintenance_mode
        if message is not None:
            row.maintenance_message = message
        row.updated_by = updated_by
        await db.commit()
        await db.refresh(row)

    _cache["value"] = None
    return await get_maintenance_status(use_cache=False)
