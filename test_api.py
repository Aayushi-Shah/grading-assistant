#!/usr/bin/env python3
"""
Simple test script for the Grading Assistant API
"""

import requests
import json
import os

BASE_URL = "http://localhost:5001"

def test_api():
    """Test basic API functionality"""
    print("Testing Grading Assistant API...")
    
    # Test 1: Check if API is running
    try:
        response = requests.get(f"{BASE_URL}/")
        if response.status_code == 200:
            print("✓ API is running")
            print(f"  Response: {response.json()}")
        else:
            print(f"✗ API returned status code: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("✗ Cannot connect to API. Make sure the server is running.")
        return False
    
    # Test 2: Create a professor
    professor_data = {
        "name": "Dr. Test Professor",
        "email": "test@university.edu",
        "department": "Computer Science"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/api/professors", json=professor_data)
        if response.status_code == 201:
            professor = response.json()
            print(f"✓ Professor created with ID: {professor['id']}")
            professor_id = professor['id']
        else:
            print(f"✗ Failed to create professor: {response.status_code}")
            return False
    except Exception as e:
        print(f"✗ Error creating professor: {e}")
        return False
    
    # Test 3: Create an assignment
    assignment_data = {
        "title": "Test Assignment",
        "description": "A test assignment for API testing",
        "max_points": 100,
        "professor_id": professor_id
    }
    
    try:
        response = requests.post(f"{BASE_URL}/api/assignments", json=assignment_data)
        if response.status_code == 201:
            assignment = response.json()
            print(f"✓ Assignment created with ID: {assignment['id']}")
            assignment_id = assignment['id']
        else:
            print(f"✗ Failed to create assignment: {response.status_code}")
            return False
    except Exception as e:
        print(f"✗ Error creating assignment: {e}")
        return False
    
    # Test 4: Get all professors
    try:
        response = requests.get(f"{BASE_URL}/api/professors")
        if response.status_code == 200:
            professors = response.json()
            print(f"✓ Retrieved {len(professors)} professors")
        else:
            print(f"✗ Failed to get professors: {response.status_code}")
    except Exception as e:
        print(f"✗ Error getting professors: {e}")
    
    # Test 5: Get all assignments
    try:
        response = requests.get(f"{BASE_URL}/api/assignments")
        if response.status_code == 200:
            assignments = response.json()
            print(f"✓ Retrieved {len(assignments)} assignments")
        else:
            print(f"✗ Failed to get assignments: {response.status_code}")
    except Exception as e:
        print(f"✗ Error getting assignments: {e}")
    
    print("\n✓ API tests completed successfully!")
    return True

if __name__ == '__main__':
    test_api()
