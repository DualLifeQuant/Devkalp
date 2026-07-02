import asyncio
from sqlalchemy import select
from app.database import AsyncSessionLocal, engine, Base
from app.models import Partner

async def seed():
    # Make sure tables are created
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        
    async with AsyncSessionLocal() as db:
        # Check if partners exist
        result = await db.execute(select(Partner))
        partners = result.scalars().all()
        
        if len(partners) == 0:
            print("Seeding default partners...")
            default_partners = [
                Partner(
                    name="Adobe",
                    logo_url="https://upload.wikimedia.org/wikipedia/commons/7/7b/Adobe_Systems_logo.svg",
                    website_url="https://www.adobe.com",
                    is_active=True
                ),
                Partner(
                    name="Apple",
                    logo_url="https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg",
                    website_url="https://www.apple.com",
                    is_active=True
                ),
                Partner(
                    name="Bosch",
                    logo_url="https://upload.wikimedia.org/wikipedia/commons/1/16/Bosch-logo.svg",
                    website_url="https://www.bosch.com",
                    is_active=True
                ),
                Partner(
                    name="Atlassian",
                    logo_url="https://upload.wikimedia.org/wikipedia/commons/0/01/Atlassian_logo.svg",
                    website_url="https://www.atlassian.com",
                    is_active=True
                ),
                Partner(
                    name="Cargill",
                    logo_url="https://upload.wikimedia.org/wikipedia/commons/d/d0/Cargill_Logo.svg",
                    website_url="https://www.cargill.com",
                    is_active=True
                ),
                Partner(
                    name="Infosys",
                    logo_url="https://upload.wikimedia.org/wikipedia/commons/9/95/Infosys_logo.svg",
                    website_url="https://www.infosys.com",
                    is_active=True
                ),
                Partner(
                    name="Wipro",
                    logo_url="https://upload.wikimedia.org/wikipedia/commons/a/a0/Wipro_Logo.svg",
                    website_url="https://www.wipro.com",
                    is_active=True
                ),
                Partner(
                    name="Tata Group",
                    logo_url="https://upload.wikimedia.org/wikipedia/commons/8/8f/Tata_logo.svg",
                    website_url="https://www.tata.com",
                    is_active=True
                )
            ]
            db.add_all(default_partners)
            await db.commit()
            print("Successfully seeded partners!")
        else:
            print("Database already has partners. Skipping seeding.")

if __name__ == "__main__":
    asyncio.run(seed())
