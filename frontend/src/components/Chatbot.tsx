import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  Send, 
  FileArchive, 
  FileText, 
  ClipboardList,
  Bot,
  User,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';

interface ChatMessage {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  files?: File[];
}

interface ChatbotProps {}

const Chatbot: React.FC<ChatbotProps> = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'bot',
      content: 'Hello! I\'m your AI Grading Assistant. I can help you grade assignments by analyzing student submissions. Please upload a ZIP file with student submissions, the assignment description, and any rubrics you\'d like me to use.',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState<'upload' | 'assignment' | 'rubric' | 'processing' | 'complete'>('upload');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setUploadedFiles(prev => [...prev, ...files]);
    
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: `Uploaded ${files.length} file(s): ${files.map(f => f.name).join(', ')}`,
      timestamp: new Date(),
      files
    };
    
    setMessages(prev => [...prev, newMessage]);
    
    // Simulate bot response
    setTimeout(() => {
      const botResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: 'Great! I can see you\'ve uploaded some files. Now please provide me with the assignment description and any rubrics you\'d like me to use for grading.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);
      setCurrentStep('assignment');
    }, 1000);
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMessage]);
    setInputMessage('');

    // Simulate bot processing
    setIsProcessing(true);
    setTimeout(() => {
      const botResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: 'Perfect! I have all the information I need. I\'ll now analyze the submissions and create an ideal solution. This may take a few minutes...',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);
      setCurrentStep('processing');
      setIsProcessing(false);
    }, 2000);
  };

  const getStepIcon = (step: string) => {
    switch (step) {
      case 'upload':
        return <FileArchive className="w-5 h-5" />;
      case 'assignment':
        return <FileText className="w-5 h-5" />;
      case 'rubric':
        return <ClipboardList className="w-5 h-5" />;
      case 'processing':
        return <Loader2 className="w-5 h-5 animate-spin" />;
      case 'complete':
        return <CheckCircle className="w-5 h-5" />;
      default:
        return <Bot className="w-5 h-5" />;
    }
  };

  const getStepColor = (step: string) => {
    switch (step) {
      case 'upload':
        return 'bg-blue-100 text-blue-600';
      case 'assignment':
        return 'bg-orange-100 text-orange-600';
      case 'rubric':
        return 'bg-purple-100 text-purple-600';
      case 'processing':
        return 'bg-yellow-100 text-yellow-600';
      case 'complete':
        return 'bg-green-100 text-green-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Progress Steps */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-600">Grading Progress</span>
          <span className="text-xs text-gray-500">
            {currentStep === 'upload' && 'Step 1/4'}
            {currentStep === 'assignment' && 'Step 2/4'}
            {currentStep === 'rubric' && 'Step 3/4'}
            {currentStep === 'processing' && 'Step 4/4'}
            {currentStep === 'complete' && 'Complete!'}
          </span>
        </div>
        <div className="flex space-x-2">
          {['upload', 'assignment', 'rubric', 'processing'].map((step, index) => (
            <div
              key={step}
              className={`flex-1 h-2 rounded-full ${
                currentStep === step || 
                (step === 'upload' && ['assignment', 'rubric', 'processing', 'complete'].includes(currentStep)) ||
                (step === 'assignment' && ['rubric', 'processing', 'complete'].includes(currentStep)) ||
                (step === 'rubric' && ['processing', 'complete'].includes(currentStep)) ||
                (step === 'processing' && currentStep === 'complete')
                  ? 'bg-blue-500'
                  : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto max-h-64 space-y-4 mb-4">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-start space-x-2 max-w-xs ${
                message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  message.type === 'user' 
                    ? 'bg-blue-500' 
                    : 'bg-green-500'
                }`}>
                  {message.type === 'user' ? (
                    <User className="w-4 h-4 text-white" />
                  ) : (
                    <Bot className="w-4 h-4 text-white" />
                  )}
                </div>
                <div className={`px-4 py-2 rounded-lg ${
                  message.type === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}>
                  <p className="text-sm">{message.content}</p>
                  {message.files && message.files.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {message.files.map((file, index) => (
                        <div key={index} className="flex items-center space-x-2 text-xs">
                          <FileArchive className="w-3 h-3" />
                          <span>{file.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* File Upload Area */}
      {currentStep === 'upload' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4"
        >
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
          >
            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Click to upload ZIP file with student submissions</p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".zip"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        </motion.div>
      )}

      {/* Input Area */}
      <div className="flex space-x-2">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder={
            currentStep === 'upload' ? 'Upload files first...' :
            currentStep === 'assignment' ? 'Describe the assignment...' :
            currentStep === 'rubric' ? 'Provide grading rubrics...' :
            'Type your message...'
          }
          disabled={currentStep === 'upload' || isProcessing}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSendMessage}
          disabled={!inputMessage.trim() || isProcessing}
          className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white p-1.5 rounded-md transition-colors"
        >
          {isProcessing ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </motion.button>
      </div>

      {/* Status Indicator */}
      {currentStep === 'processing' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg"
        >
          <div className="flex items-center space-x-2">
            <Loader2 className="w-4 h-4 animate-spin text-yellow-600" />
            <span className="text-sm text-yellow-800">AI is analyzing submissions and creating ideal solution...</span>
          </div>
        </motion.div>
      )}

      {currentStep === 'complete' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg"
        >
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-sm text-green-800">Grading complete! Check your assignments for the CSV report.</span>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Chatbot;
