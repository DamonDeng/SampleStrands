# Database Migration Guide

This guide explains how to migrate your SampleStrands application from in-memory storage to persistent SQLite database storage.

## Overview

The migration includes:
- **SQLite Database**: Lightweight, file-based database storage
- **SQLAlchemy ORM**: Object-relational mapping for easy database operations
- **UUID Primary Keys**: All entities (agents, sessions, messages, models) use UUIDs
- **Automatic Configuration Loading**: Model and tool configurations loaded from JSON to database
- **Data Persistence**: All data survives application restarts
- **Development Tools**: CLI tools for database management

## Migration Steps

### 1. Install Dependencies

```bash
cd backend
python install_dependencies.py
```

Or manually:
```bash
pip install sqlalchemy>=2.0.0 alembic>=1.12.0
pip install -r requirements.txt
```

### 2. Initialize Database

```bash
# Initialize database with tables
python cli.py init

# Load model and tool configurations
python cli.py load-config

# Check status
python cli.py status
```

### 3. Test Migration

```bash
# Run comprehensive migration tests
python test_database_migration.py
```

### 4. Start Application

```bash
# Start the backend server
python main.py
```

The application will now use persistent database storage instead of in-memory storage.

## Database Schema

### Tables Created

1. **agents** - AI agent configurations
   - `id` (UUID, Primary Key)
   - `name`, `description`, `system_prompt`
   - `llm_config` (JSON) - Model configuration
   - `tools` (JSON) - Tool configurations
   - `is_active`, `usage_stats`, `metadata`
   - `created_at`, `updated_at`

2. **sessions** - Chat sessions
   - `id` (UUID, Primary Key)
   - `title`, `agent_id` (Foreign Key)
   - `metadata` (JSON)
   - `created_at`, `updated_at`

3. **messages** - Chat messages
   - `id` (UUID, Primary Key)
   - `session_id` (Foreign Key)
   - `role` ('user', 'assistant', 'system')
   - `content`, `status`, `metadata` (JSON)
   - `timestamp`

4. **supported_models** - Available AI models
   - `uuid` (UUID, Primary Key)
   - `model_id`, `model_name`, `provider`
   - `description`, `max_tokens`
   - `supports_streaming`, `supports_tools`
   - `category`, `activated_in_app`
   - `default_seq_number`, `config_version`

5. **supported_tools** - Available tools
   - `uuid` (UUID, Primary Key)
   - `tool_id`, `tool_name`, `description`
   - `category`, `parameters_schema` (JSON)
   - `examples` (JSON)

## CLI Commands

### Database Management
```bash
python cli.py init                    # Initialize database
python cli.py reset                   # Reset database (drops all data)
python cli.py status                  # Show database status
python cli.py test                    # Test database connection
```

### Backup & Restore
```bash
python cli.py backup                  # Create backup
python cli.py restore <backup_file>   # Restore from backup
python cli.py list-backups           # List available backups
python cli.py cleanup-backups 5      # Keep only 5 most recent backups
```

### Configuration Management
```bash
python cli.py load-config            # Load JSON configs to database
python cli.py config-status          # Show configuration status
```

## Database File Location

- **Database File**: `backend/chat_app.db`
- **Backups**: `backend/chat_app.backup.YYYYMMDD_HHMMSS.db`

## Development Workflow

### During Development
```bash
# Reset database when schema changes
python cli.py reset

# Reload configurations after JSON changes
python cli.py load-config

# Test changes
python test_database_migration.py
```

### Before Major Changes
```bash
# Always backup before major changes
python cli.py backup

# Check current status
python cli.py status
```

## Key Benefits

### 1. Data Persistence
- All data survives application restarts
- No data loss when backend crashes
- Proper data integrity with ACID transactions

### 2. UUID Primary Keys
- Globally unique identifiers for all entities
- Safe for distributed systems
- No ID conflicts during development

### 3. Flexible Schema
- JSON fields for experimental features
- Easy to add new fields without migrations
- Backward compatibility maintained

### 4. Development Tools
- CLI for database management
- Automated testing
- Backup and restore functionality

## Migration Verification

The migration is successful when:

1. ✅ Database initializes without errors
2. ✅ Configurations load from JSON files
3. ✅ Agent CRUD operations work
4. ✅ Session and message operations work
5. ✅ Data persists across restarts
6. ✅ Frontend can connect and operate normally

## Troubleshooting

### Database Connection Issues
```bash
# Test connection
python cli.py test

# Check database file permissions
ls -la chat_app.db

# Reset if corrupted
python cli.py reset
```

### Configuration Loading Issues
```bash
# Check configuration status
python cli.py config-status

# Reload configurations
python cli.py load-config

# Verify JSON files exist
ls -la config/
```

### Performance Issues
```bash
# Check database size
python cli.py status

# Clean up old backups
python cli.py cleanup-backups 3
```

## Rollback Plan

If issues occur, you can rollback:

1. **Stop the application**
2. **Restore from backup**: `python cli.py restore <backup_file>`
3. **Or revert to in-memory storage** by commenting out database initialization in `main.py`

## Next Steps

After successful migration:

1. **Monitor Performance**: Check database performance under load
2. **Regular Backups**: Set up automated backup schedule
3. **Schema Evolution**: Use Alembic for future schema changes
4. **Optimization**: Add indexes for frequently queried fields

## Support

For issues with the migration:
1. Check the logs in `backend.log`
2. Run the test suite: `python test_database_migration.py`
3. Use CLI tools for debugging: `python cli.py status`
