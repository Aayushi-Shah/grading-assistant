#!/usr/bin/env python3
"""
Database initialization script for Grading Assistant Backend
"""

from app import app
from models import db, Professor, Assignment, GradingReport, SubmissionResult

def init_database():
    """Initialize the database with tables"""
    with app.app_context():
        # Create all tables
        db.create_all()
        print("✓ Database tables created successfully")
        
        # Create a sample professor for testing
        sample_professor = Professor(
            name="Dr. Jane Smith",
            email="jane.smith@university.edu",
            department="Computer Science"
        )
        
        # Check if professor already exists
        existing_prof = Professor.query.filter_by(email=sample_professor.email).first()
        if not existing_prof:
            db.session.add(sample_professor)
            db.session.commit()
            print("✓ Sample professor created")
        else:
            print("✓ Sample professor already exists")
        
        print("\nDatabase initialization completed!")
        print("You can now start the application with: python app.py")

if __name__ == '__main__':
    init_database()
