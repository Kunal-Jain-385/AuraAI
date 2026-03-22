import React, { useState } from 'react';
import { Calendar, Plus, Trash2, CheckCircle2, Clock, Sparkles } from 'lucide-react';

interface Exam {
  id: string;
  subject: string;
  date: string;
}

interface ScheduleItem {
  time: string;
  task: string;
  type: 'revision' | 'new-topic' | 'break';
}

export const StudyPlanner: React.FC = () => {
  const [exams, setExams] = useState<Exam[]>([
    { id: '1', subject: 'Quantum Physics', date: '2026-04-15' },
    { id: '2', subject: 'Linear Algebra', date: '2026-04-20' },
  ]);
  const [newSubject, setNewSubject] = useState('');
  const [newDate, setNewDate] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);

  const addExam = () => {
    if (!newSubject || !newDate) return;
    setExams([...exams, { id: crypto.randomUUID(), subject: newSubject, date: newDate }]);
    setNewSubject('');
    setNewDate('');
  };

  const removeExam = (id: string) => {
    setExams(exams.filter(e => e.id !== id));
  };

  const generateSchedule = () => {
    setIsGenerating(true);
    // Simulate AI generation
    setTimeout(() => {
      setSchedule([
        { time: '08:00 AM', task: 'Quantum Physics: Wave-Particle Duality', type: 'new-topic' },
        { time: '10:00 AM', task: 'Coffee Break', type: 'break' },
        { time: '10:30 AM', task: 'Linear Algebra: Eigenvalues Revision', type: 'revision' },
        { time: '12:30 PM', task: 'Lunch Break', type: 'break' },
        { time: '01:30 PM', task: 'Data Structures: Hash Tables', type: 'new-topic' },
        { time: '03:30 PM', task: 'Weak Topic: Matrix Transformation', type: 'revision' },
      ]);
      setIsGenerating(false);
    }, 1500);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-zinc-50 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-serif font-medium text-zinc-900">Study Planner</h1>
            <p className="text-zinc-500 text-sm mt-1">Set your deadlines and let Aura optimize your schedule.</p>
          </div>
          <button 
            onClick={generateSchedule}
            disabled={exams.length === 0 || isGenerating}
            className="flex items-center gap-2 px-6 py-3 bg-zinc-900 text-white rounded-2xl font-bold text-sm hover:scale-105 transition-all disabled:opacity-50"
          >
            {isGenerating ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Sparkles size={18} className="text-emerald-400" />
            )}
            GENERATE SCHEDULE
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-3xl border border-zinc-100 shadow-sm space-y-6">
            <h3 className="text-sm font-bold text-zinc-900 mb-4 flex items-center gap-2">
              <Calendar size={18} className="text-zinc-400" />
              Upcoming Exams
            </h3>
            
            <div className="space-y-3">
              {exams.map(exam => (
                <div key={exam.id} className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                  <div>
                    <div className="font-bold text-sm text-zinc-900">{exam.subject}</div>
                    <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{exam.date}</div>
                  </div>
                  <button onClick={() => removeExam(exam.id)} className="p-2 text-zinc-300 hover:text-red-500 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-zinc-100 flex gap-2">
              <input 
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                placeholder="Subject" 
                className="flex-1 bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-zinc-900/5" 
              />
              <input 
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-zinc-900/5" 
              />
              <button onClick={addExam} className="p-2 bg-zinc-900 text-white rounded-xl hover:scale-105 transition-all">
                <Plus size={18} />
              </button>
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-zinc-100 shadow-sm">
            <h3 className="text-sm font-bold text-zinc-900 mb-8 flex items-center gap-2">
              <Clock size={18} className="text-zinc-400" />
              Daily Schedule
            </h3>
            
            {schedule.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-12 h-12 bg-zinc-50 rounded-2xl flex items-center justify-center text-zinc-300">
                  <Calendar size={24} />
                </div>
                <p className="text-xs text-zinc-400 max-w-[200px]">Add your exams and click generate to see your optimized study plan.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {schedule.map((item, i) => (
                  <div key={i} className="flex gap-4 group">
                    <div className="text-[10px] font-bold text-zinc-400 w-16 pt-1">{item.time}</div>
                    <div className="relative flex-1 pb-6 border-l-2 border-zinc-100 pl-6 last:pb-0">
                      <div className={`absolute -left-[9px] top-1.5 w-4 h-4 rounded-full border-2 border-white shadow-sm ${
                        item.type === 'revision' ? 'bg-amber-400' : 
                        item.type === 'break' ? 'bg-zinc-200' : 'bg-emerald-400'
                      }`} />
                      <div className="font-bold text-sm text-zinc-900 mb-1">{item.task}</div>
                      <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{item.type}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
