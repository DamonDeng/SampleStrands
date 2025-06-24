#!/usr/bin/env python3
"""
Test script to verify config version update functionality.
This tests the automatic configuration update based on version comparison.
"""

import os
import sys
import logging
from pathlib import Path

# Add the backend directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database.connection import init_database, test_database_connection
from database.config_loader import config_loader
from models.database import SupportedModelDB
from database.connection import get_db_session

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


def test_config_version_checking():
    """Test config version checking functionality."""
    print("🧪 Testing Config Version Checking")
    print("=" * 50)
    
    try:
        # Step 1: Check JSON config version
        print("\n📋 Step 1: Checking JSON config version...")
        json_version = config_loader.get_json_config_version("models")
        print(f"📊 JSON config version: {json_version}")
        
        # Step 2: Check database config version
        print("\n🗄️ Step 2: Checking database config version...")
        db_version = config_loader.get_database_config_version("models")
        print(f"📊 Database config version: {db_version}")
        
        # Step 3: Check if update is needed
        print("\n🔍 Step 3: Checking if update is needed...")
        needs_update = config_loader.needs_config_update("models")
        print(f"🔄 Update needed: {needs_update}")
        
        return True
        
    except Exception as e:
        print(f"❌ Config version checking failed: {str(e)}")
        logger.exception("Config version checking error")
        return False


def test_selective_model_update():
    """Test selective model update based on version."""
    print("\n🧪 Testing Selective Model Update")
    print("=" * 40)
    
    try:
        # Step 1: Get current model states
        print("\n📊 Step 1: Current model states...")
        with get_db_session() as session:
            models = session.query(SupportedModelDB).all()
            print(f"📊 Total models in database: {len(models)}")
            
            for model in models:
                print(f"   - {model.model_name}: activated={model.activated_in_app}, version={model.config_version}")
        
        # Step 2: Perform selective update
        print("\n🔄 Step 2: Performing selective update...")
        success = config_loader.load_models_from_json(force_update=False)
        
        if success:
            print("✅ Selective update completed successfully")
        else:
            print("❌ Selective update failed")
            return False
        
        # Step 3: Check updated model states
        print("\n📊 Step 3: Updated model states...")
        with get_db_session() as session:
            models = session.query(SupportedModelDB).all()
            print(f"📊 Total models in database: {len(models)}")
            
            activated_models = []
            deactivated_models = []
            
            for model in models:
                print(f"   - {model.model_name}: activated={model.activated_in_app}, version={model.config_version}")
                if model.activated_in_app:
                    activated_models.append(model.model_name)
                else:
                    deactivated_models.append(model.model_name)
            
            print(f"\n✅ Activated models ({len(activated_models)}):")
            for model_name in activated_models:
                print(f"   - {model_name}")
            
            print(f"\n❌ Deactivated models ({len(deactivated_models)}):")
            for model_name in deactivated_models:
                print(f"   - {model_name}")
        
        return True
        
    except Exception as e:
        print(f"❌ Selective model update failed: {str(e)}")
        logger.exception("Selective model update error")
        return False


def test_force_update():
    """Test force update functionality."""
    print("\n🧪 Testing Force Update")
    print("=" * 30)
    
    try:
        # Step 1: Perform force update
        print("\n🔄 Step 1: Performing force update...")
        success = config_loader.load_all_configurations(force_update=True)
        
        if success:
            print("✅ Force update completed successfully")
        else:
            print("❌ Force update failed")
            return False
        
        # Step 2: Verify all models are updated
        print("\n📊 Step 2: Verifying force update results...")
        with get_db_session() as session:
            models = session.query(SupportedModelDB).all()
            
            version_2_count = 0
            for model in models:
                if model.config_version == 2:
                    version_2_count += 1
            
            print(f"📊 Models with version 2: {version_2_count}/{len(models)}")
            
            if version_2_count == len(models):
                print("✅ All models updated to version 2")
                return True
            else:
                print("⚠️ Some models may not have been updated")
                return False
        
    except Exception as e:
        print(f"❌ Force update failed: {str(e)}")
        logger.exception("Force update error")
        return False


def test_expected_activation_states():
    """Test that the expected models are activated/deactivated."""
    print("\n🧪 Testing Expected Activation States")
    print("=" * 45)
    
    # Expected activated models
    expected_activated = {
        "Claude 3.7 Sonnet",
        "Claude 3.5 Sonnet", 
        "Amazon Nova Pro",
        "DeepSeek R1"
    }
    
    try:
        with get_db_session() as session:
            models = session.query(SupportedModelDB).all()
            
            actually_activated = set()
            actually_deactivated = set()
            
            for model in models:
                if model.activated_in_app:
                    actually_activated.add(model.model_name)
                else:
                    actually_deactivated.add(model.model_name)
            
            print(f"📊 Expected activated: {expected_activated}")
            print(f"📊 Actually activated: {actually_activated}")
            
            # Check if expected models are activated
            missing_activated = expected_activated - actually_activated
            unexpected_activated = actually_activated - expected_activated
            
            if not missing_activated and not unexpected_activated:
                print("✅ All expected models are correctly activated")
                print("✅ No unexpected models are activated")
                return True
            else:
                if missing_activated:
                    print(f"❌ Missing activated models: {missing_activated}")
                if unexpected_activated:
                    print(f"⚠️ Unexpected activated models: {unexpected_activated}")
                return False
        
    except Exception as e:
        print(f"❌ Activation state test failed: {str(e)}")
        logger.exception("Activation state test error")
        return False


def main():
    """Main test function."""
    print("🚀 Config Version Update Test Suite")
    print("=" * 60)
    
    # Initialize database first
    print("🗄️ Initializing database...")
    init_database()
    
    if not test_database_connection():
        print("❌ Database connection failed")
        return False
    
    print("✅ Database connection successful")
    
    # Run tests
    tests = [
        ("Config Version Checking", test_config_version_checking),
        ("Selective Model Update", test_selective_model_update),
        ("Expected Activation States", test_expected_activation_states),
        ("Force Update", test_force_update),
    ]
    
    passed = 0
    total = len(tests)
    
    for test_name, test_func in tests:
        print(f"\n{'='*60}")
        print(f"Running: {test_name}")
        print('='*60)
        
        if test_func():
            print(f"✅ {test_name} PASSED")
            passed += 1
        else:
            print(f"❌ {test_name} FAILED")
    
    print(f"\n{'='*60}")
    print(f"TEST RESULTS: {passed}/{total} tests passed")
    print('='*60)
    
    if passed == total:
        print("🎉 ALL TESTS PASSED!")
        return True
    else:
        print("❌ Some tests failed")
        return False


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
