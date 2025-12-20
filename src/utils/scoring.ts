import chroma from 'chroma-js';

export const calculateColorScore = (palettes: any): { score: string; summary: string; details: any } => {
  // Mock score logic based on palette structure
  // In a real app, we'd analyze contrast variance, hue distribution, etc.
  
  let totalContrast = 0;
  let count = 0;
  
  Object.values(palettes).forEach((tokens: any) => {
    tokens.forEach((t: any) => {
      // Compare with white and black
      const cW = chroma.contrast(t.value, 'white');
      const cB = chroma.contrast(t.value, 'black');
      totalContrast += Math.max(cW, cB);
      count++;
    });
  });
  
  const avgContrast = count > 0 ? totalContrast / count : 0;
  
  let score = 'B';
  let summary = 'Balanced system';
  
  if (avgContrast > 10) {
    score = 'A+';
    summary = 'Excellent readability and contrast range.';
  } else if (avgContrast > 8) {
    score = 'A';
    summary = 'Great contrast.';
  } else if (avgContrast > 6) {
    score = 'B';
    summary = 'Good balance.';
  } else {
    score = 'C';
    summary = 'Some colors may lack contrast.';
  }
  
  return {
    score,
    summary,
    details: { avgContrast }
  };
};

