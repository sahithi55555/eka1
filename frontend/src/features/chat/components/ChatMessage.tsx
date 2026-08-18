import type { Citation } from '../services/chatService';
import { CitationCard } from './CitationCard';

export interface MessageProps {
  role: 'user' | 'assistant' | 'error';
  content: string;
  citations?: Citation[];
  times?: { llm: number; retrieval: number; total: number };
}

export function ChatMessage({ message }: { message: MessageProps }) {
  const isUser = message.role === 'user';
  const isError = message.role === 'error';

  return (
    <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} mb-6`}>
      <div className={`max-w-[85%] rounded-lg p-5 ${isUser
          ? 'bg-blue-600 text-white rounded-br-none shadow-sm'
          : isError
            ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-bl-none text-red-800 dark:text-red-200'
            : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-bl-none text-gray-800 dark:text-gray-100 shadow-sm'
        }`}>

        <div className="whitespace-pre-wrap leading-relaxed">{message.content}</div>

        {!isUser && !isError && message.citations && message.citations.length > 0 && (
          <div className="mt-5 pt-4 border-t border-gray-200 dark:border-gray-700">
            <h4 className="text-sm font-semibold mb-3 text-gray-500 dark:text-gray-400 uppercase tracking-wider">Sources Referenced</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {message.citations.map((c, i) => (
                <CitationCard key={i} citation={c} />
              ))}
            </div>
          </div>
        )}

        {!isUser && !isError && message.times && (
          <div className="mt-3 text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wider font-mono">
            Ret: {message.times.retrieval.toFixed(0)}ms •
            LLM: {message.times.llm.toFixed(0)}ms •
            Total: {message.times.total.toFixed(0)}ms
          </div>
        )}
      </div>
    </div>
  );
}
