import { Season, Subject } from './types';

export function getSeasonName(season: Season) {
  switch (season) {
    case 'm': return 'Feb/March';
    case 's': return 'May/June';
    case 'w': return 'Oct/Nov';
  }
}

export function formatPaperName(year: number, season: Season, paper: number, variant: number) {
  return `${year} ${getSeasonName(season)} Paper ${paper}${variant}`;
}

export function generateSearchLink(code: string, year: number, season: Season, paper: number, variant: number) {
  const yearShort = year.toString().slice(-2);
  const query = `IGCSE ${code} ${season}${yearShort} qp ${paper}${variant} pdf`;
  return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
}

export function calculatePercentage(score: number, maxScore: number) {
  if (maxScore === 0) return 0;
  return Math.round((score / maxScore) * 100);
}
