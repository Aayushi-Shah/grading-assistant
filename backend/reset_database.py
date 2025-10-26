#!/usr/bin/env python3
"""
Reset database completely and recreate with fresh data
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app import app
from models import db, Professor, Assignment, Subject, GradingReport, SubmissionResult
from datetime import datetime, timedelta

def reset_database():
    """Drop all tables and recreate with fresh data"""
    with app.app_context():
        # Drop all tables
        db.drop_all()
        print("✅ Dropped all tables")
        
        # Create all tables
        db.create_all()
        print("✅ Created all tables")
        
        # Create professors
        professors = [
            Professor(name='Dr. Jane Smith', email='jane.smith@university.edu', department='Computer Science'),
            Professor(name='Dr. John Doe', email='john.doe@university.edu', department='Mathematics'),
            Professor(name='Dr. Sarah Wilson', email='sarah.wilson@university.edu', department='Physics')
        ]
        
        for professor in professors:
            db.session.add(professor)
        db.session.commit()
        print(f"✅ Created {len(professors)} professors")
        
        # Create subjects for each professor
        subjects_data = [
            # Dr. Jane Smith (CS)
            {'name': 'Introduction to Programming', 'code': 'CS101', 'description': 'Basic programming concepts using Python', 'professor_id': 1},
            {'name': 'Data Structures', 'code': 'CS201', 'description': 'Advanced programming and data structures', 'professor_id': 1},
            {'name': 'Database Systems', 'code': 'CS301', 'description': 'Database design and management', 'professor_id': 1},
            
            # Dr. John Doe (Math)
            {'name': 'Calculus I', 'code': 'MATH101', 'description': 'Differential calculus', 'professor_id': 2},
            {'name': 'Linear Algebra', 'code': 'MATH201', 'description': 'Vector spaces and linear transformations', 'professor_id': 2},
            {'name': 'Statistics', 'code': 'MATH301', 'description': 'Probability and statistical analysis', 'professor_id': 2},
            
            # Dr. Sarah Wilson (Physics)
            {'name': 'Mechanics', 'code': 'PHYS101', 'description': 'Classical mechanics and dynamics', 'professor_id': 3},
            {'name': 'Electromagnetism', 'code': 'PHYS201', 'description': 'Electric and magnetic fields', 'professor_id': 3},
            {'name': 'Quantum Physics', 'code': 'PHYS301', 'description': 'Introduction to quantum mechanics', 'professor_id': 3}
        ]
        
        subjects = []
        for subject_data in subjects_data:
            subject = Subject(**subject_data)
            subjects.append(subject)
            db.session.add(subject)
        db.session.commit()
        print(f"✅ Created {len(subjects)} subjects")
        
        # Create sample assignments
        assignments_data = [
            {
                'title': 'Python Basics Assignment',
                'description': 'Write a Python program to calculate factorial',
                'due_date': datetime.now() + timedelta(days=7),
                'max_points': 100,
                'professor_id': 1,
                'subject_id': 1  # CS101
            },
            {
                'title': 'Data Structures Lab',
                'description': 'Implement a binary search tree in Python',
                'due_date': datetime.now() + timedelta(days=14),
                'max_points': 100,
                'professor_id': 1,
                'subject_id': 2  # CS201
            },
            {
                'title': 'Database Design Project',
                'description': 'Design a database schema for a library management system',
                'due_date': datetime.now() + timedelta(days=21),
                'max_points': 100,
                'professor_id': 1,
                'subject_id': 3  # CS301
            },
            {
                'title': 'Calculus Problem Set',
                'description': 'Solve derivatives and limits problems',
                'due_date': datetime.now() + timedelta(days=5),
                'max_points': 100,
                'professor_id': 2,
                'subject_id': 4  # MATH101
            },
            {
                'title': 'Linear Algebra Exercises',
                'description': 'Matrix operations and eigenvalue problems',
                'due_date': datetime.now() + timedelta(days=10),
                'max_points': 100,
                'professor_id': 2,
                'subject_id': 5  # MATH201
            }
        ]
        
        assignments = []
        for assignment_data in assignments_data:
            assignment = Assignment(**assignment_data)
            assignments.append(assignment)
            db.session.add(assignment)
        db.session.commit()
        print(f"✅ Created {len(assignments)} assignments")
        
        # Create some sample grading reports
        grading_reports = [
            {
                'assignment_id': 1,
                'report_name': 'Python Basics Grading Report',
                'average_score': 85.5,
                'total_submissions': 25,
                'graded_submissions': 25
            },
            {
                'assignment_id': 2,
                'report_name': 'Data Structures Lab Report',
                'average_score': 78.2,
                'total_submissions': 20,
                'graded_submissions': 20
            },
            {
                'assignment_id': 4,
                'report_name': 'Calculus Problem Set Report',
                'average_score': 92.1,
                'total_submissions': 30,
                'graded_submissions': 30
            }
        ]
        
        for report_data in grading_reports:
            report = GradingReport(**report_data)
            db.session.add(report)
        db.session.commit()
        print(f"✅ Created {len(grading_reports)} grading reports")
        
        # Create some sample submission results
        submission_results = [
            {
                'assignment_id': 1,
                'student_name': 'Alice Johnson',
                'student_id': 'A001',
                'score': 88.0,
                'max_score': 100.0,
                'feedback': 'Good implementation, minor style issues',
                'submission_path': 'uploads/assignment_1/alice_factorial.py',
                'grading_status': 'graded'
            },
            {
                'assignment_id': 1,
                'student_name': 'Bob Smith',
                'student_id': 'A002',
                'score': 92.0,
                'max_score': 100.0,
                'feedback': 'Excellent code with proper documentation',
                'submission_path': 'uploads/assignment_1/bob_factorial.py',
                'grading_status': 'graded'
            },
            {
                'assignment_id': 2,
                'student_name': 'Charlie Brown',
                'student_id': 'A003',
                'score': 75.0,
                'max_score': 100.0,
                'feedback': 'Correct implementation but inefficient',
                'submission_path': 'uploads/assignment_2/charlie_bst.py',
                'grading_status': 'graded'
            }
        ]
        
        for result_data in submission_results:
            result = SubmissionResult(**result_data)
            db.session.add(result)
        db.session.commit()
        print(f"✅ Created {len(submission_results)} submission results")
        
        print("\n🎉 Database reset and seeded successfully!")
        print(f"📊 Summary:")
        print(f"   - Professors: {len(professors)}")
        print(f"   - Subjects: {len(subjects)}")
        print(f"   - Assignments: {len(assignments)}")
        print(f"   - Grading Reports: {len(grading_reports)}")
        print(f"   - Submission Results: {len(submission_results)}")

if __name__ == '__main__':
    reset_database()
