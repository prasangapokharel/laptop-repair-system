"""Fix all corrupted password hashes in database"""
import asyncio
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy import text
from db import engine
from utils.security import hash_password


async def fix_all_passwords():
    """Fix all corrupted password hashes"""
    async with engine.begin() as conn:
        # Get all users with corrupted password hashes (longer than 72 chars)
        result = await conn.execute(
            text("SELECT id, phone, full_name, LENGTH(password_hash) as hash_len FROM users WHERE LENGTH(password_hash) > 72")
        )
        corrupted_users = result.fetchall()
        
        if not corrupted_users:
            print("No corrupted password hashes found.")
            return
        
        print(f"Found {len(corrupted_users)} users with corrupted password hashes:")
        for user in corrupted_users:
            print(f"  - {user[1]} ({user[2]}) - Hash length: {user[3]}")
        
        # Fix each user - set password to 'password123'
        default_password = "password123"
        fixed_count = 0
        
        for user in corrupted_users:
            user_id = user[0]
            phone = user[1]
            new_hash = hash_password(default_password)
            
            await conn.execute(
                text("UPDATE users SET password_hash = :hash WHERE id = :id"),
                {"hash": new_hash, "id": user_id}
            )
            print(f"Fixed password for user {phone} (ID: {user_id})")
            fixed_count += 1
        
        print(f"\nFixed {fixed_count} password hashes. All passwords set to: {default_password}")


async def main():
    await fix_all_passwords()
    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(main())



