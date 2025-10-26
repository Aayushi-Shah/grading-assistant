import google.generativeai as genai
import os
import json
import re
from dotenv import load_dotenv

load_dotenv()
genai.configure(api_key=os.getenv('GEMINI_API_KEY'))

def test_gemini():
    """Test if Gemini API key is working correctly"""
    try:
        model = genai.GenerativeModel('gemini-2.5-flash')
        response = model.generate_content("Which company created the iphone?")
        
        print("✅ Gemini API is working!")
        print(f"Response: {response.candidates[0].content.parts[0].text}")
        return True
        
    except Exception as e:
        print(f"❌ Gemini API Error: {str(e)}")
        return False

def generate_solution(assignment_description, rubric, max_points):
    """
    Generate a reference solution for a coding assignment.
    
    Args:
        assignment_description (str): Description of the assignment
        rubric (str): Grading rubric/criteria
        max_points (int): Maximum points for the assignment
    
    Returns:
        str: Python code as a string
    """
    model = genai.GenerativeModel('gemini-2.5-pro')
    
    prompt = f"""You are an expert programming instructor. Generate a reference solution.

Assignment Description:
{assignment_description}

Grading Rubric:
{rubric}

Maximum Points: {max_points}

Requirements:
1. Write clean, well-commented Python code
2. Implement all features from the assignment description
3. Follow Python best practices
4. Output ONLY the code, no markdown or explanations
5. Ensure the code is executable and complete

Python Code:"""
    
    try:
        response = model.generate_content(prompt)
        code = response.candidates[0].content.parts[0].text.strip()
        
        # Clean up markdown code blocks if present
        if code.startswith('```python'):
            code = code.split('```python')[1].split('```')[0].strip()
        elif code.startswith('```'):
            code = code.split('```')[1].split('```')[0].strip()
            
        return code
    except Exception as e:
        raise Exception(f"Solution generation failed: {str(e)}")

def grade_submission(student_code, assignment_description, rubric, reference_solution, max_points):
    """
    Grade a single student submission.
    
    Args:
        student_code (str): The student's code
        assignment_description (str): Description of the assignment
        rubric (str): Grading rubric/criteria
        reference_solution (str): Reference solution code
        max_points (int): Maximum points for the assignment
    
    Returns:
        dict: {"score": float, "feedback": str, "status": str}
    """
    model = genai.GenerativeModel('gemini-2.5-pro')
    
    prompt = f"""You are a fair programming grader. Grade this student submission.

Assignment:
{assignment_description}

Grading Rubric:
{rubric}

Reference Solution:
{reference_solution}

Student Submission:
{student_code}

Maximum Points: {max_points}

Grade the submission and return ONLY a JSON object with this EXACT format:
{{
  "score": <number between 0 and {max_points}>,
  "feedback": "<detailed feedback explaining the grade>"
}}

Grading Guidelines:
- Award full points for correct, working code
- Deduct points for errors, incomplete features, poor style
- Be specific about what caused deductions
- Keep feedback under 100 words
- If code has syntax errors, score should be low but not zero unless completely empty

JSON Output:"""

    max_retries = 3
    for attempt in range(max_retries):
        try:
            response = model.generate_content(prompt)
            result_text = response.candidates[0].content.parts[0].text.strip()
            
            # Try to extract JSON from response
            json_match = re.search(r'\{[^{}]*"score"[^{}]*"feedback"[^{}]*\}', 
                                   result_text, re.DOTALL)
            
            if json_match:
                result_text = json_match.group(0)
            
            # Parse JSON
            result = json.loads(result_text)
            
            # Validate structure
            if "score" not in result or "feedback" not in result:
                raise ValueError("Missing required fields")
            
            # Normalize score
            score = float(result["score"])
            score = max(0, min(score, max_points))
            
            # Clean feedback
            feedback = str(result["feedback"]).strip()
            
            return {
                "score": score,
                "feedback": feedback,
                "status": "graded"
            }
            
        except json.JSONDecodeError as e:
            if attempt == max_retries - 1:
                return {
                    "score": 0,
                    "feedback": f"Grading error: Unable to parse AI response",
                    "status": "error"
                }
            continue
        except Exception as e:
            if attempt == max_retries - 1:
                return {
                    "score": 0,
                    "feedback": f"Grading error: {str(e)}",
                    "status": "error"
                }
            continue
    
        return {
            "score": 0,
            "feedback": "Grading failed after multiple attempts",
            "status": "error"
        }

def grade_all_submissions(assignment_id, rubric, max_points):
    """
    Grade all submissions for an assignment.
    This function integrates with Person 2's database models.
    
    Args:
        assignment_id (int): ID of the assignment in the database
        rubric (str): Grading rubric/criteria
        max_points (int): Maximum points for the assignment
    
    Returns:
        dict: Summary of grading results
    """
    from models import db, Assignment, GradingReport, SubmissionResult
    from datetime import datetime
    import os
    
    print(f"🚀 Starting batch grading for Assignment ID: {assignment_id}")
    print("=" * 60)
    
    # Get assignment from database
    assignment = Assignment.query.get(assignment_id)
    if not assignment:
        raise ValueError(f"Assignment {assignment_id} not found")
    
    print(f"Assignment: {assignment.title}")
    print(f"Max Points: {max_points}")
    
    # Check if files were uploaded and extracted
    if not assignment.extracted_folder_path:
        raise ValueError("No submissions uploaded for this assignment")
    
    extracted_path = assignment.extracted_folder_path
    print(f"Extracted folder: {extracted_path}")
    
    # Find all Python files
    python_files = []
    for root, dirs, files in os.walk(extracted_path):
        for file in files:
            if file.endswith('.py'):
                python_files.append(os.path.join(root, file))
    
    if not python_files:
        raise ValueError("No Python files found in submission")
    
    print(f"Found {len(python_files)} Python files to grade")
    
    # Generate reference solution
    print("\nStep 1: Generating reference solution...")
    try:
        reference_solution = generate_solution(
            assignment.description or "Code assignment",
            rubric,
            max_points
        )
        print("✅ Reference solution generated!")
    except Exception as e:
        print(f"❌ Solution generation failed: {e}")
        raise
    
    # Create grading report
    print("\nStep 2: Creating grading report...")
    report = GradingReport(
        assignment_id=assignment_id,
        report_name=f"{assignment.title} - AI Grading Report",
        total_submissions=len(python_files),
        graded_submissions=0
    )
    db.session.add(report)
    db.session.commit()
    print(f"✅ Grading report created (ID: {report.id})")
    
    # Grade each submission
    print(f"\nStep 3: Grading {len(python_files)} submissions...")
    results = []
    total_score = 0
    successful_grades = 0
    
    for i, file_path in enumerate(python_files):
        print(f"Grading {i+1}/{len(python_files)}: {os.path.basename(file_path)}")
        
        # Read student code
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                student_code = f.read()
        except Exception as e:
            print(f"  ⚠️  Error reading file: {e}")
            student_code = ""
        
        # Extract student name from filename
        student_name = os.path.basename(file_path).replace('.py', '')
        
        # Grade the submission
        try:
            grade_result = grade_submission(
                student_code,
                assignment.description or "Code assignment",
                rubric,
                reference_solution,
                max_points
            )
            
            # Save to database
            submission = SubmissionResult(
                assignment_id=assignment_id,
                student_name=student_name,
                submission_path=file_path,
                score=grade_result["score"],
                max_score=max_points,
                feedback=grade_result["feedback"],
                grading_status=grade_result["status"],
                graded_at=datetime.utcnow()
            )
            db.session.add(submission)
            
            total_score += grade_result["score"]
            successful_grades += 1
            
            results.append({
                "student_name": student_name,
                "score": grade_result["score"],
                "feedback": grade_result["feedback"],
                "status": grade_result["status"]
            })
            
            print(f"  ✅ Score: {grade_result['score']}/{max_points}")
            
        except Exception as e:
            print(f"  ❌ Grading failed: {e}")
            
            # Save error result
            submission = SubmissionResult(
                assignment_id=assignment_id,
                student_name=student_name,
                submission_path=file_path,
                score=0,
                max_score=max_points,
                feedback=f"Grading error: {str(e)}",
                grading_status="error",
                graded_at=datetime.utcnow()
            )
            db.session.add(submission)
            
            results.append({
                "student_name": student_name,
                "score": 0,
                "feedback": f"Grading error: {str(e)}",
                "status": "error"
            })
    
    # Update report statistics
    report.graded_submissions = successful_grades
    report.average_score = total_score / successful_grades if successful_grades > 0 else 0
    db.session.commit()
    
    print(f"\n✅ Batch grading completed!")
    print(f"Successfully graded: {successful_grades}/{len(python_files)}")
    print(f"Average score: {report.average_score:.1f}/{max_points}")
    
    return {
        "report_id": report.id,
        "assignment_id": assignment_id,
        "generated_solution": reference_solution,
        "results": results,
        "average_score": report.average_score,
        "total_submissions": len(python_files),
        "successful_grades": successful_grades
    }

if __name__ == "__main__":
    print("Testing Gemini API connection...")
    test_gemini()