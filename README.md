# Grading Assistant

An AI-powered assignment grading system with React frontend and Flask backend.

## Project Structure

```
grading-assistant/
├── backend/                 # Flask backend API
│   ├── app.py              # Main Flask application
│   ├── config.py           # Configuration settings
│   ├── models.py           # Database models
│   ├── routes.py           # API routes
│   ├── init_db.py          # Database initialization
│   ├── requirements.txt     # Python dependencies
│   ├── start.sh            # Startup script
│   ├── tests/              # Test files
│   ├── uploads/            # File uploads
│   └── instance/           # Database files
├── frontend/               # React frontend
│   ├── src/                # Source code
│   ├── public/             # Public assets
│   ├── build/              # Production build
│   └── package.json        # Node dependencies
└── README.md              # This file
```

## Quick Start

### Backend Setup
```bash
cd backend
source venv/bin/activate
pip install -r requirements.txt
python init_db.py
./start.sh
```

### Frontend Setup
```bash
cd frontend
npm install
npm run build
```

The application will be available at `http://localhost:5001`

## Features

- Assignment management
- File upload and processing
- AI-powered grading (planned)
- Dashboard with statistics
- Professor management

## Development

- Backend: Flask, SQLAlchemy, SQLite
- Frontend: React, TypeScript, Tailwind CSS
- Database: SQLite (development)
