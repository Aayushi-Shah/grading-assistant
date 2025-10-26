#!/usr/bin/env python3
"""
Database migration script to add subjects functionality
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app import app
from models import db, Professor, Subject, Assignment

def migrate_database():
    """Add subjects table and update assignments table"""
    with app.app_context():
        try:
            # Create subjects table
            db.create_all()
            print("✅ Database tables created/updated successfully")
            
            # Check if we have any professors
            professors = Professor.query.all()
            if not professors:
                print("❌ No professors found. Please run seed_data.py first.")
                return
            
            # Check if we already have subjects
            existing_subjects = Subject.query.all()
            if existing_subjects:
                print(f"✅ Found {len(existing_subjects)} existing subjects")
                return
            
            # Create default subjects for each professor
            for professor in professors:
                # Create some default subjects for each professor
                default_subjects = [
                    {
                        'name': 'Introduction to Programming',
                        'code': 'CS101',
                        'description': 'Basic programming concepts and problem solving'
                    },
                    {
                        'name': 'Data Structures and Algorithms',
                        'code': 'CS201',
                        'description': 'Advanced programming with data structures and algorithms'
                    },
                    {
                        'name': 'Database Systems',
                        'code': 'CS301',
                        'description': 'Database design, implementation, and management'
                    },
                    {
                        'name': 'Software Engineering',
                        'code': 'CS401',
                        'description': 'Software development methodologies and practices'
                    }
                ]
                
                for subject_data in default_subjects:
                    subject = Subject(
                        name=subject_data['name'],
                        code=f"{subject_data['code']}_{professor.id}",  # Make unique per professor
                        description=subject_data['description'],
                        professor_id=professor.id
                    )
                    db.session.add(subject)
                
                print(f"✅ Created default subjects for Professor {professor.name}")
            
            db.session.commit()
            print("✅ Migration completed successfully!")
            
            # Display created subjects
            subjects = Subject.query.all()
            print(f"\n📚 Created {len(subjects)} subjects:")
            for subject in subjects:
                print(f"  - {subject.code}: {subject.name} (Professor ID: {subject.professor_id})")
                
        except Exception as e:
            print(f"❌ Migration failed: {e}")
            db.session.rollback()
            raise

if __name__ == '__main__':
    migrate_database()
