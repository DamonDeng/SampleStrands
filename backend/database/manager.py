"""
Database management utilities for development and maintenance.
"""

import os
import shutil
import logging
from datetime import datetime
from pathlib import Path
from typing import Optional

from database.connection import (
    init_database, drop_database, get_database_info, 
    test_database_connection, DATABASE_URL
)

# Create logger for this module
logger = logging.getLogger(__name__)


class DatabaseManager:
    """Database management utilities."""
    
    def __init__(self):
        self.database_url = DATABASE_URL
        self.db_file_path = self._get_db_file_path()
    
    def _get_db_file_path(self) -> Optional[Path]:
        """Get the database file path for SQLite databases."""
        if self.database_url.startswith("sqlite:///"):
            # Remove sqlite:/// prefix and handle relative paths
            db_path = self.database_url.replace("sqlite:///", "")
            if db_path.startswith("./"):
                db_path = db_path[2:]  # Remove ./
            return Path(db_path)
        return None
    
    def init_fresh_database(self) -> bool:
        """Initialize a fresh database (drops existing data)."""
        logger.info("🔄 Initializing fresh database...")
        
        try:
            # Backup existing database if it exists
            if self.db_file_path and self.db_file_path.exists():
                self.backup_database()
                self.db_file_path.unlink()  # Delete the file
                logger.info(f"🗑️ Removed existing database: {self.db_file_path}")
            
            # Initialize new database
            init_database()
            logger.info("✅ Fresh database initialized successfully")
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to initialize fresh database: {str(e)}")
            return False
    
    def backup_database(self) -> Optional[Path]:
        """Create a backup of the current database."""
        if not self.db_file_path or not self.db_file_path.exists():
            logger.warning("⚠️ No database file to backup")
            return None
        
        try:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            backup_path = self.db_file_path.with_suffix(f".backup.{timestamp}.db")
            
            shutil.copy2(self.db_file_path, backup_path)
            logger.info(f"📦 Database backed up to: {backup_path}")
            return backup_path
            
        except Exception as e:
            logger.error(f"❌ Failed to backup database: {str(e)}")
            return None
    
    def restore_database(self, backup_path: str) -> bool:
        """Restore database from a backup."""
        backup_file = Path(backup_path)
        
        if not backup_file.exists():
            logger.error(f"❌ Backup file not found: {backup_path}")
            return False
        
        if not self.db_file_path:
            logger.error("❌ Cannot restore: not using SQLite database")
            return False
        
        try:
            # Backup current database before restore
            if self.db_file_path.exists():
                current_backup = self.backup_database()
                logger.info(f"📦 Current database backed up before restore: {current_backup}")
            
            # Restore from backup
            shutil.copy2(backup_file, self.db_file_path)
            logger.info(f"✅ Database restored from: {backup_path}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to restore database: {str(e)}")
            return False
    
    def get_database_status(self) -> dict:
        """Get comprehensive database status information."""
        status = {
            "database_url": self.database_url.split("://")[0] + "://***",
            "connection_test": test_database_connection(),
            "database_info": get_database_info(),
            "file_info": {}
        }
        
        # Add file information for SQLite
        if self.db_file_path:
            if self.db_file_path.exists():
                stat = self.db_file_path.stat()
                status["file_info"] = {
                    "path": str(self.db_file_path),
                    "size_mb": round(stat.st_size / (1024 * 1024), 2),
                    "created": datetime.fromtimestamp(stat.st_ctime).isoformat(),
                    "modified": datetime.fromtimestamp(stat.st_mtime).isoformat()
                }
            else:
                status["file_info"] = {
                    "path": str(self.db_file_path),
                    "exists": False
                }
        
        return status
    
    def list_backups(self) -> list:
        """List available database backups."""
        if not self.db_file_path:
            return []
        
        backup_dir = self.db_file_path.parent
        backup_pattern = f"{self.db_file_path.stem}.backup.*.db"
        
        backups = []
        for backup_file in backup_dir.glob(backup_pattern):
            stat = backup_file.stat()
            backups.append({
                "path": str(backup_file),
                "name": backup_file.name,
                "size_mb": round(stat.st_size / (1024 * 1024), 2),
                "created": datetime.fromtimestamp(stat.st_ctime).isoformat(),
                "modified": datetime.fromtimestamp(stat.st_mtime).isoformat()
            })
        
        # Sort by creation time, newest first
        backups.sort(key=lambda x: x["created"], reverse=True)
        return backups
    
    def cleanup_old_backups(self, keep_count: int = 5) -> int:
        """Clean up old backup files, keeping only the most recent ones."""
        backups = self.list_backups()
        
        if len(backups) <= keep_count:
            logger.info(f"📦 No cleanup needed. Found {len(backups)} backups, keeping {keep_count}")
            return 0
        
        # Remove old backups
        removed_count = 0
        for backup in backups[keep_count:]:
            try:
                Path(backup["path"]).unlink()
                logger.info(f"🗑️ Removed old backup: {backup['name']}")
                removed_count += 1
            except Exception as e:
                logger.error(f"❌ Failed to remove backup {backup['name']}: {str(e)}")
        
        logger.info(f"✅ Cleanup complete. Removed {removed_count} old backups")
        return removed_count
    
    def migrate_from_memory_data(self, agents_data: dict = None, sessions_data: dict = None) -> bool:
        """
        Migrate data from in-memory storage to database.
        This is used during the initial migration from memory to persistent storage.
        """
        logger.info("🔄 Migrating data from memory storage to database...")
        
        try:
            from database.connection import get_db_session
            from models.database import AgentDB, SessionDB, MessageDB
            
            with get_db_session() as session:
                migrated_agents = 0
                migrated_sessions = 0
                migrated_messages = 0
                
                # Migrate agents if provided
                if agents_data:
                    for agent_id, agent_data in agents_data.items():
                        db_agent = AgentDB(
                            id=agent_id,
                            name=agent_data.get("config", {}).get("name", "Unknown Agent"),
                            description=agent_data.get("config", {}).get("description"),
                            system_prompt=agent_data.get("config", {}).get("system_prompt"),
                            llm_config=agent_data.get("config", {}).get("llm_config", {}),
                            tools=agent_data.get("config", {}).get("tools", []),
                            is_active=agent_data.get("is_active", True),
                            usage_stats=agent_data.get("usage_stats", {}),
                            metadata=agent_data.get("metadata", {}),
                            created_at=agent_data.get("created_at"),
                            updated_at=agent_data.get("updated_at")
                        )
                        session.add(db_agent)
                        migrated_agents += 1
                
                # Migrate sessions if provided
                if sessions_data:
                    for session_id, session_data in sessions_data.items():
                        db_session = SessionDB(
                            id=session_id,
                            title=session_data.get("title", "Untitled Session"),
                            agent_id=session_data.get("agent_id"),
                            metadata=session_data.get("metadata", {}),
                            created_at=session_data.get("created_at"),
                            updated_at=session_data.get("updated_at")
                        )
                        session.add(db_session)
                        
                        # Migrate messages for this session
                        for message_data in session_data.get("messages", []):
                            db_message = MessageDB(
                                id=message_data.get("id"),
                                session_id=session_id,
                                role=message_data.get("role"),
                                content=message_data.get("content"),
                                status=message_data.get("status", "completed"),
                                metadata=message_data.get("metadata", {}),
                                timestamp=message_data.get("timestamp")
                            )
                            session.add(db_message)
                            migrated_messages += 1
                        
                        migrated_sessions += 1
                
                session.commit()
                logger.info(f"✅ Migration complete: {migrated_agents} agents, {migrated_sessions} sessions, {migrated_messages} messages")
                return True
                
        except Exception as e:
            logger.error(f"❌ Failed to migrate data: {str(e)}")
            return False


# Global database manager instance
db_manager = DatabaseManager()
