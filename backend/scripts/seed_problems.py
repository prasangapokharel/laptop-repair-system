import sys
import os
import asyncio
from sqlalchemy import select

# Add backend to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from db import AsyncSessionLocal
from models.device import DeviceType
from models.problem import Problem

async def seed_problems():
    async with AsyncSessionLocal() as db:
        # Get or create a device type
        result = await db.execute(select(DeviceType).limit(1))
        device_type = result.scalar_one_or_none()
        
        if not device_type:
            print("Creating default device type...")
            device_type = DeviceType(name="Laptop", description="Default laptop type")
            db.add(device_type)
            await db.commit()
            await db.refresh(device_type)
        
        print(f"Using Device Type ID: {device_type.id}")
        
        # Create 50 problems
        problems = []
        for i in range(1, 51):
            name = f"Common Problem {i}"
            # Check if exists
            existing = await db.execute(
                select(Problem).where(
                    Problem.device_type_id == device_type.id,
                    Problem.name == name
                )
            )
            if not existing.scalar_one_or_none():
                problems.append(Problem(
                    device_type_id=device_type.id,
                    name=name,
                    description=f"Description for problem {i} - automatically generated."
                ))
        
        if problems:
            db.add_all(problems)
            await db.commit()
            print(f"Successfully added {len(problems)} problems.")
        else:
            print("No new problems to add.")

if __name__ == "__main__":
    asyncio.run(seed_problems())
