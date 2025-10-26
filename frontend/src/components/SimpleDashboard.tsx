import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
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
  Download,
  Trash2
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
  average_score?: number; // Optional average score for the assignment
  is_graded?: boolean; // Whether the assignment has been graded
}

interface ChatMessage {
  id: number;
  text: string;
  isUser: boolean;
}

// Memoized Assignment Card Component to prevent unnecessary re-renders
const AssignmentCard = React.memo(({ assignment, index, onViewGrades, onDownloadCSV, onDeleteAssignment }: { 
  assignment: Assignment; 
  index: number;
  onViewGrades: (assignment: Assignment) => void;
  onDownloadCSV: (assignment: Assignment) => void;
  onDeleteAssignment: (assignment: Assignment) => void;
}) => {
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
            {assignment.average_score !== null && assignment.average_score !== undefined && (
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="font-medium text-green-600 dark:text-green-400">
                  Avg: {assignment.average_score?.toFixed(2)}%
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${assignment.is_graded ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
          <span className={`text-sm ${assignment.is_graded ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
            {assignment.is_graded ? 'Graded' : 'Ungraded'}
          </span>
        </div>
        
        <div className="flex space-x-2">
          {assignment.is_graded && (
            <>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => {
                  e.stopPropagation();
                  onViewGrades(assignment);
                }}
                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg text-xs font-medium flex items-center space-x-1 transition-colors"
              >
                <Eye className="w-3 h-3" />
                <span>View</span>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => {
                  e.stopPropagation();
                  onDownloadCSV(assignment);
                }}
                className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-lg text-xs font-medium flex items-center space-x-1 transition-colors"
              >
                <Download className="w-3 h-3" />
                <span>CSV</span>
              </motion.button>
            </>
          )}
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => {
              e.stopPropagation();
              onDeleteAssignment(assignment);
            }}
            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-xs font-medium flex items-center space-x-1 transition-colors"
          >
            <Trash2 className="w-3 h-3" />
            <span>Delete</span>
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
  
  // New 6-step workflow state
  const [workflowStep, setWorkflowStep] = useState<'name' | 'question' | 'solution' | 'rubrics' | 'upload' | 'complete'>('name');
  const [workflowData, setWorkflowData] = useState({
    assignmentName: '',
    questionFile: null as File | null,
    solution: '',
    rubrics: '',
    maxPoints: 100,
    assignmentId: null as number | null
  });
  
  // Assignment creation workflow state (legacy)
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
  
  // Solution modal state
  const [showSolutionModal, setShowSolutionModal] = useState(false);
  const [currentSolution, setCurrentSolution] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [solutionChangeCount, setSolutionChangeCount] = useState(0);
  const [isStateSaved, setIsStateSaved] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null); // Ref for auto-scrolling
  
  // Grade viewing state
  const [showGradesModal, setShowGradesModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [gradesData, setGradesData] = useState<any[]>([]);
  const [isLoadingGrades, setIsLoadingGrades] = useState(false);
  
  // Delete confirmation state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [assignmentToDelete, setAssignmentToDelete] = useState<Assignment | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // State persistence functions
  const saveChatbotState = () => {
    const state = {
      chatMessages,
      currentStep,
      assignmentData: {
        ...assignmentData,
        file: null // Don't persist File objects
      },
      solutionChangeCount,
      timestamp: Date.now()
    };
    localStorage.setItem('gradingAssistant_chatbotState', JSON.stringify(state));
    
    // Show saved indicator
    setIsStateSaved(true);
    setTimeout(() => setIsStateSaved(false), 2000);
  };

  const loadChatbotState = () => {
    try {
      const savedState = localStorage.getItem('gradingAssistant_chatbotState');
      if (savedState) {
        const state = JSON.parse(savedState);
        
        // Only restore if state is less than 24 hours old
        if (Date.now() - state.timestamp < 24 * 60 * 60 * 1000) {
          setChatMessages(state.chatMessages || []);
          setCurrentStep(state.currentStep || 0);
          setAssignmentData(state.assignmentData || {
            title: '',
            description: '',
            file: null,
            solution: '',
            rubrics: '',
            maxPoints: 100,
            assignmentId: null
          });
          setSolutionChangeCount(state.solutionChangeCount || 0);
          return true;
        }
      }
    } catch (error) {
      console.error('Error loading chatbot state:', error);
    }
    return false;
  };

  const clearChatbotState = () => {
    localStorage.removeItem('gradingAssistant_chatbotState');
    setChatMessages([]);
    setCurrentStep(0);
    setAssignmentData({
      title: '',
      description: '',
      file: null,
      solution: '',
      rubrics: '',
      maxPoints: 100,
      assignmentId: null
    });
    setSolutionChangeCount(0);
    
    // Scroll to top when chat is cleared
    setTimeout(() => {
      const chatContainer = document.querySelector('.overflow-y-auto');
      if (chatContainer) {
        chatContainer.scrollTop = 0;
      }
    }, 100);
  };

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      console.log('🔍 DEBUG: Scrolling to bottom, ref found:', messagesEndRef.current);
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    } else {
      console.log('❌ DEBUG: messagesEndRef.current is null');
    }
  };

  // Handle viewing grades
  const handleViewGrades = async (assignment: Assignment) => {
    setIsLoadingGrades(true);
    setSelectedAssignment(assignment);
    
    try {
      const response = await fetch(`http://localhost:5002/api/assignments/${assignment.id}/grades`);
      if (response.ok) {
        const data = await response.json();
        setGradesData(data.grades || []);
        setShowGradesModal(true);
      } else {
        console.error('Failed to fetch grades:', response.status);
        addBotMessage(`❌ **Error loading grades:** Failed to fetch grades for assignment "${assignment.title}". Please try again.`);
      }
    } catch (error) {
      console.error('Error fetching grades:', error);
      addBotMessage(`❌ **Error loading grades:** ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`);
    } finally {
      setIsLoadingGrades(false);
    }
  };

  // Handle downloading CSV
  const handleDownloadCSV = async (assignment: Assignment) => {
    try {
      const response = await fetch(`http://localhost:5002/api/assignments/${assignment.id}/download-csv`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `assignment_${assignment.id}_grades.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        addBotMessage(`✅ **CSV Downloaded Successfully!**\n\n📊 **Assignment:** ${assignment.title}\n📁 **File:** assignment_${assignment.id}_grades.csv\n\nThe file contains all student grades and feedback for this assignment.`);
      } else {
        console.error('Failed to download CSV:', response.status);
        addBotMessage(`❌ **Error downloading CSV:** Failed to generate CSV for assignment "${assignment.title}". Please try again.`);
      }
    } catch (error) {
      console.error('Error downloading CSV:', error);
      addBotMessage(`❌ **Error downloading CSV:** ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`);
    }
  };

  // Handle delete assignment
  const handleDeleteAssignment = (assignment: Assignment) => {
    setAssignmentToDelete(assignment);
    setShowDeleteModal(true);
  };

  // Confirm delete assignment
  const confirmDeleteAssignment = async () => {
    if (!assignmentToDelete) return;
    
    setIsDeleting(true);
    try {
      const response = await fetch(`http://localhost:5002/api/assignments/${assignmentToDelete.id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        // Remove assignment from local state
        setAssignments(prev => prev.filter(a => a.id !== assignmentToDelete.id));
        
        // Refresh class average and assignment averages
        fetchClassAverage();
        fetchAssignmentAverages();
        
        // Show success message
        addBotMessage(`🗑️ **Assignment Deleted Successfully!**\n\nAssignment "${assignmentToDelete.title}" has been permanently deleted along with all its grades and submissions.`);
        
        setShowDeleteModal(false);
        setAssignmentToDelete(null);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to delete assignment:', response.status, errorData);
        addBotMessage(`❌ **Error deleting assignment:** ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error deleting assignment:', error);
      addBotMessage(`❌ **Error deleting assignment:** ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsDeleting(false);
    }
  };

  // Stats calculation - using useMemo to prevent unnecessary re-renders
  const [classAverage, setClassAverage] = useState<number | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  
  const stats = useMemo(() => ({
    totalAssignments: assignments.length,
    averageScore: classAverage
  }), [assignments.length, classAverage]);

  // Fetch class average from API
  // Helper function to fetch and sort assignments by creation date (newest first)
  const fetchAssignmentsSorted = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:5002/api/assignments');
      if (response.ok) {
        const assignmentsData = await response.json();
        
        // Check graded status for each assignment using the average API
        const assignmentsWithStatus = await Promise.all(
          assignmentsData.map(async (assignment: Assignment) => {
            try {
              const averageResponse = await fetch(`http://localhost:5002/api/assignments/${assignment.id}/average`);
              if (averageResponse.ok) {
                const averageData = await averageResponse.json();
                const isGraded = averageData.average_score != null;
                console.log(`🔍 Assignment ${assignment.id} (${assignment.title}): average_score=${averageData.average_score}, is_graded=${isGraded}`);
                return {
                  ...assignment,
                  is_graded: isGraded
                };
              }
            } catch (error) {
              console.error(`Error checking average for assignment ${assignment.id}:`, error);
            }
            return {
              ...assignment,
              is_graded: false
            };
          })
        );
        
        // Sort by created_at in descending order (newest first)
        const sortedAssignments = assignmentsWithStatus.sort((a: Assignment, b: Assignment) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        setAssignments(sortedAssignments);
        return sortedAssignments;
      } else {
        console.error('Error fetching assignments:', response.status);
        return [];
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
      return [];
    }
  }, []);

  const fetchClassAverage = useCallback(async () => {
    setIsLoadingStats(true);
    try {
      const response = await fetch('http://localhost:5002/api/class-average');
      if (response.ok) {
        const data = await response.json();
        setClassAverage(data.class_average);
      } else {
        console.error('Failed to fetch class average:', response.status);
        setClassAverage(null);
      }
    } catch (error) {
      console.error('Error fetching class average:', error);
      setClassAverage(null);
    } finally {
      setIsLoadingStats(false);
    }
  }, []);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  // Fetch assignment averages for each assignment
  const fetchAssignmentAverages = useCallback(async () => {
    if (assignments.length === 0) return;
    
    try {
      const promises = assignments.map(async (assignment) => {
        try {
          const response = await fetch(`http://localhost:5002/api/assignments/${assignment.id}/average`);
          if (response.ok) {
            const data = await response.json();
            return { ...assignment, average_score: data.average_score };
          }
        } catch (error) {
          console.error(`Error fetching average for assignment ${assignment.id}:`, error);
        }
        return assignment;
      });
      
      const updatedAssignments = await Promise.all(promises);
      setAssignments(updatedAssignments);
    } catch (error) {
      console.error('Error fetching assignment averages:', error);
    }
  }, [assignments.length]);

  // Fetch class average when component mounts
  useEffect(() => {
    fetchClassAverage();
  }, [fetchClassAverage]);

  // Fetch assignment averages when assignments change
  useEffect(() => {
    if (assignments.length > 0) {
      fetchAssignmentAverages();
    }
  }, [assignments.length]); // Only run when assignments count changes, not on every assignment update

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

  // Load chatbot state on component mount
  useEffect(() => {
    const stateRestored = loadChatbotState();
    if (stateRestored) {
      console.log('✅ Chatbot state restored from localStorage');
      // Add a notification message about state restoration
      addBotMessage(`🔄 **Welcome back!**\n\nI've restored your previous conversation and assignment progress. You can continue where you left off or start fresh by clicking the "Clear" button.`);
      // Scroll to bottom after state is restored
      setTimeout(scrollToBottom, 100);
    }
  }, []);

  // Save chatbot state whenever important state changes
  useEffect(() => {
    // Only save if we have meaningful state (not just initial empty state)
    if (chatMessages.length > 0 || currentStep > 0 || assignmentData.title || assignmentData.solution) {
      saveChatbotState();
    }
  }, [chatMessages, currentStep, assignmentData, solutionChangeCount]);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

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
      await fetchAssignmentsSorted();

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

  // New 6-step workflow functions
  const startNewWorkflow = () => {
    setWorkflowStep('name');
    setWorkflowData({
      assignmentName: '',
      questionFile: null,
      solution: '',
      rubrics: '',
      maxPoints: 100,
      assignmentId: null
    });
    addBotMessage("🎯 **Welcome to the Assignment Creation Workflow!**\n\n**Step 1/6: Assignment Name**\nWhat would you like to call this assignment?");
  };

  const handleWorkflowStep = (userInput: string) => {
    switch (workflowStep) {
      case 'name':
        handleAssignmentName(userInput);
        break;
      case 'question':
        handleQuestionUpload(userInput);
        break;
      case 'solution':
        handleSolutionAcceptance(userInput);
        break;
      case 'rubrics':
        handleRubricsInput(userInput);
        break;
      case 'upload':
        handleSolutionUpload(userInput);
        break;
      case 'complete':
        handleWorkflowComplete(userInput);
        break;
      default:
        addBotMessage("🤔 **I'm not sure what to do with that input. Please try again or type 'help' for assistance.**");
    }
  };

  const handleAssignmentName = (name: string) => {
    setWorkflowData(prev => ({ ...prev, assignmentName: name }));
    setWorkflowStep('question');
    addBotMessage(`✅ **Assignment Name Set:** "${name}"\n\n**Step 2/6: Question File Upload**\nPlease upload the assignment question file (DOCX, PDF, or TXT).\n\nClick the "Choose File" button below to upload your question file.`);
  };

  const handleQuestionUpload = (input: string) => {
    if (input.toLowerCase().includes('upload') || input.toLowerCase().includes('file')) {
      addBotMessage("📁 **Please use the file upload button below to upload your question file.**\n\nSupported formats: DOCX, PDF, TXT");
    } else {
      addBotMessage("📁 **Please upload the question file using the upload button below.**");
    }
  };

  const regenerateSolution = async () => {
    setIsGeneratingSolution(true);
    try {
      if (!workflowData.assignmentId) {
        addBotMessage(`❌ **Error: Assignment not found.** Please start over.`);
        return;
      }
      
      // Generate new solution using the assignment ID
      const solutionResponse = await fetch(`http://localhost:5002/api/generate-solution/${workflowData.assignmentId}`, {
        method: 'POST'
      });

      if (!solutionResponse.ok) {
        const errorData = await solutionResponse.json().catch(() => ({}));
        throw new Error(errorData.error || `Solution generation failed with status ${solutionResponse.status}`);
      }

      const solutionResult = await solutionResponse.json();
      console.log('🔍 DEBUG: New solution generated successfully:', solutionResult);
      
      setWorkflowData(prev => ({ ...prev, solution: solutionResult.solution }));
      setCurrentSolution(solutionResult.solution);
      setShowSolutionModal(true);
      addBotMessage(`✅ **New Solution Generated!**\n\n**Step 3/6: Review Solution**\n\nPlease review the new solution in the popup window and choose your action.`);
      
    } catch (error) {
      console.error('Error regenerating solution:', error);
      addBotMessage(`❌ **Error regenerating solution:** ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsGeneratingSolution(false);
    }
  };

  const handleSolutionAcceptance = (input: string) => {
    // This function is now handled by the modal buttons
    // Keep it for backward compatibility but redirect to modal
    addBotMessage("🤔 **Please use the popup window to review the solution and choose your action.**");
  };

  const handleRubricsInput = (rubrics: string) => {
    setWorkflowData(prev => ({ ...prev, rubrics }));
    setWorkflowStep('upload');
    addBotMessage(`✅ **Rubrics Set:** "${rubrics}"\n\n**Step 5/6: Student Submissions Upload**\nNow please upload the ZIP file containing student submissions.\n\nClick the "Choose File" button below to upload the submissions ZIP file.`);
  };

  const handleSolutionUpload = (input: string) => {
    if (input.toLowerCase().includes('upload') || input.toLowerCase().includes('file')) {
      addBotMessage("📁 **Please use the file upload button below to upload the student submissions ZIP file.**");
    } else {
      addBotMessage("📁 **Please upload the student submissions ZIP file using the upload button below.**");
    }
  };

  const handleWorkflowComplete = async (input: string) => {
    addBotMessage("🎉 **Assignment Creation Complete!**\n\nYour assignment has been successfully created and graded.\n\n**Summary:**\n• Assignment: " + workflowData.assignmentName + "\n• Students Graded: " + (workflowData.assignmentId ? "Completed" : "Pending") + "\n• Status: Ready for review\n\n**Next Steps:**\n• View grades in the assignment card\n• Download CSV reports\n• Review individual submissions\n\nType 'create' to start a new assignment workflow!");
    
    // Refresh assignments list to show the new assignment
    try {
      await fetchAssignmentsSorted();
      fetchClassAverage();
      fetchAssignmentAverages();
    } catch (error) {
      console.error('Error refreshing assignments:', error);
    }
  };

  // Legacy assignment creation workflow functions (3 steps)
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
    
    // Handle based on current workflow step
    if (workflowStep === 'question') {
      setWorkflowData(prev => ({ ...prev, questionFile: file }));
      addBotMessage(`📁 **Question File Uploaded Successfully!**\n\nFile: ${file.name} (${(file.size / 1024).toFixed(1)}KB)\n\n**Step 3/6: Generate Solution**\n\nNow I'll create the assignment and generate a reference solution using AI. This may take a moment...`);
      setWorkflowStep('solution');
      createAssignmentAndGenerateSolution(file);
    } else if (workflowStep === 'upload') {
      // Handle student submissions upload
      handleStudentSubmissionsUpload(file);
    } else {
      // Legacy workflow
    setAssignmentData(prev => ({ ...prev, file }));
      addBotMessage(`📁 **File Uploaded Successfully!**\n\nFile: ${file.name} (${(file.size / 1024).toFixed(1)}KB)\n\n🤖 **Step 3/3: Generate Solution**\n\nNow I'll generate a reference solution using AI. This may take a moment...`);
    setCurrentStep(3);
      generateSolution(file);
    }
  };

  const handleStudentSubmissionsUpload = async (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      addBotMessage(`📁 **Student Submissions Uploaded Successfully!**\n\nFile: ${file.name} (${(file.size / 1024).toFixed(1)}KB)\n\n**Step 6/6: Complete Process**\n\nStarting the grading process...`);
      
      // Create assignment first
      const assignmentResponse = await fetch('http://localhost:5002/api/upload-question-file', {
        method: 'POST',
        body: (() => {
          const formData = new FormData();
          formData.append('title', workflowData.assignmentName);
          formData.append('description', workflowData.assignmentName);
          formData.append('max_points', workflowData.maxPoints.toString());
          formData.append('professor_id', professor?.id.toString() || '1');
          if (workflowData.questionFile) {
            formData.append('file', workflowData.questionFile);
          }
          return formData;
        })()
      });

      if (!assignmentResponse.ok) {
        throw new Error(`Assignment creation failed: ${assignmentResponse.status}`);
      }

      const assignmentResult = await assignmentResponse.json();
      const assignmentId = assignmentResult.assignment_id;
      
      setWorkflowData(prev => ({ ...prev, assignmentId }));
      
      // Generate solution
      const solutionResponse = await fetch(`http://localhost:5002/api/generate-solution/${assignmentId}`, {
        method: 'POST'
      });

      if (!solutionResponse.ok) {
        throw new Error(`Solution generation failed: ${solutionResponse.status}`);
      }

      const solutionResult = await solutionResponse.json();
      setWorkflowData(prev => ({ ...prev, solution: solutionResult.solution }));
      
      // Upload student submissions and start grading
      const uploadResponse = await fetch(`http://localhost:5002/api/assignments/${assignmentId}/upload`, {
        method: 'POST',
        body: (() => {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('rubric', workflowData.rubrics);
          formData.append('max_points', workflowData.maxPoints.toString());
          return formData;
        })()
      });

      if (!uploadResponse.ok) {
        throw new Error(`Upload failed: ${uploadResponse.status}`);
      }

      setWorkflowStep('complete');
      addBotMessage(`🎉 **Assignment Creation Complete!**\n\nYour assignment has been successfully created and graded.\n\n**Summary:**\n• Assignment: ${workflowData.assignmentName}\n• Students Graded: Completed\n• Status: Ready for review\n\n**Next Steps:**\n• View grades in the assignment card\n• Download CSV reports\n• Review individual submissions\n\nType 'create' to start a new assignment workflow!`);
      
      // Refresh assignments list
      await fetchAssignmentsSorted();
      fetchClassAverage();
      fetchAssignmentAverages();
      
    } catch (error) {
      console.error('Error in student submissions upload:', error);
      addBotMessage(`❌ **Error during upload:** ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const createAssignmentAndGenerateSolution = async (file: File) => {
    setIsGeneratingSolution(true);
    try {
      console.log('🔍 DEBUG: Creating assignment and generating solution for new workflow');
      console.log('Workflow data:', workflowData);
      console.log('File:', file);
      
      // Step 1: Create assignment with uploaded file
      const formData = new FormData();
      formData.append('title', workflowData.assignmentName);
      formData.append('description', workflowData.assignmentName);
      formData.append('file', file);
      formData.append('max_points', workflowData.maxPoints.toString());
      formData.append('professor_id', professor?.id.toString() || '1');

      console.log('🔍 DEBUG: Uploading assignment with data:', {
        title: workflowData.assignmentName,
        description: workflowData.assignmentName,
        file: file.name,
        max_points: workflowData.maxPoints,
        professor_id: professor?.id
      });

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
      console.log('🔍 DEBUG: Assignment created successfully:', uploadResult);
      
      // Store assignment ID in workflow data
      setWorkflowData(prev => ({ ...prev, assignmentId: uploadResult.assignment_id }));
      
      // Step 2: Generate solution using the assignment ID
      const solutionResponse = await fetch(`http://localhost:5002/api/generate-solution/${uploadResult.assignment_id}`, {
        method: 'POST'
      });

      if (!solutionResponse.ok) {
        const errorData = await solutionResponse.json().catch(() => ({}));
        throw new Error(errorData.error || `Solution generation failed with status ${solutionResponse.status}`);
      }

      const solutionResult = await solutionResponse.json();
      console.log('🔍 DEBUG: Solution generated successfully:', solutionResult);
      
      setWorkflowData(prev => ({ ...prev, solution: solutionResult.solution }));
      setCurrentSolution(solutionResult.solution);
      setShowSolutionModal(true);
      addBotMessage(`✅ **Solution Generated Successfully!**\n\n**Step 3/6: Review Solution**\n\nPlease review the solution in the popup window and choose your action.`);
      
    } catch (error) {
      console.error('Error in createAssignmentAndGenerateSolution:', error);
      addBotMessage(`❌ **Error creating assignment and generating solution:** ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsGeneratingSolution(false);
    }
  };

  const generateSolution = async (file?: File) => {
    setIsGeneratingSolution(true);
    try {
      // Debug: Check if we have the required data
      console.log('Assignment data:', assignmentData);
      console.log('Workflow data:', workflowData);
      console.log('File parameter:', file);
      console.log('File parameter type:', typeof file);
      console.log('File parameter name:', file?.name);
      console.log('File parameter size:', file?.size);
      
      // Check if we're in the new workflow or legacy workflow
      const isNewWorkflow = workflowStep === 'solution';
      
      if (isNewWorkflow) {
        // New workflow: We already have the assignment created, just generate solution
        if (!workflowData.assignmentId) {
          addBotMessage(`❌ **Error: Assignment not found.** Please start over.`);
          setIsGeneratingSolution(false);
          return;
        }
        
        const solutionResponse = await fetch(`http://localhost:5002/api/generate-solution/${workflowData.assignmentId}`, {
          method: 'POST'
        });
        
        if (!solutionResponse.ok) {
          const errorData = await solutionResponse.json().catch(() => ({}));
          throw new Error(errorData.error || `Solution generation failed with status ${solutionResponse.status}`);
        }

        const solutionResult = await solutionResponse.json();
        console.log('Solution result:', solutionResult);
        
        setWorkflowData(prev => ({ ...prev, solution: solutionResult.solution }));
        setCurrentSolution(solutionResult.solution);
        setShowSolutionModal(true);
        addBotMessage(`✅ **Solution Generated Successfully!**\n\n**Step 3/6: Review Solution**\n\nPlease review the solution in the popup window and choose your action.`);
        
        setIsGeneratingSolution(false);
        return;
      } else {
        // Legacy workflow
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
        
        setCurrentSolution(assignmentData.solution);
        setShowSolutionModal(true);
        addBotMessage(`✅ **Solution Generated Successfully!**\n\nI've created a reference solution based on your assignment.${fileInfo}${contentInfo}${solutionInfo}\n\nPlease review it in the popup window and choose your action.`);
        console.log('🔍 DEBUG: Setting showSolutionModal to true');
        console.log('🔍 DEBUG: Solution content:', result.solution);
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
      }
    } catch (error) {
      console.error('Solution generation error:', error);
      addBotMessage(`❌ **Error generating solution.** Please try again.`);
    }
    setIsGeneratingSolution(false);
  };

  const approveSolution = () => {
    if (workflowStep === 'solution') {
      // New workflow: Move to rubrics step
      setWorkflowStep('rubrics');
      addBotMessage(`✅ **Solution Approved!**\n\n**Step 4/6: Grading Rubrics**\nPlease provide the grading rubrics for this assignment.\n\nExample: 'Code quality (30%), Correctness (40%), Efficiency (20%), Documentation (10%)'`);
    } else {
      // Legacy workflow
    addBotMessage(`✅ **Solution Approved!**\n\nNow upload the ZIP file containing student submissions to start grading:`);
    setCurrentStep(4);
    
    // Add upload interface as a bot message
    setTimeout(() => {
      addBotMessage(`**Please use the file upload button below to upload student submissions:**`);
    }, 500);
    }
    setShowSolutionModal(false);
  };

  const requestSolutionChange = () => {
    if (workflowStep === 'solution') {
      // New workflow: Regenerate solution
      addBotMessage(`🔄 **Regenerating solution...**\n\nPlease wait while I generate a new solution for your assignment.`);
      setShowSolutionModal(false);
      regenerateSolution();
    } else {
      // Legacy workflow
    const newChangeCount = solutionChangeCount + 1;
    setSolutionChangeCount(newChangeCount);
    addBotMessage(`🔄 **Requesting Solution Changes** (Attempt ${newChangeCount})\n\nWhat would you like me to change in the solution?`);
    setShowSolutionModal(false);
    }
  };


  const startGradingWithAssignment = async (assignmentId: number, rubrics: string, maxPoints: number) => {
    setIsGrading(true);
    setGradingProgress(0);
    
    try {
      // Start async grading
      const response = await fetch(`http://localhost:5002/api/assignments/${assignmentId}/grade-async`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rubric: rubrics,
          max_points: maxPoints
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to start grading');
      }

      const startResult = await response.json();
      addBotMessage(`🚀 **Grading Started!**\n\n⏳ Processing ${startResult.total_submissions || 'multiple'} submissions...\n\nThis may take 2-4 minutes. I'll notify you when it's complete!`);

      // Poll for grading status
      const pollStatus = async () => {
        try {
          const statusResponse = await fetch(`http://localhost:5002/api/assignments/${assignmentId}/grading-status`);
          if (statusResponse.ok) {
            const status = await statusResponse.json();
            
            if (status.status === 'completed') {
              // Grading complete!
              setGradingProgress(100);
              addBotMessage(`🎉 **Grading Complete!**\n\n✅ ${status.total_submissions} submissions graded\n📊 Average score: ${status.average_score?.toFixed(2)}%\n\nCheck the analytics dashboard for detailed insights!`);
        
        // Show notification
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('Grading Complete!', {
                  body: `Graded ${status.total_submissions} submissions with average score of ${status.average_score?.toFixed(2)}%`,
            icon: '/logo192.png'
          });
        }
              
              // Refresh assignments list, class average and assignment averages after grading completion
              await fetchAssignmentsSorted();
              fetchClassAverage();
              fetchAssignmentAverages();
              
              setIsGrading(false);
              setCurrentStep(0);
              return;
            } else if (status.status === 'processing') {
              // Update progress
              const progress = Math.min(status.progress_percentage || 0, 95);
              setGradingProgress(progress);
              
              // Continue polling
              setTimeout(pollStatus, 2000); // Poll every 2 seconds
      } else {
              throw new Error('Unexpected grading status: ' + status.status);
            }
          } else {
            throw new Error('Failed to check grading status');
      }
    } catch (error) {
          console.error('Status polling error:', error);
          addBotMessage(`❌ **Status check failed:** ${error instanceof Error ? error.message : 'Unknown error'}\n\nGrading may still be in progress. Please refresh the page to check.`);
          setIsGrading(false);
          setCurrentStep(0);
        }
      };

      // Start polling after a short delay
      setTimeout(pollStatus, 1000);

    } catch (error) {
      console.error('Grading error:', error);
      addBotMessage(`❌ **Grading failed:** ${error instanceof Error ? error.message : 'Unknown error'}\n\nPlease try again.`);
    setIsGrading(false);
    setCurrentStep(0);
    }
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

    // Enhanced chatbot responses with new 6-step workflow
    if (userInput.includes('create') || userInput.includes('new') || userInput.includes('assignment')) {
      startNewWorkflow();
    } else if (workflowStep !== 'name' && workflowStep !== 'complete') {
      // Handle workflow steps (except name and complete)
      handleWorkflowStep(chatInput);
    } else if (workflowStep === 'name') {
      // Handle assignment name input
      handleAssignmentName(chatInput);
    } else if (workflowStep === 'complete') {
      // Handle workflow complete - allow starting new workflow
      if (userInput.includes('create') || userInput.includes('new') || userInput.includes('assignment')) {
        startNewWorkflow();
      } else {
        handleWorkflowComplete(chatInput);
      }
    } else if (currentStep === 1) {
      // Legacy: Step 1: Assignment Title
      handleAssignmentTitle(chatInput);
    } else if (currentStep === 4) {
      // Legacy: Step 4: Upload student submissions and start grading
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
      const averageText = stats.averageScore !== null ? stats.averageScore.toFixed(2) + "%" : "No grades yet";
      addBotMessage("📈 **Analytics & Performance:**\n\n**Key Metrics Available:**\n• **Assignment Statistics** - Total assignments and performance\n• **Grade Distribution** - Performance across students\n• **Trend Analysis** - Progress over time\n• **Class Performance** - Overall class averages\n\n**Dashboard Overview:**\n• Total Assignments: " + stats.totalAssignments + "\n• Class Average: " + averageText + "\n\nClick on any assignment card for detailed analytics!");
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
                  {isLoadingStats ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-200 border-t-transparent"></div>
                      <div className="text-sm text-blue-200">Loading...</div>
              </div>
                  ) : stats.averageScore !== null ? (
                    <>
                  <div className="text-2xl font-bold">{stats.averageScore?.toFixed(2)}%</div>
                      <div className="text-sm text-blue-200">Class Average</div>
                    </>
                  ) : (
                    <>
                      <div className="text-lg font-medium text-blue-200">No grades yet</div>
                      <div className="text-sm text-blue-200">Class Average</div>
                    </>
                  )}
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
                    {workflowStep !== 'name' && (
                      <div className="mt-2 text-xs text-blue-600 dark:text-blue-400 font-medium">
                        Workflow: {workflowStep === 'question' ? 'Step 2/6: Question Upload' :
                                  workflowStep === 'solution' ? 'Step 3/6: Solution Generation' :
                                  workflowStep === 'rubrics' ? 'Step 4/6: Rubrics Input' :
                                  workflowStep === 'upload' ? 'Step 5/6: Submissions Upload' :
                                  workflowStep === 'complete' ? 'Step 6/6: Complete' : 'Active'}
                      </div>
                    )}
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
                        {message.text.includes('```') ? (
                          <div className="text-sm">
                            {message.text.split('```').map((part, index) => {
                              if (index % 2 === 1) {
                                // This is a code block
                                return (
                                  <div key={index} className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 my-2">
                                    <pre className="text-xs text-gray-800 dark:text-gray-200 whitespace-pre-wrap font-mono">
                                      {part}
                                    </pre>
                                  </div>
                                );
                              } else {
                                // This is regular text
                                return (
                                  <span key={index} className="whitespace-pre-wrap">
                                    {part}
                                  </span>
                                );
                              }
                            })}
                          </div>
                        ) : (
                        <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                        )}
                        
                        {/* Upload buttons inside bot messages */}
                        {!message.isUser && (
                          <>
                            {/* Assignment Question Paper Upload - Step 2 */}
                            {(currentStep === 2 || workflowStep === 'question') && (message.text.includes('upload your assignment question paper') || message.text.includes('Question File Upload')) && (
                              <motion.div 
                                className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                              >
                                <div className="text-xs font-medium text-blue-800 dark:text-blue-200 mb-2 flex items-center">
                                  <span className="mr-1">📄</span>
                                  {workflowStep === 'question' ? 'Upload Assignment Question Paper' : 
                                   workflowStep === 'upload' ? 'Upload Student Submissions (ZIP)' :
                                   'Upload Assignment Question Paper'}
                                </div>
                                <input
                                  type="file"
                                  accept={workflowStep === 'upload' ? '.zip' : '.docx,.pdf,.txt'}
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      handleFileUpload(file);
                                    }
                                  }}
                                  className="w-full p-2 border border-blue-300 dark:border-blue-600 rounded-lg bg-white dark:bg-gray-800 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                />
                                <div className="text-xs text-blue-600 dark:text-blue-300 mt-1">
                                  {workflowStep === 'upload' ? 
                                    'Upload ZIP file containing student submissions (max 10MB)' :
                                    'Upload DOCX, PDF, or TXT file containing assignment questions (max 10MB)'}
                                </div>
                              </motion.div>
                            )}

                            {/* Student Submissions Upload - Step 4 */}
                            {(currentStep === 4 || workflowStep === 'upload') && (message.text.includes('upload student submissions') || message.text.includes('Student Submissions Upload')) && (
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
                  
                  {/* Solution Generation Loader */}
                  {isGeneratingSolution && (
                    <motion.div 
                      className="flex justify-start"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <motion.div 
                        className="bg-white/80 dark:bg-gray-700/80 text-gray-800 dark:text-gray-200 border border-gray-200/50 dark:border-gray-600/50 rounded-2xl shadow-lg px-4 py-3 max-w-xs"
                        whileHover={{ scale: 1.02 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="flex space-x-1">
                            <motion.div
                              className="w-2 h-2 bg-blue-500 rounded-full"
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                            />
                            <motion.div
                              className="w-2 h-2 bg-blue-500 rounded-full"
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                            />
                            <motion.div
                              className="w-2 h-2 bg-blue-500 rounded-full"
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                            />
          </div>
                          <span className="text-sm font-medium">🤖 AI is generating solution...</span>
                        </div>
                        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                          This may take 10-30 seconds
                        </div>
                      </motion.div>
                    </motion.div>
                  )}
                  
                  {/* Grading Progress Loader */}
                  {isGrading && (
                    <motion.div 
                      className="flex justify-start"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <motion.div 
                        className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 text-gray-800 dark:text-gray-200 border border-green-200 dark:border-green-800 rounded-2xl shadow-lg px-4 py-3 max-w-xs"
                        whileHover={{ scale: 1.02 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-green-500 border-t-transparent"></div>
                          <span className="text-sm font-medium">📊 Grading submissions...</span>
                        </div>
                        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                          Progress: {Math.round(gradingProgress)}%
                        </div>
                        <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <motion.div 
                            className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${gradingProgress}%` }}
                            transition={{ duration: 0.5 }}
                          />
                        </div>
                      </motion.div>
                    </motion.div>
                  )}
                  
                  {/* Auto-scroll anchor - positioned right after the last message */}
                  <div ref={messagesEndRef} />
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
                    
                    {/* Clear Chat Button */}
                    {(chatMessages.length > 0 || currentStep > 0) && (
                      <motion.button
                        type="button"
                        onClick={clearChatbotState}
                        className="px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 flex items-center space-x-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 300 }}
                        title="Clear chat and start over"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        <span>Clear</span>
                      </motion.button>
                    )}
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
                  
                  {/* State Saved Indicator */}
                  {isStateSaved && (
                    <motion.div 
                      className="mt-2 text-xs text-green-600 dark:text-green-400 flex items-center space-x-2"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ delay: 0.1 }}
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Progress saved</span>
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


                {/* Upload Progress */}
                {isUploading && (
                  <motion.div 
                    className="mt-4 p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg border border-green-200 dark:border-green-800"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div className="flex items-center space-x-2 mb-3">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-green-500 border-t-transparent"></div>
                      <div className="text-sm font-medium text-green-800 dark:text-green-200">
                        📁 Uploading & Processing ZIP File...
                      </div>
                    </div>
                    
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-2">
                      <div 
                        className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                    
                    <div className="flex justify-between items-center text-xs text-green-600 dark:text-green-300">
                      <span>{uploadProgress}% Complete</span>
                      <span className="text-gray-500 dark:text-gray-400">
                        {uploadProgress < 50 ? 'Uploading ZIP file...' : 
                         uploadProgress < 80 ? 'Extracting Python files...' : 
                         'Generating solution & grading...'}
                      </span>
                    </div>
                    
                    <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                      💡 This process includes uploading, extracting, and AI grading
                    </div>
                  </motion.div>
                )}

                {/* Grading Progress */}
                {isGrading && (
                  <motion.div 
                    className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg border border-purple-200 dark:border-purple-800"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div className="flex items-center space-x-2 mb-3">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-purple-500 border-t-transparent"></div>
                      <div className="text-sm font-medium text-purple-800 dark:text-purple-200">
                        🤖 AI Grading in Progress...
              </div>
                    </div>
                    
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-2">
                      <div 
                        className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${gradingProgress}%` }}
                      ></div>
            </div>
                    
                    <div className="flex justify-between items-center text-xs text-purple-600 dark:text-purple-300">
                      <span>{gradingProgress}% Complete</span>
                      <span className="text-gray-500 dark:text-gray-400">
                        {gradingProgress < 100 ? 'Processing submissions...' : 'Finalizing results...'}
                      </span>
                    </div>
                    
                    <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                      💡 This process typically takes 2-4 minutes for multiple submissions
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
                        onViewGrades={handleViewGrades}
                        onDownloadCSV={handleDownloadCSV}
                        onDeleteAssignment={handleDeleteAssignment}
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
                  {currentSolution}
                </pre>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex space-x-3">
              <button
                onClick={approveSolution}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                ✅ Accept
              </button>
              <button
                onClick={requestSolutionChange}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                🔄 Reject & Regenerate
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

      {/* Grades Modal */}
      {showGradesModal && selectedAssignment && (
        <motion.div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setShowGradesModal(false)}
        >
          <motion.div 
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Student Grades</h2>
                  <p className="text-blue-100 mt-1">{selectedAssignment.title}</p>
                </div>
                <button
                  onClick={() => setShowGradesModal(false)}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              {isLoadingGrades ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
                  <span className="ml-3 text-gray-600 dark:text-gray-300">Loading grades...</span>
                </div>
              ) : gradesData.length > 0 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{gradesData.length}</div>
                      <div className="text-sm text-blue-600 dark:text-blue-400">Total Submissions</div>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {Math.round(gradesData.reduce((sum, grade) => sum + grade.percentage, 0) / gradesData.length)}%
                      </div>
                      <div className="text-sm text-green-600 dark:text-green-400">Average Score</div>
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {gradesData.filter(grade => grade.percentage >= 80).length}
                      </div>
                      <div className="text-sm text-purple-600 dark:text-purple-400">A Grades (80%+)</div>
                    </div>
                    <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                        {gradesData.filter(grade => grade.percentage < 60).length}
                      </div>
                      <div className="text-sm text-orange-600 dark:text-orange-400">Below 60%</div>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-700">
                          <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Student</th>
                          <th className="text-center py-3 px-4 font-semibold text-gray-900 dark:text-white">Score</th>
                          <th className="text-center py-3 px-4 font-semibold text-gray-900 dark:text-white">Percentage</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Feedback</th>
                        </tr>
                      </thead>
                      <tbody>
                        {gradesData.map((grade, index) => (
                          <tr key={index} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                            <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">
                              {grade.student_name}
                            </td>
                            <td className="py-3 px-4 text-center text-gray-600 dark:text-gray-300">
                              {grade.score}/{grade.max_points}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                grade.percentage >= 80 ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                                grade.percentage >= 70 ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
                                grade.percentage >= 60 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                                'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                              }`}>
                                {grade.percentage}%
                              </span>
                            </td>
                            <td className="py-3 px-4 text-gray-600 dark:text-gray-300 max-w-xs truncate">
                              {grade.feedback}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-gray-400 dark:text-gray-500 mb-4">
                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Grades Available</h3>
                  <p className="text-gray-600 dark:text-gray-300">This assignment hasn't been graded yet.</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 dark:bg-gray-700/50 px-6 py-4 flex justify-end space-x-3">
              <button
                onClick={() => setShowGradesModal(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleDownloadCSV(selectedAssignment);
                  setShowGradesModal(false);
                }}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Download CSV</span>
              </button>
          </div>
          </motion.div>
        </motion.div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && assignmentToDelete && (
        <motion.div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setShowDeleteModal(false)}
        >
          <motion.div 
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                  <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Delete Assignment
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    This action cannot be undone
                  </p>
                </div>
              </div>
              
              <div className="mb-6">
                <p className="text-gray-700 dark:text-gray-300 mb-2">
                  Are you sure you want to delete this assignment?
                </p>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                  <p className="font-medium text-gray-900 dark:text-white">
                    {assignmentToDelete.title}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {assignmentToDelete.description}
                  </p>
                </div>
                <p className="text-sm text-red-600 dark:text-red-400 mt-2">
                  ⚠️ This will permanently delete all grades, submissions, and related data.
                </p>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteAssignment}
                  disabled={isDeleting}
                  className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                >
                  {isDeleting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      <span>Delete</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default SimpleDashboard;