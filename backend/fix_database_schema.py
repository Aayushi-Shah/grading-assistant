#!/usr/bin/env python3
"""
Fix database schema to add subject_id column to assignments table
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app import app
from models import db, Professor, Assignment, Subject
import sqlite3

def fix_database_schema():
    """Add subject_id column to assignments table"""
    with app.app_context():
        try:
            # Get the database path
            db_path = app.config['SQLALCHEMY_DATABASE_URI'].replace('sqlite:///', '')
            
            # Connect to SQLite database directly
            conn = sqlite3.connect(db_path)
            cursor = conn.cursor()
            
            # Check if subject_id column exists
            cursor.execute("PRAGMA table_info(assignments)")
            columns = [column[1] for column in cursor.fetchall()]
            
            if 'subject_id' not in columns:
                print("Adding subject_id column to assignments table...")
                
                # Add subject_id column with a default value
                cursor.execute("ALTER TABLE assignments ADD COLUMN subject_id INTEGER DEFAULT 1")
                
                # Update existing assignments to have subject_id = 1 (first subject)
                cursor.execute("UPDATE assignments SET subject_id = 1 WHERE subject_id IS NULL")
                
                print("✅ subject_id column added successfully")
            else:
                print("✅ subject_id column already exists")
            
            # Commit changes
            conn.commit()
            conn.close()
            
            # Verify the change
            with app.app_context():
                assignments = Assignment.query.all()
                print(f"✅ Found {len(assignments)} assignments")
                if assignments:
                    print(f"✅ First assignment subject_id: {assignments[0].subject_id}")
                
        except Exception as e:
            print(f"❌ Error fixing database schema: {e}")
            raise

if __name__ == '__main__':
    fix_database_schema()
