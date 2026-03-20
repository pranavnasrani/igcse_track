import React, { useState } from 'react';
import { useStore } from '../store';
import { calculatePercentage, formatPaperName, generateSearchLink } from '../utils';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { ArrowLeft, Plus, Search, Trash2, ExternalLink, Calendar, FileText, Hash, CheckCircle, BookOpen, Target } from 'lucide-react';
import { LogForm } from './LogForm';

interface SubjectDetailProps {
  store: ReturnType<typeof useStore>;
  subjectId: string;
  onBack: () => void;
}

export function SubjectDetail({ store, subjectId, onBack }: SubjectDetailProps) {
  const { subjects, logs, deleteLog } = store;
  const [isLogging, setIsLogging] = useState(false);
  const [searchYear, setSearchYear] = useState(new Date().getFullYear() - 1);
  const [searchSeason, setSearchSeason] = useState<'m' | 's' | 'w'>('s');
  const [searchPaper, setSearchPaper] = useState(4);
  const [searchVariant, setSearchVariant] = useState(1);

  const subject = subjects.find(s => s.id === subjectId);
  if (!subject) return <div>Subject not found</div>;

  const subjectLogs = logs.filter(l => l.subjectId === subjectId);
  const averageScore = subjectLogs.length > 0 
    ? Math.round(subjectLogs.reduce((acc, log) => acc + calculatePercentage(log.score, log.maxScore), 0) / subjectLogs.length)
    : 0;

  const chartData = [...subjectLogs].reverse().map(log => ({
    date: format(new Date(log.date), 'MMM dd'),
    score: calculatePercentage(log.score, log.maxScore),
    name: formatPaperName(log.year, log.season, log.paper, log.variant)
  }));

  return (
    <div className="space-y-6">
      <button 
        onClick={onBack}
        className="flex items-center text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors mb-4"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to Subjects
      </button>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div 
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-sm"
            style={{ backgroundColor: subject.color }}
          >
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">{subject.name}</h2>
            <p className="text-sm font-medium text-slate-500">Code: {subject.code}</p>
          </div>
        </div>
        <button 
          onClick={() => setIsLogging(true)}
          className="flex items-center justify-center px-5 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition-colors shadow-sm w-full md:w-auto"
        >
          <Plus className="w-4 h-4 mr-2" />
          Log Paper
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Stats & Find Papers */}
        <div className="space-y-6 lg:col-span-1">
          {/* Stats */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Overview</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 flex items-center"><CheckCircle className="w-4 h-4 mr-2" /> Papers Done</span>
                <span className="font-bold text-slate-900">{subjectLogs.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 flex items-center"><Target className="w-4 h-4 mr-2" /> Average Score</span>
                <span className="font-bold text-slate-900">{averageScore}%</span>
              </div>
            </div>
          </div>

          {/* Find Papers */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
              <Search className="w-5 h-5 mr-2 text-indigo-500" />
              Find Papers
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Year</label>
                  <input 
                    type="number" 
                    value={searchYear} 
                    onChange={e => setSearchYear(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Season</label>
                  <select 
                    value={searchSeason} 
                    onChange={e => setSearchSeason(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="m">Feb/March</option>
                    <option value="s">May/June</option>
                    <option value="w">Oct/Nov</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Paper</label>
                  <select 
                    value={searchPaper} 
                    onChange={e => setSearchPaper(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {[1, 2, 3, 4, 5, 6].map(p => <option key={p} value={p}>Paper {p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Variant</label>
                  <select 
                    value={searchVariant} 
                    onChange={e => setSearchVariant(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {[1, 2, 3].map(v => <option key={v} value={v}>Variant {v}</option>)}
                  </select>
                </div>
              </div>
              <a 
                href={generateSearchLink(subject.code, searchYear, searchSeason, searchPaper, searchVariant)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-full px-4 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-xl hover:bg-slate-800 transition-colors"
              >
                Search Paper <ExternalLink className="w-4 h-4 ml-2" />
              </a>
            </div>
          </div>
        </div>

        {/* Right Column: Chart & Logs */}
        <div className="space-y-6 lg:col-span-2">
          {/* Chart */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-semibold text-slate-900 mb-6">Performance Trend</h3>
            {chartData.length > 0 ? (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                    <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dx={-10} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      formatter={(value: number) => [`${value}%`, 'Score']}
                      labelStyle={{ color: '#64748b', marginBottom: '4px' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="score" 
                      stroke={subject.color} 
                      strokeWidth={3}
                      dot={{ r: 4, fill: subject.color, strokeWidth: 2, stroke: '#fff' }}
                      activeDot={{ r: 6, strokeWidth: 0 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-slate-400">
                <p>No data yet. Log a paper to see your progress!</p>
              </div>
            )}
          </div>

          {/* Logs List */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-lg font-semibold text-slate-900">Paper History</h3>
            </div>
            <div className="divide-y divide-slate-100">
              {subjectLogs.length > 0 ? subjectLogs.map(log => {
                const percentage = calculatePercentage(log.score, log.maxScore);
                return (
                  <div key={log.id} className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-slate-50 transition-colors group">
                    <div className="mb-2 sm:mb-0">
                      <p className="font-semibold text-slate-900 flex items-center">
                        <FileText className="w-4 h-4 mr-2 text-slate-400" />
                        {formatPaperName(log.year, log.season, log.paper, log.variant)}
                      </p>
                      <p className="text-sm text-slate-500 mt-1 flex items-center">
                        <Calendar className="w-3.5 h-3.5 mr-1.5" />
                        {format(new Date(log.date), 'MMM dd, yyyy')}
                      </p>
                      {log.notes && (
                        <p className="text-sm text-slate-600 mt-2 bg-slate-100 p-2 rounded-lg inline-block">
                          {log.notes}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center space-x-6">
                      <div className="text-right">
                        <p className="text-xl font-bold text-slate-900" style={{ color: percentage >= 80 ? '#10b981' : percentage >= 60 ? '#f59e0b' : '#ef4444' }}>
                          {percentage}%
                        </p>
                        <p className="text-xs font-medium text-slate-500">{log.score} / {log.maxScore}</p>
                      </div>
                      <button 
                        onClick={() => deleteLog(log.id)}
                        className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                        title="Delete log"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                );
              }) : (
                <div className="p-8 text-center text-slate-500">
                  No papers logged yet for this subject.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {isLogging && (
        <LogForm 
          store={store} 
          defaultSubjectId={subjectId} 
          onClose={() => setIsLogging(false)} 
        />
      )}
    </div>
  );
}
