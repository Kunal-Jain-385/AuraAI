import React from 'react';
import { Brain, Shield, LogOut, MessageSquare, LayoutDashboard, Calendar } from 'lucide-react';

interface HeaderProps {
  activeTab: 'chat' | 'dashboard' | 'planner';
  onTabChange: (tab: 'chat' | 'dashboard' | 'planner') => void;
  privacyMode: boolean;
  onTogglePrivacy: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  privacyMode,
  onTogglePrivacy,
  onLogout,
}) => {
  return (
    <header className="h-16 border-b border-zinc-100 bg-white flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center text-white">
          <Brain size={20} />
        </div>
        <span className="text-xl font-serif italic font-semibold text-zinc-800">Aura</span>
      </div>

      <nav className="flex items-center bg-zinc-50 p-1 rounded-xl border border-zinc-100">
        <button
          onClick={() => onTabChange('chat')}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'chat' ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-400 hover:text-zinc-600'
          }`}
        >
          <MessageSquare size={14} />
          CHAT
        </button>
        <button
          onClick={() => onTabChange('dashboard')}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'dashboard' ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-400 hover:text-zinc-600'
          }`}
        >
          <LayoutDashboard size={14} />
          DASHBOARD
        </button>
        <button
          onClick={() => onTabChange('planner')}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'planner' ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-400 hover:text-zinc-600'
          }`}
        >
          <Calendar size={14} />
          PLANNER
        </button>
      </nav>

      <div className="flex items-center gap-4">
        <button
          onClick={onTogglePrivacy}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold border transition-all ${
            privacyMode 
              ? 'bg-emerald-50 border-emerald-100 text-emerald-600' 
              : 'bg-zinc-50 border-zinc-100 text-zinc-400'
          }`}
        >
          <Shield size={12} />
          Privacy Mode {privacyMode ? 'ON' : 'OFF'}
        </button>
        <button 
          onClick={onLogout}
          className="p-2 text-zinc-400 hover:text-red-500 transition-colors"
        >
          <LogOut size={20} />
        </button>
      </div>
    </header>
  );
};
