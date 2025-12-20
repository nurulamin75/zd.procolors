import chroma from 'chroma-js';

export const getContrast = (fg: string, bg: string): number => {
  return chroma.contrast(fg, bg);
};

export const getAccessibleTextColor = (bgColor: string): string => {
  const whiteContrast = chroma.contrast(bgColor, '#ffffff');
  const blackContrast = chroma.contrast(bgColor, '#000000');
  return whiteContrast > blackContrast ? '#ffffff' : '#000000';
};

export const getRating = (contrast: number): { label: string; color: string; passAA: boolean; passAAA: boolean } => {
  if (contrast >= 7) return { label: 'AAA', color: '#22c55e', passAA: true, passAAA: true };
  if (contrast >= 4.5) return { label: 'AA', color: '#3b82f6', passAA: true, passAAA: false };
  if (contrast >= 3) return { label: 'AA Large', color: '#eab308', passAA: false, passAAA: false };
  return { label: 'Fail', color: '#ef4444', passAA: false, passAAA: false };
};

