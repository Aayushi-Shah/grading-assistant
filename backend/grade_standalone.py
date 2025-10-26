#!/usr/bin/env python3
"""
Standalone grading script that can be run independently
"""

import sys
import os
from app import app
from models import db, Assignment, GradingReport, SubmissionResult
from ai_service import grade_all_submissions

def grade_assignment_standalone(assignment_id, rubric, max_points=None):
    """
    Grade an assignment using the standalone script
    """
    with app.app_context():
        try:
            # Get assignment
            assignment = Assignment.query.get(assignment_id)
            if not assignment:
                print(f"❌ Assignment {assignment_id} not found")
                return False
            
            print(f"🎯 Grading Assignment: {assignment.title}")
            print(f"Max Points: {max_points or assignment.max_points}")
            print("=" * 60)
            
            # Use assignment's max_points if not provided
            if max_points is None:
                max_points = assignment.max_points
            
            # Call AI grading function
            result = grade_all_submissions(assignment_id, rubric, max_points)
            
            print("\n🎉 GRADING COMPLETED!")
            print("=" * 60)
            print(f"Report ID: {result['report_id']}")
            print(f"Total Submissions: {result['total_submissions']}")
            print(f"Successfully Graded: {result['successful_grades']}")
            print(f"Average Score: {result['average_score']:.1f}/{max_points}")
            
            print("\nIndividual Results:")
            for submission in result['results']:
                print(f"  {submission['student_name']}: {submission['score']}/{max_points} - {submission['status']}")
                if submission['feedback']:
                    print(f"    Feedback: {submission['feedback'][:100]}...")
            
            return True
            
        except Exception as e:
            print(f"❌ Grading failed: {e}")
            return False

def list_assignments():
    """List all assignments"""
    with app.app_context():
        assignments = Assignment.query.all()
        print("Available Assignments:")
        print("=" * 30)
        for a in assignments:
            print(f"ID: {a.id}")
            print(f"Title: {a.title}")
            print(f"Max Points: {a.max_points}")
            print(f"Has Files: {'Yes' if a.extracted_folder_path else 'No'}")
            print("-" * 30)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage:")
        print("  python grade_standalone.py list                    # List assignments")
        print("  python grade_standalone.py <assignment_id> <rubric> [max_points]")
        print("\nExample:")
        print("  python grade_standalone.py 1 'Function should work correctly' 50")
        list_assignments()
        sys.exit(1)
    
    if sys.argv[1] == "list":
        list_assignments()
        sys.exit(0)
    
    try:
        assignment_id = int(sys.argv[1])
        rubric = sys.argv[2]
        max_points = int(sys.argv[3]) if len(sys.argv) > 3 else None
        
        success = grade_assignment_standalone(assignment_id, rubric, max_points)
        sys.exit(0 if success else 1)
        
    except ValueError:
        print("❌ Invalid arguments. Assignment ID and max_points must be numbers.")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)
