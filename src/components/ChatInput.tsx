'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';

interface ChatInputProps {
  onSend: (message: string) => void;
  loading: boolean;
  darkMode?: boolean;
}

export function ChatInput({ onSend, loading, darkMode }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = message.trim();
    if (!trimmed || loading) return;
    onSend(trimmed);
    setMessage('');
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSubmit(event);
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="flex items-end space-x-3">
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message here... (Press Enter to send, Shift+Enter for new line)"
            className={`min-h-[50px] max-h-[200px] resize-none pr-12 py-3 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl shadow-sm ${
              darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : ''
            }`}
            disabled={loading}
            rows={1}
          />
          {message.trim() && (
            <button
              type="submit"
              disabled={loading}
              className="absolute right-3 bottom-3 w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-lg flex items-center justify-center transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          )}
        </div>
      </div>

      <div className={`flex items-center justify-between mt-3 text-xs ${
        darkMode ? 'text-gray-400' : 'text-gray-500'
      }`}>
        <div className="flex items-center space-x-4">
          <span>Press Enter to send</span>
          <span>•</span>
          <span>Shift + Enter for new line</span>
        </div>
        {loading && (
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span>AgentVerse is thinking...</span>
          </div>
        )}
      </div>
    </form>
  );
}
