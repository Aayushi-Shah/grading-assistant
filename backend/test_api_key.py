#!/usr/bin/env python3
"""
Test script to verify Gemini API key is working
"""

import os
import sys
from dotenv import load_dotenv

# Load .env file from the parent directory (project root)
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

def test_api_key():
    """Test if the Gemini API key is properly configured"""
    
    # Check if API key is set
    api_key = os.getenv('GEMINI_API_KEY')
    
    if not api_key:
        print("❌ GEMINI_API_KEY not found!")
        print("\nTo set up your API key:")
        print("1. Get your API key from: https://makersuite.google.com/app/apikey")
        print("2. Create a .env file in the project root with:")
        print("   GEMINI_API_KEY=your_actual_api_key_here")
        print("3. Or set it as an environment variable:")
        print("   export GEMINI_API_KEY=your_actual_api_key_here")
        return False
    
    if api_key == "your_api_key_here" or api_key == "test_key":
        print("❌ Please replace the placeholder API key with your actual key!")
        print(f"Current key: {api_key}")
        return False
    
    print(f"✅ API key found: {api_key[:10]}...")
    
    # Test the API
    try:
        import google.generativeai as genai
        genai.configure(api_key=api_key)
        
        model = genai.GenerativeModel('gemini-2.5-flash')
        response = model.generate_content("What is 2+2?")
        
        print("✅ Gemini API is working!")
        print(f"Response: {response.candidates[0].content.parts[0].text}")
        return True
        
    except Exception as e:
        print(f"❌ Gemini API Error: {str(e)}")
        return False

if __name__ == "__main__":
    print("🔍 Testing Gemini API configuration...")
    print("=" * 50)
    
    success = test_api_key()
    
    if success:
        print("\n🎉 API is ready! You can now use real Gemini responses.")
    else:
        print("\n⚠️  Please fix the API key configuration before proceeding.")
    
    sys.exit(0 if success else 1)
