export function TypingIndicator() {
  return (
    <div className="flex items-start mb-6">
      <div className="flex items-center space-x-2 text-gray-500 bg-gray-100 dark:bg-gray-800 dark:border dark:border-gray-700 w-fit p-4 rounded-lg rounded-bl-none">
        <div className="w-2.5 h-2.5 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
        <div className="w-2.5 h-2.5 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        <div className="w-2.5 h-2.5 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
      </div>
    </div>
  );
}
