import React, { useState } from 'react';
import { useStore } from '../store';
import { X } from 'lucide-react';

interface LogFormProps {
  store: ReturnType<typeof useStore>;
  defaultSubjectId?: string;
  onClose: () => void;
}

export function LogForm({ store, defaultSubjectId, onClose }: LogFormProps) {
  const { subjects, addLog } = store;
  
  const [subjectId, setSubjectId] = useState(defaultSubjectId || subjects[0]?.id || '');
  const [year, setYear] = useState(new Date().getFullYear() - 1);
  const [season, setSeason] = useState<'m' | 's' | 'w'>('s');
  const [paper, setPaper] = useState(4);
  const [variant, setVariant] = useState(1);
  const [score, setScore] = useState('');
  const [maxScore, setMaxScore] = useState('80');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectId || !score || !maxScore || !date) return;

    addLog({
      subjectId,
      year,
      season,
      paper,
      variant,
      score: Number(score),
      maxScore: Number(maxScore),
      date: new Date(date).toISOString(),
      notes: notes.trim() || undefined
    });
    
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-900">Log Paper</h2>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {!defaultSubjectId && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Subject</label>
              <select 
                value={subjectId} 
                onChange={e => setSubjectId(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              >
                <option value="" disabled>Select a subject</option>
                {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Year</label>
              <input 
                type="number" 
                value={year} 
                onChange={e => setYear(Number(e.target.value))}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Season</label>
              <select 
                value={season} 
                onChange={e => setSeason(e.target.value as any)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="m">Feb/March</option>
                <option value="s">May/June</option>
                <option value="w">Oct/Nov</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Paper</label>
              <select 
                value={paper} 
                onChange={e => setPaper(Number(e.target.value))}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {[1, 2, 3, 4, 5, 6].map(p => <option key={p} value={p}>Paper {p}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Variant</label>
              <select 
                value={variant} 
                onChange={e => setVariant(Number(e.target.value))}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {[1, 2, 3].map(v => <option key={v} value={v}>Variant {v}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Score</label>
              <input 
                type="number" 
                value={score} 
                onChange={e => setScore(e.target.value)}
                placeholder="e.g. 65"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Max Score</label>
              <input 
                type="number" 
                value={maxScore} 
                onChange={e => setMaxScore(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
                min="1"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Date Completed</label>
            <input 
              type="date" 
              value={date} 
              onChange={e => setDate(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Notes (Optional)</label>
            <textarea 
              value={notes} 
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. Struggled with kinematics questions"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none h-20"
            />
          </div>

          <div className="pt-2">
            <button 
              type="submit"
              className="w-full flex items-center justify-center px-4 py-3 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition-colors shadow-sm"
            >
              Save Log
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
