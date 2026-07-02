import asyncio
from sqlalchemy import delete
from app.database import AsyncSessionLocal
from app.models import PressMention

async def clear():
    async with AsyncSessionLocal() as db:
        await db.execute(delete(PressMention))
        await db.commit()
        print("Successfully cleared all press mentions from database!")

if __name__ == "__main__":
    asyncio.run(clear())
