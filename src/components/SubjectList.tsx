import React, { useState } from 'react';
import { BookOpen, Plus, ChevronRight, Target, X } from 'lucide-react';
import { useStore } from '../store';
import { Subject } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { IGCSE_SUBJECTS } from '../constants';

interface SubjectListProps {
  onSelectSubject: (id: string) => void;
  userId: string;
}

export function SubjectList({ onSelectSubject, userId }: SubjectListProps) {
  const { subjects, addSubject } = useStore(userId);
  const [isAdding, setIsAdding] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newSubjectCode, setNewSubjectCode] = useState('');
  const [newSubjectColor, setNewSubjectColor] = useState('#6366f1');
  const [newSubjectTarget, setNewSubjectTarget] = useState<number | ''>('');

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const code = e.target.value;
    setNewSubjectCode(code);
    if (IGCSE_SUBJECTS[code]) {
      setNewSubjectName(IGCSE_SUBJECTS[code]);
    }
  };

  const handleAddSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newSubjectName.trim()) {
      await addSubject({
        name: newSubjectName.trim(),
        code: newSubjectCode.trim(),
        color: newSubjectColor,
        targetScore: newSubjectTarget === '' ? undefined : Number(newSubjectTarget),
      });
      setNewSubjectName('');
      setNewSubjectCode('');
      setNewSubjectColor('#6366f1');
      setNewSubjectTarget('');
      setIsAdding(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6 pb-20 md:pb-0"
    >
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-50 font-display tracking-tight transition-colors">Subjects</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1 transition-colors">Manage your IGCSE subjects and track progress.</p>
        </div>
      </div>



      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subjects.map((subject) => (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            key={subject.id}
            onClick={() => onSelectSubject(subject.id)}
            className="flex flex-col text-left bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${subject.color}15`, color: subject.color }}
              >
                <BookOpen className="w-6 h-6" />
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50 font-display transition-colors">{subject.name}</h3>
            {subject.targetScore && (
              <div className="flex items-center mt-2 text-sm text-slate-500 dark:text-slate-400 transition-colors">
                <Target className="w-4 h-4 mr-1.5 text-slate-400 dark:text-slate-500" />
                Target: <span className="font-semibold text-slate-700 dark:text-slate-300 ml-1">{subject.targetScore}%</span>
              </div>
            )}
          </motion.button>
        ))}
      </div>

      {/* Add Subject Modal */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-800"
            >
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center sticky top-0 bg-white dark:bg-slate-900 z-10">
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50 font-display transition-colors">Add New Subject</h3>
                <button onClick={() => setIsAdding(false)} className="text-slate-400 hover:text-slate-500 dark:hover:text-slate-300 transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={handleAddSubject} className="p-6 transition-colors">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 transition-colors">Subject Code</label>
                    <input
                      type="text"
                      value={newSubjectCode}
                      onChange={handleCodeChange}
                      className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                      placeholder="e.g., 0580"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 transition-colors">Subject Name</label>
                    <input
                      type="text"
                      value={newSubjectName}
                      onChange={(e) => setNewSubjectName(e.target.value)}
                      className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
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
                      value={newSubjectTarget}
                      onChange={(e) => setNewSubjectTarget(e.target.value ? Number(e.target.value) : '')}
                      className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                      placeholder="e.g., 90"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 transition-colors">Color Theme</label>
                    <input
                      type="color"
                      value={newSubjectColor}
                      onChange={(e) => setNewSubjectColor(e.target.value)}
                      className="h-10 w-full p-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 cursor-pointer transition-colors"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-3">
                  <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl font-medium transition-colors">
                    Cancel
                  </button>
                  <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-medium transition-colors shadow-sm">
                    Save Subject
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
          setIsAdding(true);
        }}
        className="fixed bottom-20 right-6 md:bottom-8 md:right-8 w-14 h-14 bg-indigo-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-indigo-700 transition-colors z-50"
      >
        <Plus className="w-6 h-6" />
      </motion.button>
    </motion.div>
  );
}
