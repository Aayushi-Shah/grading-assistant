#!/usr/bin/env python3
"""
Seeder script for Grading Assistant database
Creates realistic sample data for all models
"""

from datetime import datetime, timedelta
import random
from models import db, Professor, Assignment, GradingReport, SubmissionResult
from app import app

def create_professors():
    """Create sample professors"""
    professors_data = [
        {
            'name': 'Dr. Jane Smith',
            'email': 'jane.smith@university.edu',
            'department': 'Computer Science'
        },
        {
            'name': 'Prof. Michael Johnson',
            'email': 'michael.johnson@university.edu',
            'department': 'Mathematics'
        },
        {
            'name': 'Dr. Sarah Wilson',
            'email': 'sarah.wilson@university.edu',
            'department': 'Physics'
        },
        {
            'name': 'Prof. David Chen',
            'email': 'david.chen@university.edu',
            'department': 'Computer Science'
        },
        {
            'name': 'Dr. Emily Rodriguez',
            'email': 'emily.rodriguez@university.edu',
            'department': 'Data Science'
        }
    ]
    
    professors = []
    for prof_data in professors_data:
        professor = Professor(**prof_data)
        db.session.add(professor)
        professors.append(professor)
    
    db.session.commit()
    print(f"✓ Created {len(professors)} professors")
    return professors

def create_assignments(professors):
    """Create sample assignments for professors"""
    assignments_data = [
        # Computer Science assignments
        {
            'title': 'Data Structures Implementation',
            'description': 'Implement a binary search tree with insert, delete, and search operations. Include unit tests and documentation.',
            'max_points': 100,
            'due_date': datetime.now() + timedelta(days=14)
        },
        {
            'title': 'Database Design Project',
            'description': 'Design and implement a relational database for a library management system. Include ER diagram, normalization analysis, and SQL queries.',
            'max_points': 150,
            'due_date': datetime.now() + timedelta(days=21)
        },
        {
            'title': 'Machine Learning Assignment',
            'description': 'Build a classification model using scikit-learn. Analyze dataset, implement model, and evaluate performance.',
            'max_points': 120,
            'due_date': datetime.now() + timedelta(days=10)
        },
        {
            'title': 'Web Development Project',
            'description': 'Create a full-stack web application using React and Node.js. Include authentication, CRUD operations, and responsive design.',
            'max_points': 200,
            'due_date': datetime.now() + timedelta(days=28)
        },
        {
            'title': 'Algorithm Analysis',
            'description': 'Analyze time and space complexity of sorting algorithms. Implement and compare bubble sort, merge sort, and quick sort.',
            'max_points': 80,
            'due_date': datetime.now() + timedelta(days=7)
        },
        # Mathematics assignments
        {
            'title': 'Calculus Problem Set',
            'description': 'Solve problems involving derivatives, integrals, and applications of calculus in real-world scenarios.',
            'max_points': 100,
            'due_date': datetime.now() + timedelta(days=5)
        },
        {
            'title': 'Linear Algebra Project',
            'description': 'Work with matrices, eigenvalues, and eigenvectors. Solve systems of linear equations and geometric transformations.',
            'max_points': 120,
            'due_date': datetime.now() + timedelta(days=12)
        },
        {
            'title': 'Statistics Assignment',
            'description': 'Analyze datasets using statistical methods. Create visualizations and interpret results.',
            'max_points': 90,
            'due_date': datetime.now() + timedelta(days=9)
        },
        # Physics assignments
        {
            'title': 'Mechanics Lab Report',
            'description': 'Conduct experiments on projectile motion and analyze data. Write comprehensive lab report with calculations.',
            'max_points': 100,
            'due_date': datetime.now() + timedelta(days=6)
        },
        {
            'title': 'Electromagnetism Problem Set',
            'description': 'Solve problems involving electric fields, magnetic fields, and electromagnetic induction.',
            'max_points': 110,
            'due_date': datetime.now() + timedelta(days=11)
        },
        # Data Science assignments
        {
            'title': 'Data Visualization Project',
            'description': 'Create interactive visualizations using Python libraries. Analyze trends and patterns in real-world datasets.',
            'max_points': 130,
            'due_date': datetime.now() + timedelta(days=16)
        },
        {
            'title': 'Statistical Modeling',
            'description': 'Build regression models and perform hypothesis testing. Interpret results and make predictions.',
            'max_points': 140,
            'due_date': datetime.now() + timedelta(days=18)
        }
    ]
    
    assignments = []
    assignment_index = 0
    
    for professor in professors:
        # Assign 2-3 assignments per professor
        num_assignments = random.randint(2, 3)
        for _ in range(num_assignments):
            if assignment_index < len(assignments_data):
                assignment_data = assignments_data[assignment_index].copy()
                assignment_data['professor_id'] = professor.id
                
                # Add file paths for some assignments
                if random.choice([True, False]):
                    assignment_data['zip_file_path'] = f'/uploads/assignment_{assignment_index + 1}/student_submissions.zip'
                    assignment_data['extracted_folder_path'] = f'/uploads/assignment_{assignment_index + 1}/extracted/'
                
                assignment = Assignment(**assignment_data)
                db.session.add(assignment)
                assignments.append(assignment)
                assignment_index += 1
    
    db.session.commit()
    print(f"✓ Created {len(assignments)} assignments")
    return assignments

def create_grading_reports(assignments):
    """Create grading reports for assignments"""
    reports = []
    
    for assignment in assignments:
        total_submissions = random.randint(15, 35)
        graded_submissions = random.randint(total_submissions - 5, total_submissions)
        average_score = round(random.uniform(70, 95), 1)
        
        report_data = {
            'assignment_id': assignment.id,
            'report_name': f'{assignment.title} - Grading Report',
            'report_path': f'/reports/assignment_{assignment.id}_grading_report.pdf',
            'total_submissions': total_submissions,
            'graded_submissions': graded_submissions,
            'average_score': average_score
        }
        
        report = GradingReport(**report_data)
        db.session.add(report)
        reports.append(report)
    
    db.session.commit()
    print(f"✓ Created {len(reports)} grading reports")
    return reports

def create_submission_results(assignments):
    """Create submission results for assignments"""
    student_names = [
        'John Doe', 'Jane Smith', 'Michael Johnson', 'Sarah Wilson', 'David Chen',
        'Emily Rodriguez', 'James Brown', 'Lisa Davis', 'Robert Miller', 'Jennifer Garcia',
        'William Martinez', 'Ashley Anderson', 'Christopher Taylor', 'Jessica Thomas',
        'Matthew Jackson', 'Amanda White', 'Daniel Harris', 'Michelle Martin',
        'Andrew Thompson', 'Stephanie Garcia', 'Kevin Martinez', 'Rachel Anderson',
        'Brandon Taylor', 'Nicole Thomas', 'Ryan Jackson', 'Samantha White',
        'Tyler Harris', 'Brittany Martin', 'Jordan Thompson', 'Megan Garcia'
    ]
    
    submission_results = []
    
    for assignment in assignments:
        # Create 15-30 submissions per assignment
        num_submissions = random.randint(15, 30)
        
        for i in range(num_submissions):
            student_name = random.choice(student_names)
            student_id = f'STU{random.randint(1000, 9999)}'
            
            # Generate realistic scores
            score = round(random.uniform(60, 100), 1)
            max_score = assignment.max_points
            percentage = (score / max_score) * 100
            
            # Generate feedback based on score
            if percentage >= 90:
                feedback = "Excellent work! Outstanding implementation with clear documentation."
            elif percentage >= 80:
                feedback = "Good work! Solid implementation with minor areas for improvement."
            elif percentage >= 70:
                feedback = "Satisfactory work. Some issues need to be addressed in future assignments."
            else:
                feedback = "Needs improvement. Please review the requirements and seek help if needed."
            
            # Determine grading status
            grading_status = random.choices(
                ['graded', 'pending', 'error'],
                weights=[85, 10, 5]
            )[0]
            
            submission_data = {
                'assignment_id': assignment.id,
                'student_name': student_name,
                'student_id': student_id,
                'submission_path': f'/uploads/assignment_{assignment.id}/extracted/{student_name.lower().replace(" ", "_")}/',
                'score': score,
                'max_score': max_score,
                'feedback': feedback,
                'grading_status': grading_status,
                'graded_at': datetime.now() - timedelta(hours=random.randint(1, 72)) if grading_status == 'graded' else None
            }
            
            submission = SubmissionResult(**submission_data)
            db.session.add(submission)
            submission_results.append(submission)
    
    db.session.commit()
    print(f"✓ Created {len(submission_results)} submission results")
    return submission_results

def main():
    """Main seeder function"""
    print("🌱 Starting database seeding...")
    
    with app.app_context():
        # Clear existing data
        print("🗑️  Clearing existing data...")
        SubmissionResult.query.delete()
        GradingReport.query.delete()
        Assignment.query.delete()
        Professor.query.delete()
        db.session.commit()
        
        # Create seed data
        print("👨‍🏫 Creating professors...")
        professors = create_professors()
        
        print("📝 Creating assignments...")
        assignments = create_assignments(professors)
        
        print("📊 Creating grading reports...")
        reports = create_grading_reports(assignments)
        
        print("📋 Creating submission results...")
        submissions = create_submission_results(assignments)
        
        print("\n🎉 Database seeding completed successfully!")
        print(f"📈 Summary:")
        print(f"   • {len(professors)} professors")
        print(f"   • {len(assignments)} assignments")
        print(f"   • {len(reports)} grading reports")
        print(f"   • {len(submissions)} submission results")

if __name__ == '__main__':
    main()
