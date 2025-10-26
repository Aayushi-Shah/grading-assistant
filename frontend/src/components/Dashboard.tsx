import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Upload, 
  FileText, 
  Download, 
  CheckCircle, 
  Clock,
  Users,
  TrendingUp,
  Bot,
  FileArchive,
  ClipboardList
} from 'lucide-react';
import Chatbot from './Chatbot';
import AssignmentCard from './AssignmentCard';

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
  due_date: string | null;
  max_points: number;
  created_at: string;
  zip_file_path: string | null;
  extracted_folder_path: string | null;
}

interface GradingStats {
  totalAssignments: number;
  totalSubmissions: number;
  gradedSubmissions: number;
  averageScore: number;
}

const Dashboard: React.FC = () => {
  const [professor, setProfessor] = useState<Professor | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [stats, setStats] = useState<GradingStats>({
    totalAssignments: 0,
    totalSubmissions: 0,
    gradedSubmissions: 0,
    averageScore: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch professor data (using first professor for demo)
      const professorResponse = await fetch('/api/professors');
      const professors = await professorResponse.json();
      if (professors.length > 0) {
        setProfessor(professors[0]);
      }

      // Fetch assignments
      const assignmentsResponse = await fetch('/api/assignments');
      const assignmentsData = await assignmentsResponse.json();
      setAssignments(assignmentsData);

      // Calculate stats
      const totalSubmissions = assignmentsData.reduce((sum: number, assignment: Assignment) => 
        assignment.extracted_folder_path ? sum + 1 : sum, 0
      );
      
      setStats({
        totalAssignments: assignmentsData.length,
        totalSubmissions,
        gradedSubmissions: Math.floor(totalSubmissions * 0.7), // Mock data
        averageScore: 85.5 // Mock data
      });

      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
      {/* Header */}
      <motion.header 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="bg-white shadow-lg border-b border-blue-100"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 p-3 rounded-xl"
              >
                <BookOpen className="w-8 h-8 text-white" />
              </motion.div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Grading Assistant</h1>
                <p className="text-gray-600">AI-Powered Assignment Grading</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">Welcome back,</p>
                <p className="font-semibold text-gray-900">{professor?.name || 'Professor'}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-pink-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">
                  {professor?.name?.charAt(0) || 'P'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-4xl font-bold mb-2">
                  Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}, {professor?.name?.split(' ')[0] || 'Professor'}!
                </h2>
                <p className="text-xl text-blue-100">
                  Ready to grade some assignments with AI assistance?
                </p>
              </div>
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
                className="text-6xl"
              >
                🤖
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <div className="bg-white rounded-xl p-6 shadow-lg border border-blue-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Assignments</p>
                <p className="text-3xl font-bold text-blue-600">{stats.totalAssignments}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-orange-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Submissions</p>
                <p className="text-3xl font-bold text-orange-600">{stats.totalSubmissions}</p>
              </div>
              <div className="bg-orange-100 p-3 rounded-lg">
                <Upload className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-green-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Graded</p>
                <p className="text-3xl font-bold text-green-600">{stats.gradedSubmissions}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-purple-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Score</p>
                <p className="text-3xl font-bold text-purple-600">{stats.averageScore}%</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Assignments */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="lg:col-span-2"
          >
            <div className="bg-white rounded-xl shadow-lg border border-gray-100">
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-blue-600" />
                  Recent Assignments
                </h3>
              </div>
              <div className="p-6">
                {assignments.length > 0 ? (
                  <div className="space-y-4">
                    {assignments.map((assignment, index) => (
                      <motion.div
                        key={assignment.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                      >
                        <AssignmentCard assignment={assignment} />
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No assignments yet</p>
                    <p className="text-sm text-gray-400">Create your first assignment to get started</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* AI Chatbot */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 h-full">
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                  <Bot className="w-5 h-5 mr-2 text-green-600" />
                  AI Grading Assistant
                </h3>
                <p className="text-sm text-gray-600 mt-1">Upload files and get AI-powered grading</p>
              </div>
              <div className="p-6">
                <Chatbot />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
