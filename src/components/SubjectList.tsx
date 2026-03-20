import React, { useState } from 'react';
import { useStore } from '../store';
import { calculatePercentage } from '../utils';
import { BookOpen, ChevronRight, Plus } from 'lucide-react';
import { AddSubjectModal } from './AddSubjectModal';

interface SubjectListProps {
  store: ReturnType<typeof useStore>;
  navigateTo: (view: 'dashboard' | 'subjects' | 'subject', subjectId?: string) => void;
}

export function SubjectList({ store, navigateTo }: SubjectListProps) {
  const { subjects, logs } = store;
  const [isAdding, setIsAdding] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Subjects</h2>
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Subject
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {subjects.map(subject => {
          const subjectLogs = logs.filter(l => l.subjectId === subject.id);
          const averageScore = subjectLogs.length > 0 
            ? Math.round(subjectLogs.reduce((acc, log) => acc + calculatePercentage(log.score, log.maxScore), 0) / subjectLogs.length)
            : null;

          return (
            <div 
              key={subject.id}
              onClick={() => navigateTo('subject', subject.id)}
              className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:border-indigo-200 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm"
                    style={{ backgroundColor: subject.color }}
                  >
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {subject.name}
                    </h3>
                    <p className="text-xs font-medium text-slate-500">{subject.code}</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-400 transition-colors" />
              </div>

              <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-50">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Papers Done</p>
                  <p className="font-semibold text-slate-900">{subjectLogs.length}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500 mb-1">Average</p>
                  <p className="font-semibold text-slate-900">
                    {averageScore !== null ? `${averageScore}%` : '-'}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {isAdding && <AddSubjectModal store={store} onClose={() => setIsAdding(false)} />}
    </div>
  );
}
