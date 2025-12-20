import chroma from 'chroma-js';
import { ColorToken } from '../../../../../utils/tokens';
import { getAccessibleTextColor, getContrast } from './calculateContrast';

export interface SystemScore {
  grade: string;
  gradeColor: string;
  summary: string;
  avgContrast: number;
  aaPassPercentage: number;
  aaaPassPercentage: number;
  totalTested: number;
  failedCount: number;
}

export const evaluateSystem = (palettes: Record<string, ColorToken[]>): SystemScore => {
  let totalContrast = 0;
  let aaPassCount = 0;
  let aaaPassCount = 0;
  let totalTested = 0;
  let failedCount = 0;

  Object.values(palettes).forEach((tokens) => {
    tokens.forEach((t) => {
      // Test against its optimal text color (white or black)
      const textColor = getAccessibleTextColor(t.value);
      const ratio = getContrast(textColor, t.value);
      
      totalContrast += ratio;
      totalTested++;

      if (ratio >= 7) aaaPassCount++;
      if (ratio >= 4.5) aaPassCount++;
      if (ratio < 3) failedCount++;
    });
  });

  const avgContrast = totalTested > 0 ? totalContrast / totalTested : 0;
  const aaPassPercentage = totalTested > 0 ? Math.round((aaPassCount / totalTested) * 100) : 0;
  const aaaPassPercentage = totalTested > 0 ? Math.round((aaaPassCount / totalTested) * 100) : 0;

  let grade = 'F';
  let gradeColor = '#ef4444';
  let summary = 'Poor readability across the system.';

  if (avgContrast > 10 && failedCount === 0) {
    grade = 'A+';
    gradeColor = '#22c55e';
    summary = 'Excellent readability and consistency.';
  } else if (avgContrast > 8 && aaPassPercentage > 90) {
    grade = 'A';
    gradeColor = '#22c55e';
    summary = 'Great contrast and accessibility coverage.';
  } else if (avgContrast > 6 && aaPassPercentage > 80) {
    grade = 'B';
    gradeColor = '#3b82f6';
    summary = 'Good overall, but some shades need attention.';
  } else if (avgContrast > 4.5) {
    grade = 'C';
    gradeColor = '#f59e0b'; // Orange
    summary = 'Passable, but many colors fail standard text contrast.';
  } else if (avgContrast > 3) {
    grade = 'D';
    gradeColor = '#f97316'; // Orange-Red
    summary = 'Significant accessibility issues detected.';
  }

  return {
    grade,
    gradeColor,
    summary,
    avgContrast: parseFloat(avgContrast.toFixed(1)),
    aaPassPercentage,
    aaaPassPercentage,
    totalTested,
    failedCount
  };
};

