# 🎓 Grading Assistant

Grading Assistant is an AI-powered platform tackling a real-world problem in *education*: slow, inconsistent grading of coding assignments. Using Gemini LLM, it drafts a reference solution, evaluates student code against instructor rubrics, and returns clear, actionable feedback—so instructors spend time teaching, not tallying.

The experience is designed to be *accessible, functional, and intuitive* from the first click. Interfaces support adjustable color contrast and scalable typography, keyboard-operable navigation, and screen-reader friendly labels (ARIA), with responsive layouts that remain robust across devices and assistive technologies. Explanations are written in plain language and organized so information can be perceived in multiple ways, improving comprehension for diverse learners.

Instructors manage assignments, upload ZIPs of submissions, and view unified results and analytics across courses. A human-in-the-loop review step keeps AI aligned with course intent, while rubric-aware scoring ensures fairness and transparency. By combining thoughtful UX with responsible AI, Grading Assistant meaningfully *uses the power of AI to address a real-world problem in education*—speeding up feedback cycles, promoting equity in evaluation, and improving learning outcomes.

---

## 🧰 Tech Stack

•⁠  ⁠*Frontend:* React, TypeScript, Tailwind CSS  
•⁠  ⁠*Backend:* Flask (Python), SQLAlchemy  
•⁠  ⁠*AI:* Gemini LLM (reference solution + rubric-aware evaluation)  
•⁠  ⁠*Database:* SQLite (dev)  
•⁠  ⁠*Build & Tooling:* Node.js, npm, Python venv, shell scripts

---

## ✨ Features

•⁠  ⁠*Assignment management:* create, update, and organize coding tasks.  
•⁠  ⁠*Bulk uploads:* import student submissions as a ZIP (multi-language capable).  
•⁠  ⁠*Rubric-aware grading:* consistent scoring aligned with professor guidelines.  
•⁠  ⁠*Gemini-generated reference:* fast, reviewable solution baseline for each task.  
•⁠  ⁠*Automated feedback:* clear explanations of deductions and common mistakes.  
•⁠  ⁠*Unified dashboard:* view scores across *multiple courses and assignments*.  
•⁠  ⁠*Basic analytics:* distributions, averages, and outlier spotting at a glance.  
•⁠  ⁠*Export:* download results/feedback for LMS or gradebook imports (CSV/JSON).

---

## 🧱 Components & Responsibilities

### 1) Frontend (React + TypeScript)
•⁠  ⁠Professor-facing dashboard with assignment views, score tables, and basic analytics.
•⁠  ⁠Upload flows for assignments and ZIP bundles of student code.
•⁠  ⁠Result pages showing marks, rubric breakdowns, and feedback per submission.

### 2) Backend API (Flask + SQLAlchemy)
•⁠  ⁠REST endpoints for assignment CRUD, file upload, grading jobs, and results retrieval.
•⁠  ⁠Orchestrates rubric parsing, submission dispatch, and persistence.
•⁠  ⁠Security & validation for file types and size; error handling & status reporting.

### 3) AI Grading Engine (Gemini Integration)
•⁠  ⁠Drafts the *reference solution* for each assignment and supports professor review.
•⁠  ⁠Compares each submission against the reference + rubric criteria.
•⁠  ⁠Produces structured *feedback* (deductions, hints, and suggested fixes).

### 4) Data Layer (SQLite)
•⁠  ⁠Stores users, assignments, rubrics, submissions, scores, and feedback artifacts.
•⁠  ⁠Tracks job status and enables historical analytics at course/assignment levels.

---

## Quick Start

### Backend Setup
⁠ bash
cd backend
source venv/bin/activate
pip install -r requirements.txt
python init_db.py
./start.sh
 ⁠

### Frontend Setup
⁠ bash
cd frontend
npm install
npm run build
 ⁠

The application will be available at ⁠ http://localhost:5001 ⁠

---

## 📂 Project Structure


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

---