from flask import Blueprint, request, jsonify, current_app
from models import db, Professor, Assignment, GradingReport, SubmissionResult
import os
import zipfile
import shutil
from datetime import datetime

main_bp = Blueprint('main', __name__)

@main_bp.route('/api/professors', methods=['GET', 'POST'])
def professors():
    if request.method == 'GET':
        professors = Professor.query.all()
        return jsonify([prof.to_dict() for prof in professors])
    
    elif request.method == 'POST':
        data = request.get_json()
        professor = Professor(
            name=data['name'],
            email=data['email'],
            department=data.get('department')
        )
        db.session.add(professor)
        db.session.commit()
        return jsonify(professor.to_dict()), 201

@main_bp.route('/api/professors/<int:professor_id>', methods=['GET', 'PUT', 'DELETE'])
def professor(professor_id):
    professor = Professor.query.get_or_404(professor_id)
    
    if request.method == 'GET':
        return jsonify(professor.to_dict())
    
    elif request.method == 'PUT':
        data = request.get_json()
        professor.name = data.get('name', professor.name)
        professor.email = data.get('email', professor.email)
        professor.department = data.get('department', professor.department)
        db.session.commit()
        return jsonify(professor.to_dict())
    
    elif request.method == 'DELETE':
        db.session.delete(professor)
        db.session.commit()
        return '', 204

@main_bp.route('/api/assignments', methods=['GET', 'POST'])
def assignments():
    if request.method == 'GET':
        assignments = Assignment.query.all()
        return jsonify([assignment.to_dict() for assignment in assignments])
    
    elif request.method == 'POST':
        data = request.get_json()
        assignment = Assignment(
            title=data['title'],
            description=data.get('description'),
            due_date=datetime.fromisoformat(data['due_date']) if data.get('due_date') else None,
            max_points=data.get('max_points', 100),
            professor_id=data['professor_id']
        )
        db.session.add(assignment)
        db.session.commit()
        return jsonify(assignment.to_dict()), 201

@main_bp.route('/api/assignments/<int:assignment_id>', methods=['GET', 'PUT', 'DELETE'])
def assignment(assignment_id):
    assignment = Assignment.query.get_or_404(assignment_id)
    
    if request.method == 'GET':
        return jsonify(assignment.to_dict())
    
    elif request.method == 'PUT':
        data = request.get_json()
        assignment.title = data.get('title', assignment.title)
        assignment.description = data.get('description', assignment.description)
        assignment.due_date = datetime.fromisoformat(data['due_date']) if data.get('due_date') else assignment.due_date
        assignment.max_points = data.get('max_points', assignment.max_points)
        db.session.commit()
        return jsonify(assignment.to_dict())
    
    elif request.method == 'DELETE':
        db.session.delete(assignment)
        db.session.commit()
        return '', 204

@main_bp.route('/api/assignments/<int:assignment_id>/upload', methods=['POST'])
def upload_assignment_zip(assignment_id):
    assignment = Assignment.query.get_or_404(assignment_id)
    
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    if not file.filename.endswith('.zip'):
        return jsonify({'error': 'File must be a ZIP file'}), 400
    
    # Create assignment-specific directory
    assignment_dir = os.path.join(current_app.config['UPLOAD_FOLDER'], f'assignment_{assignment_id}')
    os.makedirs(assignment_dir, exist_ok=True)
    
    # Save the zip file
    zip_path = os.path.join(assignment_dir, file.filename)
    file.save(zip_path)
    
    # Extract the zip file
    extract_path = os.path.join(assignment_dir, 'extracted')
    os.makedirs(extract_path, exist_ok=True)
    
    try:
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            zip_ref.extractall(extract_path)
        
        # Update assignment with file paths
        assignment.zip_file_path = zip_path
        assignment.extracted_folder_path = extract_path
        db.session.commit()
        
        return jsonify({
            'message': 'File uploaded and extracted successfully',
            'zip_path': zip_path,
            'extracted_path': extract_path
        }), 200
        
    except zipfile.BadZipFile:
        return jsonify({'error': 'Invalid ZIP file'}), 400
    except Exception as e:
        return jsonify({'error': f'Error processing file: {str(e)}'}), 500

@main_bp.route('/api/assignments/<int:assignment_id>/submissions', methods=['GET'])
def get_submissions(assignment_id):
    assignment = Assignment.query.get_or_404(assignment_id)
    submissions = SubmissionResult.query.filter_by(assignment_id=assignment_id).all()
    return jsonify([submission.to_dict() for submission in submissions])

@main_bp.route('/api/grading-reports', methods=['GET', 'POST'])
def grading_reports():
    if request.method == 'GET':
        reports = GradingReport.query.all()
        return jsonify([report.to_dict() for report in reports])
    
    elif request.method == 'POST':
        data = request.get_json()
        report = GradingReport(
            assignment_id=data['assignment_id'],
            report_name=data['report_name'],
            report_path=data.get('report_path'),
            total_submissions=data.get('total_submissions', 0),
            graded_submissions=data.get('graded_submissions', 0),
            average_score=data.get('average_score')
        )
        db.session.add(report)
        db.session.commit()
        return jsonify(report.to_dict()), 201

@main_bp.route('/api/submission-results', methods=['GET', 'POST'])
def submission_results():
    if request.method == 'GET':
        results = SubmissionResult.query.all()
        return jsonify([result.to_dict() for result in results])
    
    elif request.method == 'POST':
        data = request.get_json()
        result = SubmissionResult(
            assignment_id=data['assignment_id'],
            student_name=data['student_name'],
            student_id=data.get('student_id'),
            submission_path=data.get('submission_path'),
            score=data.get('score'),
            max_score=data.get('max_score'),
            feedback=data.get('feedback'),
            grading_status=data.get('grading_status', 'pending')
        )
        db.session.add(result)
        db.session.commit()
        return jsonify(result.to_dict()), 201

# LLM Integration Endpoints
@main_bp.route('/api/assignments/<int:assignment_id>/llm/process', methods=['POST'])
def trigger_llm_processing(assignment_id):
    """Trigger LLM processing for an assignment"""
    assignment = Assignment.query.get_or_404(assignment_id)
    
    data = request.get_json()
    ideal_solution = data.get('ideal_solution')
    rubrics = data.get('rubrics')
    
    # Update assignment with LLM data
    assignment.ideal_solution = ideal_solution
    assignment.rubrics = rubrics
    assignment.llm_processing_status = 'processing'
    assignment.llm_processed_at = datetime.utcnow()
    
    db.session.commit()
    
    # TODO: Here you would trigger the actual LLM API call
    # For now, we'll simulate the processing
    return jsonify({
        'message': 'LLM processing triggered successfully',
        'assignment_id': assignment_id,
        'status': 'processing',
        'estimated_completion': '5-10 minutes'
    }), 200

@main_bp.route('/api/assignments/<int:assignment_id>/llm/status', methods=['GET'])
def get_llm_processing_status(assignment_id):
    """Get the current LLM processing status"""
    assignment = Assignment.query.get_or_404(assignment_id)
    
    return jsonify({
        'assignment_id': assignment_id,
        'status': assignment.llm_processing_status,
        'processed_at': assignment.llm_processed_at.isoformat() if assignment.llm_processed_at else None,
        'ideal_solution': assignment.ideal_solution,
        'rubrics': assignment.rubrics
    })

@main_bp.route('/api/assignments/<int:assignment_id>/llm/verify', methods=['POST'])
def verify_ideal_solution(assignment_id):
    """Professor verifies the ideal solution before grading"""
    assignment = Assignment.query.get_or_404(assignment_id)
    
    data = request.get_json()
    is_approved = data.get('approved', False)
    feedback = data.get('feedback', '')
    
    if is_approved:
        assignment.llm_processing_status = 'approved'
        # TODO: Trigger actual grading process here
        return jsonify({
            'message': 'Ideal solution approved. Grading process started.',
            'status': 'grading_started'
        }), 200
    else:
        assignment.llm_processing_status = 'rejected'
        return jsonify({
            'message': 'Ideal solution rejected. Please provide feedback.',
            'status': 'rejected',
            'feedback': feedback
        }), 200

@main_bp.route('/api/assignments/<int:assignment_id>/csv', methods=['GET'])
def download_grading_csv(assignment_id):
    """Download grading results as CSV"""
    assignment = Assignment.query.get_or_404(assignment_id)
    submission_results = SubmissionResult.query.filter_by(assignment_id=assignment_id).all()
    
    # Create CSV content
    csv_content = "Student Name,Student ID,Score,Max Score,Percentage,Feedback,Grading Status\n"
    for result in submission_results:
        percentage = (result.score / result.max_score * 100) if result.max_score > 0 else 0
        csv_content += f'"{result.student_name}","{result.student_id}",{result.score},{result.max_score},{percentage:.1f}%,"{result.feedback}","{result.grading_status}"\n'
    
    return jsonify({
        'csv_content': csv_content,
        'filename': f'assignment_{assignment_id}_grading_results.csv',
        'total_submissions': len(submission_results)
    })
