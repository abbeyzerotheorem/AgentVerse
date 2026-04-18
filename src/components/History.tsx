'use client';

interface Conversation {
  id: string;
  title: string;
  messages: any[];
  createdAt: number;
  updatedAt: number;
}

interface HistoryProps {
  conversations: Conversation[];
  currentConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
  darkMode: boolean;
}

export function History({
  conversations,
  currentConversationId,
  onSelectConversation,
  onDeleteConversation,
  darkMode
}: HistoryProps) {
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Chat History</h3>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="space-y-2 max-h-[500px] overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="text-center py-8">
            <svg className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="text-sm text-gray-500 dark:text-gray-400">No conversations yet</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Start a new chat to see it here</p>
          </div>
        ) : (
          conversations.map((conversation) => (
            <div
              key={conversation.id}
              className={`group relative p-3 rounded-lg cursor-pointer transition-all ${
                currentConversationId === conversation.id
                  ? (darkMode ? 'bg-purple-600/20 border-purple-500' : 'bg-blue-50 border-blue-200')
                  : (darkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50')
              } border ${currentConversationId === conversation.id ? 'border-l-4' : 'border-transparent'}`}
              onClick={() => onSelectConversation(conversation.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h4 className={`text-sm font-medium truncate ${
                    currentConversationId === conversation.id
                      ? (darkMode ? 'text-purple-200' : 'text-blue-900')
                      : 'text-gray-900 dark:text-white'
                  }`}>
                    {conversation.title}
                  </h4>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {conversation.messages.length} messages
                    </span>
                    <span className="text-xs text-gray-400 dark:text-gray-500">•</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(conversation.updatedAt)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteConversation(conversation.id);
                  }}
                  className={`opacity-0 group-hover:opacity-100 p-1 rounded transition-all ${
                    darkMode ? 'hover:bg-red-600/20 hover:text-red-400' : 'hover:bg-red-50 hover:text-red-600'
                  }`}
                  title="Delete conversation"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {conversations.length > 0 && (
        <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Conversations are stored locally in your browser
          </p>
        </div>
      )}
    </div>
  );
}