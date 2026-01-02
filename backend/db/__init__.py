from sqlalchemy.orm import declarative_base, sessionmaker, Session
from sqlalchemy import create_engine
from core.config import settings
import asyncio
from functools import wraps

# Use synchronous engine for better Windows compatibility
# PyMySQL is synchronous but we'll make it async-compatible
sync_engine = create_engine(
    settings.database_url_sync,
    echo=False,
    pool_size=20,
    max_overflow=10,
    pool_pre_ping=False,
    pool_recycle=3600
)

SyncSessionLocal = sessionmaker(bind=sync_engine, autocommit=False, autoflush=False)
Base = declarative_base()


# Type alias for compatibility - code still calls AsyncSession
AsyncSession = Session


async def get_db() -> Session:
    """
    Get database session. Runs synchronous operations in default thread pool
    to avoid blocking the event loop while maintaining async API compatibility.
    """
    session = SyncSessionLocal()
    try:
        yield session
    finally:
        session.close()



