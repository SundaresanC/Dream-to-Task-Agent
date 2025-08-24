#!/usr/bin/env python3
"""
Test script for Gemini 2.5 Flash integration
"""

import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv(override=True)

def test_gemini_configuration():
    """Test Gemini configuration and API key setup"""
    
    print("🔍 Testing Gemini 2.5 Flash Integration")
    print("=" * 50)
    
    # Check environment variables
    gemini_api_key = os.getenv("GEMINI_API_KEY","AIzaSyDyZWCMNU2B-y3UGOl4fqWGkoXgG_F7xJ8")
    llm_provider = os.getenv("LLM_PROVIDER", "gemini-2.5-flash")
    gemini_model = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
    
    print(f"📋 Configuration:")
    print(f"   LLM Provider: {llm_provider}")
    print(f"   Gemini Model: {gemini_model}")
    print(f"   API Key Set: {'✅ Yes' if gemini_api_key else '❌ No'}")
    
    # Test Google Generative AI import
    try:
        import google.generativeai as genai
        print("✅ Google Generative AI library imported successfully")
        
        if gemini_api_key:
            # Configure the API
            genai.configure(api_key=gemini_api_key)
            print("✅ Gemini API configured successfully")
            
            # Test model availability
            try:
                model = genai.GenerativeModel(gemini_model)
                print(f"✅ Model '{gemini_model}' is available")
                
                # Test a simple generation
                response = model.generate_content("Hello, this is a test of Gemini 2.5 Flash!")
                print("✅ Test generation successful")
                print(f"   Response: {response.text[:100]}...")
                
            except Exception as e:
                print(f"❌ Model test failed: {e}")
        else:
            print("⚠️  No API key provided - skipping model test")
            
    except ImportError as e:
        print(f"❌ Failed to import Google Generative AI: {e}")
        print("   Run: pip install google-generativeai>=0.8.0")
    
    print("\n📝 Next Steps:")
    if not gemini_api_key:
        print("1. Get your Gemini API key from https://aistudio.google.com/")
        print("2. Set GEMINI_API_KEY in your .env.local file")
        print("3. Run this test again")
    else:
        print("✅ Gemini integration is ready!")
        print("   You can now use the full Portia AI capabilities with Gemini 2.5 Flash")

if __name__ == "__main__":
    test_gemini_configuration()
