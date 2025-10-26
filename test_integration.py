#!/usr/bin/env python3
"""
Test script for the complete AI grading integration
"""

import requests
import json
import os

BASE_URL = "http://localhost:5001"

def test_complete_flow():
    """Test the complete grading flow from start to finish"""
    print("🚀 Testing Complete AI Grading Integration")
    print("=" * 60)
    
    # Step 1: Create a professor
    print("Step 1: Creating professor...")
    professor_data = {
        "name": "Dr. AI Tester",
        "email": "ai.tester@university.edu",
        "department": "Computer Science"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/api/professors", json=professor_data)
        if response.status_code == 201:
            professor = response.json()
            print(f"✅ Professor created (ID: {professor['id']})")
            professor_id = professor['id']
        else:
            print(f"❌ Failed to create professor: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error creating professor: {e}")
        return False
    
    # Step 2: Create an assignment
    print("\nStep 2: Creating assignment...")
    assignment_data = {
        "title": "Test AI Grading Assignment",
        "description": "Write a Python function that calculates the factorial of a number",
        "max_points": 50,
        "professor_id": professor_id
    }
    
    try:
        response = requests.post(f"{BASE_URL}/api/assignments", json=assignment_data)
        if response.status_code == 201:
            assignment = response.json()
            print(f"✅ Assignment created (ID: {assignment['id']})")
            assignment_id = assignment['id']
        else:
            print(f"❌ Failed to create assignment: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error creating assignment: {e}")
        return False
    
    # Step 3: Upload test files (we'll create a simple test file)
    print("\nStep 3: Creating test submission files...")
    test_dir = "test_submissions"
    os.makedirs(test_dir, exist_ok=True)
    
    # Create a test Python file
    test_code = '''
def factorial(n):
    if n < 0:
        return "Error: Factorial not defined for negative numbers"
    if n == 0 or n == 1:
        return 1
    result = 1
    for i in range(2, n + 1):
        result *= i
    return result

# Test the function
print(factorial(5))
'''
    
    with open(f"{test_dir}/student1.py", "w") as f:
        f.write(test_code)
    
    # Create a ZIP file
    import zipfile
    with zipfile.ZipFile(f"{test_dir}/submissions.zip", 'w') as zipf:
        zipf.write(f"{test_dir}/student1.py", "student1.py")
    
    print("✅ Test submission files created")
    
    # Step 4: Upload ZIP file
    print("\nStep 4: Uploading ZIP file...")
    try:
        with open(f"{test_dir}/submissions.zip", "rb") as f:
            files = {'file': f}
            response = requests.post(f"{BASE_URL}/api/assignments/{assignment_id}/upload", files=files)
        
        if response.status_code == 200:
            print("✅ ZIP file uploaded and extracted")
        else:
            print(f"❌ Failed to upload ZIP: {response.status_code}")
            print(f"Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Error uploading ZIP: {e}")
        return False
    
    # Step 5: Grade the assignment (hybrid approach)
    print("\nStep 5: Grading assignment with AI (hybrid approach)...")
    grading_data = {
        "rubric": "Function should handle positive integers and return correct factorial. Deduct points for errors.",
        "max_points": 50
    }
    
    # Import the standalone grading function
    import sys
    sys.path.append('.')
    from grade_standalone import grade_assignment_standalone
    
    try:
        result = grade_assignment_standalone(assignment_id, grading_data["rubric"], grading_data["max_points"])
        if result:
            print("✅ AI grading completed!")
            print(f"Report ID: {result['report_id']}")
            print(f"Total submissions: {result['total_submissions']}")
            print(f"Successfully graded: {result['successful_grades']}")
            print(f"Average score: {result['average_score']:.1f}")
            
            # Show individual results
            print("\nIndividual Results:")
            for submission in result['results']:
                print(f"  {submission['student_name']}: {submission['score']}/{grading_data['max_points']} - {submission['status']}")
                if submission['feedback']:
                    print(f"    Feedback: {submission['feedback'][:100]}...")
            
            return True
        else:
            print("❌ Grading failed")
            return False
    except Exception as e:
        print(f"❌ Error during grading: {e}")
        return False
    
    finally:
        # Cleanup
        import shutil
        if os.path.exists(test_dir):
            shutil.rmtree(test_dir)

def test_api_health():
    """Test if the API is running"""
    try:
        response = requests.get(f"{BASE_URL}/")
        if response.status_code == 200:
            print("✅ API is running")
            return True
        else:
            print(f"❌ API returned status: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to API. Make sure the server is running.")
        return False

if __name__ == "__main__":
    print("🔍 Checking API health...")
    if not test_api_health():
        print("\n❌ API is not running. Please start the Flask server first:")
        print("   python app.py")
        exit(1)
    
    print("\n" + "="*60)
    success = test_complete_flow()
    
    if success:
        print("\n🎉 Complete integration test PASSED!")
        print("Your AI grading system is fully integrated and working!")
    else:
        print("\n❌ Integration test FAILED!")
        print("Check the errors above and fix them.")
