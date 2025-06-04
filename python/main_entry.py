#!/usr/bin/env python3
"""
Simple Python script for Tauri integration
Supports both command line arguments and JSON input/output
"""

import sys
import json
import argparse
from datetime import datetime
import traceback
import os

from agent_wrapper import AgentWrapper

def strands_agents_test(input_text: str) -> dict:
    """
    Test the strands agents
    """

    os.environ['BYPASS_TOOL_CONSENT'] = 'true'

    agent_wrapper = AgentWrapper()

    response = agent_wrapper.chat(input_text)

    print(f"Response: {response}")


    return {
        "status": "success",
        "response": response
    }


def process_string(input_text: str) -> dict:
    """
    Process the input string and return a response
    This is where you can add your actual Python logic
    """
    try:
        # Simple example processing - you can replace this with your actual logic
        response = {
            "status": "success",
            "original_input": input_text,
            "processed_output": f"Python processed: '{input_text}' at {datetime.now().isoformat()}",
            "length": len(input_text),
            "uppercase": input_text.upper(),
            "reversed": input_text[::-1],
            "timestamp": datetime.now().isoformat()
        }
        return response
    except Exception as e:
        return {
            "status": "error",
            "error": str(e),
            "traceback": traceback.format_exc(),
            "timestamp": datetime.now().isoformat()
        }


def main():
    parser = argparse.ArgumentParser(description="Python script for Tauri integration")
    parser.add_argument("--input", "-i", type=str, help="Input string to process")
    parser.add_argument("--json", "-j", action="store_true", help="Use JSON input/output mode")
    
    args = parser.parse_args()
    
    if args.json:
        # JSON mode - read from stdin, write to stdout
        try:
            input_data = json.loads(sys.stdin.read())
            input_text = input_data.get("text", "")
            result = process_string(input_text)
            print(json.dumps(result, indent=2))
        except json.JSONDecodeError as e:
            error_response = {
                "status": "error",
                "error": f"Invalid JSON input: {str(e)}",
                "timestamp": datetime.now().isoformat()
            }
            print(json.dumps(error_response, indent=2))
        except Exception as e:
            error_response = {
                "status": "error",
                "error": str(e),
                "traceback": traceback.format_exc(),
                "timestamp": datetime.now().isoformat()
            }
            print(json.dumps(error_response, indent=2))
    else:
        # Command line mode
        if args.input:
            result = process_string(args.input)
            print(json.dumps(result, indent=2))
        else:
            # Interactive mode
            print("Python script is ready! Enter text to process (or 'quit' to exit):")
            while True:
                try:
                    user_input = input("> ")
                    if user_input.lower() in ['quit', 'exit', 'q']:
                        break
                    result = process_string(user_input)
                    print(json.dumps(result, indent=2))
                except KeyboardInterrupt:
                    print("\nGoodbye!")
                    break
                except Exception as e:
                    error_response = {
                        "status": "error",
                        "error": str(e),
                        "timestamp": datetime.now().isoformat()
                    }
                    print(json.dumps(error_response, indent=2))


if __name__ == "__main__":
    main()
