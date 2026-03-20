import React, { useMemo } from 'react';
import { useStore } from '../store';
import { BookOpen, TrendingUp, Award, Activity } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { motion } from 'motion/react';

interface DashboardProps {
  userId: string;
}

export function Dashboard({ userId }: DashboardProps) {
  const { subjects, logs } = useStore(userId);

  const stats = useMemo(() => {
    const totalPapers = logs.length;
    const averageScore = logs.length > 0
      ? Math.round(logs.reduce((acc, log) => acc + (log.score / log.maxScore) * 100, 0) / logs.length)
      : 0;
    
    const recentLogs = [...logs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

    return { totalPapers, averageScore, recentLogs };
  }, [logs]);

  const chartData = useMemo(() => {
    return subjects.map(subject => {
      const subjectLogs = logs.filter(l => l.subjectId === subject.id);
      const avg = subjectLogs.length > 0
        ? Math.round(subjectLogs.reduce((acc, log) => acc + (log.score / log.maxScore) * 100, 0) / subjectLogs.length)
        : 0;
      return {
        name: subject.name,
        average: avg,
        papers: subjectLogs.length,
        color: subject.color
      };
    }).filter(data => data.papers > 0).slice(0, 6); // Top 6 active subjects
  }, [subjects, logs]);

  const getSeasonName = (s: string) => {
    if (s === 'm') return 'March';
    if (s === 's') return 'June';
    if (s === 'w') return 'November';
    return s;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6 pb-20 md:pb-0"
    >
      <div>
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-50 font-display tracking-tight transition-colors">Dashboard</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-1 transition-colors">Here's an overview of your IGCSE preparation.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex items-center space-x-4 transition-colors">
          <div className="w-14 h-14 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center transition-colors">
            <BookOpen className="w-7 h-7" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider transition-colors">Total Papers</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-slate-50 font-display transition-colors">{stats.totalPapers}</p>
          </div>
        </div>
        
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex items-center space-x-4 transition-colors">
          <div className="w-14 h-14 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center transition-colors">
            <Award className="w-7 h-7" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider transition-colors">Average Score</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-slate-50 font-display transition-colors">{stats.averageScore}%</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex items-center space-x-4 transition-colors">
          <div className="w-14 h-14 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center transition-colors">
            <Activity className="w-7 h-7" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider transition-colors">Active Subjects</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-slate-50 font-display transition-colors">{subjects.length}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-6 font-display flex items-center transition-colors">
            <TrendingUp className="w-5 h-5 mr-2 text-slate-400 dark:text-slate-500" />
            Performance by Subject
          </h3>
          <div className="h-72">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 5, right: 20, bottom: 25, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="name" 
                    stroke="#94a3b8" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
                  <Tooltip
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: number, name: string) => [
                      name === 'average' ? `${value}%` : value, 
                      name === 'average' ? 'Avg Score' : 'Papers Done'
                    ]}
                  />
                  <Bar dataKey="average" radius={[6, 6, 0, 0]} maxBarSize={50}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 dark:text-slate-500 transition-colors">
                <p>No data yet. Log some papers to see your performance.</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-6 font-display transition-colors">Recent Activity</h3>
          <div className="space-y-4">
            {stats.recentLogs.length > 0 ? (
              stats.recentLogs.map(log => {
                const subject = subjects.find(s => s.id === log.subjectId);
                if (!subject) return null;
                const percentage = Math.round((log.score / log.maxScore) * 100);
                
                return (
                  <div key={log.id} className="flex items-center p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm mr-4 flex-shrink-0 shadow-sm"
                      style={{ backgroundColor: subject.color }}
                    >
                      {percentage}%
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate transition-colors">{subject.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate transition-colors">
                        {log.year} {getSeasonName(log.season)} p{log.paper}v{log.variant} • {log.score}/{log.maxScore}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4 transition-colors">No recent activity.</p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
