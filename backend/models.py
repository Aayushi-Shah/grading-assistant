from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from sqlalchemy import Text

db = SQLAlchemy()

class Professor(db.Model):
    __tablename__ = 'professors'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    department = db.Column(db.String(100))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationship with assignments
    assignments = db.relationship('Assignment', backref='professor', lazy=True, cascade='all, delete-orphan')
    
    def __repr__(self):
        return f'<Professor {self.name}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'department': self.department,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class Assignment(db.Model):
    __tablename__ = 'assignments'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(Text)
    due_date = db.Column(db.DateTime)
    max_points = db.Column(db.Integer, default=100)
    professor_id = db.Column(db.Integer, db.ForeignKey('professors.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # File paths for uploaded assignments
    zip_file_path = db.Column(db.String(500))
    extracted_folder_path = db.Column(db.String(500))
    
    # LLM Integration fields (commented out for now to fix schema issues)
    # ideal_solution = db.Column(Text)
    # rubrics = db.Column(Text)
    # llm_processing_status = db.Column(db.String(50), default='pending')  # pending, processing, completed, error
    # llm_processed_at = db.Column(db.DateTime)
    
    # Relationships
    grading_reports = db.relationship('GradingReport', backref='assignment', lazy=True, cascade='all, delete-orphan')
    submission_results = db.relationship('SubmissionResult', backref='assignment', lazy=True, cascade='all, delete-orphan')
    
    def __repr__(self):
        return f'<Assignment {self.title}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'due_date': self.due_date.isoformat() if self.due_date else None,
            'max_points': self.max_points,
            'professor_id': self.professor_id,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'zip_file_path': self.zip_file_path,
            'extracted_folder_path': self.extracted_folder_path
        }

class GradingReport(db.Model):
    __tablename__ = 'grading_reports'
    
    id = db.Column(db.Integer, primary_key=True)
    assignment_id = db.Column(db.Integer, db.ForeignKey('assignments.id'), nullable=False)
    report_name = db.Column(db.String(200), nullable=False)
    report_path = db.Column(db.String(500))
    total_submissions = db.Column(db.Integer, default=0)
    graded_submissions = db.Column(db.Integer, default=0)
    average_score = db.Column(db.Float)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<GradingReport {self.report_name}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'assignment_id': self.assignment_id,
            'report_name': self.report_name,
            'report_path': self.report_path,
            'total_submissions': self.total_submissions,
            'graded_submissions': self.graded_submissions,
            'average_score': self.average_score,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class SubmissionResult(db.Model):
    __tablename__ = 'submission_results'
    
    id = db.Column(db.Integer, primary_key=True)
    assignment_id = db.Column(db.Integer, db.ForeignKey('assignments.id'), nullable=False)
    student_name = db.Column(db.String(100), nullable=False)
    student_id = db.Column(db.String(50))
    submission_path = db.Column(db.String(500))
    score = db.Column(db.Float)
    max_score = db.Column(db.Float)
    feedback = db.Column(Text)
    grading_status = db.Column(db.String(50), default='pending')  # pending, graded, error
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    graded_at = db.Column(db.DateTime)
    
    def __repr__(self):
        return f'<SubmissionResult {self.student_name}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'assignment_id': self.assignment_id,
            'student_name': self.student_name,
            'student_id': self.student_id,
            'submission_path': self.submission_path,
            'score': self.score,
            'max_score': self.max_score,
            'feedback': self.feedback,
            'grading_status': self.grading_status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'graded_at': self.graded_at.isoformat() if self.graded_at else None
        }
