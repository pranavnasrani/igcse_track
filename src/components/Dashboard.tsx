import React, { useMemo, useState } from 'react';
import { useStore } from '../store';
import { BookOpen, TrendingUp, Award, Activity, Search, Flame, FileQuestion, Edit2, Sparkles, Target } from 'lucide-react';
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
import { LogForm } from './LogForm';
import { PaperLog } from '../types';

interface DashboardProps {
  userId: string;
  actingUserId: string;
}

export function Dashboard({ userId, actingUserId }: DashboardProps) {
  const store = useStore(userId, actingUserId);
  const { subjects, logs } = store;

  const [searchQuery, setSearchQuery] = useState('');
  const [editingLog, setEditingLog] = useState<PaperLog | null>(null);
  const [parsedSearch, setParsedSearch] = useState<{
    season?: string;
    year?: number;
    paper?: number;
    variant?: number;
    subjectId?: string;
  }>({});

  const handleSmartSearch = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setParsedSearch({});
      return;
    }

    const lowerQuery = query.toLowerCase();
    const parsed: any = {};

    // 1. Extract standard shorthand like s23, m22, w21
    const shorthandMatch = lowerQuery.match(/\b([msw])(\d{2})\b/);
    if (shorthandMatch) {
      parsed.season = shorthandMatch[1];
      parsed.year = parseInt(`20${shorthandMatch[2]}`);
    } else {
      if (/(march|\bm\b)/.test(lowerQuery)) parsed.season = 'm';
      else if (/(june|may|\bs\b)/.test(lowerQuery)) parsed.season = 's';
      else if (/(nov|oct|november|\bw\b)/.test(lowerQuery)) parsed.season = 'w';

      const yearMatch = lowerQuery.match(/\b(20\d{2})\b/);
      if (yearMatch) parsed.year = parseInt(yearMatch[1]);
    }

    // 2. Extract paper and variant
    const pvMatch = lowerQuery.match(/\b(?:p|qp|paper\s*)?([1-6])([1-3])\b/);
    if (pvMatch) {
      parsed.paper = parseInt(pvMatch[1]);
      parsed.variant = parseInt(pvMatch[2]);
    } else {
      const pMatch = lowerQuery.match(/\b(?:paper|p)\s*([1-6])\b/);
      if (pMatch) parsed.paper = parseInt(pMatch[1]);

      const vMatch = lowerQuery.match(/\b(?:variant|v)\s*([1-3])\b/);
      if (vMatch) parsed.variant = parseInt(vMatch[1]);
    }

    // 3. Extract subject
    const subjectMatch = subjects.find(s => 
      lowerQuery.includes(s.name.toLowerCase()) || 
      (s.code && lowerQuery.includes(s.code.toLowerCase()))
    );
    if (subjectMatch) {
      parsed.subjectId = subjectMatch.id;
    }

    setParsedSearch(parsed);
  };

  const getSeasonName = (s: string) => {
    if (s === 'm') return 'March';
    if (s === 's') return 'June';
    if (s === 'w') return 'November';
    return s;
  };

  const filteredLogs = useMemo(() => {
    if (!searchQuery.trim()) {
      return [...logs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);
    }

    return logs.filter(log => {
      if (parsedSearch.season && log.season !== parsedSearch.season) return false;
      if (parsedSearch.year && log.year !== parsedSearch.year) return false;
      if (parsedSearch.paper && log.paper !== parsedSearch.paper) return false;
      if (parsedSearch.variant && log.variant !== parsedSearch.variant) return false;
      if (parsedSearch.subjectId && log.subjectId !== parsedSearch.subjectId) return false;
      
      // Fallback to fuzzy search if no specific fields were parsed
      if (Object.keys(parsedSearch).length === 0) {
         const subject = subjects.find(s => s.id === log.subjectId);
         const searchStr = `${subject?.name} ${subject?.code} ${log.year} ${getSeasonName(log.season)} p${log.paper}v${log.variant} ${log.notes || ''}`.toLowerCase();
         if (!searchStr.includes(searchQuery.toLowerCase())) return false;
      }

      return true;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [logs, searchQuery, parsedSearch, subjects]);

  const stats = useMemo(() => {
    const totalPapers = logs.length;
    const averageScore = logs.length > 0
      ? Math.round(logs.reduce((acc, log) => acc + (log.score / log.maxScore) * 100, 0) / logs.length)
      : 0;
    
    const recentLogs = [...logs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

    // Calculate streak (papers done in the last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentPapersCount = logs.filter(log => new Date(log.date) >= sevenDaysAgo).length;

    return { totalPapers, averageScore, recentLogs, recentPapersCount };
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

  const momentum = useMemo(() => {
    const today = new Date();
    const days = Array.from({ length: 14 }, (_, index) => {
      const date = new Date(today);
      date.setHours(0, 0, 0, 0);
      date.setDate(today.getDate() - (13 - index));
      const nextDate = new Date(date);
      nextDate.setDate(date.getDate() + 1);

      const count = logs.filter(log => {
        const logDate = new Date(log.date);
        return logDate >= date && logDate < nextDate;
      }).length;

      const level = count === 0 ? 0 : count === 1 ? 1 : count === 2 ? 2 : 3;
      return { date, count, level };
    });

    const activeDays = days.filter(day => day.count > 0).length;
    const score = Math.round((activeDays / days.length) * 100);

    return { days, activeDays, score };
  }, [logs]);

  const focusInsight = useMemo(() => {
    if (subjects.length === 0) return null;

    const bySubject = subjects.map(subject => {
      const subjectLogs = logs.filter(log => log.subjectId === subject.id);
      const average = subjectLogs.length > 0
        ? Math.round(subjectLogs.reduce((acc, log) => acc + (log.score / log.maxScore) * 100, 0) / subjectLogs.length)
        : 0;
      const lastPracticedAt = subjectLogs.length > 0
        ? subjectLogs.reduce((latest, log) => {
            const logDate = new Date(log.date);
            return logDate > latest ? logDate : latest;
          }, new Date(subjectLogs[0].date))
        : null;

      return {
        subject,
        average,
        logsCount: subjectLogs.length,
        lastPracticedAt,
        targetGap: subject.targetScore ? subject.targetScore - average : 0
      };
    });

    const belowTarget = bySubject
      .filter(item => item.logsCount > 0 && item.targetGap > 0)
      .sort((a, b) => b.targetGap - a.targetGap)[0];

    if (belowTarget) {
      return {
        title: `Focus on ${belowTarget.subject.name}`,
        subtitle: `You're ${Math.round(belowTarget.targetGap)}% below your target. One more paper here could move your average fast.`,
        color: belowTarget.subject.color
      };
    }

    const practicedSubjects = bySubject
      .filter(item => item.logsCount > 0 && item.lastPracticedAt)
      .sort((a, b) => (a.lastPracticedAt!.getTime() - b.lastPracticedAt!.getTime()));

    if (practicedSubjects.length > 0) {
      const stale = practicedSubjects[0];
      const daysSince = Math.max(0, Math.floor((Date.now() - stale.lastPracticedAt!.getTime()) / (1000 * 60 * 60 * 24)));
      return {
        title: `Revise ${stale.subject.name} next`,
        subtitle: daysSince === 0
          ? 'Great consistency today. Keep momentum by attempting one fresh variant.'
          : `${daysSince} day${daysSince === 1 ? '' : 's'} since your last paper in this subject.`,
        color: stale.subject.color
      };
    }

    return {
      title: `Start with ${subjects[0].name}`,
      subtitle: 'Log your first paper to unlock personalized performance insights.',
      color: subjects[0].color
    };
  }, [subjects, logs]);

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

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 flex items-center space-x-4 transition-colors">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center transition-colors shadow-sm">
            <BookOpen className="w-7 h-7" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider transition-colors">Total Papers</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-slate-50 font-display transition-colors">{stats.totalPapers}</p>
          </div>
        </div>
        
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 flex items-center space-x-4 transition-colors">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center transition-colors shadow-sm">
            <Award className="w-7 h-7" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider transition-colors">Average Score</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-slate-50 font-display transition-colors">{stats.averageScore}%</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 flex items-center space-x-4 transition-colors">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center transition-colors shadow-sm">
            <Activity className="w-7 h-7" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider transition-colors">Active Subjects</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-slate-50 font-display transition-colors">{subjects.length}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 flex items-center space-x-4 transition-colors">
          <div className="w-14 h-14 rounded-2xl bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center transition-colors shadow-sm">
            <Flame className="w-7 h-7" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider transition-colors">7-Day Streak</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-slate-50 font-display transition-colors">{stats.recentPapersCount}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-3 font-display flex items-center transition-colors">
            <Sparkles className="w-5 h-5 mr-2 text-indigo-500 dark:text-indigo-400" />
            Focus Insight
          </h3>
          {focusInsight ? (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50 dark:bg-slate-950/60 transition-colors">
              <div className="flex items-center mb-2">
                <span
                  className="w-2.5 h-2.5 rounded-full mr-2"
                  style={{ backgroundColor: focusInsight.color }}
                />
                <p className="text-base font-semibold text-slate-900 dark:text-slate-100 transition-colors">{focusInsight.title}</p>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 transition-colors">{focusInsight.subtitle}</p>
            </div>
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400 transition-colors">Add a subject to start getting tailored recommendations.</p>
          )}
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-3 font-display flex items-center transition-colors">
            <Target className="w-5 h-5 mr-2 text-emerald-500 dark:text-emerald-400" />
            14-Day Momentum
          </h3>
          <p className="text-3xl font-bold text-slate-900 dark:text-slate-50 font-display transition-colors">{momentum.score}%</p>
          <p className="text-sm text-slate-500 dark:text-slate-400 transition-colors">{momentum.activeDays} active days in the last 2 weeks</p>
          <div className="grid grid-cols-7 gap-1.5 mt-4">
            {momentum.days.map((day) => (
              <div
                key={day.date.toISOString()}
                className={
                  `h-5 rounded-md ${day.level === 0
                    ? 'bg-slate-200 dark:bg-slate-800'
                    : day.level === 1
                      ? 'bg-indigo-200 dark:bg-indigo-900'
                      : day.level === 2
                        ? 'bg-indigo-400 dark:bg-indigo-600'
                        : 'bg-indigo-600 dark:bg-indigo-400'
                  }`
                }
                title={`${day.date.toLocaleDateString()}: ${day.count} paper${day.count === 1 ? '' : 's'}`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
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
                    cursor={{ fill: 'rgba(148, 163, 184, 0.1)' }}
                    contentStyle={{ 
                      backgroundColor: '#ffffff',
                      color: '#0f172a',
                      borderRadius: '12px', 
                      border: 'none', 
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' 
                    }}
                    itemStyle={{ color: '#0f172a' }}
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
              <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 transition-colors">
                <TrendingUp className="w-12 h-12 mb-4 opacity-20" />
                <p>No data yet. Log some papers to see your performance.</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 font-display transition-colors">
              {searchQuery.trim() ? 'Search Results' : 'Recent Activity'}
            </h3>
          </div>
          
          <div className="relative mb-4">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSmartSearch(e.target.value)}
              placeholder="Search done papers (e.g. 'Math s23 p42')"
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-colors text-sm"
            />
          </div>

          <div className="space-y-4 overflow-y-auto flex-1 max-h-[400px] pr-2">
            {filteredLogs.length > 0 ? (
              filteredLogs.map(log => {
                const subject = subjects.find(s => s.id === log.subjectId);
                if (!subject) return null;
                const percentage = Math.round((log.score / log.maxScore) * 100);
                
                return (
                  <div key={log.id} className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-800 group">
                    <div className="flex items-center overflow-hidden">
                      <div 
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-sm mr-4 flex-shrink-0 shadow-sm"
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
                    <button
                      onClick={() => setEditingLog(log)}
                      className="p-2 text-slate-400 hover:text-indigo-500 dark:text-slate-500 dark:hover:text-indigo-400 transition-colors rounded-full hover:bg-indigo-50 dark:hover:bg-indigo-500/10 opacity-0 group-hover:opacity-100 focus:opacity-100"
                      title="Edit log"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-slate-500 dark:text-slate-400 transition-colors">
                <FileQuestion className="w-12 h-12 mb-4 opacity-20" />
                <p className="text-sm text-center">
                  {searchQuery.trim() ? 'No papers found matching your search.' : 'No recent activity. Use "Quick Log" to add one!'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {editingLog && (
        <LogForm
          store={store}
          existingLog={editingLog}
          onClose={() => setEditingLog(null)}
        />
      )}
    </motion.div>
  );
}
