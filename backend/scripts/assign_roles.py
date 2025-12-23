"""
Script to assign roles to users who don't have any roles assigned.
This will assign the Customer role (role_id=5) to all users without roles.
"""
import asyncio
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select, text
from db import Base
from models.user import User, Role, RoleEnroll
from core.config import settings

async def assign_roles_to_users():
    """Assign Customer role to all users without roles"""
    
    # Create async engine
    engine = create_async_engine(settings.database_url, echo=True)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        # Get all users
        result = await session.execute(select(User))
        all_users = result.scalars().all()
        
        print(f"\n{'='*80}")
        print(f"Total users in database: {len(all_users)}")
        print(f"{'='*80}\n")
        
        customer_role_result = await session.execute(select(Role).where(Role.name == "Customer"))
        customer_role = customer_role_result.scalar_one_or_none()
        
        if not customer_role:
            print("❌ Customer role not found!")
            return
        
        assigned_count = 0
        already_has_role_count = 0
        
        for user in all_users:
            # Check if user already has any role
            existing_role = await session.execute(
                select(RoleEnroll).where(RoleEnroll.user_id == user.id)
            )
            has_role = existing_role.scalar_one_or_none()
            
            if has_role:
                already_has_role_count += 1
                print(f"✓ User {user.id} ({user.email}) already has role(s)")
            else:
                # Assign Customer role
                role_enroll = RoleEnroll(user_id=user.id, role_id=customer_role.id)
                session.add(role_enroll)
                assigned_count += 1
                print(f"✅ Assigned Customer role to User {user.id} ({user.email})")
        
        await session.commit()
        
        print(f"\n{'='*80}")
        print(f"Summary:")
        print(f"  - Users with existing roles: {already_has_role_count}")
        print(f"  - Users assigned Customer role: {assigned_count}")
        print(f"{'='*80}\n")

async def clean_duplicate_roles():
    """Remove duplicate role assignments for user 2 (test@repair.com)"""
    
    engine = create_async_engine(settings.database_url, echo=True)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        print(f"\n{'='*80}")
        print(f"Cleaning duplicate roles for test user")
        print(f"{'='*80}\n")
        
        test_user_result = await session.execute(select(User).where(User.phone == "9876543210"))
        test_user = test_user_result.scalar_one_or_none()
        target_user_id = test_user.id if test_user else 2
        result = await session.execute(select(RoleEnroll).where(RoleEnroll.user_id == target_user_id))
        enrollments = result.scalars().all()
        
        print(f"User {target_user_id} currently has {len(enrollments)} role(s):")
        for enroll in enrollments:
            role_result = await session.execute(select(Role).where(Role.id == enroll.role_id))
            role = role_result.scalar_one()
            print(f"  - Role {role.id}: {role.name}")
        
        if len(enrollments) > 1:
            tech_role_result = await session.execute(select(Role).where(Role.name == "Technician"))
            tech_role = tech_role_result.scalar_one_or_none()
            tech_role_id = tech_role.id if tech_role else 2
            for enroll in enrollments:
                if enroll.role_id != tech_role_id:
                    await session.delete(enroll)
                    role_result = await session.execute(select(Role).where(Role.id == enroll.role_id))
                    role = role_result.scalar_one()
                    print(f"  ❌ Removed role: {role.name}")
            
            await session.commit()
            print(f"\n✅ Kept only Technician role for user {target_user_id}")
        else:
            print(f"\n✓ User {target_user_id} already has only one role")

async def display_credentials():
    """Display credentials for staff users"""
    
    engine = create_async_engine(settings.database_url, echo=True)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        print(f"\n{'='*80}")
        print(f"STAFF USER CREDENTIALS")
        print(f"{'='*80}\n")
        
        # Get all role enrollments with user and role info
        result = await session.execute(
            select(RoleEnroll, User, Role)
            .join(User, RoleEnroll.user_id == User.id)
            .join(Role, RoleEnroll.role_id == Role.id)
            .where(Role.id.in_([1, 2, 3, 4, 29]))  # Staff roles only
        )
        
        staff_users = {}
        for enroll, user, role in result:
            if user.id not in staff_users:
                staff_users[user.id] = {
                    'user': user,
                    'roles': []
                }
            staff_users[user.id]['roles'].append(role)
        
        # Display by role type
        role_order = {
            1: "ADMIN",
            2: "TECHNICIAN", 
            3: "RECEPTION",
            29: "RECEPTIONIST",
            4: "ACCOUNTANT"
        }
        
        for role_id, role_name in role_order.items():
            print(f"\n📋 {role_name}:")
            print(f"{'-'*80}")
            
            found = False
            for user_id, data in staff_users.items():
                user = data['user']
                roles = data['roles']
                
                if any(r.id == role_id for r in roles):
                    found = True
                    print(f"  Email:    {user.email}")
                    print(f"  Phone:    {user.phone}")
                    print(f"  Password: password123")
                    print(f"  User ID:  {user.id}")
                    print()
            
            if not found:
                print(f"  ⚠️  No user assigned to this role")
                print()

async def main():
    """Main function to run all tasks"""
    print("\n🚀 Starting role assignment script...\n")
    
    # Step 1: Clean duplicate roles for user 2
    await clean_duplicate_roles()
    
    # Step 2: Assign roles to users without roles
    await assign_roles_to_users()
    
    # Step 3: Display credentials
    await display_credentials()
    
    print("\n✅ Script completed successfully!\n")

if __name__ == "__main__":
    asyncio.run(main())
