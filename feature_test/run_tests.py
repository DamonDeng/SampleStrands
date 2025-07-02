#!/usr/bin/env python3
"""
Test runner for document attachment feature tests.
"""

import sys
import os
from pathlib import Path

def main():
    """Main test runner."""
    print("🧪 Document Attachment Feature Test Runner")
    print("=" * 50)
    
    # Add current directory to Python path
    current_dir = Path(__file__).parent
    sys.path.insert(0, str(current_dir))
    
    print("Available tests:")
    print("1. Bedrock Converse API Test")
    print("2. Strands Agents SDK Test")
    print("3. Run both tests")
    print()

    choice = input("Select test to run (1-3): ").strip()

    if choice == "1":
        print("\n🚀 Running Bedrock Converse API Test...")
        try:
            import test_bedrock_converse_api
            test_bedrock_converse_api.main()
        except ImportError as e:
            print(f"❌ Failed to import test: {e}")
            sys.exit(1)
        except Exception as e:
            print(f"❌ Test failed: {e}")
            sys.exit(1)

    elif choice == "2":
        print("\n🚀 Running Strands Agents SDK Test...")
        try:
            import test_strands_agents_sdk
            test_strands_agents_sdk.main()
        except ImportError as e:
            print(f"❌ Failed to import test: {e}")
            sys.exit(1)
        except Exception as e:
            print(f"❌ Test failed: {e}")
            sys.exit(1)

    elif choice == "3":
        print("\n🚀 Running both tests...")
        try:
            print("\n" + "="*60)
            print("🧪 Test 1: Bedrock Converse API")
            print("="*60)
            import test_bedrock_converse_api
            test_bedrock_converse_api.main()

            print("\n" + "="*60)
            print("🧪 Test 2: Strands Agents SDK")
            print("="*60)
            import test_strands_agents_sdk
            test_strands_agents_sdk.main()

        except ImportError as e:
            print(f"❌ Failed to import test: {e}")
            sys.exit(1)
        except Exception as e:
            print(f"❌ Test failed: {e}")
            sys.exit(1)
    
    else:
        print("❌ Invalid choice")
        sys.exit(1)

if __name__ == "__main__":
    main()
