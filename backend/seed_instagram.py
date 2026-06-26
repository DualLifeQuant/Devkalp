import asyncio
from sqlalchemy import select
from app.database import AsyncSessionLocal, engine, Base
from app.models import InstagramPost

async def seed():
    # Make sure tables are created
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(InstagramPost))
        posts = result.scalars().all()
        
        if len(posts) == 0:
            print("Seeding default Instagram posts...")
            default_posts = [
                InstagramPost(
                    post_url="https://www.instagram.com/p/CeEducationPost/",
                    image_url="/13.jpeg",
                    caption="Empowering young minds! Guided tutoring and school library setups are building self-reliant futures for rural students. 📚✨ #Education #Devkalp",
                    likes_count=124,
                    comments_count=12,
                    is_active=True
                ),
                InstagramPost(
                    post_url="https://www.instagram.com/p/CeHealthcarePost/",
                    image_url="/camp.jpg",
                    caption="Bringing healthcare to the doorstep. Our mobile clinics and diagnostic camps cover remote villages in Surat, Gujarat. 🩺🚐 #Healthcare #CommunityCare",
                    likes_count=198,
                    comments_count=18,
                    is_active=True
                ),
                InstagramPost(
                    post_url="https://www.instagram.com/p/CeMatrimonyPost/",
                    image_url="/matrimony.jpg",
                    caption="Finding stories, building homes. Our counselor-guided matrimony program connects families on values and compatibility. 💍❤️ #Matrimony #TrueConnections",
                    likes_count=256,
                    comments_count=34,
                    is_active=True
                ),
                InstagramPost(
                    post_url="https://www.instagram.com/p/CeJobsPost/",
                    image_url="/jobs.jpg",
                    caption="Career guidance and job matching. Preparing candidates step-by-step for local placements. 💼🚀 #Livelihoods #Empowerment",
                    likes_count=89,
                    comments_count=5,
                    is_active=True
                ),
                InstagramPost(
                    post_url="https://www.instagram.com/p/CeVolunteerPost/",
                    image_url="/volunteer.jpg",
                    caption="Our incredible volunteer network running nutrition drives and health camps. Thank you for your selflessness! 🙌🌟 #Volunteering #SocialImpact",
                    likes_count=145,
                    comments_count=9,
                    is_active=True
                ),
                InstagramPost(
                    post_url="https://www.instagram.com/p/CeGeneralPost/",
                    image_url="/2.jpeg",
                    caption="Devkalp Foundation is dedicated to walking alongside families through every walk of life. Join us today. 🤝❤️ #Empowerment #SocialGood",
                    likes_count=167,
                    comments_count=11,
                    is_active=True
                )
            ]
            db.add_all(default_posts)
            await db.commit()
            print("Successfully seeded Instagram posts!")
        else:
            print("Database already has Instagram posts. Skipping seeding.")

if __name__ == "__main__":
    asyncio.run(seed())
