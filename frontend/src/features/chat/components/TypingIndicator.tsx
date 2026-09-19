import { Bot } from "lucide-react";

export function TypingIndicator() {
  return (
    <div className="flex gap-3 mb-6">
      <div className="h-8 w-8 rounded-xl bg-primary/10 text-primary border border-border flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
        <Bot className="h-4 w-4" />
      </div>
      <div className="flex items-center space-x-1.5 bg-card border border-border p-4 rounded-2xl rounded-tl-xs shadow-sm">
        <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
        <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
      </div>
    </div>
  );
}
