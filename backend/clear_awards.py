import asyncio
from sqlalchemy import delete
from app.database import AsyncSessionLocal
from app.models import Award

async def clear():
    async with AsyncSessionLocal() as db:
        await db.execute(delete(Award))
        await db.commit()
        print("Successfully cleared all awards from database!")

if __name__ == "__main__":
    asyncio.run(clear())
