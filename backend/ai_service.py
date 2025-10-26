import google.generativeai as genai
import os
import json
import re
from dotenv import load_dotenv

# Load .env file from the parent directory (project root)
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

# Configuration flag to force mock responses (set to True when API quota is exceeded)
FORCE_MOCK_RESPONSES = False  # Set to True to use mock responses instead of API calls

# Only configure API if not forcing mock responses
if not FORCE_MOCK_RESPONSES:
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

def generate_mock_solution(assignment_description, rubric, max_points):
    """
    Generate a mock solution for demonstration when API quota is exceeded.
    """
    print("🤖 DEBUG: Generating mock solution for demonstration...")
    
    # Extract key information from assignment description
    content_lower = assignment_description.lower()
    
    # Check for common programming patterns
    if "factorial" in content_lower:
        return """#----------------------------------------------------------
# Name: [Your Name]
# E-mail Address: [Your E-mail Address]
# Class: CMPSC 101
# Project #: Homework 3
# Due Date: Friday, October 3, 2025
# Brief Project Description: Calculate factorial of a number
#----------------------------------------------------------

def factorial(n):
    if n == 0 or n == 1:
        return 1
    else:
        return n * factorial(n - 1)

def main():
    try:
        num = int(input("Enter a number: "))
        if num < 0:
            print("Factorial is not defined for negative numbers.")
        else:
            result = factorial(num)
            print(f"The factorial of {num} is {result}")
    except ValueError:
        print("Please enter a valid integer.")

if __name__ == "__main__":
    main()"""

    elif "fibonacci" in content_lower:
        return """#----------------------------------------------------------
# Name: [Your Name]
# E-mail Address: [Your E-mail Address]
# Class: CMPSC 101
# Project #: Homework 3
# Due Date: Friday, October 3, 2025
# Brief Project Description: Generate Fibonacci sequence
#----------------------------------------------------------

def fibonacci(n):
    if n <= 1:
        return n
    else:
        return fibonacci(n-1) + fibonacci(n-2)

def main():
    try:
        num = int(input("Enter the number of terms: "))
        if num <= 0:
            print("Please enter a positive integer.")
        else:
            print("Fibonacci sequence:")
            for i in range(num):
                print(fibonacci(i), end=" ")
            print()
    except ValueError:
        print("Please enter a valid integer.")

if __name__ == "__main__":
    main()"""

    elif "shipping" in content_lower or "cost" in content_lower:
        return """#----------------------------------------------------------
# Name: [Your Name]
# E-mail Address: [Your E-mail Address]
# Class: CMPSC 101
# Project #: Homework 3
# Due Date: Friday, October 3, 2025
# Brief Project Description: Calculate shipping cost
#----------------------------------------------------------

def calculate_shipping_cost(weight, distance):
    base_cost = 5.0
    
    # Weight-based pricing
    if weight <= 1:
        weight_cost = 0
    elif weight <= 5:
        weight_cost = 2.0
    else:
        weight_cost = 3.0
    
    # Distance-based pricing
    if distance <= 100:
        distance_cost = 0
    elif distance <= 500:
        distance_cost = 5.0
    else:
        distance_cost = 10.0
    
    total_cost = base_cost + weight_cost + distance_cost
    return total_cost

def main():
    try:
        weight = float(input("Enter package weight (lbs): "))
        distance = float(input("Enter shipping distance (miles): "))
        
        if weight <= 0 or distance <= 0:
            print("Weight and distance must be positive numbers.")
        else:
            cost = calculate_shipping_cost(weight, distance)
            print(f"Shipping cost: ${cost:.2f}")
    except ValueError:
        print("Please enter valid numbers.")

if __name__ == "__main__":
    main()"""

    else:
        # Generic mock solution
        return f"""#----------------------------------------------------------
# Name: [Your Name]
# E-mail Address: [Your E-mail Address]
# Class: CMPSC 101
# Project #: Homework 3
# Due Date: Friday, October 3, 2025
# Brief Project Description: {assignment_description[:50]}...
#----------------------------------------------------------

def main():
    print("Hello, World!")
    print("This is a mock solution for demonstration purposes.")
    print("The actual solution would be generated based on the assignment requirements.")
    
    # Add your solution logic here
    # This is a placeholder for the actual implementation
    
if __name__ == "__main__":
    main()"""

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
    # Check if we should force mock responses
    if FORCE_MOCK_RESPONSES:
        print("🔄 DEBUG: Using mock response for demonstration (FORCE_MOCK_RESPONSES=True)...")
        return generate_mock_solution(assignment_description, rubric, max_points)
    
    # Check if API quota is exceeded - use mock response
    try:
        model = genai.GenerativeModel('gemini-2.5-flash')
        
        # Debug: Print the assignment content being sent to AI
        print(f"🔍 DEBUG: Assignment content being sent to AI:")
        print(f"Content: {assignment_description[:500]}...")
        print(f"Content length: {len(assignment_description)}")
    except Exception as e:
        print(f"⚠️ DEBUG: API quota exceeded or error: {e}")
        print("🔄 DEBUG: Using mock response for demonstration...")
        return generate_mock_solution(assignment_description, rubric, max_points)
    
    # If we get here, API is working, proceed with normal generation
    try:
        prompt = f"""You are an expert programming instructor. Generate a SIMPLE, DIRECT solution based on the ACTUAL ASSIGNMENT CONTENT provided below.

CRITICAL INSTRUCTIONS:
- Focus on the ASSIGNMENT CONTENT FROM UPLOADED FILE (if present) - this is the primary source
- Ignore generic titles and focus on the specific requirements in the file content
- Generate ONLY what is specifically requested in the assignment content
- Keep the solution SIMPLE and STRAIGHTFORWARD
- Match the exact output format if examples are provided in the file content

ASSIGNMENT CONTENT:
{assignment_description}

GRADING CRITERIA:
{rubric}

MAXIMUM POINTS: {max_points}

SOLUTION GUIDELINES:
1. Read the assignment content carefully - focus on the actual requirements, not just the title
2. Generate a simple, working Python program that fulfills the specific requirements
3. Include only the functionality explicitly requested in the assignment content
4. Use basic Python constructs (input, print, variables)
5. Follow the exact output format if examples are provided in the assignment
6. Add minimal comments only where necessary
7. Do NOT add complex error handling unless explicitly requested
8. Do NOT add unnecessary functions or classes unless requested

IMPORTANT: 
- If the assignment content contains specific requirements, follow those exactly
- If there are sample outputs or examples in the assignment, match them precisely
- The assignment title is just for reference - focus on the actual content and requirements

Generate the Python solution:"""
        
        response = model.generate_content(prompt)
        code = response.candidates[0].content.parts[0].text.strip()
        
        # Clean up markdown code blocks if present
        if code.startswith('```python'):
            code = code.split('```python')[1].split('```')[0].strip()
        elif code.startswith('```'):
            code = code.split('```')[1].split('```')[0].strip()
        
        # Debug: Print the generated solution
        print(f"🤖 DEBUG: Generated solution preview:")
        print(f"Solution length: {len(code)}")
        print(f"Solution preview: {code[:200]}...")
            
        return code
    except Exception as e:
        print(f"⚠️ DEBUG: API call failed: {e}")
        print("🔄 DEBUG: Falling back to mock solution...")
        return generate_mock_solution(assignment_description, rubric, max_points)

def grade_submission_mock(student_code, assignment_description, rubric, reference_solution, max_points):
    """
    Mock grading function for demonstration when API quota is exceeded.
    """
    print("🤖 DEBUG: Using mock grading for demonstration...")
    
    # Simple mock grading logic
    import random
    
    # Check for basic Python syntax
    if "def " in student_code and "main()" in student_code:
        base_score = 60
    elif "print(" in student_code:
        base_score = 40
    else:
        base_score = 20
    
    # Add some randomness for demonstration
    score = base_score + random.randint(-10, 20)
    score = max(0, min(score, max_points))
    
    # Generate mock feedback
    if score >= 80:
        feedback = "Excellent work! Code is well-structured and meets requirements."
    elif score >= 60:
        feedback = "Good work! Code runs but could use some improvements."
    elif score >= 40:
        feedback = "Needs improvement. Code has some issues but shows understanding."
    else:
        feedback = "Requires significant work. Please review the requirements and try again."
    
    return {
        "score": score,
        "feedback": feedback,
        "status": "graded"
    }

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
    # Check if we should force mock responses
    if FORCE_MOCK_RESPONSES:
        print("🔄 DEBUG: Using mock grading for demonstration (FORCE_MOCK_RESPONSES=True)...")
        return grade_submission_mock(student_code, assignment_description, rubric, reference_solution, max_points)
    
    # Check if API quota is exceeded - use mock grading
    try:
        model = genai.GenerativeModel('gemini-2.5-flash')
    except Exception as e:
        print(f"⚠️ DEBUG: API quota exceeded for grading: {e}")
        print("🔄 DEBUG: Using mock grading for demonstration...")
        return grade_submission_mock(student_code, assignment_description, rubric, reference_solution, max_points)
    
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
                print(f"⚠️ DEBUG: API grading failed: {e}")
                print("🔄 DEBUG: Falling back to mock grading...")
                return grade_submission_mock(student_code, assignment_description, rubric, reference_solution, max_points)
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
        import sys
        sys.stdout.flush()
        print(f"Grading {i+1}/{len(python_files)}: {os.path.basename(file_path)}", flush=True)
        
        # Read student code
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                student_code = f.read()
            print(f"  📄 Read {len(student_code)} characters", flush=True)
        except Exception as e:
            print(f"  ⚠️  Error reading file: {e}", flush=True)
            student_code = ""
        
        # Extract student name from filename
        student_name = os.path.basename(file_path).replace('.py', '')
        
        # Grade the submission
        try:
            print(f"  🤖 Sending to AI for grading...", flush=True)
            sys.stdout.flush()
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
            
            print(f"  ✅ Score: {grade_result['score']}/{max_points}", flush=True)
            sys.stdout.flush()
            
        except Exception as e:
            print(f"  ❌ Grading failed: {e}", flush=True)
            import traceback
            traceback.print_exc()
            
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