import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bot } from 'lucide-react';
import { ChatMessage } from '../types';

interface ChatInterfaceProps {
  chatMessages: ChatMessage[];
  chatInput: string;
  setChatInput: (input: string) => void;
  handleChatSubmit: (e: React.FormEvent) => void;
  clearChatbotState: () => void;
  isGeneratingSolution: boolean;
  isGrading: boolean;
  gradingProgress: number;
  currentStep: number;
  workflowStep: 'name' | 'question' | 'solution' | 'rubrics' | 'upload' | 'complete';
  onFileUpload: (file: File) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  chatMessages,
  chatInput,
  setChatInput,
  handleChatSubmit,
  clearChatbotState,
  isGeneratingSolution,
  isGrading,
  gradingProgress,
  currentStep,
  workflowStep,
  onFileUpload,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const renderMessage = (message: ChatMessage, index: number) => {
    const isUser = message.isUser;
    
    return (
      <motion.div
        key={message.id}
        className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.1 }}
      >
        <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
          isUser 
            ? 'bg-gradient-to-r from-indigo-500 to-blue-600 text-white' 
            : 'bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 text-gray-800 dark:text-gray-200'
        }`}>
          <div className="text-sm whitespace-pre-wrap">
            {message.text.split('\n').map((line, lineIndex) => {
              if (line.startsWith('**') && line.endsWith('**')) {
                return (
                  <div key={lineIndex} className="font-bold text-base mb-1">
                    {line.slice(2, -2)}
                  </div>
                );
              }
              if (line.startsWith('```')) {
                return (
                  <div key={lineIndex} className="bg-black/10 dark:bg-white/10 rounded-lg p-2 font-mono text-xs mt-2">
                    {line.slice(3)}
                  </div>
                );
              }
              if (line.includes('📁') && line.includes('Upload')) {
                return (
                  <div key={lineIndex} className="mt-2">
                    <input
                      type="file"
                      accept=".zip,.py,.java,.cpp,.c,.js,.ts,.html,.css"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) onFileUpload(file);
                      }}
                      className="hidden"
                      id={`file-upload-${message.id}-${lineIndex}`}
                    />
                    <label
                      htmlFor={`file-upload-${message.id}-${lineIndex}`}
                      className="inline-flex items-center px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded-lg cursor-pointer transition-colors"
                    >
                      📁 Upload File
                    </label>
                  </div>
                );
              }
              return (
                <div key={lineIndex} className={lineIndex === 0 ? '' : 'mt-1'}>
                  {line}
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="relative bg-white/90 dark:bg-slate-800/90 backdrop-blur-2xl rounded-2xl shadow-2xl border border-slate-200/40 dark:border-slate-700/50 h-fit max-h-[700px] flex flex-col overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/40 via-transparent to-blue-50/40 dark:from-indigo-900/20 dark:to-blue-900/20"></div>
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-400/10 to-blue-400/10 rounded-full blur-2xl"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-400/10 to-pink-400/10 rounded-full blur-xl"></div>
      
      {/* Header */}
      <div className="relative p-6 border-b border-white/20 dark:border-gray-700/30 z-10">
        <motion.div 
          className="flex items-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <motion.div
            className="relative w-14 h-14 bg-gradient-to-br from-green-500 via-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mr-4 shadow-xl"
            whileHover={{ 
              scale: 1.1, 
              rotate: 5,
              boxShadow: "0 20px 40px rgba(34, 197, 94, 0.3)"
            }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Bot className="w-8 h-8 text-white" />
            <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-blue-400 rounded-2xl blur opacity-30"></div>
          </motion.div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 dark:from-white dark:via-blue-100 dark:to-purple-100 bg-clip-text text-transparent">
                  AI Assistant
                </h3>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Your intelligent grading companion</p>
              </div>
              
              {/* Clear Chat Cross Button */}
              {chatMessages.length > 0 && (
                <motion.button
                  onClick={clearChatbotState}
                  className="w-8 h-8 bg-red-500/10 hover:bg-red-500/20 rounded-full flex items-center justify-center transition-all duration-300 group"
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  title="Clear chat"
                >
                  <svg className="w-4 h-4 text-red-500 group-hover:text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </motion.button>
              )}
            </div>
            
            {workflowStep !== 'name' && (
              <motion.div 
                className="mt-2 inline-flex items-center px-3 py-1 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-full text-xs font-semibold text-blue-700 dark:text-blue-300"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.0 }}
              >
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></div>
                {workflowStep === 'question' ? `Step ${currentStep}/5: Assignment Name` :
                 workflowStep === 'solution' ? `Step ${currentStep}/5: Assignment Question` :
                 workflowStep === 'rubrics' ? `Step ${currentStep}/5: Generating Solution` :
                 workflowStep === 'upload' ? `Step ${currentStep}/5: Ready for Upload` :
                 workflowStep === 'complete' ? 'Step 5/5: Complete' : 'Active'}
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
      
      {/* Chat Messages Area */}
      <div className="relative p-6 flex-1 flex flex-col z-10">
        <div className="flex-1 overflow-y-auto mb-6 space-y-4 min-h-[250px] max-h-[400px] scrollbar-thin scrollbar-thumb-blue-300 dark:scrollbar-thumb-blue-600 scrollbar-track-transparent">
          {chatMessages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-gray-500 dark:text-gray-400">
                <Bot className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">Start a conversation to get help with grading</p>
              </div>
            </div>
          ) : (
            chatMessages.map((message, index) => renderMessage(message, index))
          )}

          {/* Solution Generation Loader */}
          {isGeneratingSolution && (
            <motion.div
              className="flex justify-start"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 text-gray-800 dark:text-gray-200 border border-blue-200 dark:border-blue-800 rounded-2xl shadow-lg px-4 py-3 max-w-xs"
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

          {/* Auto-scroll anchor */}
          <div ref={messagesEndRef} />
        </div>

        {/* File Upload Section - Show when in upload step */}
        {workflowStep === 'upload' && (
          <motion.div 
            className="border-t border-slate-200 dark:border-slate-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="text-center">
              <div className="mb-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-2">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-1">Upload Student Submissions</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Upload a ZIP file containing student submissions for grading</p>
              </div>
              
              <div className="relative">
                <input
                  type="file"
                  accept=".zip"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) onFileUpload(file);
                  }}
                  className="hidden"
                  id="assignment-file-upload"
                />
                <label
                  htmlFor="assignment-file-upload"
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-xl cursor-pointer transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  Choose ZIP File
                </label>
              </div>
              
              <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                <p>📁 Make sure your ZIP file contains individual folders for each student</p>
                <p>📝 Each folder should contain the student's code files</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Input Form */}
        <motion.div
          className="relative z-10 mt-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.6 }}
        >
          <form
            onSubmit={handleChatSubmit}
            className="relative flex space-x-3 bg-white/95 dark:bg-slate-800/95 backdrop-blur-2xl rounded-2xl p-4 border border-slate-200/40 dark:border-slate-700/50 shadow-xl"
          >
            {/* Input Background Glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-50/60 to-blue-50/60 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-2xl"></div>

            <div className="flex-1 relative">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onFocus={(e) => e.target.placeholder = "Ask me about grading, assignments, or analytics..."}
                onBlur={(e) => e.target.placeholder = "Ask me about grading..."}
                placeholder="Ask me about grading..."
                className="w-full px-5 py-4 bg-transparent border-none focus:outline-none text-base text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-300 font-medium"
                style={{
                  boxShadow: chatInput ? '0 0 0 3px rgba(59, 130, 246, 0.3)' : 'none'
                }}
              />
              {chatInput && (
                <motion.div
                  className="absolute right-4 top-1/2 transform -translate-y-1/2"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                >
                  <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse shadow-lg"></div>
                </motion.div>
              )}
            </div>

            <motion.button
              type="submit"
              disabled={!chatInput.trim()}
              className={`relative px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center space-x-2 ${
                chatInput.trim()
                  ? 'bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl'
                  : 'bg-slate-300 dark:bg-slate-600 text-slate-500 dark:text-slate-400 cursor-not-allowed'
              }`}
              whileHover={chatInput.trim() ? {
                scale: 1.02,
                y: -1
              } : {}}
              whileTap={chatInput.trim() ? { scale: 0.98 } : {}}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <span>Send</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
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
      </div>
    </div>
  );
};

export default ChatInterface;
