import { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { Button } from '../../../components/ui/Button';

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
  placeholder?: string;
}

export function ChatInput({ onSend, isLoading, placeholder = "Ask a question against your documents..." }: ChatInputProps) {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSend(input);
      setInput('');
    }
  };

  return (
    <div className="border-t border-border bg-background/80 backdrop-blur-sm p-4 shrink-0">
      <form onSubmit={handleSubmit} className="flex gap-3 max-w-4xl mx-auto">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={placeholder}
          className="flex-1 rounded-lg border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-muted-foreground shadow-sm"
          disabled={isLoading}
        />
        <Button type="submit" variant="primary" disabled={isLoading || !input.trim()}>
          {isLoading ? <Loader2 className="animate-spin w-4 h-4" /> : <Send className="w-4 h-4" />}
        </Button>
      </form>
    </div>
  );
}

