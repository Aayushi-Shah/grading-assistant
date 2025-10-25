#!/bin/bash
# Startup script for Grading Assistant Backend

echo "Starting Grading Assistant Backend..."

# Activate virtual environment
source venv/bin/activate

# Initialize database if it doesn't exist
if [ ! -f "grading_assistant.db" ]; then
    echo "Initializing database..."
    python init_db.py
fi

# Start the application
echo "Starting Flask application on port 5001..."
python app.py
