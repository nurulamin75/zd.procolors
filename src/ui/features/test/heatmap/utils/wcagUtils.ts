import chroma from 'chroma-js';

export const suggestFix = (hex: string, target: 'AA' | 'AAA' = 'AA'): string | null => {
  const bg = hex;
  const text = chroma.contrast(bg, '#ffffff') > chroma.contrast(bg, '#000000') ? '#ffffff' : '#000000';
  const ratio = target === 'AA' ? 4.5 : 7;

  // If already passes
  if (chroma.contrast(text, bg) >= ratio) return bg;

  // Try to shift brightness
  let fixed = chroma(bg);
  let step = 0.01;
  let maxSteps = 100; // Prevent infinite loop

  // Determine direction: need more contrast against text
  // If text is white, bg needs to be darker
  // If text is black, bg needs to be lighter
  const isDarkText = text === '#000000';

  for (let i = 0; i < maxSteps; i++) {
    if (isDarkText) {
      fixed = fixed.brighten(step);
    } else {
      fixed = fixed.darken(step);
    }
    
    if (chroma.contrast(text, fixed) >= ratio) {
      return fixed.hex();
    }
  }

  return null; // Failed to find close match
};

