import asyncio
from datetime import datetime, timedelta
from sqlalchemy import select
from app.database import AsyncSessionLocal, engine, Base
from app.models import User, UserRole, Campaign, CampaignStatus
from app.core.security import get_password_hash

async def seed():
    # Make sure tables are created
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        
    async with AsyncSessionLocal() as db:
        # 1. Check if admin exists, if not create one
        admin_email = "admin@devkalp.org"
        result = await db.execute(select(User).where(User.email == admin_email))
        admin = result.scalar_one_or_none()
        
        if not admin:
            print("Creating default admin account...")
            admin = User(
                full_name="Super Admin",
                email=admin_email,
                phone="9999999999",
                hashed_password=get_password_hash("Admin@123"),
                role=UserRole.ADMIN,
                is_active=True,
                is_verified=True,
            )
            db.add(admin)
            await db.flush()
            print(f"Admin account created: {admin_email}")
        else:
            print("Admin account already exists.")
            
        # 2. Check if campaigns exist
        result = await db.execute(select(Campaign))
        campaigns = result.scalars().all()
        
        if not campaigns:
            print("No campaigns found. Seeding default campaigns...")
            default_campaigns = [
                Campaign(
                    title="Free Health & Wellness Camp 2026",
                    slug="free-health-wellness-camp-2026",
                    category="Health",
                    short_description="A free health screening, counseling, and awareness session for families in rural areas.",
                    description=(
                        "Our annual Health & Wellness Camp provides free basic check-ups, sugar & BP testing, "
                        "and doctor consultation for underprivileged families. We will also distribute free essential "
                        "medicines and conduct hygiene awareness sessions."
                    ),
                    venue="Community Center Sector 5",
                    city="Mumbai",
                    event_date=datetime.now() + timedelta(days=15),
                    status=CampaignStatus.ACTIVE.value,
                    max_registrations=100,
                    registration_count=0,
                    is_registration_open=True,
                    cover_image="https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=800",
                    created_by=admin.id,
                ),
                Campaign(
                    title="Digital Education & Literacy Drive",
                    slug="digital-education-literacy-drive",
                    category="Education",
                    short_description="Empowering young children with basic computer skills, internet safety, and coding fundamentals.",
                    description=(
                        "Help us bridge the digital divide. This campaign aims to set up temporary learning labs "
                        "and teach school children basic computer operations, office tools, and online safety. "
                        "Volunteers will assist students hands-on."
                    ),
                    venue="Devkalp Learning Hub",
                    city="Pune",
                    event_date=datetime.now() + timedelta(days=30),
                    status=CampaignStatus.ACTIVE.value,
                    max_registrations=50,
                    registration_count=0,
                    is_registration_open=True,
                    cover_image="https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=800",
                    created_by=admin.id,
                ),
                Campaign(
                    title="Mega Tree Plantation Drive",
                    slug="mega-tree-plantation-drive",
                    category="Environment",
                    short_description="Planting 500 saplings in city parks and residential zones to improve green cover.",
                    description=(
                        "Join hands to make our city green again. We are organizing a massive tree plantation drive "
                        "across multiple neighborhoods. Saplings, soil, and tools will be provided. Please wear comfortable clothes."
                    ),
                    venue="Greenwood Public Park",
                    city="Bangalore",
                    event_date=datetime.now() + timedelta(days=7),
                    status=CampaignStatus.ACTIVE.value,
                    max_registrations=200,
                    registration_count=0,
                    is_registration_open=True,
                    cover_image="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=800",
                    created_by=admin.id,
                ),
                Campaign(
                    title="Community Kitchen & Food Donation",
                    slug="community-kitchen-food-donation",
                    category="Community",
                    short_description="Preparing and distributing warm nutritious meals to shelter homes and migrant workers.",
                    description=(
                        "Every weekend, Devkalp hosts a community kitchen preparing healthy meals. We distribute them "
                        "to homeless shelters and daily wage workers. Volunteers are needed for food prep, packing, and distribution."
                    ),
                    venue="Devkalp Head Office",
                    city="Mumbai",
                    event_date=datetime.now() + timedelta(days=5),
                    status=CampaignStatus.ACTIVE.value,
                    max_registrations=30,
                    registration_count=0,
                    is_registration_open=True,
                    cover_image="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=800",
                    created_by=admin.id,
                )
            ]
            db.add_all(default_campaigns)
            await db.commit()
            print("Seeded 4 default campaigns successfully!")
        else:
            print(f"Found {len(campaigns)} existing campaigns. Skipping campaign seed.")

if __name__ == "__main__":
    asyncio.run(seed())
