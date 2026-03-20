import { useState, useEffect } from 'react';
import { Subject, PaperLog, DEFAULT_SUBJECTS } from './types';

export function useStore() {
  const [subjects, setSubjects] = useState<Subject[]>(() => {
    const saved = localStorage.getItem('igcse_subjects');
    return saved ? JSON.parse(saved) : DEFAULT_SUBJECTS;
  });

  const [logs, setLogs] = useState<PaperLog[]>(() => {
    const saved = localStorage.getItem('igcse_logs');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('igcse_subjects', JSON.stringify(subjects));
  }, [subjects]);

  useEffect(() => {
    localStorage.setItem('igcse_logs', JSON.stringify(logs));
  }, [logs]);

  const addLog = (log: Omit<PaperLog, 'id'>) => {
    const newLog = { ...log, id: crypto.randomUUID() };
    setLogs(prev => [newLog, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  };

  const deleteLog = (id: string) => {
    setLogs(prev => prev.filter(l => l.id !== id));
  };

  const addSubject = (subject: Omit<Subject, 'id'>) => {
    setSubjects(prev => [...prev, { ...subject, id: crypto.randomUUID() }]);
  };

  return { subjects, logs, addLog, deleteLog, addSubject };
}
