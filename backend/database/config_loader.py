"""
Configuration loader for migrating JSON configurations to database.
"""

import json
import logging
import os
from pathlib import Path
from typing import List, Dict, Any, Optional

from sqlalchemy.orm import Session
from sqlalchemy import func
from database.connection import get_db_session
from database.converters import converter
from models.database import SupportedModelDB, SupportedToolDB

# Create logger for this module
logger = logging.getLogger(__name__)


class ConfigurationLoader:
    """Loads and manages configuration data in the database."""
    
    def __init__(self):
        # Use environment variable for config directory (set by Electron in production)
        # Fall back to relative path for development
        config_dir_env = os.getenv('SAMPLESTRANDS_CONFIG_DIR')
        if config_dir_env:
            self.config_dir = Path(config_dir_env)
            logger.info(f"🔧 Using config directory from environment: {self.config_dir}")
        else:
            self.config_dir = Path(__file__).parent.parent / "config"
            logger.info(f"🔧 Using default config directory: {self.config_dir}")

    def get_json_config_version(self, config_type: str = "models") -> int:
        """Get the maximum config version from JSON configuration file."""
        if config_type == "models":
            config_file = self.config_dir / "supported_models.json"
        elif config_type == "tools":
            config_file = self.config_dir / "supported_tools.json"
        else:
            logger.error(f"❌ Unknown config type: {config_type}")
            return 0

        if not config_file.exists():
            logger.error(f"❌ Configuration file not found: {config_file}")
            return 0

        try:
            with open(config_file, 'r') as f:
                config_data = json.load(f)

            if config_type == "models":
                models = config_data.get("models", [])
                if not models:
                    return 0
                # Return the maximum config_version from all models
                return max(model.get("config_version", 1) for model in models)
            elif config_type == "tools":
                tools = config_data.get("tools", [])
                if not tools:
                    return 0
                # Return the maximum config_version from all tools
                return max(tool.get("config_version", 1) for tool in tools)

        except Exception as e:
            logger.error(f"❌ Failed to read config version from {config_file}: {str(e)}")
            return 0

    def get_database_config_version(self, config_type: str = "models") -> int:
        """Get the maximum config version from database."""
        try:
            with get_db_session() as session:
                if config_type == "models":
                    result = session.query(func.max(SupportedModelDB.config_version)).scalar()
                elif config_type == "tools":
                    result = session.query(func.max(SupportedToolDB.config_version)).scalar()
                else:
                    logger.error(f"❌ Unknown config type: {config_type}")
                    return 0

                return result if result is not None else 0

        except Exception as e:
            logger.error(f"❌ Failed to get database config version for {config_type}: {str(e)}")
            return 0

    def needs_config_update(self, config_type: str = "models") -> bool:
        """Check if configuration needs to be updated based on version comparison."""
        json_version = self.get_json_config_version(config_type)
        db_version = self.get_database_config_version(config_type)

        logger.info(f"📊 Config version check for {config_type}: JSON={json_version}, DB={db_version}")

        # If JSON version is 0, it means force reset
        if json_version == 0:
            logger.info(f"🔄 Force reset requested for {config_type} (JSON version = 0)")
            return True

        # If JSON version is higher than DB version, update is needed
        if json_version > db_version:
            logger.info(f"🔄 Update needed for {config_type}: JSON version ({json_version}) > DB version ({db_version})")
            return True

        logger.info(f"✅ No update needed for {config_type}: versions are up to date")
        return False
    
    def load_models_from_json(self, force_update: bool = False) -> bool:
        """Load supported models from JSON file into database."""
        models_file = self.config_dir / "supported_models.json"

        if not models_file.exists():
            logger.error(f"❌ Models configuration file not found: {models_file}")
            return False

        try:
            with open(models_file, 'r') as f:
                models_data = json.load(f)

            with get_db_session() as session:
                if force_update:
                    # Clear existing models for force update
                    logger.info("🔄 Force update: clearing all existing models")
                    session.query(SupportedModelDB).delete()

                    # Load new models
                    db_models = converter.load_supported_models_from_json(models_data)

                    for db_model in db_models:
                        session.add(db_model)

                    session.commit()
                    logger.info(f"✅ Force loaded {len(db_models)} supported models into database")
                    return True
                else:
                    # Selective update based on config version
                    json_models = models_data.get("models", [])
                    updated_count = 0

                    for json_model in json_models:
                        model_id = json_model.get("model_id")
                        json_version = json_model.get("config_version", 1)

                        if not model_id:
                            logger.warning(f"⚠️ Skipping model without model_id: {json_model}")
                            continue

                        # Check if model exists in database
                        existing_model = session.query(SupportedModelDB).filter_by(model_id=model_id).first()

                        if existing_model:
                            db_version = existing_model.config_version

                            # Update if JSON version is higher or if JSON version is 0 (force reset)
                            if json_version == 0 or json_version > db_version:
                                logger.info(f"🔄 Updating model {model_id}: v{db_version} -> v{json_version}")

                                # Update existing model with new data
                                existing_model.model_name = json_model.get("model_name", existing_model.model_name)
                                existing_model.provider = json_model.get("provider", existing_model.provider)
                                existing_model.description = json_model.get("description", existing_model.description)
                                existing_model.max_tokens = json_model.get("max_tokens", existing_model.max_tokens)
                                existing_model.supports_streaming = json_model.get("supports_streaming", existing_model.supports_streaming)
                                existing_model.supports_tools = json_model.get("supports_tools", existing_model.supports_tools)
                                existing_model.category = json_model.get("category", existing_model.category)
                                existing_model.activated_in_app = json_model.get("activated_in_app", existing_model.activated_in_app)
                                existing_model.default_seq_number = json_model.get("default_seq_number", existing_model.default_seq_number)
                                existing_model.config_version = json_version

                                updated_count += 1
                            else:
                                logger.debug(f"📊 Model {model_id} is up to date (v{db_version})")
                        else:
                            # Add new model
                            logger.info(f"➕ Adding new model {model_id} (v{json_version})")
                            db_model = converter.convert_json_model_to_db(json_model)
                            session.add(db_model)
                            updated_count += 1

                    session.commit()
                    logger.info(f"✅ Updated/added {updated_count} models in database")
                    return True

        except Exception as e:
            logger.error(f"❌ Failed to load models from JSON: {str(e)}")
            return False
    
    def load_tools_from_json(self) -> bool:
        """Load supported tools from JSON file into database."""
        tools_file = self.config_dir / "supported_tools.json"
        
        if not tools_file.exists():
            logger.error(f"❌ Tools configuration file not found: {tools_file}")
            return False
        
        try:
            with open(tools_file, 'r') as f:
                tools_data = json.load(f)
            
            with get_db_session() as session:
                # Clear existing tools
                session.query(SupportedToolDB).delete()
                
                # Load new tools
                db_tools = converter.load_supported_tools_from_json(tools_data)
                
                for db_tool in db_tools:
                    session.add(db_tool)
                
                session.commit()
                logger.info(f"✅ Loaded {len(db_tools)} supported tools into database")
                return True
                
        except Exception as e:
            logger.error(f"❌ Failed to load tools from JSON: {str(e)}")
            return False
    
    def load_all_configurations(self, force_update: bool = False) -> bool:
        """Load all configurations from JSON files into database with version checking."""
        logger.info("🔄 Loading all configurations into database...")

        models_success = True
        tools_success = True

        # Check if models need updating
        if force_update or self.needs_config_update("models"):
            logger.info("🔄 Models configuration update needed")
            models_success = self.load_models_from_json(force_update)
        else:
            logger.info("✅ Models configuration is up to date")

        # Check if tools need updating (for now, always use force update for tools)
        if force_update or self.needs_config_update("tools"):
            logger.info("🔄 Tools configuration update needed")
            tools_success = self.load_tools_from_json()
        else:
            logger.info("✅ Tools configuration is up to date")

        if models_success and tools_success:
            logger.info("✅ All configurations loaded successfully")
            return True
        else:
            logger.error("❌ Failed to load some configurations")
            return False
    
    def get_models_count(self) -> int:
        """Get count of models in database."""
        try:
            with get_db_session() as session:
                return session.query(SupportedModelDB).count()
        except Exception as e:
            logger.error(f"❌ Failed to get models count: {str(e)}")
            return 0
    
    def get_tools_count(self) -> int:
        """Get count of tools in database."""
        try:
            with get_db_session() as session:
                return session.query(SupportedToolDB).count()
        except Exception as e:
            logger.error(f"❌ Failed to get tools count: {str(e)}")
            return 0
    
    def is_database_initialized(self) -> bool:
        """Check if database has been initialized with configuration data."""
        try:
            models_count = self.get_models_count()
            tools_count = self.get_tools_count()
            
            # Consider initialized if we have at least some models and tools
            return models_count > 0 and tools_count > 0
        except Exception:
            return False
    
    def get_configuration_status(self) -> Dict[str, Any]:
        """Get status of configuration data in database."""
        return {
            "models_count": self.get_models_count(),
            "tools_count": self.get_tools_count(),
            "is_initialized": self.is_database_initialized(),
            "config_files": {
                "models_file_exists": (self.config_dir / "supported_models.json").exists(),
                "tools_file_exists": (self.config_dir / "supported_tools.json").exists()
            }
        }
    
    def export_models_to_json(self, output_file: Path = None) -> bool:
        """Export models from database back to JSON file."""
        if output_file is None:
            output_file = self.config_dir / "supported_models_export.json"
        
        try:
            with get_db_session() as session:
                db_models = session.query(SupportedModelDB).order_by(SupportedModelDB.default_seq_number).all()
                
                models_data = {
                    "models": [],
                    "default_model": None,
                    "categories": {}
                }
                
                for db_model in db_models:
                    model_dict = {
                        "uuid": db_model.uuid,
                        "model_id": db_model.model_id,
                        "model_name": db_model.model_name,
                        "provider": db_model.provider,
                        "description": db_model.description,
                        "max_tokens": db_model.max_tokens,
                        "supports_streaming": db_model.supports_streaming,
                        "supports_tools": db_model.supports_tools,
                        "support_streaming_tools": db_model.support_streaming_tools,
                        "category": db_model.category,
                        "activated_in_app": db_model.activated_in_app,
                        "default_seq_number": db_model.default_seq_number,
                        "config_version": db_model.config_version
                    }
                    models_data["models"].append(model_dict)
                
                # Set default model (first one with lowest seq number)
                if models_data["models"]:
                    models_data["default_model"] = models_data["models"][0]["model_id"]
                
                with open(output_file, 'w') as f:
                    json.dump(models_data, f, indent=2)
                
                logger.info(f"✅ Exported {len(db_models)} models to {output_file}")
                return True
                
        except Exception as e:
            logger.error(f"❌ Failed to export models to JSON: {str(e)}")
            return False
    
    def export_tools_to_json(self, output_file: Path = None) -> bool:
        """Export tools from database back to JSON file."""
        if output_file is None:
            output_file = self.config_dir / "supported_tools_export.json"
        
        try:
            with get_db_session() as session:
                db_tools = session.query(SupportedToolDB).order_by(SupportedToolDB.tool_name).all()
                
                tools_data = {
                    "tools": []
                }
                
                for db_tool in db_tools:
                    tool_dict = {
                        "uuid": db_tool.uuid,
                        "tool_id": db_tool.tool_id,
                        "tool_name": db_tool.tool_name,
                        "description": db_tool.description,
                        "category": db_tool.category,
                        "parameters_schema": db_tool.parameters_schema,
                        "examples": db_tool.examples
                    }
                    tools_data["tools"].append(tool_dict)
                
                with open(output_file, 'w') as f:
                    json.dump(tools_data, f, indent=2)
                
                logger.info(f"✅ Exported {len(db_tools)} tools to {output_file}")
                return True
                
        except Exception as e:
            logger.error(f"❌ Failed to export tools to JSON: {str(e)}")
            return False


# Global configuration loader instance
config_loader = ConfigurationLoader()
