import type { Citation } from '../services/chatService';
import { CitationCard } from './CitationCard';
import { Bot, User, Layers, Clock } from 'lucide-react';

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
    <div className={`flex gap-3 mb-6 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar Icon */}
      <div className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 shadow-sm text-xs font-bold ${
        isUser 
          ? 'bg-primary text-primary-foreground' 
          : isError
            ? 'bg-destructive/10 text-destructive border border-destructive/20'
            : 'bg-primary/10 text-primary border border-border'
      }`}>
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>

      {/* Message Bubble Container */}
      <div className={`max-w-[85%] sm:max-w-[78%] rounded-2xl p-4 md:p-5 transition-colors ${
        isUser
          ? 'bg-primary text-primary-foreground rounded-tr-xs shadow-sm'
          : isError
            ? 'bg-destructive/10 border border-destructive/30 rounded-tl-xs text-destructive'
            : 'bg-card border border-border rounded-tl-xs text-foreground shadow-sm'
      }`}>
        <div className="text-sm leading-relaxed whitespace-pre-wrap selection:bg-primary/20">
          {message.content}
        </div>

        {/* Citations Container */}
        {!isUser && !isError && message.citations && message.citations.length > 0 && (
          <div className="mt-4 pt-3.5 border-t border-border/70">
            <h4 className="text-xs font-semibold mb-2.5 text-muted-foreground flex items-center gap-1.5 uppercase tracking-wider">
              <Layers className="w-3.5 h-3.5 text-primary" />
              Grounded Sources ({message.citations.length})
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {message.citations.map((c, i) => (
                <CitationCard key={i} citation={c} />
              ))}
            </div>
          </div>
        )}

        {/* Execution Latency Telemetry */}
        {!isUser && !isError && message.times && (
          <div className="mt-3 flex items-center gap-2 text-[10px] text-muted-foreground font-mono">
            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-muted/70 border border-border/50">
              <Clock className="w-2.5 h-2.5" />
              Retrieval: {message.times.retrieval.toFixed(0)}ms
            </span>
            <span className="px-1.5 py-0.5 rounded bg-muted/70 border border-border/50">
              LLM: {message.times.llm.toFixed(0)}ms
            </span>
            <span className="font-semibold text-foreground">
              Total: {message.times.total.toFixed(0)}ms
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
