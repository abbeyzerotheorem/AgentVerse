'use client';

interface SettingsProps {
  darkMode: boolean;
  onToggleDarkMode: (enabled: boolean) => void;
  onExport: () => void;
  darkModeEnabled: boolean;
}

export function Settings({ darkMode, onToggleDarkMode, onExport, darkModeEnabled }: SettingsProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Settings</h3>
        <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="space-y-4">
        {/* Dark Mode Toggle */}
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-white">Dark Mode</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">Toggle between light and dark themes</p>
          </div>
          <button
            onClick={() => onToggleDarkMode(!darkMode)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              darkMode ? 'bg-purple-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                darkMode ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Export Conversation */}
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-white">Export Chat</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">Download current conversation as text file</p>
          </div>
          <button
            onClick={onExport}
            className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded-md transition-colors"
          >
            Export
          </button>
        </div>

        {/* Model Info */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">AI Model</h4>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
            <p className="text-xs text-gray-600 dark:text-gray-300">
              <strong>Current:</strong> Gemini 3 Flash Preview
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Advanced AI model for natural conversations
            </p>
          </div>
        </div>

        {/* About */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">About AgentVerse</h4>
          <div className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
            <p>Version: 1.0.0</p>
            <p>Built with Next.js & Google Gemini AI</p>
            <p>Conversations stored locally in your browser</p>
          </div>
        </div>
      </div>
    </div>
  );
}