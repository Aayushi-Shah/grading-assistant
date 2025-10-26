import React from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Calendar, 
  Users, 
  Download, 
  CheckCircle,
  Clock,
  FileArchive
} from 'lucide-react';

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

interface AssignmentCardProps {
  assignment: Assignment;
}

const AssignmentCard: React.FC<AssignmentCardProps> = ({ assignment }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = () => {
    if (assignment.extracted_folder_path) {
      return 'bg-green-100 text-green-800 border-green-200';
    }
    return 'bg-orange-100 text-orange-800 border-orange-200';
  };

  const getStatusText = () => {
    if (assignment.extracted_folder_path) {
      return 'Submissions Ready';
    }
    return 'Awaiting Submissions';
  };

  const getStatusIcon = () => {
    if (assignment.extracted_folder_path) {
      return <CheckCircle className="w-4 h-4" />;
    }
    return <Clock className="w-4 h-4" />;
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-gradient-to-r from-white to-blue-50 rounded-lg border border-gray-200 p-6 hover:shadow-md transition-all duration-200"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <div className="bg-blue-100 p-2 rounded-lg">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900">{assignment.title}</h4>
          </div>
          
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {assignment.description}
          </p>
          
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4" />
              <span>Created {formatDate(assignment.created_at)}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Users className="w-4 h-4" />
              <span>{assignment.max_points} points</span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col items-end space-y-2">
          <div className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor()}`}>
            {getStatusIcon()}
            <span>{getStatusText()}</span>
          </div>
          
          {assignment.extracted_folder_path && (
            <div className="flex space-x-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded-md text-xs font-medium flex items-center space-x-1 transition-colors"
              >
                <FileArchive className="w-3 h-3" />
                <span>View Files</span>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded-md text-xs font-medium flex items-center space-x-1 transition-colors"
              >
                <Download className="w-3 h-3" />
                <span>Download CSV</span>
              </motion.button>
            </div>
          )}
        </div>
      </div>
      
      {assignment.due_date && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>Due: {formatDate(assignment.due_date)}</span>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default AssignmentCard;
