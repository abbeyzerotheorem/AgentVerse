'use client';

import { useEffect, useRef, useState } from 'react';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  files?: File[];
}

interface ChatWindowProps {
  messages: ChatMessage[];
  loading?: boolean;
  darkMode?: boolean;
}

export function ChatWindow({ messages, loading, darkMode }: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const copyToClipboard = async (content: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000); // Reset after 2 seconds
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className="h-[60vh] overflow-y-auto px-6 py-4 space-y-6">
      {messages.map((message, index) => {
        const messageId = `${message.timestamp}-${index}`;
        const isCopied = copiedMessageId === messageId;

        return (
          <div
            key={index}
            className={`flex items-start space-x-3 ${
              message.role === 'assistant' ? 'justify-start' : 'justify-end'
            }`}
          >
            {message.role === 'assistant' ? (
              <>
                {/* Assistant Avatar */}
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>

                {/* Assistant Message Bubble */}
                <div className="relative group">
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-3 shadow-sm ${
                      darkMode ? 'bg-gray-700 text-gray-100' : 'bg-gray-100 text-gray-900'
                    } rounded-tl-sm`}
                  >
                    {/* Display images if any */}
                    {message.files && message.files.length > 0 && (
                      <div className="mb-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {message.files.map((file, fileIndex) => (
                          <div key={fileIndex} className="relative">
                            <img
                              src={URL.createObjectURL(file)}
                              alt={file.name}
                              className="w-full max-w-xs h-auto rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                              onClick={() => window.open(URL.createObjectURL(file), '_blank')}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                    <div className={`text-xs mt-2 ${
                      darkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>

                  {/* Copy Button */}
                  <button
                    onClick={() => copyToClipboard(message.content, messageId)}
                    className={`absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 rounded-md ${
                      darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-200'
                    }`}
                    title="Copy message"
                  >
                    {isCopied ? (
                      <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    )}
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* User Message Bubble */}
                <div className="relative group">
                  <div className="max-w-[75%] rounded-2xl px-4 py-3 shadow-sm bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-tr-sm">
                    {/* Display images if any */}
                    {message.files && message.files.length > 0 && (
                      <div className="mb-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {message.files.map((file, fileIndex) => (
                          <div key={fileIndex} className="relative">
                            <img
                              src={URL.createObjectURL(file)}
                              alt={file.name}
                              className="w-full max-w-xs h-auto rounded-lg cursor-pointer hover:opacity-90 transition-opacity border-2 border-white/20"
                              onClick={() => window.open(URL.createObjectURL(file), '_blank')}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                    <div className="text-xs mt-2 text-blue-100">
                      {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>

                  {/* Copy Button for User Messages */}
                  <button
                    onClick={() => copyToClipboard(message.content, messageId)}
                    className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 rounded-md hover:bg-blue-700"
                    title="Copy message"
                  >
                    {isCopied ? (
                      <svg className="w-4 h-4 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    )}
                  </button>
                </div>

                {/* User Avatar */}
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </>
            )}
          </div>
        );
      })}

      {/* Typing Indicator */}
      {loading && (
        <div className="flex items-start space-x-3 justify-start">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <div className={`rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm ${
            darkMode ? 'bg-gray-700' : 'bg-gray-100'
          }`}>
            <div className="flex space-x-1">
              <div className={`w-2 h-2 rounded-full animate-bounce ${
                darkMode ? 'bg-gray-400' : 'bg-gray-500'
              }`}></div>
              <div className={`w-2 h-2 rounded-full animate-bounce ${
                darkMode ? 'bg-gray-400' : 'bg-gray-500'
              }`} style={{ animationDelay: '0.1s' }}></div>
              <div className={`w-2 h-2 rounded-full animate-bounce ${
                darkMode ? 'bg-gray-400' : 'bg-gray-500'
              }`} style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}
