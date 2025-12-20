import chroma from 'chroma-js';

export const getContrast = (fg: string, bg: string): number => {
  try {
    return chroma.contrast(fg, bg);
  } catch (e) {
    return 0;
  }
};

export const getLuminance = (color: string): number => {
  try {
    return chroma(color).luminance();
  } catch (e) {
    return 0;
  }
};

export const suggestAccessibleColor = (fg: string, bg: string, targetRatio: number = 4.5): string | null => {
  try {
    const fgColor = chroma(fg);
    const bgColor = chroma(bg);
    const currentRatio = chroma.contrast(fg, bg);

    if (currentRatio >= targetRatio) return null;

    // Try darkening/brightening foreground
    let adjusted = fgColor;
    const step = 0.05;
    
    // Determine direction based on luminance
    const bgLum = bgColor.luminance();
    const fgLum = fgColor.luminance();
    const shouldLighten = fgLum > bgLum ? true : false;

    for (let i = 0; i < 20; i++) {
        if (shouldLighten) {
            adjusted = adjusted.brighten(step);
        } else {
            adjusted = adjusted.darken(step);
        }
        if (chroma.contrast(adjusted, bg) >= targetRatio) {
            return adjusted.hex();
        }
    }
    
    return null;
  } catch (e) {
    return null;
  }
};

