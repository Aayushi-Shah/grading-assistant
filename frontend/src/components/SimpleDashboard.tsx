import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Bot, 
  Sun, 
  Moon, 
  GraduationCap,
  Calendar,
  Target,
  Users
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

const SimpleDashboard: React.FC = () => {
  const [professor, setProfessor] = useState<Professor | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');

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
          const professorResponse = await fetch(`/api/professors/${professorId}`);
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
          const professorResponse = await fetch('/api/professors');
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
      const assignmentsResponse = await fetch('/api/assignments');
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

    // Enhanced chatbot responses with more comprehensive support
    if (userInput.includes('create') || userInput.includes('new') || userInput.includes('assignment')) {
      startAssignmentCreation();
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
                <div className="flex-1 overflow-y-auto mb-4 space-y-3 min-h-[150px] max-h-[200px]">
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
                    className="flex space-x-3 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-3 border border-gray-200/50 dark:border-gray-600/50"
                  >
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Ask me about grading..."
                      className="flex-1 px-4 py-2 bg-transparent border-none focus:outline-none text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    />
                    <motion.button
                      type="submit"
                      className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-2 rounded-xl text-sm font-medium shadow-lg transition-all duration-200"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      Send
                    </motion.button>
                  </form>
                </motion.div>
                
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
                {assignments.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {assignments.map((assignment, index) => (
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
                          
                          <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                            <Users className="w-4 h-4" />
                            <span>{Math.floor(Math.random() * 20) + 5} submissions</span>
                          </div>
                        </div>
                      </motion.div>
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
    </div>
  );
};

export default SimpleDashboard;