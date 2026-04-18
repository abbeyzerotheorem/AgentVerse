'use client';

import { useEffect, useRef } from 'react';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatWindowProps {
  messages: ChatMessage[];
  loading?: boolean;
}

export function ChatWindow({ messages, loading }: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  return (
    <div className="h-[60vh] overflow-y-auto px-6 py-4 space-y-6">
      {messages.map((message, index) => (
        <div
          key={index}
          className={`flex items-start space-x-3 ${
            message.role === 'assistant' ? 'justify-start' : 'justify-end flex-row-reverse space-x-reverse'
          }`}
        >
          {/* Avatar */}
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
              message.role === 'assistant'
                ? 'bg-gradient-to-br from-blue-500 to-purple-600'
                : 'bg-gradient-to-br from-green-500 to-teal-600'
            }`}
          >
            {message.role === 'assistant' ? (
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            )}
          </div>

          {/* Message Bubble */}
          <div
            className={`max-w-[75%] rounded-2xl px-4 py-3 shadow-sm ${
              message.role === 'assistant'
                ? 'bg-gray-100 text-gray-900 rounded-tl-sm'
                : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-tr-sm'
            }`}
          >
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
          </div>
        </div>
      ))}

      {/* Typing Indicator */}
      {loading && (
        <div className="flex items-start space-x-3 justify-start">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}
