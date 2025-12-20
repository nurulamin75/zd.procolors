import chroma from 'chroma-js';

export const getContrast = (fg: string, bg: string): number => {
  return chroma.contrast(fg, bg);
};

export interface A11yScore {
  aa: boolean;
  aaa: boolean;
  aaLarge: boolean;
  aaaLarge: boolean;
  score: number;
}

export const checkAccessibility = (fg: string, bg: string): A11yScore => {
  const score = chroma.contrast(fg, bg);
  return {
    score: parseFloat(score.toFixed(2)),
    aa: score >= 4.5,
    aaa: score >= 7,
    aaLarge: score >= 3,
    aaaLarge: score >= 4.5
  };
};

export const getTextColor = (bgColor: string): string => {
  const whiteContrast = chroma.contrast(bgColor, '#ffffff');
  const blackContrast = chroma.contrast(bgColor, '#000000');
  return whiteContrast > blackContrast ? '#ffffff' : '#000000';
};

export const suggestAccessibleShade = (base: string, bg: string, ratio = 4.5): string | null => {
    // Try darkening or lightening the base color until it meets ratio
    let color = chroma(base);
    if (chroma.contrast(color, bg) >= ratio) return color.hex();

    // Try darkening
    let darker = color;
    for (let i = 0; i < 20; i++) {
        darker = darker.darken(0.1);
        if (chroma.contrast(darker, bg) >= ratio) return darker.hex();
    }

    // Try lightening
    let lighter = color;
    for (let i = 0; i < 20; i++) {
        lighter = lighter.brighten(0.1);
        if (chroma.contrast(lighter, bg) >= ratio) return lighter.hex();
    }

    return null; // Could not find
}

