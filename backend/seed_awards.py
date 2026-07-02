import asyncio
from sqlalchemy import select
from app.database import AsyncSessionLocal, engine, Base
from app.models import Award

async def seed():
    # Make sure tables are created
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        
    async with AsyncSessionLocal() as db:
        # Check if awards exist
        result = await db.execute(select(Award))
        awards = result.scalars().all()
        
        if len(awards) == 0:
            print("Seeding default awards...")
            default_awards = [
                Award(
                    title="Excellence in Rural Healthcare",
                    issuer="Gujarat Social Welfare Board",
                    date_given="March 2026",
                    description="Awarded for our mobile medical dispensary camp initiative that successfully reached over 10,000 underserved residents in Surat district villages.",
                    image_url="https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&q=80&w=600",
                    link="https://example.com/verify/healthcare-excellence",
                    is_active=True
                ),
                Award(
                    title="Most Transparent NGO Award",
                    issuer="Charity Transparency Alliance",
                    date_given="January 2026",
                    description="Recognized for 100% transparency in fundraising, session-by-session campaign reporting, and clear donor impact metrics in Surat, Gujarat.",
                    image_url="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=600",
                    link="https://example.com/verify/charity-transparency",
                    is_active=True
                )
            ]
            db.add_all(default_awards)
            await db.commit()
            print("Successfully seeded awards!")
        else:
            print("Database already has awards. Skipping seeding.")

if __name__ == "__main__":
    asyncio.run(seed())
