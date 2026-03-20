import React from 'react';
import { useStore } from '../store';
import { calculatePercentage, formatPaperName } from '../utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { format } from 'date-fns';
import { Activity, BookOpen, Target, TrendingUp } from 'lucide-react';

interface DashboardProps {
  store: ReturnType<typeof useStore>;
  navigateTo: (view: 'dashboard' | 'subjects' | 'subject', subjectId?: string) => void;
}

export function Dashboard({ store, navigateTo }: DashboardProps) {
  const { subjects, logs } = store;

  const totalPapers = logs.length;
  const averageScore = logs.length > 0 
    ? Math.round(logs.reduce((acc, log) => acc + calculatePercentage(log.score, log.maxScore), 0) / logs.length)
    : 0;

  const recentLogs = [...logs].slice(0, 5);

  const chartData = [...logs].slice(0, 15).reverse().map(log => {
    const subject = subjects.find(s => s.id === log.subjectId);
    return {
      date: format(new Date(log.date), 'MMM dd'),
      score: calculatePercentage(log.score, log.maxScore),
      subject: subject?.name || 'Unknown',
      color: subject?.color || '#cbd5e1',
      name: formatPaperName(log.year, log.season, log.paper, log.variant)
    };
  });

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard</h2>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center space-x-4">
          <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Papers Completed</p>
            <p className="text-2xl font-bold text-slate-900">{totalPapers}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center space-x-4">
          <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Average Score</p>
            <p className="text-2xl font-bold text-slate-900">{averageScore}%</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center space-x-4">
          <div className="p-3 bg-amber-100 text-amber-600 rounded-xl">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Active Subjects</p>
            <p className="text-2xl font-bold text-slate-900">
              {new Set(logs.map(l => l.subjectId)).size}
            </p>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-slate-900 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-indigo-500" />
            Recent Performance
          </h3>
        </div>
        {chartData.length > 0 ? (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dx={-10} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number, name: string, props: any) => [`${value}%`, props.payload.subject]}
                  labelFormatter={(label: string, payload: any[]) => payload[0]?.payload?.name || label}
                  labelStyle={{ color: '#64748b', marginBottom: '4px' }}
                  cursor={{ fill: '#f1f5f9' }}
                />
                <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-72 flex items-center justify-center text-slate-400">
            <p>No data yet. Log a paper to see your progress!</p>
          </div>
        )}
      </div>

      {/* Recent Logs */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="text-lg font-semibold text-slate-900">Recent Papers</h3>
        </div>
        <div className="divide-y divide-slate-100">
          {recentLogs.length > 0 ? recentLogs.map(log => {
            const subject = subjects.find(s => s.id === log.subjectId);
            const percentage = calculatePercentage(log.score, log.maxScore);
            return (
              <div key={log.id} className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => navigateTo('subject', log.subjectId)}>
                <div className="mb-2 sm:mb-0">
                  <div className="flex items-center space-x-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: subject?.color || '#cbd5e1' }} />
                    <p className="font-medium text-slate-900">{subject?.name}</p>
                  </div>
                  <p className="text-sm text-slate-500 mt-1">
                    {formatPaperName(log.year, log.season, log.paper, log.variant)}
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-lg font-bold text-slate-900">{percentage}%</p>
                    <p className="text-xs text-slate-500">{log.score} / {log.maxScore}</p>
                  </div>
                  <div className="text-xs text-slate-400">
                    {format(new Date(log.date), 'MMM dd, yyyy')}
                  </div>
                </div>
              </div>
            );
          }) : (
            <div className="p-8 text-center text-slate-500">
              No papers logged yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
