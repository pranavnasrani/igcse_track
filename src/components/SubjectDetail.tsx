import React, { useState, useMemo, useEffect } from 'react';
import { ArrowLeft, Plus, Search, ExternalLink, Calendar, Clock, Target, TrendingUp, FileText, CheckCircle, Edit2, Check, AlertCircle, Trash2, Settings, X, FileQuestion, LayoutGrid, List, Flame, Sparkles } from 'lucide-react';
import { useStore } from '../store';
import { format, parseISO } from 'date-fns';
import { Season } from '../types';
import { IGCSE_SUBJECTS } from '../constants';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';

interface SubjectDetailProps {
  subjectId: string;
  onBack: () => void;
  userId: string;
}

export function SubjectDetail({ subjectId, onBack, userId }: SubjectDetailProps) {
  const { subjects, logs, addLog, deleteLog, updateLog, updateSubject, deleteSubject } = useStore(userId);
  const subject = subjects.find(s => s.id === subjectId);
  const subjectLogs = logs.filter(l => l.subjectId === subjectId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const [isAddingLog, setIsAddingLog] = useState(false);
  const [editingLogId, setEditingLogId] = useState<string | null>(null);
  const [isEditingSubject, setIsEditingSubject] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
  const [editSubjectData, setEditSubjectData] = useState({
    name: '',
    code: '',
    color: '#6366f1',
    targetScore: ''
  });

  useEffect(() => {
    if (subject) {
      setEditSubjectData({
        name: subject.name,
        code: subject.code || '',
        color: subject.color,
        targetScore: subject.targetScore?.toString() || ''
      });
    }
  }, [subject]);

  const [newLog, setNewLog] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    year: new Date().getFullYear(),
    season: 's' as Season,
    paper: '1',
    variant: '1',
    score: '',
    maxScore: '',
    timeTaken: '',
    notes: ''
  });

  const [searchYear, setSearchYear] = useState(new Date().getFullYear().toString());
  const [searchSeason, setSearchSeason] = useState('s');
  const [searchPaper, setSearchPaper] = useState('1');
  const [searchVariant, setSearchVariant] = useState('1');
  const [searchQuery, setSearchQuery] = useState('');
  const [smartLogInput, setSmartLogInput] = useState('');

  const handleSmartLogInput = (query: string) => {
    setSmartLogInput(query);
    if (!query.trim()) return;

    const lowerQuery = query.toLowerCase();
    let newLogUpdates: any = {};

    // 1. Extract standard shorthand like s23, m22, w21
    const shorthandMatch = lowerQuery.match(/\b([msw])(\d{2})\b/);
    if (shorthandMatch) {
      newLogUpdates.season = shorthandMatch[1];
      newLogUpdates.year = parseInt(`20${shorthandMatch[2]}`);
    } else {
      if (/(march|\bm\b)/.test(lowerQuery)) newLogUpdates.season = 'm';
      else if (/(june|may|\bs\b)/.test(lowerQuery)) newLogUpdates.season = 's';
      else if (/(nov|oct|november|\bw\b)/.test(lowerQuery)) newLogUpdates.season = 'w';

      const yearMatch = lowerQuery.match(/\b(20\d{2})\b/);
      if (yearMatch) newLogUpdates.year = parseInt(yearMatch[1]);
    }

    // 2. Extract paper and variant
    const pvMatch = lowerQuery.match(/\b(?:p|qp|paper\s*)?([1-6])([1-3])\b/);
    if (pvMatch) {
      newLogUpdates.paper = pvMatch[1];
      newLogUpdates.variant = pvMatch[2];
    } else {
      const pMatch = lowerQuery.match(/\b(?:paper|p)\s*([1-6])\b/);
      if (pMatch) newLogUpdates.paper = pMatch[1];

      const vMatch = lowerQuery.match(/\b(?:variant|v)\s*([1-3])\b/);
      if (vMatch) newLogUpdates.variant = vMatch[1];
    }

    if (Object.keys(newLogUpdates).length > 0) {
      setNewLog(prev => ({ ...prev, ...newLogUpdates }));
    }
  };

  const handleSmartSearch = (query: string) => {
    setSearchQuery(query);
    const lowerQuery = query.toLowerCase();

    let newSeason = searchSeason;
    let newYear = searchYear;
    let newPaper = searchPaper;
    let newVariant = searchVariant;

    // 1. Extract standard shorthand like s23, m22, w21
    const shorthandMatch = lowerQuery.match(/\b([msw])(\d{2})\b/);
    if (shorthandMatch) {
      newSeason = shorthandMatch[1];
      newYear = `20${shorthandMatch[2]}`;
    } else {
      // Fallback words
      if (/(march|\bm\b)/.test(lowerQuery)) newSeason = 'm';
      else if (/(june|may|\bs\b)/.test(lowerQuery)) newSeason = 's';
      else if (/(nov|oct|november|\bw\b)/.test(lowerQuery)) newSeason = 'w';

      const yearMatch = lowerQuery.match(/\b(20\d{2})\b/);
      if (yearMatch) newYear = yearMatch[1];
    }

    // 2. Extract paper and variant
    // Matches p42, qp42, 42 (as a standalone word)
    const pvMatch = lowerQuery.match(/\b(?:p|qp|paper\s*)?([1-6])([1-3])\b/);
    if (pvMatch) {
      newPaper = pvMatch[1];
      newVariant = pvMatch[2];
    } else {
      const pMatch = lowerQuery.match(/\b(?:paper|p)\s*([1-6])\b/);
      if (pMatch) newPaper = pMatch[1];

      const vMatch = lowerQuery.match(/\b(?:variant|v)\s*([1-3])\b/);
      if (vMatch) newVariant = vMatch[1];
    }

    setSearchSeason(newSeason);
    setSearchYear(newYear);
    setSearchPaper(newPaper);
    setSearchVariant(newVariant);
  };

  const chartData = useMemo(() => {
    return [...subjectLogs].reverse().map(log => ({
      date: format(parseISO(log.date), 'MMM dd'),
      score: Math.round((log.score / log.maxScore) * 100),
      label: `${log.year} ${log.season}${log.paper}${log.variant}`
    }));
  }, [subjectLogs]);

  const averageScore = useMemo(() => {
    if (subjectLogs.length === 0) return 0;
    const totalPercentage = subjectLogs.reduce((acc, log) => acc + (log.score / log.maxScore) * 100, 0);
    return Math.round(totalPercentage / subjectLogs.length);
  }, [subjectLogs]);

  const gridData = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const maxAvailableYear = currentYear - 1; // Exclude current year as papers aren't out yet
    const logYears = subjectLogs.map(l => l.year);
    const earliestLogYear = logYears.length > 0 ? Math.min(...logYears) : maxAvailableYear;
    const maxYear = Math.max(maxAvailableYear, ...logYears);
    const minYear = earliestLogYear - 2;
    const displayYears = Array.from({ length: maxYear - minYear + 1 }, (_, i) => maxYear - i);
    
    const seasons: Season[] = ['m', 's', 'w'];
    const seasonLabels = { m: 'March', s: 'June', w: 'November' };
    
    const isAvailable = (y: number, s: Season) => {
      return y <= maxAvailableYear;
    };

    let recommended: { year: number, season: Season } | null = null;
    const seasonsToCheck = ['w', 's', 'm'] as Season[];
    
    for (let y = maxYear; y >= minYear; y--) {
      for (const s of seasonsToCheck) {
        if (isAvailable(y, s)) {
          const hasPaper = subjectLogs.some(l => l.year === y && l.season === s);
          if (!hasPaper) {
            recommended = { year: y, season: s };
            break;
          }
        }
      }
      if (recommended) break;
    }

    return { displayYears, seasons, seasonLabels, recommended };
  }, [subjectLogs]);

  if (!subject) return null;

  const handleAddLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newLog.score && newLog.maxScore) {
      // Create date object from the date input, keeping the current time
      const dateObj = new Date(newLog.date);
      const now = new Date();
      dateObj.setHours(now.getHours(), now.getMinutes(), now.getSeconds());

      const logData = {
        subjectId,
        date: dateObj.toISOString(),
        year: newLog.year,
        season: newLog.season,
        paper: Number(newLog.paper),
        variant: Number(newLog.variant),
        score: Number(newLog.score),
        maxScore: Number(newLog.maxScore),
        timeTaken: newLog.timeTaken ? Number(newLog.timeTaken) : undefined,
        notes: newLog.notes
      };

      if (editingLogId) {
        await updateLog(editingLogId, logData);
      } else {
        await addLog(logData);
      }
      
      setIsAddingLog(false);
      setEditingLogId(null);
      setNewLog({
        date: format(new Date(), 'yyyy-MM-dd'),
        year: new Date().getFullYear(),
        season: 's',
        paper: '1',
        variant: '1',
        score: '',
        maxScore: '',
        timeTaken: '',
        notes: ''
      });
    }
  };

  const handleRecommendClick = (year: number, season: Season) => {
    // March series only has variant 2 for all subjects
    let targetVariant = searchVariant;
    if (season === 'm' && targetVariant !== 'none') {
      targetVariant = '2';
      setSearchVariant('2');
    }

    // Update the search fields so it's ready
    setSearchYear(year.toString());
    setSearchSeason(season);
    
    // Pre-fill the new log form for when they return and click '+'
    setNewLog(prev => ({ ...prev, year, season, variant: targetVariant }));
    
    // Open the question paper
    if (!subject?.code) {
      const variantText = targetVariant === 'none' ? '' : ` variant ${targetVariant}`;
      const query = `IGCSE ${subject.name} past paper ${year} ${getSeasonName(season)} paper ${searchPaper}${variantText}`;
      window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank');
      return;
    }
    
    const year2Digit = year.toString().slice(-2);
    const paperStr = targetVariant === 'none' ? searchPaper : `${searchPaper}${targetVariant}`;
    const url = `https://pastpapers.papacambridge.com/directories/CAIE/CAIE-pastpapers/upload/${subject.code}_${season}${year2Digit}_qp_${paperStr}.pdf`;
    
    window.open(url, '_blank');
  };

  const handleEditLog = (log: any) => {
    setNewLog({
      date: format(parseISO(log.date), 'yyyy-MM-dd'),
      year: log.year,
      season: log.season,
      paper: log.paper.toString(),
      variant: log.variant.toString(),
      score: log.score.toString(),
      maxScore: log.maxScore.toString(),
      timeTaken: log.timeTaken ? log.timeTaken.toString() : '',
      notes: log.notes || ''
    });
    setEditingLogId(log.id);
    setIsAddingLog(true);
  };

  const getSeasonName = (s: string) => {
    if (s === 'm') return 'March';
    if (s === 's') return 'June';
    if (s === 'w') return 'November';
    return s;
  };

  const handleEditCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const code = e.target.value;
    setEditSubjectData(prev => ({ ...prev, code }));
    if (IGCSE_SUBJECTS[code]) {
      setEditSubjectData(prev => ({ ...prev, name: IGCSE_SUBJECTS[code] }));
    }
  };

  const handleSaveSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (subject && editSubjectData.name.trim()) {
      await updateSubject(subject.id, {
        name: editSubjectData.name.trim(),
        code: editSubjectData.code.trim(),
        color: editSubjectData.color,
        targetScore: editSubjectData.targetScore ? Number(editSubjectData.targetScore) : undefined
      });
      setIsEditingSubject(false);
    }
  };

  const handleDeleteSubject = async () => {
    if (window.confirm('Are you sure you want to delete this subject? All associated logs will remain in the database but will be orphaned.')) {
      if (subject) {
        await deleteSubject(subject.id);
        onBack();
      }
    }
  };

  const generatePapaCambridgeUrl = (type: 'qp' | 'ms') => {
    if (!subject?.code) return null;
    const year2Digit = searchYear.slice(-2);
    const paperStr = searchVariant === 'none' ? searchPaper : `${searchPaper}${searchVariant}`;
    return `https://pastpapers.papacambridge.com/directories/CAIE/CAIE-pastpapers/upload/${subject.code}_${searchSeason}${year2Digit}_${type}_${paperStr}.pdf`;
  };

  const generateSearchUrl = () => {
    const variantText = searchVariant === 'none' ? '' : ` variant ${searchVariant}`;
    const query = `IGCSE ${subject.name} past paper ${searchYear} ${getSeasonName(searchSeason)} paper ${searchPaper}${variantText}`;
    return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6 pb-20 md:pb-0"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-600 dark:text-slate-400"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <div className="flex items-center">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-50 font-display tracking-tight flex items-center transition-colors">
                <span
                  className="w-4 h-4 rounded-full mr-3"
                  style={{ backgroundColor: subject.color }}
                />
                {subject.name}
              </h2>
              <span className="ml-3 text-xl text-slate-400 dark:text-slate-500 font-medium font-display transition-colors">
                {subject.code ? `(${subject.code})` : ''}
              </span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 mt-1 transition-colors">Track your performance and find past papers.</p>
          </div>
        </div>
        <button
          onClick={() => setIsEditingSubject(!isEditingSubject)}
          className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-600 dark:text-slate-400"
        >
          <Settings className="w-6 h-6" />
        </button>
      </div>

      <AnimatePresence>
        {isEditingSubject && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <form onSubmit={handleSaveSubject} className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 mb-6 transition-colors">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 font-display transition-colors">Edit Subject</h3>
                <button
                  type="button"
                  onClick={handleDeleteSubject}
                  className="flex items-center text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium transition-colors"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete Subject
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 transition-colors">Subject Code</label>
                  <input
                    type="text"
                    value={editSubjectData.code}
                    onChange={handleEditCodeChange}
                    className="w-full px-4 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                    placeholder="e.g., 0580"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 transition-colors">Subject Name</label>
                  <input
                    type="text"
                    value={editSubjectData.name}
                    onChange={(e) => setEditSubjectData({ ...editSubjectData, name: e.target.value })}
                    className="w-full px-4 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                    placeholder="e.g., Mathematics"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 transition-colors">Target Score (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={editSubjectData.targetScore}
                    onChange={(e) => setEditSubjectData({ ...editSubjectData, targetScore: e.target.value })}
                    className="w-full px-4 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                    placeholder="e.g., 90"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 transition-colors">Color Theme</label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      value={editSubjectData.color}
                      onChange={(e) => setEditSubjectData({ ...editSubjectData, color: e.target.value })}
                      className="h-10 w-14 p-1 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 cursor-pointer transition-colors"
                    />
                    <div className="flex space-x-2">
                      <button type="button" onClick={() => setIsEditingSubject(false)} className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl font-medium transition-colors">
                        Cancel
                      </button>
                      <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-medium transition-colors shadow-sm">
                        Save
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Stats Overview */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col justify-center items-center text-center transition-colors">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-sm" style={{ backgroundColor: `${subject.color}15`, color: subject.color }}>
            <TrendingUp className="w-8 h-8" />
          </div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider transition-colors">Average Score</p>
          <p className="text-4xl font-bold text-slate-900 dark:text-slate-50 font-display mt-1 transition-colors">{averageScore}%</p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 transition-colors">{subjectLogs.length} papers completed</p>
        </div>

        {/* Target Score */}
        {subject.targetScore && (
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col justify-center items-center text-center transition-colors">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-sm transition-colors">
              <Target className="w-8 h-8" />
            </div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider transition-colors">Target Score</p>
            <p className="text-4xl font-bold text-slate-900 dark:text-slate-50 font-display mt-1 transition-colors">{subject.targetScore}%</p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 transition-colors">
              {averageScore >= subject.targetScore ? 'On track! 🎉' : `${subject.targetScore - averageScore}% to go`}
            </p>
          </div>
        )}

        {/* Find Papers */}
        <div className={cn("bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors", subject.targetScore ? "" : "md:col-span-2")}>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-4 font-display flex items-center transition-colors">
            <Search className="w-5 h-5 mr-2 text-slate-400 dark:text-slate-500" />
            Find Past Papers
          </h3>
          <div className="mb-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSmartSearch(e.target.value)}
              placeholder="Smart search (e.g., 's23 p42' or 'June 2023 Paper 4')"
              className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-colors"
            />
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider transition-colors">Year</label>
              <select
                value={searchYear}
                onChange={(e) => setSearchYear(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-colors"
              >
                {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider transition-colors">Season</label>
              <select
                value={searchSeason}
                onChange={(e) => setSearchSeason(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-colors"
              >
                <option value="m">March</option>
                <option value="s">June</option>
                <option value="w">November</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider transition-colors">Paper</label>
              <select
                value={searchPaper}
                onChange={(e) => setSearchPaper(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-colors"
              >
                {['1', '2', '3', '4', '5', '6'].map(v => (
                  <option key={v} value={v}>Paper {v}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider transition-colors">Variant</label>
              <select
                value={searchVariant}
                onChange={(e) => setSearchVariant(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-colors"
              >
                {['1', '2', '3'].map(v => (
                  <option key={v} value={v}>Variant {v}</option>
                ))}
                <option value="none">No Variant</option>
              </select>
            </div>
          </div>
          <div className="flex flex-col space-y-3">
            {subject.code ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <a
                  href={generatePapaCambridgeUrl('qp')!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-full px-4 py-2.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-xl font-medium transition-colors"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Question Paper
                </a>
                <a
                  href={generatePapaCambridgeUrl('ms')!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-full px-4 py-2.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl font-medium transition-colors"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Mark Scheme
                </a>
              </div>
            ) : (
              <div className="p-3 bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 rounded-xl text-sm text-amber-700 dark:text-amber-400 flex items-start transition-colors">
                <AlertCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                <p>Add a subject code (e.g., 0580) above to get direct PDF links to past papers and mark schemes.</p>
              </div>
            )}
            <a
              href={generateSearchUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl font-medium transition-colors"
            >
              <Search className="w-4 h-4 mr-2" />
              Search Google
            </a>
          </div>
        </div>
      </div>

      {/* Performance Chart */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-6 font-display transition-colors">Performance Trend</h3>
        <div className="h-72">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  labelStyle={{ fontWeight: 'bold', color: '#0f172a' }}
                />
                {subject.targetScore && (
                  <ReferenceLine y={subject.targetScore} stroke="#10b981" strokeDasharray="3 3" label={{ position: 'insideTopLeft', value: 'Target', fill: '#10b981', fontSize: 12 }} />
                )}
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke={subject.color}
                  strokeWidth={3}
                  dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                  name="Score (%)"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400">
              <p>No data yet. Log a paper to see your trend.</p>
            </div>
          )}
        </div>
      </div>

      {/* Paper Logs */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 font-display transition-colors">Paper History</h3>
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700/50">
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-200 ${viewMode === 'grid' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400 font-medium' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="text-sm">Grid</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-200 ${viewMode === 'list' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400 font-medium' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
              title="List View"
            >
              <List className="w-4 h-4" />
              <span className="text-sm">List</span>
            </button>
          </div>
        </div>

        {viewMode === 'list' ? (
          <div className="space-y-4">
            {subjectLogs.map((log) => {
              const percentage = Math.round((log.score / log.maxScore) * 100);
              return (
                <div key={log.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-2xl border border-slate-100 dark:border-slate-800/50 bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  <div className="flex items-start md:items-center space-x-4 mb-3 md:mb-0">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold font-display shadow-sm" style={{ backgroundColor: subject.color }}>
                      {percentage}%
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-slate-100 transition-colors">
                        {log.year} {getSeasonName(log.season)} - Paper {log.paper}{log.variant}
                      </p>
                      <div className="flex items-center text-sm text-slate-500 dark:text-slate-400 mt-1 space-x-3 transition-colors">
                        <span className="flex items-center"><Calendar className="w-3 h-3 mr-1" /> {format(parseISO(log.date), 'MMM dd, yyyy')}</span>
                        {log.timeTaken && <span className="flex items-center"><Clock className="w-3 h-3 mr-1" /> {log.timeTaken} min</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col md:items-end">
                    <div className="flex items-center space-x-3 mb-1">
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors">
                        {log.score} / {log.maxScore} marks
                      </p>
                      <button
                        onClick={() => handleEditLog(log)}
                        className="p-1 text-slate-400 hover:text-indigo-500 dark:text-slate-500 dark:hover:text-indigo-400 transition-colors rounded-full hover:bg-indigo-50 dark:hover:bg-indigo-500/10"
                        title="Edit log"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm('Are you sure you want to delete this paper log?')) {
                            deleteLog(log.id);
                          }
                        }}
                        className="p-1 text-slate-400 hover:text-red-500 dark:text-slate-500 dark:hover:text-red-400 transition-colors rounded-full hover:bg-red-50 dark:hover:bg-red-500/10"
                        title="Delete log"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    {log.notes && (
                      <p className="text-sm text-slate-500 dark:text-slate-400 italic max-w-xs truncate transition-colors">
                        "{log.notes}"
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
            {subjectLogs.length === 0 && !isAddingLog && (
              <div className="flex flex-col items-center justify-center py-12 text-slate-500 dark:text-slate-400 transition-colors">
                <FileQuestion className="w-12 h-12 mb-4 opacity-20" />
                <p className="text-sm text-center">No papers logged yet. Start practicing!</p>
              </div>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr>
                  <th className="p-3 border-b border-slate-200 dark:border-slate-800 font-semibold text-sm text-slate-900 dark:text-slate-100">Year</th>
                  {gridData.seasons.map(s => (
                    <th key={s} className="p-3 border-b border-slate-200 dark:border-slate-800 font-semibold text-sm text-slate-900 dark:text-slate-100">{gridData.seasonLabels[s]}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {gridData.displayYears.map(year => (
                  <tr key={year} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                    <td className="p-3 border-b border-slate-100 dark:border-slate-800/50 font-medium text-sm text-slate-700 dark:text-slate-300 align-top w-24">
                      {year}
                    </td>
                    {gridData.seasons.map(season => {
                      const cellLogs = subjectLogs.filter(l => l.year === year && l.season === season);
                      const isRecommended = gridData.recommended?.year === year && gridData.recommended?.season === season;
                      
                      return (
                        <td key={`${year}-${season}`} className={`p-3 border-b border-slate-100 dark:border-slate-800/50 align-top ${isRecommended ? 'bg-indigo-50/30 dark:bg-indigo-500/5' : ''}`}>
                          <div className="flex flex-col items-start gap-2">
                            {isRecommended && cellLogs.length === 0 && (
                              <button 
                                onClick={() => handleRecommendClick(year, season)}
                                className="text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-500/20 px-2 py-1 rounded-md flex items-center hover:bg-indigo-200 dark:hover:bg-indigo-500/30 transition-colors"
                              >
                                <Flame className="w-3 h-3 mr-1" /> Recommended Next
                              </button>
                            )}
                            <div className="flex flex-wrap gap-2">
                              {cellLogs.length > 0 ? (
                                cellLogs.map(log => {
                                  const percentage = Math.round((log.score / log.maxScore) * 100);
                                  return (
                                    <button
                                      key={log.id}
                                      onClick={() => handleEditLog(log)}
                                      className="text-xs px-2 py-1.5 rounded-lg border flex items-center gap-1.5 hover:opacity-80 transition-opacity bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                                      title={`Score: ${log.score}/${log.maxScore} (${percentage}%)`}
                                    >
                                      <span className="font-semibold">P{log.paper}V{log.variant}</span>
                                      <span className="opacity-50">|</span>
                                      <span className={subject.targetScore && percentage >= subject.targetScore ? 'text-emerald-600 dark:text-emerald-400 font-medium' : ''}>{percentage}%</span>
                                    </button>
                                  );
                                })
                              ) : (
                                !isRecommended && <span className="text-xs text-slate-400 dark:text-slate-600 italic opacity-0 group-hover:opacity-100 transition-opacity">No papers</span>
                              )}
                            </div>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Log Paper Modal */}
      <AnimatePresence>
        {isAddingLog && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-800"
            >
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center sticky top-0 bg-white dark:bg-slate-900 z-10">
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50 font-display transition-colors">{editingLogId ? 'Edit Paper Log' : 'Log New Paper'}</h3>
                <button onClick={() => { setIsAddingLog(false); setEditingLogId(null); setSmartLogInput(''); }} className="text-slate-400 hover:text-slate-500 dark:hover:text-slate-300 transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={handleAddLog} className="p-6 transition-colors">
                {!editingLogId && (
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex items-center transition-colors">
                      <Sparkles className="w-4 h-4 mr-1.5 text-indigo-500" />
                      Smart Autocomplete
                    </label>
                    <input 
                      type="text" 
                      value={smartLogInput} 
                      onChange={e => handleSmartLogInput(e.target.value)}
                      placeholder="e.g. s23 p42"
                      className="w-full px-4 py-2.5 bg-indigo-50/50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-indigo-300 dark:placeholder:text-indigo-700 text-indigo-900 dark:text-indigo-100 transition-colors"
                    />
                  </div>
                )}
                <div className="grid grid-cols-2 md:grid-cols-7 gap-4 mb-4">
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider transition-colors">Date</label>
                    <input
                      type="date"
                      value={newLog.date}
                      onChange={(e) => setNewLog({ ...newLog, date: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider transition-colors">Year</label>
                    <input
                      type="number"
                      value={newLog.year}
                      onChange={(e) => setNewLog({ ...newLog, year: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider transition-colors">Season</label>
                    <select
                      value={newLog.season}
                      onChange={(e) => setNewLog({ ...newLog, season: e.target.value as Season })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-colors"
                    >
                      <option value="m">March</option>
                      <option value="s">June</option>
                      <option value="w">Nov</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider transition-colors">Paper</label>
                    <input
                      type="number"
                      value={newLog.paper}
                      onChange={(e) => setNewLog({ ...newLog, paper: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider transition-colors">Variant</label>
                    <input
                      type="number"
                      value={newLog.variant}
                      onChange={(e) => setNewLog({ ...newLog, variant: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider transition-colors">
                      Score
                      {newLog.score && newLog.maxScore && Number(newLog.maxScore) > 0 ? (
                        <span className="ml-1 text-indigo-600 dark:text-indigo-400">
                          ({Math.round((Number(newLog.score) / Number(newLog.maxScore)) * 100)}%)
                        </span>
                      ) : null}
                    </label>
                    <input
                      type="number"
                      value={newLog.score}
                      onChange={(e) => setNewLog({ ...newLog, score: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider transition-colors">Total</label>
                    <input
                      type="number"
                      value={newLog.maxScore}
                      onChange={(e) => setNewLog({ ...newLog, maxScore: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-colors"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider transition-colors">Time (min)</label>
                    <input
                      type="number"
                      value={newLog.timeTaken}
                      onChange={(e) => setNewLog({ ...newLog, timeTaken: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-colors"
                      placeholder="Optional"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider transition-colors">Notes</label>
                    <input
                      type="text"
                      value={newLog.notes}
                      onChange={(e) => setNewLog({ ...newLog, notes: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-colors"
                      placeholder="e.g., Struggled with question 4"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-3">
                  {editingLogId && (
                    <button 
                      type="button"
                      onClick={() => {
                        if (window.confirm('Are you sure you want to delete this paper log?')) {
                          deleteLog(editingLogId);
                          setIsAddingLog(false);
                          setEditingLogId(null);
                        }
                      }}
                      className="px-4 py-2 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-100 dark:hover:bg-red-500/20 font-medium transition-colors flex items-center"
                      title="Delete Log"
                    >
                      <Trash2 className="w-4 h-4 mr-1.5" />
                      Delete
                    </button>
                  )}
                  <button type="button" onClick={() => { setIsAddingLog(false); setEditingLogId(null); setSmartLogInput(''); }} className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl font-medium transition-colors">
                    Cancel
                  </button>
                  <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-medium transition-colors shadow-sm">
                    {editingLogId ? 'Update Log' : 'Save Log'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Action Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          setNewLog(prev => ({
            ...prev,
            year: parseInt(searchYear),
            season: searchSeason as Season,
            paper: searchPaper,
            variant: searchVariant === 'none' ? '1' : searchVariant
          }));
          setIsAddingLog(true);
        }}
        className="fixed bottom-20 right-6 md:bottom-8 md:right-8 w-14 h-14 bg-indigo-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-indigo-700 transition-colors z-50"
      >
        <Plus className="w-6 h-6" />
      </motion.button>
    </motion.div>
  );
}

function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}
