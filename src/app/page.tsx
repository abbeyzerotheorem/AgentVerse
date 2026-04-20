'use client';

import { useState, useEffect, useRef } from 'react';
import { ChatInput } from '../components/ChatInput';
import { ChatWindow } from '../components/ChatWindow';
import { Settings } from '../components/Settings';
import { History } from '../components/History';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  files?: File[];
}

interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
}

export default function Home() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedConversations = localStorage.getItem('agentverse-conversations');
    const savedCurrentId = localStorage.getItem('agentverse-current-conversation');
    const savedDarkMode = localStorage.getItem('agentverse-dark-mode');

    if (savedConversations) {
      setConversations(JSON.parse(savedConversations));
    }
    if (savedCurrentId) {
      setCurrentConversationId(savedCurrentId);
    }
    if (savedDarkMode) {
      setDarkMode(JSON.parse(savedDarkMode));
    }
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('agentverse-conversations', JSON.stringify(conversations));
  }, [conversations]);

  useEffect(() => {
    localStorage.setItem('agentverse-current-conversation', currentConversationId || '');
  }, [currentConversationId]);

  useEffect(() => {
    localStorage.setItem('agentverse-dark-mode', JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const currentConversation = conversations.find(c => c.id === currentConversationId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentConversation?.messages, loading]);

  const createNewConversation = () => {
    const newConversation: Conversation = {
      id: Date.now().toString(),
      title: 'New Conversation',
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setConversations(prev => [newConversation, ...prev]);
    setCurrentConversationId(newConversation.id);
  };

  const updateConversationTitle = (conversationId: string, firstMessage: string) => {
    const title = firstMessage.length > 50 ? firstMessage.substring(0, 50) + '...' : firstMessage;
    setConversations(prev => prev.map(conv =>
      conv.id === conversationId
        ? { ...conv, title, updatedAt: Date.now() }
        : conv
    ));
  };

  const deleteConversation = (conversationId: string) => {
    setConversations(prev => prev.filter(c => c.id !== conversationId));
    if (currentConversationId === conversationId) {
      const remaining = conversations.filter(c => c.id !== conversationId);
      setCurrentConversationId(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  const handleSend = async (message: string, files?: File[]) => {
    if (!currentConversationId) {
      createNewConversation();
      // Wait for state to update
      setTimeout(() => handleSend(message, files), 0);
      return;
    }

    setLoading(true);
    const userMessage: ChatMessage = {
      role: 'user',
      content: message,
      timestamp: Date.now(),
      files: files
    };

    // Update conversation with user message
    setConversations(prev => prev.map(conv =>
      conv.id === currentConversationId
        ? {
            ...conv,
            messages: [...conv.messages, userMessage],
            updatedAt: Date.now(),
            title: conv.messages.length === 0 ? (message.length > 50 ? message.substring(0, 50) + '...' : message) : conv.title
          }
        : conv
    ));

    try {
      const formData = new FormData();
      formData.append('message', message);
      if (files && files.length > 0) {
        files.forEach((file, index) => {
          formData.append(`file_${index}`, file);
        });
        formData.append('fileCount', files.length.toString());
      }

      const response = await fetch('/api/chat', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        const errorMessage = data?.error || 'Failed to get response';
        throw new Error(errorMessage);
      }

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: data.text,
        timestamp: Date.now()
      };

      // Update conversation with assistant message
      setConversations(prev => prev.map(conv =>
        conv.id === currentConversationId
          ? { ...conv, messages: [...conv.messages, assistantMessage], updatedAt: Date.now() }
          : conv
      ));

    } catch (error) {
      console.error('Error:', error);
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: Date.now()
      };
      setConversations(prev => prev.map(conv =>
        conv.id === currentConversationId
          ? { ...conv, messages: [...conv.messages, errorMessage], updatedAt: Date.now() }
          : conv
      ));
    } finally {
      setLoading(false);
    }
  };

  const exportConversation = () => {
    if (!currentConversation) return;

    const content = currentConversation.messages
      .map(msg => `${msg.role === 'user' ? 'You' : 'AgentVerse'}: ${msg.content}`)
      .join('\n\n');

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentConversation.title}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100'}`}>
      {/* Header */}
      <div className={`${darkMode ? 'bg-gray-800/80 border-gray-700' : 'bg-white/80 backdrop-blur-sm border-gray-200/50'} border-b sticky top-0 z-20`}>
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img src="/agentverse.png" alt="AgentVerse" className="w-10 h-10 object-contain" />
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent dark:from-white dark:to-gray-300">
                  AgentVerse
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">AI-Powered Conversations</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowHistory(!showHistory)}
                className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
                title="Conversation History"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>

              <button
                onClick={() => setShowSettings(!showSettings)}
                className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
                title="Settings"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>

              <button
                onClick={createNewConversation}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg text-sm font-medium transition-all duration-200"
              >
                New Chat
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* History Sidebar */}
          {showHistory && (
            <div className={`${darkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 backdrop-blur-sm border-gray-200/50'} border rounded-2xl p-4 w-80 h-[calc(100vh-140px)] overflow-y-auto`}>
              <History
                conversations={conversations}
                currentConversationId={currentConversationId}
                onSelectConversation={setCurrentConversationId}
                onDeleteConversation={deleteConversation}
                darkMode={darkMode}
              />
            </div>
          )}

          {/* Settings Sidebar */}
          {showSettings && (
            <div className={`${darkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 backdrop-blur-sm border-gray-200/50'} border rounded-2xl p-4 w-80`}>
              <Settings
                darkMode={darkMode}
                onToggleDarkMode={setDarkMode}
                onExport={exportConversation}
                darkModeEnabled={darkMode}
              />
            </div>
          )}

          {/* Main Chat Area */}
          <div className="flex-1">
            {currentConversation ? (
              <div className={`${darkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/80 backdrop-blur-sm border-gray-200/50'} rounded-2xl shadow-xl border overflow-hidden`}>
                <div className="px-6 py-4 border-b border-gray-200/50 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                      {currentConversation.title}
                    </h2>
                    <button
                      onClick={exportConversation}
                      className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
                      title="Export Conversation"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </button>
                  </div>
                </div>
                <ChatWindow messages={currentConversation.messages} loading={loading} darkMode={darkMode} />
                <div ref={messagesEndRef} />
              </div>
            ) : (
              // Welcome Screen
              <div className="text-center py-20">
                <div className="mx-auto mb-6">
                  <img src="/agentverse.png" alt="AgentVerse" className="w-20 h-20 object-contain" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Welcome to AgentVerse</h2>
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
                  Start a conversation with our advanced AI assistant. Ask questions, get help, or just chat about anything!
                </p>
                <button
                  onClick={createNewConversation}
                  className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl text-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Start New Conversation
                </button>
              </div>
            )}

            {/* Input Area */}
            {currentConversation && (
              <div className="mt-6">
                <div className={`${darkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/80 backdrop-blur-sm border-gray-200/50'} rounded-2xl shadow-xl border p-6`}>
                  <ChatInput onSend={handleSend} loading={loading} darkMode={darkMode} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}