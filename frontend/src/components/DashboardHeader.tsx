import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon, GraduationCap } from 'lucide-react';
import { Professor } from '../types';

interface DashboardHeaderProps {
  professor: Professor | null;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  classAverage: number;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  professor,
  isDarkMode,
  onToggleDarkMode,
  classAverage
}) => {
  return (
    <motion.div
      className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 rounded-3xl shadow-2xl overflow-hidden mb-8"
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/10"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-white/5 to-transparent rounded-full -translate-y-48 translate-x-48"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-white/5 to-transparent rounded-full translate-y-40 -translate-x-40"></div>
      
      <div className="relative z-10 p-8 lg:p-12">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          {/* Left Section - Logo and Title */}
          <motion.div
            className="flex items-center space-x-6 mb-6 lg:mb-0"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <motion.div
              className="relative w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-xl"
              whileHover={{ 
                scale: 1.1, 
                rotate: 5,
                boxShadow: "0 20px 40px rgba(255, 255, 255, 0.2)"
              }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <GraduationCap className="w-8 h-8 text-white" />
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl"></div>
            </motion.div>
            
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold text-white mb-2">
                Grading Assistant
              </h1>
              <p className="text-blue-100 text-lg font-medium">
                AI-Powered Assignment Management
              </p>
            </div>
          </motion.div>

          {/* Right Section - Professor Info and Dark Mode Toggle */}
          <motion.div
            className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-6"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            {/* Class Average Display */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-4 border border-white/20">
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-1">
                  {classAverage.toFixed(1)}%
                </div>
                <div className="text-blue-100 text-sm font-medium">
                  Class Average
                </div>
              </div>
            </div>

            {/* Professor Info */}
            {professor && (
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-4 border border-white/20">
                <div className="text-center">
                  <div className="text-white font-semibold text-lg mb-1">
                    {professor.name}
                  </div>
                  <div className="text-blue-100 text-sm">
                    {professor.department}
                  </div>
                </div>
              </div>
            )}

            {/* Dark Mode Toggle */}
            <motion.button
              onClick={onToggleDarkMode}
              className="relative w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20 shadow-xl hover:bg-white/30 transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isDarkMode ? (
                <Sun className="w-6 h-6 text-yellow-300" />
              ) : (
                <Moon className="w-6 h-6 text-blue-200" />
              )}
            </motion.button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default DashboardHeader;
