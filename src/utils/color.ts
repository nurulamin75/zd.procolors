import chroma from 'chroma-js';
export { checkAccessibility, getContrast, getTextColor, suggestAccessibleShade, type A11yScore } from './contrast';
export { generateShades, generateSemanticPalette, SHADE_Scale, type ColorToken } from './tokens';

export const isValidColor = (color: string): boolean => {
  return chroma.valid(color);
};
