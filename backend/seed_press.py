import asyncio
from sqlalchemy import select
from app.database import AsyncSessionLocal, engine, Base
from app.models import PressMention

async def seed():
    # Make sure tables are created
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        
    async with AsyncSessionLocal() as db:
        # Check if press mentions exist
        result = await db.execute(select(PressMention))
        mentions = result.scalars().all()
        
        if len(mentions) == 0:
            print("Seeding default press mentions...")
            default_mentions = [
                PressMention(
                    title="Devkalp Foundation Recognized at Indian Social Impact Awards 2026",
                    publisher_name="ANI News",
                    logo_url=None,
                    article_url="https://example.com/ani-news-devkalp-awards",
                    publish_date="January 2026",
                    summary="Devkalp Foundation was recognized as one of the best emerging NGOs of the year for its breakthrough local community matrimonial counselor services and school health campaigns in Surat.",
                    is_active=True
                ),
                PressMention(
                    title="How Devkalp's Counselor Services are Transforming Matrimony in Surat",
                    publisher_name="The Print",
                    logo_url=None,
                    article_url="https://example.com/theprint-devkalp-matrimony",
                    publish_date="February 2026",
                    summary="A detailed feature on how counselor-guided, family-supported matrimonial matchmaking is re-introducing core values and building trust in community relationships.",
                    is_active=True
                ),
                PressMention(
                    title="Bringing Livelihood and Healthcare to the Doorstep of Rural Gujarat",
                    publisher_name="Business Standard",
                    logo_url=None,
                    article_url="https://example.com/business-standard-devkalp-livelihood",
                    publish_date="May 2026",
                    summary="Highlighting the joint CSR partnership models launched by Devkalp to provide digital literacy courses, mobile medical units, and direct placements.",
                    is_active=True
                )
            ]
            db.add_all(default_mentions)
            await db.commit()
            print("Successfully seeded press mentions!")
        else:
            print("Database already has press mentions. Skipping seeding.")

if __name__ == "__main__":
    asyncio.run(seed())
