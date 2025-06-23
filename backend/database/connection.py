"""
Database connection and session management.
"""

import os
import logging
from contextlib import contextmanager
from typing import Generator

from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import StaticPool

from models.database import Base

# Create logger for this module
logger = logging.getLogger(__name__)

# Database configuration
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./chat_app.db")

# Create engine with appropriate settings for SQLite
if DATABASE_URL.startswith("sqlite"):
    # SQLite-specific configuration
    engine = create_engine(
        DATABASE_URL,
        echo=False,  # Set to True for SQL query logging during development
        connect_args={
            "check_same_thread": False,  # Allow SQLite to be used across threads
            "timeout": 30  # 30 second timeout for database operations
        },
        poolclass=StaticPool,  # Use static pool for SQLite
        pool_pre_ping=True,  # Verify connections before use
    )
else:
    # PostgreSQL or other database configuration
    engine = create_engine(
        DATABASE_URL,
        echo=False,
        pool_pre_ping=True,
        pool_recycle=3600,  # Recycle connections every hour
    )

# Create session factory
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)


def init_database():
    """Initialize the database by creating all tables."""
    logger.info("🗄️ Initializing database...")
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("✅ Database initialized successfully")
    except Exception as e:
        logger.error(f"❌ Failed to initialize database: {str(e)}")
        raise


def drop_database():
    """Drop all database tables (for development/testing)."""
    logger.warning("🗑️ Dropping all database tables...")
    try:
        Base.metadata.drop_all(bind=engine)
        logger.info("✅ Database tables dropped successfully")
    except Exception as e:
        logger.error(f"❌ Failed to drop database tables: {str(e)}")
        raise


@contextmanager
def get_db_session() -> Generator[Session, None, None]:
    """
    Context manager for database sessions.
    Ensures proper cleanup and error handling.
    """
    session = SessionLocal()
    try:
        yield session
        session.commit()
    except Exception as e:
        session.rollback()
        logger.error(f"❌ Database session error: {str(e)}")
        raise
    finally:
        session.close()


def get_db() -> Generator[Session, None, None]:
    """
    Dependency function for FastAPI to inject database sessions.
    """
    session = SessionLocal()
    try:
        yield session
    except Exception as e:
        session.rollback()
        logger.error(f"❌ Database session error: {str(e)}")
        raise
    finally:
        session.close()


# SQLite-specific optimizations
if DATABASE_URL.startswith("sqlite"):
    @event.listens_for(engine, "connect")
    def set_sqlite_pragma(dbapi_connection, connection_record):
        """Set SQLite pragmas for better performance and reliability."""
        cursor = dbapi_connection.cursor()
        # Enable foreign key constraints
        cursor.execute("PRAGMA foreign_keys=ON")
        # Set journal mode to WAL for better concurrency
        cursor.execute("PRAGMA journal_mode=WAL")
        # Set synchronous mode to NORMAL for better performance
        cursor.execute("PRAGMA synchronous=NORMAL")
        # Set cache size (negative value means KB, positive means pages)
        cursor.execute("PRAGMA cache_size=-64000")  # 64MB cache
        # Set temp store to memory
        cursor.execute("PRAGMA temp_store=MEMORY")
        cursor.close()


def get_database_info() -> dict:
    """Get information about the database."""
    try:
        with get_db_session() as session:
            # Get table information
            if DATABASE_URL.startswith("sqlite"):
                result = session.execute("SELECT name FROM sqlite_master WHERE type='table'")
                tables = [row[0] for row in result.fetchall()]
            else:
                result = session.execute("SELECT tablename FROM pg_tables WHERE schemaname='public'")
                tables = [row[0] for row in result.fetchall()]
            
            return {
                "database_url": DATABASE_URL.split("://")[0] + "://***",  # Hide credentials
                "tables": tables,
                "engine_info": str(engine.url).split("://")[0] + "://***"
            }
    except Exception as e:
        logger.error(f"❌ Failed to get database info: {str(e)}")
        return {
            "database_url": DATABASE_URL.split("://")[0] + "://***",
            "tables": [],
            "error": str(e)
        }


def test_database_connection() -> bool:
    """Test database connection."""
    try:
        with get_db_session() as session:
            session.execute("SELECT 1")
            logger.info("✅ Database connection test successful")
            return True
    except Exception as e:
        logger.error(f"❌ Database connection test failed: {str(e)}")
        return False
