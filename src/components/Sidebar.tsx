import React, { useState } from 'react';
import { Settings, MessageSquare, Trash2, Plus, ShieldCheck, WifiOff } from 'lucide-react';
import { ChatSession } from '../types';
import { formatDistanceToNow } from 'date-fns';
import { ConfirmationModal } from './ConfirmationModal';

interface SidebarProps {
  sessions: ChatSession[];
  currentSessionId?: string;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
  onSettings: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  sessions,
  currentSessionId,
  onSelect,
  onNew,
  onDelete,
  onClearAll,
  onSettings,
}) => {
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [showClearAllConfirm, setShowClearAllConfirm] = useState(false);

  return (
    <div className="w-72 bg-zinc-50 h-full flex flex-col border-r border-zinc-100 shrink-0">
      <div className="p-4">
        <button
          onClick={onNew}
          className="w-full flex items-center justify-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-white py-2.5 rounded-xl transition-all shadow-sm font-bold text-sm"
        >
          <Plus size={18} />
          New Chat
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-2 space-y-1">
        {sessions.length === 0 ? (
          <div className="p-8 text-center space-y-2">
            <div className="text-zinc-300 flex justify-center">
              <MessageSquare size={32} />
            </div>
            <p className="text-xs text-zinc-400 font-medium">No chats yet</p>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center px-2 py-2 mb-1">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">History</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowClearAllConfirm(true);
                }}
                className="text-[10px] font-bold text-zinc-400 hover:text-red-500 transition-colors uppercase tracking-widest"
              >
                Clear All
              </button>
            </div>
            {sessions.map((session) => (
              <div
                key={session.id}
                className={`group flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                  currentSessionId === session.id 
                    ? 'bg-white shadow-sm border border-zinc-100 text-zinc-900' 
                    : 'text-zinc-500 hover:bg-zinc-100/50'
                }`}
                onClick={() => onSelect(session.id)}
              >
                <MessageSquare size={16} className={`shrink-0 ${currentSessionId === session.id ? 'text-zinc-900' : 'opacity-40'}`} />
                <div className="flex-1 min-w-0">
                  <div className="truncate text-sm font-bold">{session.title}</div>
                  <div className="text-[10px] opacity-40 font-medium">
                    {formatDistanceToNow(session.updatedAt, { addSuffix: true })}
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setConfirmDeleteId(session.id);
                  }}
                  className={`p-1.5 hover:text-red-500 transition-all ${
                    currentSessionId === session.id ? 'opacity-40 hover:opacity-100' : 'opacity-0 group-hover:opacity-40 hover:opacity-100'
                  }`}
                  title="Delete chat"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </>
        )}
      </div>

      <ConfirmationModal
        isOpen={!!confirmDeleteId}
        title="Delete Chat"
        message="Are you sure you want to delete this chat? This action cannot be undone."
        onConfirm={() => confirmDeleteId && onDelete(confirmDeleteId)}
        onCancel={() => setConfirmDeleteId(null)}
        confirmLabel="Delete"
        isDanger={true}
      />

      <ConfirmationModal
        isOpen={showClearAllConfirm}
        title="Clear All History"
        message="Are you sure you want to delete all your chat history? This action cannot be undone."
        onConfirm={onClearAll}
        onCancel={() => setShowClearAllConfirm(false)}
        confirmLabel="Clear All"
        isDanger={true}
      />

      <div className="p-4 border-t border-zinc-100 space-y-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1.5 rounded-lg border border-emerald-100">
            <WifiOff size={12} />
            OFFLINE MODE ACTIVE
          </div>
          <div className="flex items-center gap-2 text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1.5 rounded-lg border border-blue-100">
            <ShieldCheck size={12} />
            PRIVACY FIRST: LOCAL ONLY
          </div>
        </div>
        <button
          onClick={onSettings}
          className="w-full flex items-center gap-2 hover:bg-zinc-100 p-2.5 rounded-xl transition-all text-sm font-bold text-zinc-600"
        >
          <Settings size={18} />
          Settings
        </button>
      </div>
    </div>
  );
};
