import React from 'react';
import { User, Brain } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface MessageBubbleProps {
  role: 'user' | 'assistant' | 'system';
  content: string;
  isStreaming?: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ role, content, isStreaming }) => {
  const isAssistant = role === 'assistant';

  return (
    <div className={`flex gap-4 p-6 ${isAssistant ? 'bg-zinc-50/50' : 'bg-white'}`}>
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
        isAssistant ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-500'
      }`}>
        {isAssistant ? <Brain size={18} /> : <User size={18} />}
      </div>
      
      <div className="flex-1 min-w-0 space-y-2">
        <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
          {isAssistant ? 'Aura' : 'You'}
        </div>
        <div className="prose prose-zinc prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-zinc-900 prose-pre:text-zinc-100">
          <ReactMarkdown>{content}</ReactMarkdown>
          {isStreaming && (
            <span className="inline-block w-1.5 h-4 ml-1 bg-zinc-400 animate-pulse align-middle" />
          )}
        </div>
      </div>
    </div>
  );
};
