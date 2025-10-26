import React from 'react';
import { motion } from 'framer-motion';
import { X, Download } from 'lucide-react';
import { Assignment, Grade } from '../types';

interface GradesModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignment: Assignment | null;
  gradesData: Grade[];
  isLoadingGrades: boolean;
  onDownloadCSV: (assignment: Assignment) => void;
}

const GradesModal: React.FC<GradesModalProps> = ({
  isOpen,
  onClose,
  assignment,
  gradesData,
  isLoadingGrades,
  onDownloadCSV
}) => {
  if (!isOpen || !assignment) return null;

  const averageScore = gradesData.length > 0 
    ? Math.round(gradesData.reduce((sum, grade) => sum + grade.percentage, 0) / gradesData.length)
    : 0;

  const aGrades = gradesData.filter(grade => grade.percentage >= 80).length;
  const below60 = gradesData.filter(grade => grade.percentage < 60).length;

  return (
    <motion.div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div 
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Student Grades</h2>
              <p className="text-blue-100 mt-1">{assignment.title}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
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
                    {averageScore}%
                  </div>
                  <div className="text-sm text-green-600 dark:text-green-400">Average Score</div>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {aGrades}
                  </div>
                  <div className="text-sm text-purple-600 dark:text-purple-400">A Grades (80%+)</div>
                </div>
                <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {below60}
                  </div>
                  <div className="text-sm text-orange-600 dark:text-orange-400">Below 60%</div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Student</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Score</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Feedback</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gradesData.map((grade, index) => (
                      <tr key={index} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">
                          {grade.student_name}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            grade.percentage >= 80 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                              : grade.percentage >= 60
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                              : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                          }`}>
                            {grade.percentage}%
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-300 max-w-xs truncate">
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
              <div className="text-gray-500 dark:text-gray-400">
                No grades available for this assignment.
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 dark:bg-gray-700/50 px-6 py-4 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors"
          >
            Close
          </button>
          <button
            onClick={() => {
              onDownloadCSV(assignment);
              onClose();
            }}
            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Download CSV</span>
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default GradesModal;
