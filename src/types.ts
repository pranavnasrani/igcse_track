export type Season = 'm' | 's' | 'w'; // March, June, November

export interface Subject {
  id: string;
  name: string;
  code: string;
  color: string;
}

export interface PaperLog {
  id: string;
  subjectId: string;
  year: number;
  season: Season;
  paper: number;
  variant: number;
  score: number;
  maxScore: number;
  date: string; // ISO string
  notes?: string;
}

export const DEFAULT_SUBJECTS: Subject[] = [
  { id: '1', name: 'Mathematics', code: '0580', color: '#3b82f6' }, // blue-500
  { id: '2', name: 'Physics', code: '0625', color: '#ef4444' }, // red-500
  { id: '3', name: 'Chemistry', code: '0620', color: '#10b981' }, // emerald-500
  { id: '4', name: 'Biology', code: '0610', color: '#84cc16' }, // lime-500
  { id: '5', name: 'Computer Science', code: '0478', color: '#8b5cf6' }, // violet-500
  { id: '6', name: 'English as a Second Language', code: '0510', color: '#f59e0b' }, // amber-500
];
