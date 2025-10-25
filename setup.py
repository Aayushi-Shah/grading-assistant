#!/usr/bin/env python3
"""
Setup script for Grading Assistant Backend
"""

import os
import sys
import subprocess

def run_command(command, description):
    """Run a command and handle errors"""
    print(f"Running: {description}")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✓ {description} completed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"✗ {description} failed: {e.stderr}")
        return False

def setup_environment():
    """Set up the development environment"""
    print("Setting up Grading Assistant Backend...")
    
    # Create virtual environment
    if not os.path.exists('venv'):
        if not run_command('python3 -m venv venv', 'Creating virtual environment'):
            return False
    else:
        print("✓ Virtual environment already exists")
    
    # Activate virtual environment and install dependencies
    if sys.platform == 'win32':
        activate_cmd = 'venv\\Scripts\\activate'
        pip_cmd = 'venv\\Scripts\\pip'
    else:
        activate_cmd = 'source venv/bin/activate'
        pip_cmd = 'venv/bin/pip'
    
    # Install requirements
    if not run_command(f'{pip_cmd} install -r requirements.txt', 'Installing Python dependencies'):
        return False
    
    # Create uploads directory
    os.makedirs('uploads', exist_ok=True)
    print("✓ Created uploads directory")
    
    # Initialize database
    if not run_command(f'{pip_cmd} install flask-migrate', 'Installing Flask-Migrate'):
        return False
    
    print("\n✓ Setup completed successfully!")
    print("\nTo start the application:")
    print("1. Activate virtual environment:")
    if sys.platform == 'win32':
        print("   venv\\Scripts\\activate")
    else:
        print("   source venv/bin/activate")
    print("2. Run the application:")
    print("   python app.py")
    
    return True

if __name__ == '__main__':
    setup_environment()
