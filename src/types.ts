export type Season = 'm' | 's' | 'w'; // March, June, November

export interface Subject {
  id: string;
  name: string;
  code: string;
  color: string;
  targetScore?: number;
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
  timeTaken?: number; // in minutes
}

export const DEFAULT_SUBJECTS: Subject[] = [
  { id: '1', name: 'Mathematics', code: '0580', color: '#3b82f6', targetScore: 90 },
  { id: '2', name: 'Physics', code: '0625', color: '#ef4444', targetScore: 85 },
  { id: '3', name: 'Chemistry', code: '0620', color: '#10b981', targetScore: 85 },
  { id: '4', name: 'Biology', code: '0610', color: '#84cc16', targetScore: 85 },
  { id: '5', name: 'Computer Science', code: '0478', color: '#8b5cf6', targetScore: 90 },
  { id: '6', name: 'English as a Second Language', code: '0510', color: '#f59e0b', targetScore: 80 },
];
