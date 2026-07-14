import asyncio
from app.database import AsyncSessionLocal
from app.models import GalleryCategory
from sqlalchemy import select

CATEGORIES = [
    {"value": "matrimony", "label": "Matrimony Services", "order_index": 1},
    {"value": "health",    "label": "Health Campaigns",   "order_index": 2},
    {"value": "giving",    "label": "Transparent Giving", "order_index": 3},
    {"value": "livelihood","label": "Livelihood Support", "order_index": 4},
    {"value": "volunteer", "label": "Volunteer Ecosystem","order_index": 5},
    {"value": "general",   "label": "General NGO Events", "order_index": 6},
]


async def seed():
    async with AsyncSessionLocal() as db:
        for cat in CATEGORIES:
            existing = await db.execute(
                select(GalleryCategory).where(GalleryCategory.value == cat["value"])
            )
            if existing.scalar_one_or_none():
                print(f"Skipping (already exists): {cat['value']}")
                continue
            db.add(GalleryCategory(**cat))
            print(f"Added: {cat['value']} -> {cat['label']}")
        await db.commit()
    print("Done seeding gallery categories.")


if __name__ == "__main__":
    asyncio.run(seed())