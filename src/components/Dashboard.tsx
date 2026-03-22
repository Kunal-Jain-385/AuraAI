import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { TrendingUp, Target, Clock, BookOpen, AlertTriangle, RotateCcw } from 'lucide-react';
import { usePreferences } from '../hooks/usePreferences';
import { ConfirmationModal } from './ConfirmationModal';

const initialData = [
  { name: 'Mon', mastery: 40, hours: 2 },
  { name: 'Tue', mastery: 45, hours: 3 },
  { name: 'Wed', mastery: 55, hours: 2.5 },
  { name: 'Thu', mastery: 50, hours: 4 },
  { name: 'Fri', mastery: 65, hours: 3.5 },
  { name: 'Sat', mastery: 75, hours: 5 },
  { name: 'Sun', mastery: 80, hours: 4.5 },
];

const initialWeakAreas = [
  { subject: 'Quantum Physics', level: 30, color: '#ef4444' },
  { subject: 'Linear Algebra', level: 45, color: '#f59e0b' },
  { subject: 'Data Structures', level: 60, color: '#10b981' },
];

export const Dashboard: React.FC = () => {
  const { preferences, resetProfile } = usePreferences();
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [chartData, setChartData] = useState(initialData);
  const [weakAreas, setWeakAreas] = useState(initialWeakAreas);

  const handleReset = () => {
    resetProfile();
    setChartData(initialData.map(d => ({ ...d, mastery: 0, hours: 0 })));
    setWeakAreas(initialWeakAreas.map(a => ({ ...a, level: 0 })));
  };

  const stats = [
    { icon: <Target className="text-blue-500" />, label: 'Overall Mastery', value: preferences.learningProfile.confusionCount > 10 ? '42%' : '68%' },
    { icon: <Clock className="text-purple-500" />, label: 'Study Hours', value: '24.5h' },
    { icon: <BookOpen className="text-emerald-500" />, label: 'Topics Covered', value: Object.keys(preferences.learningProfile.questionFrequency).length || '18' },
    { icon: <AlertTriangle className="text-amber-500" />, label: 'Confusion Count', value: preferences.learningProfile.confusionCount.toString() },
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-zinc-50 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-serif font-medium text-zinc-900">Learning Dashboard</h1>
            <p className="text-zinc-500 text-sm mt-1">Track your progress and optimize your study sessions.</p>
          </div>
          <div className="flex items-center gap-6">
            <button
              onClick={() => setShowResetConfirm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-zinc-200 rounded-xl text-xs font-bold text-zinc-500 hover:text-red-500 hover:border-red-100 transition-all shadow-sm"
            >
              <RotateCcw size={14} />
              RESET STATS
            </button>
            <div className="text-right">
              <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Current Streak</div>
              <div className="text-2xl font-bold text-zinc-900 flex items-center gap-2 justify-end">
                <TrendingUp size={20} className="text-emerald-500" />
                12 DAYS
              </div>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-zinc-50 rounded-xl">{stat.icon}</div>
                <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{stat.label}</div>
              </div>
              <div className="text-2xl font-bold text-zinc-900">{stat.value}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-3xl border border-zinc-100 shadow-sm">
            <h3 className="text-sm font-bold text-zinc-900 mb-8 flex items-center gap-2">
              <TrendingUp size={18} className="text-zinc-400" />
              Mastery Progression
            </h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#a1a1aa' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#a1a1aa' }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Line type="monotone" dataKey="mastery" stroke="#18181b" strokeWidth={3} dot={{ r: 4, fill: '#18181b' }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-zinc-100 shadow-sm">
            <h3 className="text-sm font-bold text-zinc-900 mb-8 flex items-center gap-2">
              <AlertTriangle size={18} className="text-zinc-400" />
              Focus Areas
            </h3>
            <div className="space-y-6">
              {weakAreas.map((area, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-zinc-600">{area.subject}</span>
                    <span className="text-zinc-900">{area.level}% Mastery</span>
                  </div>
                  <div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full transition-all duration-1000" 
                      style={{ width: `${area.level}%`, backgroundColor: area.color }} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={showResetConfirm}
        title="Reset All Stats"
        message="Are you sure you want to reset your learning progress and dashboard stats? This will clear your learning profile and start fresh."
        onConfirm={handleReset}
        onCancel={() => setShowResetConfirm(false)}
        confirmLabel="Reset Everything"
        isDanger={true}
      />
    </div>
  );
};
