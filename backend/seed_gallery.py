import asyncio
from sqlalchemy import select
from app.database import AsyncSessionLocal, engine, Base
from app.models import GalleryItem

async def seed():
    # Make sure tables are created
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        
    async with AsyncSessionLocal() as db:
        # Check if gallery items exist
        result = await db.execute(select(GalleryItem))
        items = result.scalars().all()
        
        if len(items) == 0:
            print("Seeding default gallery items...")
            default_items = [
                GalleryItem(
                    title="Community Support & Kit Distribution",
                    description="Volunteers gathering to distribute nutrition kits, clothing, and essential hygiene supplies to families across Surat, Gujarat.",
                    image_url="volunteer.jpg",
                    category="volunteer",
                    is_active=True
                ),
                GalleryItem(
                    title="High School Health Campaign Session",
                    description="Facilitators conducting menstrual hygiene and adolescent wellness drives at a local secondary school, reaching dozens of young students.",
                    image_url="camp.jpg",
                    category="health",
                    is_active=True
                ),
                GalleryItem(
                    title="Livelihood Prep & Candidate Training",
                    description="Job seekers receiving mock interview prep and resume editing mentorship from corporate volunteers to match with career opportunities.",
                    image_url="jobs.jpg",
                    category="livelihood",
                    is_active=True
                ),
                GalleryItem(
                    title="Transparent Giving Resource Sorting",
                    description="Sorting resources purchased via donations, ensuring every single rupee is fully accounted for and mapped to local families.",
                    image_url="1.jpeg",
                    category="giving",
                    is_active=True
                ),
                GalleryItem(
                    title="Counselor Matchmaking Consultation",
                    description="A private, family-involved matrimonial counselor session matching compatibility profiles and guiding compatibility journeys.",
                    image_url="matrimony_hero.jpg",
                    category="matrimony",
                    is_active=True
                )
            ]
            db.add_all(default_items)
            await db.commit()
            print("Successfully seeded gallery items!")
        else:
            print("Database already has gallery items. Skipping seeding.")

if __name__ == "__main__":
    asyncio.run(seed())
