import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
import { X, Sparkles, Trash2 } from 'lucide-react';

import { PaperLog } from '../types';

interface LogFormProps {
  store: ReturnType<typeof useStore>;
  defaultSubjectId?: string;
  existingLog?: PaperLog;
  onClose: () => void;
}

export function LogForm({ store, defaultSubjectId, existingLog, onClose }: LogFormProps) {
  const { subjects, addLog, updateLog, deleteLog } = store;
  
  const [subjectId, setSubjectId] = useState(existingLog?.subjectId || defaultSubjectId || subjects[0]?.id || '');
  const [year, setYear] = useState(existingLog?.year || new Date().getFullYear() - 1);
  const [season, setSeason] = useState<'m' | 's' | 'w'>(existingLog?.season || 's');
  const [paper, setPaper] = useState(existingLog?.paper || 4);
  const [variant, setVariant] = useState(existingLog?.variant || 1);
  const [score, setScore] = useState(existingLog?.score?.toString() || '');
  const [maxScore, setMaxScore] = useState(existingLog?.maxScore?.toString() || '80');
  const [date, setDate] = useState(existingLog?.date ? new Date(existingLog.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState(existingLog?.notes || '');
  const [smartInput, setSmartInput] = useState('');

  const handleSmartInput = (query: string) => {
    setSmartInput(query);
    if (!query.trim()) return;

    const lowerQuery = query.toLowerCase();

    // 1. Extract standard shorthand like s23, m22, w21
    const shorthandMatch = lowerQuery.match(/\b([msw])(\d{2})\b/);
    if (shorthandMatch) {
      setSeason(shorthandMatch[1] as any);
      setYear(parseInt(`20${shorthandMatch[2]}`));
    } else {
      if (/(march|\bm\b)/.test(lowerQuery)) setSeason('m');
      else if (/(june|may|\bs\b)/.test(lowerQuery)) setSeason('s');
      else if (/(nov|oct|november|\bw\b)/.test(lowerQuery)) setSeason('w');

      const yearMatch = lowerQuery.match(/\b(20\d{2})\b/);
      if (yearMatch) setYear(parseInt(yearMatch[1]));
    }

    // 2. Extract paper and variant
    const pvMatch = lowerQuery.match(/\b(?:p|qp|paper\s*)?([1-6])([1-3])\b/);
    if (pvMatch) {
      setPaper(parseInt(pvMatch[1]));
      setVariant(parseInt(pvMatch[2]));
    } else {
      const pMatch = lowerQuery.match(/\b(?:paper|p)\s*([1-6])\b/);
      if (pMatch) setPaper(parseInt(pMatch[1]));

      const vMatch = lowerQuery.match(/\b(?:variant|v)\s*([1-3])\b/);
      if (vMatch) setVariant(parseInt(vMatch[1]));
    }

    // 3. Extract subject
    const subjectMatch = subjects.find(s => 
      lowerQuery.includes(s.name.toLowerCase()) || 
      (s.code && lowerQuery.includes(s.code.toLowerCase()))
    );
    if (subjectMatch) {
      setSubjectId(subjectMatch.id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectId || !score || !maxScore || !date) return;

    const logData = {
      subjectId,
      year,
      season,
      paper,
      variant,
      score: Number(score),
      maxScore: Number(maxScore),
      date: new Date(date).toISOString(),
      notes: notes.trim() || undefined
    };

    if (existingLog) {
      updateLog(existingLog.id, logData);
    } else {
      addLog(logData);
    }
    
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">{existingLog ? 'Edit Paper Log' : 'Log Paper'}</h2>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {!existingLog && (
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex items-center">
                <Sparkles className="w-4 h-4 mr-1.5 text-indigo-500" />
                Smart Autocomplete
              </label>
              <input 
                type="text" 
                value={smartInput} 
                onChange={e => handleSmartInput(e.target.value)}
                placeholder="e.g. Math s23 p42"
                className="w-full px-4 py-2.5 bg-indigo-50/50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-indigo-300 dark:placeholder:text-indigo-700 text-indigo-900 dark:text-indigo-100 transition-colors"
              />
            </div>
          )}

          {!defaultSubjectId && (
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Subject</label>
              <select 
                value={subjectId} 
                onChange={e => setSubjectId(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                required
              >
                <option value="" disabled>Select a subject</option>
                {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Year</label>
              <input 
                type="number" 
                value={year} 
                onChange={e => setYear(Number(e.target.value))}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Season</label>
              <select 
                value={season} 
                onChange={e => setSeason(e.target.value as any)}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
              >
                <option value="m">Feb/March</option>
                <option value="s">May/June</option>
                <option value="w">Oct/Nov</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Paper</label>
              <select 
                value={paper} 
                onChange={e => setPaper(Number(e.target.value))}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
              >
                {[1, 2, 3, 4, 5, 6].map(p => <option key={p} value={p}>Paper {p}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Variant</label>
              <select 
                value={variant} 
                onChange={e => setVariant(Number(e.target.value))}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
              >
                {[1, 2, 3].map(v => <option key={v} value={v}>Variant {v}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Score</label>
              <input 
                type="number" 
                value={score} 
                onChange={e => setScore(e.target.value)}
                placeholder="e.g. 65"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors placeholder:text-slate-400 dark:placeholder:text-slate-600"
                required
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Max Score</label>
              <input 
                type="number" 
                value={maxScore} 
                onChange={e => setMaxScore(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                required
                min="1"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Date Completed</label>
            <input 
              type="date" 
              value={date} 
              onChange={e => setDate(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Notes (Optional)</label>
            <textarea 
              value={notes} 
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. Struggled with kinematics questions"
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none h-20 transition-colors placeholder:text-slate-400 dark:placeholder:text-slate-600"
            />
          </div>

          <div className="pt-2 flex space-x-3">
            {existingLog && (
              <button 
                type="button"
                onClick={() => {
                  if (window.confirm('Are you sure you want to delete this paper log?')) {
                    deleteLog(existingLog.id);
                    onClose();
                  }
                }}
                className="flex items-center justify-center px-4 py-3 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-sm font-medium rounded-xl hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors"
                title="Delete Log"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
            <button 
              type="submit"
              className="flex-1 flex items-center justify-center px-4 py-3 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition-colors shadow-sm"
            >
              {existingLog ? 'Update Log' : 'Save Log'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
