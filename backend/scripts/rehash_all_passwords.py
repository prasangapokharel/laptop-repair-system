"""Re-hash all passwords using new bcrypt method"""
import asyncio
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy import text
from db import engine
from utils.security import hash_password


async def rehash_all_passwords():
    """Re-hash all passwords to new bcrypt format"""
    async with engine.begin() as conn:
        # Get all users
        result = await conn.execute(
            text("SELECT id, phone, full_name FROM users")
        )
        users = result.fetchall()
        
        if not users:
            print("No users found.")
            return
        
        print(f"Found {len(users)} users. Re-hashing all passwords...")
        default_password = "password123"
        fixed_count = 0
        
        for user in users:
            user_id = user[0]
            phone = user[1]
            name = user[2]
            
            # Re-hash password
            new_hash = hash_password(default_password)
            
            # Update in database
            await conn.execute(
                text("UPDATE users SET password_hash = :hash WHERE id = :id"),
                {"hash": new_hash, "id": user_id}
            )
            print(f"Re-hashed password for {name} ({phone}) - ID: {user_id}")
            fixed_count += 1
        
        print(f"\nRe-hashed {fixed_count} passwords. All passwords set to: {default_password}")


async def main():
    await rehash_all_passwords()
    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(main())



