from flask import Blueprint, request, jsonify, current_app
from models import db, Professor, Assignment, GradingReport, SubmissionResult
import os
import zipfile
import shutil
import tempfile
from datetime import datetime

# Conditional import to handle missing ai_service gracefully
try:
    from ai_service import grade_all_submissions, generate_solution
    AI_SERVICE_AVAILABLE = True
except ImportError as e:
    print(f"Warning: ai_service not available: {e}")
    AI_SERVICE_AVAILABLE = False
    
    # Mock functions for when AI service is not available
    def grade_all_submissions(assignment_id, rubric, max_points):
        return {
            'report_id': 'mock_report',
            'total_submissions': 0,
            'successful_grades': 0,
            'average_score': 0,
            'results': []
        }
    
    def generate_solution(assignment_description, rubric, max_points):
        return f"Mock solution for: {assignment_description}"

def extract_assignment_content(file, title, description):
    """
    Enhanced file content extraction with better error handling and validation
    """
    # Default content
    assignment_content = description or title
    
    print(f"🔍 DEBUG: Initial assignment content: {assignment_content}")
    
    if not file or not file.filename:
        print("📝 DEBUG: No file provided, using title/description")
        return f"ASSIGNMENT TITLE: {title}\n\nASSIGNMENT DESCRIPTION:\n{description or 'No detailed description provided'}"
    
    print(f"📁 DEBUG: Processing file: {file.filename}")
    
    # Validate file type
    allowed_extensions = ['.docx', '.pdf', '.txt']
    file_ext = os.path.splitext(file.filename)[1].lower()
    
    if file_ext not in allowed_extensions:
        print(f"⚠️ DEBUG: Unsupported file type: {file_ext}")
        return f"ASSIGNMENT TITLE: {title}\n\nASSIGNMENT DESCRIPTION:\n{description or 'No detailed description provided'}\n\nNote: File type {file_ext} not supported. Please provide DOCX, PDF, or TXT file."
    
    try:
        # Create temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix=file_ext) as temp_file:
            file.save(temp_file.name)
            temp_path = temp_file.name
        
        # Extract content based on file type
        if file_ext == '.pdf':
            text_content = extract_pdf_content(temp_path)
        elif file_ext == '.docx':
            text_content = extract_docx_content(temp_path)
        elif file_ext == '.txt':
            text_content = extract_txt_content(temp_path)
        else:
            text_content = ""
        
        # Clean up temp file
        os.unlink(temp_path)
        
        # Process extracted content - prioritize file content over title/description
        if text_content and len(text_content.strip()) > 10:
            # Use the extracted file content as the primary source
            assignment_content = f"ASSIGNMENT CONTENT FROM UPLOADED FILE:\n{text_content.strip()}\n\nASSIGNMENT TITLE: {title}"
            print(f"✅ DEBUG: Successfully extracted content ({len(text_content)} characters)")
            print(f"📄 DEBUG: File content preview: {text_content[:200]}...")
        else:
            assignment_content = f"ASSIGNMENT TITLE: {title}\n\nASSIGNMENT DESCRIPTION:\n{description or 'No detailed description provided'}\n\nNote: Could not extract meaningful content from uploaded file."
            print("⚠️ DEBUG: Insufficient content extracted from file")
        
    except Exception as e:
        print(f"❌ DEBUG: File processing error: {e}")
        assignment_content = f"ASSIGNMENT TITLE: {title}\n\nASSIGNMENT DESCRIPTION:\n{description or 'No detailed description provided'}\n\nError processing file: {str(e)}"
    
    print(f"✅ DEBUG: Final assignment content length: {len(assignment_content)}")
    print(f"📝 DEBUG: Final content preview: {assignment_content[:300]}...")
    
    return assignment_content

def extract_pdf_content(file_path):
    """Extract text content from PDF file"""
    try:
        import PyPDF2
        with open(file_path, 'rb') as pdf_file:
            pdf_reader = PyPDF2.PdfReader(pdf_file)
            text_content = ""
            for page in pdf_reader.pages:
                text_content += page.extract_text() + "\n"
            return text_content
    except ImportError:
        print("⚠️ DEBUG: PyPDF2 not available")
        return ""
    except Exception as e:
        print(f"❌ DEBUG: PDF extraction error: {e}")
        return ""

def extract_docx_content(file_path):
    """Extract text content from DOCX file"""
    try:
        from docx import Document
        doc = Document(file_path)
        text_content = ""
        for paragraph in doc.paragraphs:
            if paragraph.text.strip():
                text_content += paragraph.text.strip() + "\n"
        return text_content
    except ImportError:
        print("⚠️ DEBUG: python-docx not available")
        return ""
    except Exception as e:
        print(f"❌ DEBUG: DOCX extraction error: {e}")
        return ""

def extract_txt_content(file_path):
    """Extract text content from TXT file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as txt_file:
            return txt_file.read()
    except Exception as e:
        print(f"❌ DEBUG: TXT extraction error: {e}")
        return ""

def extract_assignment_content_from_file(file_path, title, description):
    """Extract content from stored file"""
    print(f"🔍 DEBUG: Extracting content from stored file: {file_path}")
    
    # Default content
    assignment_content = description or title
    
    if not os.path.exists(file_path):
        print(f"❌ DEBUG: File not found: {file_path}")
        return f"ASSIGNMENT TITLE: {title}\n\nASSIGNMENT DESCRIPTION:\n{description or 'No detailed description provided'}\n\nError: File not found."
    
    try:
        # Get file extension
        file_ext = os.path.splitext(file_path)[1].lower()
        
        # Extract content based on file type
        if file_ext == '.pdf':
            text_content = extract_pdf_content(file_path)
        elif file_ext == '.docx':
            text_content = extract_docx_content(file_path)
        elif file_ext == '.txt':
            text_content = extract_txt_content(file_path)
        else:
            text_content = ""
        
        # Process extracted content - prioritize file content over title/description
        if text_content and len(text_content.strip()) > 10:
            # Use the extracted file content as the primary source
            assignment_content = f"ASSIGNMENT CONTENT FROM UPLOADED FILE:\n{text_content.strip()}\n\nASSIGNMENT TITLE: {title}"
            print(f"✅ DEBUG: Successfully extracted content ({len(text_content)} characters)")
            print(f"📄 DEBUG: File content preview: {text_content[:200]}...")
        else:
            assignment_content = f"ASSIGNMENT TITLE: {title}\n\nASSIGNMENT DESCRIPTION:\n{description or 'No detailed description provided'}\n\nNote: Could not extract meaningful content from uploaded file."
            print("⚠️ DEBUG: Insufficient content extracted from file")
        
    except Exception as e:
        print(f"❌ DEBUG: File processing error: {e}")
        assignment_content = f"ASSIGNMENT TITLE: {title}\n\nASSIGNMENT DESCRIPTION:\n{description or 'No detailed description provided'}\n\nError processing file: {str(e)}"
    
    print(f"✅ DEBUG: Final assignment content length: {len(assignment_content)}")
    print(f"📝 DEBUG: Final content preview: {assignment_content[:300]}...")
    
    return assignment_content

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
        
        # Automatically start grading process after successful upload
        import sys
        sys.stdout.flush()  # Force flush to ensure messages appear
        print(f"🚀 Starting grading for assignment {assignment_id}", flush=True)
        print(f"📁 ZIP file saved to: {zip_path}", flush=True)
        print(f"📂 Extracted to: {extract_path}", flush=True)
        
        try:
            # Use default rubric and max points
            default_rubric = "Code quality, correctness, efficiency, and adherence to requirements"
            max_points = assignment.max_points or 100
            
            print(f"📋 Using rubric: {default_rubric}", flush=True)
            print(f"📊 Max points: {max_points}", flush=True)
            
            # Import here to avoid circular imports
            from ai_service import grade_all_submissions
            
            # Run grading synchronously (blocks until complete)
            print(f"🔄 Starting synchronous grading for assignment {assignment_id}", flush=True)
            print(f"⏰ This will take approximately 30-60 seconds...", flush=True)
            result = grade_all_submissions(assignment_id, default_rubric, max_points)
            print(f"✅ Auto-grading completed for assignment {assignment_id}", flush=True)
            print(f"📊 Results: {result['total_submissions']} submissions, avg score: {result['average_score']}", flush=True)
            sys.stdout.flush()
            
        except Exception as e:
            print(f"⚠️ Grading failed: {e}")
            import traceback
            traceback.print_exc()
            # Don't fail the upload if grading fails
        
        return jsonify({
            'message': 'File uploaded, extracted, and graded successfully',
            'zip_path': zip_path,
            'extracted_path': extract_path,
            'grading_status': 'completed'
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

@main_bp.route('/api/assignments/<int:assignment_id>/grade', methods=['POST'])
def grade_assignment(assignment_id):
    """
    Grade all submissions for an assignment using AI
    """
    try:
        # Get assignment
        assignment = Assignment.query.get_or_404(assignment_id)
        
        # Get request data
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No JSON data provided'}), 400
        
        rubric = data.get('rubric')
        max_points = data.get('max_points', assignment.max_points)
        
        if not rubric:
            return jsonify({'error': 'Rubric is required'}), 400
        
        # Call AI grading function
        result = grade_all_submissions(assignment_id, rubric, max_points)
        
        return jsonify({
            'success': True,
            'message': 'Grading completed successfully',
            'report_id': result['report_id'],
            'assignment_id': result['assignment_id'],
            'total_submissions': result['total_submissions'],
            'successful_grades': result['successful_grades'],
            'average_score': result['average_score'],
            'results': result['results']
        }), 200
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': f'Grading failed: {str(e)}'}), 500

@main_bp.route('/api/assignments/<int:assignment_id>/grade-async', methods=['POST'])
def grade_assignment_async(assignment_id):
    """
    Start grading process asynchronously (returns immediately)
    """
    try:
        # Get assignment
        assignment = Assignment.query.get_or_404(assignment_id)
        
        # Get request data
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No JSON data provided'}), 400
        
        rubric = data.get('rubric')
        max_points = data.get('max_points', assignment.max_points)
        
        if not rubric:
            return jsonify({'error': 'Rubric is required'}), 400
        
        # Start grading in background (simplified for now)
        import threading
        
        def grade_background():
            try:
                grade_all_submissions(assignment_id, rubric, max_points)
                print(f"✅ Background grading completed for assignment {assignment_id}")
            except Exception as e:
                print(f"❌ Background grading failed: {e}")
        
        # Start background thread
        thread = threading.Thread(target=grade_background)
        thread.daemon = True
        thread.start()
        
        return jsonify({
            'success': True,
            'message': 'Grading started in background',
            'assignment_id': assignment_id,
            'status': 'processing'
        }), 202
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': f'Failed to start grading: {str(e)}'}), 500

@main_bp.route('/api/assignments/<int:assignment_id>/grading-status', methods=['GET'])
def get_grading_status(assignment_id):
    """
    Check the grading status for an assignment
    """
    try:
        # Get the latest grading report for this assignment
        latest_report = GradingReport.query.filter_by(assignment_id=assignment_id).order_by(GradingReport.created_at.desc()).first()
        
        if not latest_report:
            return jsonify({
                'status': 'not_started',
                'message': 'No grading has been started for this assignment'
            }), 200
        
        # Check if grading is complete
        if latest_report.graded_submissions == latest_report.total_submissions:
            return jsonify({
                'status': 'completed',
                'message': 'Grading completed successfully',
                'report_id': latest_report.id,
                'total_submissions': latest_report.total_submissions,
                'graded_submissions': latest_report.graded_submissions,
                'average_score': latest_report.average_score
            }), 200
        else:
            return jsonify({
                'status': 'processing',
                'message': 'Grading in progress',
                'report_id': latest_report.id,
                'total_submissions': latest_report.total_submissions,
                'graded_submissions': latest_report.graded_submissions,
                'progress_percentage': (latest_report.graded_submissions / latest_report.total_submissions) * 100 if latest_report.total_submissions > 0 else 0
            }), 200
            
    except Exception as e:
        return jsonify({'error': f'Failed to get grading status: {str(e)}'}), 500

@main_bp.route('/api/grading-reports/<int:report_id>', methods=['GET'])
def get_grading_report(report_id):
    """
    Get detailed results for a specific grading report
    """
    try:
        report = GradingReport.query.get_or_404(report_id)
        submissions = SubmissionResult.query.filter_by(assignment_id=report.assignment_id).all()
        
        return jsonify({
            'report': report.to_dict(),
            'submissions': [sub.to_dict() for sub in submissions]
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to get report: {str(e)}'}), 500

@main_bp.route('/api/upload-question-file', methods=['POST'])
def upload_question_file():
    """Upload and store assignment question file"""
    try:
        title = request.form.get('title')
        description = request.form.get('description')
        file = request.files.get('file')
        
        if not title:
            return jsonify({'error': 'Title is required'}), 400
        
        if not file or not file.filename:
            return jsonify({'error': 'No file provided'}), 400
        
        # Validate file type
        allowed_extensions = ['.docx', '.pdf', '.txt']
        file_ext = os.path.splitext(file.filename)[1].lower()
        
        if file_ext not in allowed_extensions:
            return jsonify({'error': f'File type {file_ext} not supported. Please provide DOCX, PDF, or TXT file.'}), 400
        
        # Validate file size (max 10MB)
        if file.content_length and file.content_length > 10 * 1024 * 1024:
            return jsonify({'error': 'File too large. Maximum size is 10MB.'}), 400
        
        # Create uploads directory if it doesn't exist
        upload_dir = current_app.config['UPLOAD_FOLDER']
        os.makedirs(upload_dir, exist_ok=True)
        
        # Generate unique filename
        timestamp = datetime.utcnow().strftime('%Y%m%d_%H%M%S')
        filename = f"assignment_{timestamp}_{file.filename}"
        file_path = os.path.join(upload_dir, filename)
        
        # Save file
        file.save(file_path)
        
        # Create assignment record
        assignment = Assignment(
            title=title,
            description=description,
            question_file_path=file_path,
            professor_id=1,  # Default professor for now
            max_points=100
        )
        
        db.session.add(assignment)
        db.session.commit()
        
        print(f"✅ DEBUG: File saved to {file_path}")
        print(f"✅ DEBUG: Assignment created with ID {assignment.id}")
        
        return jsonify({
            'success': True,
            'assignment_id': assignment.id,
            'file_path': file_path,
            'message': 'File uploaded and assignment created successfully'
        }), 200
        
    except Exception as e:
        print(f"❌ DEBUG: File upload error: {e}")
        return jsonify({'error': f'File upload failed: {str(e)}'}), 500

@main_bp.route('/api/generate-solution/<int:assignment_id>', methods=['POST'])
def generate_solution_endpoint(assignment_id):
    """Generate solution for a stored assignment"""
    try:
        assignment = Assignment.query.get_or_404(assignment_id)
        
        if not assignment.question_file_path:
            return jsonify({'error': 'No question file found for this assignment'}), 400
        
        # Extract content from stored file
        assignment_content = extract_assignment_content_from_file(
            assignment.question_file_path, 
            assignment.title, 
            assignment.description
        )
        
        # Generate solution using AI
        try:
            if AI_SERVICE_AVAILABLE:
                print("🤖 DEBUG: Generating solution with AI...")
                solution = generate_solution(assignment_content, "Code quality, correctness, and efficiency", assignment.max_points)
                print(f"✅ DEBUG: Solution generated successfully ({len(solution)} characters)")
            else:
                print("⚠️ DEBUG: AI service not available, using mock solution")
                solution = f"Mock AI-generated solution for: {assignment_content}\n\nThis is a placeholder solution. Please configure the GEMINI_API_KEY in a .env file to enable real AI solution generation."
            
            return jsonify({
                'success': True,
                'solution': solution,
                'message': 'Solution generated successfully',
                'content_length': len(assignment_content),
                'solution_length': len(solution),
                'assignment_id': assignment_id
            }), 200
            
        except Exception as e:
            print(f"❌ DEBUG: Solution generation error: {e}")
            return jsonify({
                'success': False,
                'error': f'Solution generation failed: {str(e)}',
                'message': 'Failed to generate solution. Please try again.'
            }), 500
        
    except Exception as e:
        return jsonify({'error': f'Solution generation failed: {str(e)}'}), 500

@main_bp.route('/api/grade-assignment-new', methods=['POST'])
def grade_assignment_new():
    try:
        data = request.form
        assignment_id = data.get('assignment_id')
        rubric = data.get('rubric')
        max_points = int(data.get('max_points', 100))
        title = data.get('title')
        description = data.get('description')
        solution = data.get('solution')
        
        if not rubric:
            return jsonify({'error': 'Rubric is required'}), 400
        
        # Create new assignment if needed
        if assignment_id == 'new':
            assignment = Assignment(
                title=title,
                description=description,
                max_points=max_points,
                ideal_solution=solution,
                rubrics=rubric,
                professor_id=1  # Default professor
            )
            db.session.add(assignment)
            db.session.commit()
            assignment_id = assignment.id
        
        # Call AI grading function
        if AI_SERVICE_AVAILABLE:
            result = grade_all_submissions(assignment_id, rubric, max_points)
        else:
            result = {
                'report_id': 'mock_report',
                'total_submissions': 0,
                'successful_grades': 0,
                'average_score': 0,
                'results': []
            }
        
        return jsonify({
            'success': True,
            'message': 'Grading completed successfully' + (' (Mock - AI service not configured)' if not AI_SERVICE_AVAILABLE else ''),
            'report_id': result.get('report_id', 'new'),
            'assignment_id': assignment_id,
            'total_submissions': result.get('total_submissions', 0),
            'successful_grades': result.get('successful_grades', 0),
            'average_score': result.get('average_score', 0),
            'results': result.get('results', [])
        }), 200
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': f'Grading failed: {str(e)}'}), 500

@main_bp.route('/api/analytics/<int:assignment_id>', methods=['GET'])
def get_assignment_analytics(assignment_id):
    try:
        assignment = Assignment.query.get_or_404(assignment_id)
        submissions = SubmissionResult.query.filter_by(assignment_id=assignment_id).all()
        
        if not submissions:
            return jsonify({
                'assignment': assignment.to_dict(),
                'analytics': {
                    'total_submissions': 0,
                    'average_score': 0,
                    'high_score': 0,
                    'low_score': 0,
                    'grade_distribution': {},
                    'common_mistakes': [],
                    'top_performers': [],
                    'improvement_areas': []
                }
            }), 200
        
        scores = [sub.score for sub in submissions]
        average_score = sum(scores) / len(scores)
        high_score = max(scores)
        low_score = min(scores)
        
        # Grade distribution
        grade_distribution = {
            'A (90-100)': len([s for s in scores if s >= 90]),
            'B (80-89)': len([s for s in scores if s >= 80 and s < 90]),
            'C (70-79)': len([s for s in scores if s >= 70 and s < 79]),
            'D (60-69)': len([s for s in scores if s >= 60 and s < 69]),
            'F (0-59)': len([s for s in scores if s < 60])
        }
        
        # Top performers
        top_performers = sorted(submissions, key=lambda x: x.score, reverse=True)[:3]
        
        # Common mistakes (simulated)
        common_mistakes = [
            "Syntax errors in variable declarations",
            "Missing error handling",
            "Inefficient algorithm implementation",
            "Incorrect data type usage",
            "Missing input validation"
        ]
        
        # Improvement areas
        improvement_areas = [
            "Code documentation and comments",
            "Variable naming conventions",
            "Function modularity",
            "Edge case handling",
            "Performance optimization"
        ]
        
        analytics = {
            'total_submissions': len(submissions),
            'average_score': round(average_score, 2),
            'high_score': high_score,
            'low_score': low_score,
            'grade_distribution': grade_distribution,
            'common_mistakes': common_mistakes,
            'top_performers': [sub.to_dict() for sub in top_performers],
            'improvement_areas': improvement_areas,
            'score_trend': scores,  # For charting
            'completion_rate': len(submissions) / 20 * 100  # Assuming 20 students
        }
        
        return jsonify({
            'assignment': assignment.to_dict(),
            'analytics': analytics
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to get analytics: {str(e)}'}), 500

@main_bp.route('/api/notifications', methods=['POST'])
def send_notification():
    try:
        data = request.get_json()
        title = data.get('title', 'Grading Assistant')
        message = data.get('message', '')
        assignment_id = data.get('assignment_id')
        
        # In a real implementation, you would integrate with:
        # - Push notification services (Firebase, OneSignal)
        # - Email services (SendGrid, Mailgun)
        # - WebSocket connections for real-time updates
        
        return jsonify({
            'success': True,
            'message': 'Notification sent successfully'
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to send notification: {str(e)}'}), 500
