import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Bot, 
  Sun, 
  Moon, 
  GraduationCap,
  Calendar,
  Target,
  Users,
  Eye,
  Download
} from 'lucide-react';

interface Professor {
  id: number;
  name: string;
  email: string;
  department: string;
}

interface Assignment {
  id: number;
  title: string;
  description: string;
  due_date: string;
  max_points: number;
  professor_id: number;
  created_at: string;
}

interface ChatMessage {
  id: number;
  text: string;
  isUser: boolean;
}

// Memoized Assignment Card Component to prevent unnecessary re-renders
const AssignmentCard = React.memo(({ assignment, index }: { assignment: Assignment; index: number }) => {
  return (
    <motion.div 
      key={assignment.id} 
      className="bg-gradient-to-br from-white to-blue-50/30 dark:from-gray-700 dark:to-gray-600/30 rounded-2xl border border-gray-200/50 dark:border-gray-600/50 p-6 hover:shadow-xl transition-all duration-300 cursor-pointer group"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.2 + index * 0.1, duration: 0.4 }}
      whileHover={{ 
        scale: 1.02, 
        boxShadow: "0 10px 25px rgba(0,0,0,0.1)" 
      }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-3">
            <div className="bg-blue-100 dark:bg-blue-900/20 p-2 rounded-lg group-hover:bg-blue-200 dark:group-hover:bg-blue-800/30 transition-colors">
              <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {assignment.title}
            </h4>
          </div>
          
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
            {assignment.description}
          </p>
          
          <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4" />
              <span>Due: {new Date(assignment.due_date).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Target className="w-4 h-4" />
              <span>{assignment.max_points} pts</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-sm text-gray-600 dark:text-gray-400">Active</span>
        </div>
        
        <div className="flex space-x-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg text-xs font-medium flex items-center space-x-1 transition-colors"
          >
            <Eye className="w-3 h-3" />
            <span>View</span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-lg text-xs font-medium flex items-center space-x-1 transition-colors"
          >
            <Download className="w-3 h-3" />
            <span>CSV</span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
});

const SimpleDashboard: React.FC = () => {
  const [professor, setProfessor] = useState<Professor | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  
  // Memoize assignments to prevent unnecessary re-renders
  const memoizedAssignments = useMemo(() => assignments, [assignments]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  
  // Assignment creation workflow state
  const [assignmentData, setAssignmentData] = useState({
    title: '',
    description: '',
    file: null as File | null,
    solution: '',
    rubrics: '',
    maxPoints: 100,
    assignmentId: null as number | null
  });

  const [isGeneratingSolution, setIsGeneratingSolution] = useState(false);
  const [isGrading, setIsGrading] = useState(false);
  const [gradingProgress, setGradingProgress] = useState(0);
  const [showSolutionModal, setShowSolutionModal] = useState(false);
  const [solutionChangeCount, setSolutionChangeCount] = useState(0);

  // Stats calculation
  const stats = {
    totalAssignments: assignments.length,
    totalSubmissions: assignments.reduce((sum, assignment) => sum + Math.floor(Math.random() * 20) + 5, 0),
    averageScore: Math.floor(Math.random() * 20) + 75
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
    if (newTheme) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  useEffect(() => {
    // Parse URL parameters to identify professor
    const urlParams = new URLSearchParams(window.location.search);
    const professorId = urlParams.get('professor_id') || urlParams.get('prof_id') || urlParams.get('id');
    
    console.log('URL Parameters:', {
      professor_id: urlParams.get('professor_id'),
      prof_id: urlParams.get('prof_id'),
      id: urlParams.get('id'),
      selectedId: professorId
    });
    
    fetchDashboardData(professorId);
  }, []);

  const fetchDashboardData = async (professorId?: string | null) => {
    try {
      let selectedProfessor = null;
      
      // Try to fetch specific professor by ID
      if (professorId) {
        console.log(`Fetching professor with ID: ${professorId}`);
        try {
          const professorResponse = await fetch(`http://localhost:5002/api/professors/${professorId}`);
          if (professorResponse.ok) {
            selectedProfessor = await professorResponse.json();
            console.log('Professor found:', selectedProfessor);
          } else {
            console.warn(`Professor with ID ${professorId} not found (${professorResponse.status})`);
          }
        } catch (error) {
          console.error(`Error fetching professor ${professorId}:`, error);
        }
      }
      
      // Fallback to first professor if no ID provided or professor not found
      if (!selectedProfessor) {
        console.log('Fetching all professors as fallback...');
        try {
          const professorResponse = await fetch('http://localhost:5002/api/professors');
          if (professorResponse.ok) {
      const professors = await professorResponse.json();
      if (professors.length > 0) {
              selectedProfessor = professors[0];
              console.log('Using first professor as fallback:', selectedProfessor);
            } else {
              console.warn('No professors found in database');
            }
          }
        } catch (error) {
          console.error('Error fetching professors list:', error);
        }
      }
      
      setProfessor(selectedProfessor);
      console.log('Professor set in state:', selectedProfessor);

      // Fetch assignments for the selected professor
      console.log('Fetching assignments...');
      const assignmentsResponse = await fetch('http://localhost:5002/api/assignments');
      if (assignmentsResponse.ok) {
      const assignmentsData = await assignmentsResponse.json();
      setAssignments(assignmentsData);
        console.log('Assignments loaded:', assignmentsData.length);
      } else {
        console.error('Error fetching assignments:', assignmentsResponse.status);
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const addBotMessage = (text: string) => {
    const botMessage = {
      id: Date.now(),
      text: text,
      isUser: false
    };
    setChatMessages(prev => [...prev, botMessage]);
  };

  // Assignment creation workflow functions (3 steps)
  const startAssignmentCreation = () => {
    addBotMessage("🎯 **Let's create a new assignment!**\n\n**Step 1/3: Assignment Title**\nWhat would you like to call this assignment?");
    setCurrentStep(1);
  };

  const handleAssignmentTitle = (title: string) => {
    setAssignmentData(prev => ({ ...prev, title, description: title })); // Use title as description too
    addBotMessage(`📄 **Step 2/3: Upload Assignment Question Paper**\nGreat! Now upload the assignment question paper (DOCX or PDF format) for "${title}":`);
    setCurrentStep(2);
    
    // Add upload interface as a bot message
    setTimeout(() => {
      addBotMessage(`**Please use the file upload button below to upload your assignment question paper:**`);
    }, 500);
  };

  const handleFileUpload = (file: File) => {
    // Validate file type
    const allowedTypes = ['.docx', '.pdf', '.txt'];
    const fileExt = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (!allowedTypes.includes(fileExt)) {
      addBotMessage(`❌ **Invalid file type!**\n\nPlease upload a DOCX, PDF, or TXT file. You uploaded: ${file.name}`);
      return;
    }
    
    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      addBotMessage(`❌ **File too large!**\n\nPlease upload a file smaller than 10MB. Your file is: ${(file.size / 1024 / 1024).toFixed(1)}MB`);
      return;
    }
    
    setAssignmentData(prev => ({ ...prev, file }));
    addBotMessage(`📁 **File Uploaded Successfully!**\n\nFile: ${file.name} (${(file.size / 1024).toFixed(1)}KB)\n\n🤖 **Step 3/3: Generate Solution**\n\nNow I'll generate a reference solution using AI. This may take a moment...`);
    setCurrentStep(3);
    generateSolution(file);
  };

  const generateSolution = async (file?: File) => {
    setIsGeneratingSolution(true);
    try {
      // Debug: Check if we have the required data
      console.log('Assignment data:', assignmentData);
      console.log('File parameter:', file);
      console.log('File parameter type:', typeof file);
      console.log('File parameter name:', file?.name);
      console.log('File parameter size:', file?.size);
      
      if (!assignmentData.title || !assignmentData.description) {
        addBotMessage(`❌ **Error: Missing assignment information.** Please start over and provide a title.`);
        setIsGeneratingSolution(false);
        return;
      }

      // Step 1: Upload file and create assignment
      const formData = new FormData();
      formData.append('title', assignmentData.title);
      formData.append('description', assignmentData.description);
      
      // Use the file parameter if provided, otherwise use the file from state
      const fileToUpload = file || assignmentData.file;
      console.log('File to upload:', fileToUpload);
      console.log('File from parameter:', file);
      console.log('File from state:', assignmentData.file);
      
      if (!fileToUpload) {
        addBotMessage(`❌ **Error: No file provided.** Please upload a file first.`);
        setIsGeneratingSolution(false);
        return;
      }

      formData.append('file', fileToUpload);
      console.log('File attached to FormData:', fileToUpload.name, fileToUpload.size);

      // Upload file and create assignment
      const uploadResponse = await fetch('http://localhost:5002/api/upload-question-file', {
        method: 'POST',
        body: formData
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json().catch(() => ({}));
        throw new Error(errorData.error || `Upload failed with status ${uploadResponse.status}`);
      }

      const uploadResult = await uploadResponse.json();
      console.log('Upload result:', uploadResult);
      
      // Step 2: Generate solution using the assignment ID
      const solutionResponse = await fetch(`http://localhost:5002/api/generate-solution/${uploadResult.assignment_id}`, {
        method: 'POST'
      });

      if (solutionResponse.ok) {
        const result = await solutionResponse.json();
        setAssignmentData(prev => ({ ...prev, solution: result.solution, file: fileToUpload || prev.file, assignmentId: result.assignment_id }));
        
        // Show success message with file info
        const fileToShow = fileToUpload || assignmentData.file;
        const fileInfo = fileToShow ? `\n\n📁 **File processed:** ${fileToShow.name}` : '';
        const contentInfo = result.content_length ? `\n📊 **Content extracted:** ${result.content_length} characters` : '';
        const solutionInfo = result.solution_length ? `\n🤖 **Solution generated:** ${result.solution_length} characters` : '';
        
        addBotMessage(`✅ **Solution Generated Successfully!**\n\nI've created a reference solution based on your assignment.${fileInfo}${contentInfo}${solutionInfo}\n\nPlease review it and let me know if you'd like any changes.`);
        console.log('🔍 DEBUG: Setting showSolutionModal to true');
        console.log('🔍 DEBUG: Solution content:', result.solution);
        setShowSolutionModal(true);
      } else {
        const errorData = await solutionResponse.json().catch(() => ({}));
        console.error('Solution generation error:', solutionResponse.status, errorData);
        
        let errorMessage = `❌ **Error generating solution (${solutionResponse.status}).**`;
        if (errorData.error) {
          errorMessage += `\n\n**Error details:** ${errorData.error}`;
        }
        if (errorData.message) {
          errorMessage += `\n\n**Message:** ${errorData.message}`;
        }
        errorMessage += `\n\nPlease try again or contact support if the issue persists.`;
        
        addBotMessage(errorMessage);
      }
    } catch (error) {
      console.error('Solution generation error:', error);
      addBotMessage(`❌ **Error generating solution.** Please try again.`);
    }
    setIsGeneratingSolution(false);
  };

  const approveSolution = () => {
    addBotMessage(`✅ **Solution Approved!**\n\nNow upload the ZIP file containing student submissions to start grading:`);
    setShowSolutionModal(false);
    setCurrentStep(4);
    
    // Add upload interface as a bot message
    setTimeout(() => {
      addBotMessage(`**Please use the file upload button below to upload student submissions:**`);
    }, 500);
  };

  const requestSolutionChange = () => {
    const newChangeCount = solutionChangeCount + 1;
    setSolutionChangeCount(newChangeCount);
    addBotMessage(`🔄 **Requesting Solution Changes** (Attempt ${newChangeCount})\n\nWhat would you like me to change in the solution?`);
    setShowSolutionModal(false);
  };

  const handleStudentSubmissionsUpload = async (file: File) => {
    addBotMessage(`📁 **Student Submissions Uploaded!**\n\nFile: ${file.name} (${(file.size / 1024).toFixed(1)}KB)\n\nNow uploading student submissions and starting grading process...`);
    
    try {
      // Check if we have a valid assignment ID
      if (!assignmentData.assignmentId) {
        throw new Error('No assignment ID found. Please start the workflow from the beginning.');
      }
      
      console.log('🔍 DEBUG: Uploading ZIP to assignment ID:', assignmentData.assignmentId);
      
      // Upload the student submissions ZIP file to the assignment
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);
      
      addBotMessage(`⏳ **Uploading and processing... This may take up to a minute...**\n\nPlease wait while the system:\n• Uploads your ZIP file\n• Extracts all Python files\n• Generates a reference solution\n• Grades each student submission`);
      
      const uploadResponse = await fetch(`http://localhost:5002/api/assignments/${assignmentData.assignmentId}/upload`, {
        method: 'POST',
        body: uploadFormData
      });
      
      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        console.error('❌ Upload failed:', uploadResponse.status, errorText);
        throw new Error(`Upload failed: ${uploadResponse.status} - ${errorText}`);
      }
      
      const uploadResult = await uploadResponse.json();
      console.log('✅ Upload successful:', uploadResult);
      
      addBotMessage(`✅ **Grading completed successfully!**\n\nThe system has:\n• Extracted ${uploadResult.total_submissions || 'multiple'} Python files\n• Generated a reference solution\n• Graded each student submission\n• Saved results to the database\n\n🎉 **You can now view the complete grading report!**`);
      
      // Reset workflow
      setCurrentStep(0);
      
    } catch (error) {
      console.error('Upload error:', error);
      addBotMessage(`❌ **Error uploading student submissions:** ${error instanceof Error ? error.message : 'Unknown error'}\n\nPlease try again.`);
    }
  };

  const startGradingWithAssignment = async (assignmentId: number, rubrics: string, maxPoints: number) => {
    setIsGrading(true);
    setGradingProgress(0);
    
    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setGradingProgress(prev => Math.min(prev + 10, 90));
      }, 1000);

      // Call the proper grading API endpoint
      const response = await fetch(`http://localhost:5002/api/assignments/${assignmentId}/grade`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rubric: rubrics,
          max_points: maxPoints
        })
      });

      clearInterval(progressInterval);
      setGradingProgress(100);

      if (response.ok) {
        const result = await response.json();
        addBotMessage(`🎉 **Grading Complete!**\n\n✅ ${result.total_submissions} submissions graded\n📊 Average score: ${result.average_score}%\n\nCheck the analytics dashboard for detailed insights!`);
        
        // Show notification
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('Grading Complete!', {
            body: `Graded ${result.total_submissions} submissions with average score of ${result.average_score}%`,
            icon: '/logo192.png'
          });
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        addBotMessage(`❌ **Grading failed:** ${errorData.error || 'Unknown error'}\n\nPlease try again.`);
      }
    } catch (error) {
      console.error('Grading error:', error);
      addBotMessage(`❌ **Grading failed:** ${error instanceof Error ? error.message : 'Unknown error'}\n\nPlease try again.`);
    }
    
    setIsGrading(false);
    setCurrentStep(0);
  };

  // Keep the old function for backward compatibility (not used in current flow)
  const startGrading = async (rubrics: string, maxPoints: number) => {
    addBotMessage(`❌ **This grading method is deprecated.** Please use the new workflow with file uploads.`);
  };

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: chatInput,
      isUser: true
    };
    setChatMessages(prev => [...prev, userMessage]);

    const userInput = chatInput.toLowerCase();
    setChatInput('');

    // Enhanced chatbot responses with simplified 3-step workflow
    if (userInput.includes('create') || userInput.includes('new') || userInput.includes('assignment')) {
      startAssignmentCreation();
    } else if (currentStep === 1) {
      // Step 1: Assignment Title
      handleAssignmentTitle(chatInput);
    } else if (currentStep === 4) {
      // Step 4: Upload student submissions and start grading
      if (userInput.includes('upload') || userInput.includes('submission')) {
        addBotMessage(`📁 **Please use the file upload button below to upload student submissions ZIP file.**`);
      } else {
        addBotMessage(`📁 **Please upload the student submissions ZIP file using the upload button below.**`);
      }
    } else if (userInput.includes('help') || userInput.includes('support')) {
      addBotMessage("🤖 **I can help you with:**\n\n**📝 Assignment Management:**\n• Create new assignments\n• View assignment details\n• Edit assignment settings\n\n**📁 Submission Handling:**\n• View student submissions\n• Download files\n• Check submission status\n\n**📊 Analytics & Reports:**\n• Download CSV reports\n• View performance analytics\n• Generate grade summaries\n\n**🛠️ System Support:**\n• Navigation help\n• Feature explanations\n• Troubleshooting\n\nJust ask me what you need!");
    } else if (userInput.includes('view') || userInput.includes('submission') || userInput.includes('files')) {
      addBotMessage("📁 **To view submissions:**\n\n1. **Click on any assignment card** below to open details\n2. **Select 'View Files'** to browse student submissions\n3. **Download individual files** or entire folders\n4. **Check submission status** and timestamps\n\n💡 **Pro tip:**** I can also help you analyze submission patterns and identify common issues!");
    } else if (userInput.includes('download') || userInput.includes('csv') || userInput.includes('export')) {
      addBotMessage("📊 **CSV Downloads & Reports:**\n\n**Available Reports:**\n• **Grade Book Export** - Complete grading data\n• **Performance Analytics** - Student progress trends\n• **Submission Statistics** - Assignment completion rates\n• **Custom Reports** - Tailored analytics\n\n**How to Download:**\n1. Click 'Download CSV' on any assignment card\n2. Choose your preferred format\n3. Get instant download with detailed data\n\nPerfect for grade book integration and analysis!");
    } else if (userInput.includes('analytics') || userInput.includes('stats') || userInput.includes('performance')) {
      addBotMessage("📈 **Analytics & Performance:**\n\n**Key Metrics Available:**\n• **Assignment Statistics** - Total assignments and submissions\n• **Grade Distribution** - Performance across students\n• **Trend Analysis** - Progress over time\n• **Completion Rates** - Submission patterns\n\n**Dashboard Overview:**\n• Total Assignments: " + stats.totalAssignments + "\n• Total Submissions: " + stats.totalSubmissions + "\n• Average Score: " + stats.averageScore + "%\n\nClick on any assignment card for detailed analytics!");
    } else if (userInput.includes('navigate') || userInput.includes('tour') || userInput.includes('around')) {
      addBotMessage("🗺️ **Dashboard Navigation Guide:**\n\n**Left Side - AI Assistant:**\n• Chat with me for help and support\n• Quick action buttons for common tasks\n• Assignment creation workflow\n\n**Right Side - Your Assignments:**\n• View all your assignments\n• Click cards for detailed information\n• Access submissions and analytics\n\n**Top Section - Overview:**\n• Welcome message with your info\n• Key statistics and metrics\n• Quick access to main features\n\n**Need help with anything specific?** Just ask!");
    } else if (userInput.includes('settings') || userInput.includes('preferences') || userInput.includes('theme')) {
      addBotMessage("⚙️ **Settings & Preferences:**\n\n**Available Options:**\n• **Theme Toggle** - Switch between light/dark mode\n• **Display Preferences** - Customize dashboard view\n• **Notification Settings** - Control alerts and updates\n• **Export Preferences** - Default CSV formats\n\n**Current Settings:**\n• Theme: " + (isDarkMode ? 'Dark Mode' : 'Light Mode') + "\n• Professor: " + (professor?.name || 'Not loaded') + "\n• Department: " + (professor?.department || 'Not specified') + "\n\nUse the theme toggle in the top-right corner to switch modes!");
    } else if (userInput.includes('grading') || userInput.includes('rubric') || userInput.includes('criteria')) {
      addBotMessage("📝 **Grading Assistance:**\n\n**Rubric Guidelines:**\n• **Clear Criteria** - Define specific expectations\n• **Point Distribution** - Allocate points logically\n• **Feedback Templates** - Consistent evaluation format\n• **Common Patterns** - Identify typical issues\n\n**Best Practices:**\n• Use detailed rubrics for consistency\n• Provide constructive feedback\n• Track common mistakes\n• Maintain grading standards\n\n**Need help with specific grading criteria?** I can guide you through the process!");
    } else {
      addBotMessage("🤖 **I'm here to help!** Here are some things you can ask me:\n\n**📝 Assignment Tasks:**\n• 'Create assignment' - Start new assignment\n• 'View assignments' - See all assignments\n• 'Assignment details' - Get specific info\n\n**📁 Submission Tasks:**\n• 'View submissions' - Browse student files\n• 'Download files' - Get submission data\n• 'Check status' - Submission tracking\n\n**📊 Analytics Tasks:**\n• 'Show analytics' - Performance data\n• 'Download CSV' - Export reports\n• 'Statistics' - Key metrics\n\n**🛠️ Support Tasks:**\n• 'Help' - Get assistance\n• 'Navigate' - Dashboard tour\n• 'Settings' - Preferences\n\n**What would you like to do?**");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
      {/* Header */}
      <motion.header 
        className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg shadow-xl border-b border-blue-100 dark:border-gray-700 sticky top-0 z-50"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <motion.div 
              className="flex items-center"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center space-x-3">
                <motion.div
                  className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                >
                  <GraduationCap className="w-6 h-6 text-white" />
                </motion.div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">Grading Assistant</h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">AI-Powered</p>
              </div>
              </div>
            </motion.div>
            
            <div className="flex items-center space-x-4">
              <motion.button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isDarkMode ? (
                  <Sun className="w-5 h-5 text-yellow-500" />
                ) : (
                  <Moon className="w-5 h-5 text-gray-600" />
                )}
              </motion.button>

              <motion.div 
                className="hidden md:flex items-center space-x-3 bg-white/50 dark:bg-gray-700/50 rounded-xl px-4 py-2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                  {professor?.name?.charAt(0) || 'P'}
                </span>
              </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{professor?.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{professor?.department}</p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <motion.div 
            className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-2xl p-6 text-white shadow-xl"
            whileHover={{ scale: 1.01 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="flex flex-col lg:flex-row items-center justify-between">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
              >
                <motion.h2 
                  className="text-3xl lg:text-4xl font-bold mb-2 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent leading-tight"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  Welcome, {professor?.name || 'Dr. Smith'}!
                </motion.h2>
                {professor && (
                  <motion.div 
                    className="text-sm text-blue-200 mb-2"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.2 }}
                  >
                    ID: {professor.id} • {professor.department}
                  </motion.div>
                )}
                <motion.p 
                  className="text-lg text-blue-100"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.0 }}
                >
                  AI-Powered Grading Assistant
                </motion.p>
              </motion.div>
              <motion.div
                className="flex items-center space-x-6 mt-4 lg:mt-0"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 }}
              >
                <div className="text-center">
                  <div className="text-2xl font-bold">{stats.totalAssignments}</div>
                  <div className="text-sm text-blue-200">Assignments</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{stats.totalSubmissions}</div>
                  <div className="text-sm text-blue-200">Submissions</div>
              </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{stats.averageScore}%</div>
                  <div className="text-sm text-blue-200">Avg Score</div>
              </div>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>

        {/* Main Dashboard Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* AI Chatbot - Left Side */}
          <motion.div
            className="lg:col-span-1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            <div className="bg-gradient-to-br from-white/90 to-blue-50/50 dark:from-gray-800/90 dark:to-gray-700/50 backdrop-blur-lg rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-600/50 h-fit max-h-[600px] flex flex-col relative overflow-hidden">
              <div className="p-6 border-b border-gray-200/30 dark:border-gray-600/30 relative z-10">
                <motion.div 
                  className="flex items-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  <motion.div
                    className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-2xl flex items-center justify-center mr-4 shadow-lg"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Bot className="w-7 h-7 text-white" />
                  </motion.div>
              <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">AI Assistant</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Your grading companion</p>
              </div>
                </motion.div>
              </div>
              
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex-1 overflow-y-auto mb-4 space-y-3 min-h-[200px] max-h-[300px] scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
                  {chatMessages.map((message, index) => (
                    <motion.div 
                      key={message.id} 
                      className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                      initial={{ opacity: 0, y: 20, scale: 0.8 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ delay: index * 0.1, duration: 0.3 }}
                    >
                      <motion.div 
                        className={`max-w-xs px-4 py-3 rounded-2xl shadow-lg ${
                          message.isUser 
                            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white ml-auto' 
                            : 'bg-white/80 dark:bg-gray-700/80 text-gray-800 dark:text-gray-200 border border-gray-200/50 dark:border-gray-600/50'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                        
                        {/* Upload buttons inside bot messages */}
                        {!message.isUser && (
                          <>
                            {/* Assignment Question Paper Upload - Step 2 */}
                            {currentStep === 2 && message.text.includes('upload your assignment question paper') && (
                              <motion.div 
                                className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                              >
                                <div className="text-xs font-medium text-blue-800 dark:text-blue-200 mb-2 flex items-center">
                                  <span className="mr-1">📄</span>
                                  Upload Assignment Question Paper
                                </div>
                                <input
                                  type="file"
                                  accept=".docx,.pdf,.txt"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      handleFileUpload(file);
                                    }
                                  }}
                                  className="w-full p-2 border border-blue-300 dark:border-blue-600 rounded-lg bg-white dark:bg-gray-800 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                />
                                <div className="text-xs text-blue-600 dark:text-blue-300 mt-1">
                                  Upload DOCX, PDF, or TXT file containing assignment questions (max 10MB)
                                </div>
                              </motion.div>
                            )}

                            {/* Student Submissions Upload - Step 4 */}
                            {currentStep === 4 && message.text.includes('upload student submissions') && (
                              <motion.div 
                                className="mt-3 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                              >
                                <div className="text-xs font-medium text-green-800 dark:text-green-200 mb-2 flex items-center">
                                  <span className="mr-1">📁</span>
                                  Upload Student Submissions
                                </div>
                                <input
                                  type="file"
                                  accept=".zip"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      handleStudentSubmissionsUpload(file);
                                    }
                                  }}
                                  className="w-full p-2 border border-green-300 dark:border-green-600 rounded-lg bg-white dark:bg-gray-800 text-xs focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                                />
                                <div className="text-xs text-green-600 dark:text-green-300 mt-1">
                                  Upload ZIP file containing student submissions
            </div>
                              </motion.div>
                            )}
                          </>
                        )}
                      </motion.div>
                    </motion.div>
                  ))}
          </div>

                <motion.div 
                  className="relative z-10 mt-auto"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2, duration: 0.4 }}
                >
                  <form 
                    onSubmit={handleChatSubmit} 
                    className="flex space-x-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl p-4 border border-gray-200/50 dark:border-gray-600/50 shadow-lg"
                  >
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onFocus={(e) => e.target.placeholder = "Ask me about grading, assignments, or analytics..."}
                        onBlur={(e) => e.target.placeholder = "Ask me about grading..."}
                        placeholder="Ask me about grading..."
                        className="w-full px-4 py-3 bg-transparent border-none focus:outline-none text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                        style={{ 
                          boxShadow: chatInput ? '0 0 0 2px rgba(59, 130, 246, 0.2)' : 'none'
                        }}
                      />
                      {chatInput && (
                        <motion.div
                          className="absolute right-3 top-1/2 transform -translate-y-1/2"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                        >
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                        </motion.div>
                      )}
                    </div>
                    <motion.button
                      type="submit"
                      disabled={!chatInput.trim()}
                      className={`px-6 py-3 rounded-xl text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                        chatInput.trim() 
                          ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl' 
                          : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                      }`}
                      whileHover={chatInput.trim() ? { scale: 1.05 } : {}}
                      whileTap={chatInput.trim() ? { scale: 0.95 } : {}}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <span>Send</span>
                      <motion.div
                        animate={{ rotate: chatInput.trim() ? 0 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                      </motion.div>
                    </motion.button>
                  </form>
                  
                  {/* Typing indicator */}
                  {chatInput && (
                    <motion.div 
                      className="mt-2 text-xs text-gray-500 dark:text-gray-400 flex items-center space-x-2"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <div className="flex space-x-1">
                        <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                      <span>Ready to send...</span>
                    </motion.div>
                  )}
                </motion.div>
                
                
                {/* Workflow Progress Indicators */}
                {currentStep > 0 && (
                  <motion.div 
                    className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
                      Assignment Creation Progress
                    </div>
                    <div className="flex space-x-2">
                      {[1, 2, 3].map((step) => (
                        <div
                          key={step}
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                            step <= currentStep
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                          }`}
                        >
                          {step}
                        </div>
                      ))}
              </div>
                    <div className="text-xs text-blue-600 dark:text-blue-300 mt-1">
                      Step {currentStep} of 3
              </div>
                  </motion.div>
                )}

                {/* Solution Generation Progress */}
                {isGeneratingSolution && (
                  <motion.div 
                    className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full"></div>
                      <span className="text-sm text-green-700 dark:text-green-300">
                        🤖 AI is generating the solution...
                      </span>
              </div>
                  </motion.div>
                )}


                {/* Grading Progress */}
                {isGrading && (
                  <motion.div 
                    className="mt-4 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div className="text-sm font-medium text-purple-800 dark:text-purple-200 mb-2">
                      🎯 Grading in Progress...
              </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${gradingProgress}%` }}
                      ></div>
            </div>
                    <div className="text-xs text-purple-600 dark:text-purple-300 mt-1">
                      {gradingProgress}% Complete
          </div>
                  </motion.div>
                )}

                <motion.div 
                  className="mt-4 text-xs text-gray-500 dark:text-gray-400"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.4, duration: 0.4 }}
                >
                  <div className="flex items-center space-x-2">
                    <span>💡</span>
                    <span>Try: 'create assignment', 'help', or ask about submissions</span>
              </div>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Assignments Section - Right Side */}
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50">
              <div className="p-6 border-b border-gray-200/50 dark:border-gray-700/50">
                <motion.h3 
                  className="text-2xl font-bold text-gray-900 dark:text-white flex items-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.0 }}
                >
                  <motion.div
                    className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-xl flex items-center justify-center mr-4"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </motion.div>
                  Your Assignments
                </motion.h3>
                <p className="text-gray-600 dark:text-gray-400 mt-2">Click on any assignment to view details</p>
              </div>
              
              <div className="p-6">
                {memoizedAssignments.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {memoizedAssignments.map((assignment, index) => (
                      <AssignmentCard 
                        key={assignment.id}
                        assignment={assignment}
                        index={index}
                      />
                    ))}
                  </div>
                ) : (
                  <motion.div 
                    className="text-center py-12"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2 }}
                  >
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FileText className="w-8 h-8 text-gray-400" />
                  </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No assignments yet</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">Create your first assignment using the AI assistant</p>
                    <motion.button
                      onClick={() => {
                        setChatInput("create assignment");
                        handleChatSubmit({ preventDefault: () => {} } as React.FormEvent);
                      }}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Create Assignment
                    </motion.button>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
            </div>
          </div>

      {/* Solution Review Modal */}
      {showSolutionModal && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                🤖 AI Generated Solution
                </h3>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Review the solution and approve or request changes
              </p>
              </div>
            
            <div className="p-6 max-h-96 overflow-y-auto">
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                <pre className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                  {assignmentData.solution}
                </pre>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex space-x-3">
              <button
                onClick={approveSolution}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                ✅ Approve Solution
              </button>
              <button
                onClick={requestSolutionChange}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                🔄 Request Changes
              </button>
              <button
                onClick={() => setShowSolutionModal(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
          </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default SimpleDashboard;