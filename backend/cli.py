#!/usr/bin/env python3
"""
Command-line interface for database management.
"""

import sys
import json
import logging
from pathlib import Path

# Add the backend directory to Python path
sys.path.insert(0, str(Path(__file__).parent))

from database.manager import db_manager
from database.connection import init_database, test_database_connection
from database.config_loader import config_loader

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


def cmd_init():
    """Initialize database with tables."""
    print("🗄️ Initializing database...")
    try:
        init_database()
        print("✅ Database initialized successfully")
    except Exception as e:
        print(f"❌ Failed to initialize database: {str(e)}")
        sys.exit(1)


def cmd_reset():
    """Reset database (drop and recreate all tables)."""
    print("🔄 Resetting database...")
    if db_manager.init_fresh_database():
        print("✅ Database reset successfully")
    else:
        print("❌ Failed to reset database")
        sys.exit(1)


def cmd_backup():
    """Create a backup of the database."""
    print("📦 Creating database backup...")
    backup_path = db_manager.backup_database()
    if backup_path:
        print(f"✅ Backup created: {backup_path}")
    else:
        print("❌ Failed to create backup")
        sys.exit(1)


def cmd_restore(backup_path: str):
    """Restore database from backup."""
    print(f"🔄 Restoring database from: {backup_path}")
    if db_manager.restore_database(backup_path):
        print("✅ Database restored successfully")
    else:
        print("❌ Failed to restore database")
        sys.exit(1)


def cmd_status():
    """Show database status."""
    print("📊 Database Status:")
    status = db_manager.get_database_status()
    print(json.dumps(status, indent=2, default=str))


def cmd_test():
    """Test database connection."""
    print("🔍 Testing database connection...")
    if test_database_connection():
        print("✅ Database connection successful")
    else:
        print("❌ Database connection failed")
        sys.exit(1)


def cmd_list_backups():
    """List available backups."""
    print("📦 Available Backups:")
    backups = db_manager.list_backups()
    if not backups:
        print("No backups found")
        return
    
    for backup in backups:
        print(f"  📄 {backup['name']} ({backup['size_mb']} MB) - {backup['created']}")


def cmd_cleanup_backups(keep_count: int = 5):
    """Clean up old backups."""
    print(f"🧹 Cleaning up old backups (keeping {keep_count})...")
    removed = db_manager.cleanup_old_backups(keep_count)
    print(f"✅ Removed {removed} old backups")


def cmd_load_config():
    """Load configurations from JSON files into database."""
    print("📋 Loading configurations into database...")
    if config_loader.load_all_configurations():
        print("✅ Configurations loaded successfully")
        status = config_loader.get_configuration_status()
        print(f"   📊 Models: {status['models_count']}")
        print(f"   🔧 Tools: {status['tools_count']}")
    else:
        print("❌ Failed to load configurations")
        sys.exit(1)


def cmd_config_status():
    """Show configuration status."""
    print("📋 Configuration Status:")
    status = config_loader.get_configuration_status()
    print(json.dumps(status, indent=2, default=str))


def cmd_help():
    """Show help information."""
    help_text = """
🗄️ Database Management CLI

Available commands:
  init                    Initialize database with tables
  reset                   Reset database (drop and recreate all tables)
  backup                  Create a backup of the database
  restore <backup_path>   Restore database from backup
  status                  Show database status information
  test                    Test database connection
  list-backups           List available backups
  cleanup-backups [N]    Clean up old backups (keep N most recent, default: 5)
  load-config            Load configurations from JSON files into database
  config-status          Show configuration status
  help                   Show this help message

Examples:
  python cli.py init
  python cli.py reset
  python cli.py backup
  python cli.py restore chat_app.backup.20250623_143022.db
  python cli.py status
  python cli.py load-config
  python cli.py cleanup-backups 3
"""
    print(help_text)


def main():
    """Main CLI entry point."""
    if len(sys.argv) < 2:
        cmd_help()
        return
    
    command = sys.argv[1].lower()
    
    try:
        if command == "init":
            cmd_init()
        elif command == "reset":
            cmd_reset()
        elif command == "backup":
            cmd_backup()
        elif command == "restore":
            if len(sys.argv) < 3:
                print("❌ Error: restore command requires backup path")
                print("Usage: python cli.py restore <backup_path>")
                sys.exit(1)
            cmd_restore(sys.argv[2])
        elif command == "status":
            cmd_status()
        elif command == "test":
            cmd_test()
        elif command == "list-backups":
            cmd_list_backups()
        elif command == "cleanup-backups":
            keep_count = int(sys.argv[2]) if len(sys.argv) > 2 else 5
            cmd_cleanup_backups(keep_count)
        elif command == "load-config":
            cmd_load_config()
        elif command == "config-status":
            cmd_config_status()
        elif command == "help":
            cmd_help()
        else:
            print(f"❌ Unknown command: {command}")
            cmd_help()
            sys.exit(1)
    
    except KeyboardInterrupt:
        print("\n⚠️ Operation cancelled by user")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Unexpected error: {str(e)}")
        logger.exception("Unexpected error in CLI")
        sys.exit(1)


if __name__ == "__main__":
    main()
