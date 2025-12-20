import chroma from 'chroma-js';

export const getAnalogous = (base: string): string[] => {
  if (!chroma.valid(base)) return [];
  const baseColor = chroma(base);
  return [
    baseColor.set('hsl.h', baseColor.get('hsl.h') - 30).hex(),
    base,
    baseColor.set('hsl.h', baseColor.get('hsl.h') + 30).hex(),
  ];
};

export const getMonochromatic = (base: string): string[] => {
  if (!chroma.valid(base)) return [];
  return chroma.scale([base, '#fff']).mode('lab').colors(6).slice(0, 5);
};

export const getComplementary = (base: string): string[] => {
  if (!chroma.valid(base)) return [];
  const baseColor = chroma(base);
  return [
    base,
    baseColor.set('hsl.h', baseColor.get('hsl.h') + 180).hex(),
  ];
};

export const getSplitComplementary = (base: string): string[] => {
  if (!chroma.valid(base)) return [];
  const baseColor = chroma(base);
  return [
    base,
    baseColor.set('hsl.h', baseColor.get('hsl.h') + 150).hex(),
    baseColor.set('hsl.h', baseColor.get('hsl.h') + 210).hex(),
  ];
};

export const getTriadic = (base: string): string[] => {
  if (!chroma.valid(base)) return [];
  const baseColor = chroma(base);
  return [
    base,
    baseColor.set('hsl.h', baseColor.get('hsl.h') + 120).hex(),
    baseColor.set('hsl.h', baseColor.get('hsl.h') + 240).hex(),
  ];
};

export const getTetradic = (base: string): string[] => {
  if (!chroma.valid(base)) return [];
  const baseColor = chroma(base);
  return [
    base,
    baseColor.set('hsl.h', baseColor.get('hsl.h') + 90).hex(),
    baseColor.set('hsl.h', baseColor.get('hsl.h') + 180).hex(),
    baseColor.set('hsl.h', baseColor.get('hsl.h') + 270).hex(),
  ];
};

export const getSquare = (base: string): string[] => {
  if (!chroma.valid(base)) return [];
  const baseColor = chroma(base);
  return [
    base,
    baseColor.set('hsl.h', baseColor.get('hsl.h') + 90).hex(),
    baseColor.set('hsl.h', baseColor.get('hsl.h') + 180).hex(),
    baseColor.set('hsl.h', baseColor.get('hsl.h') + 270).hex(),
  ];
};

export const getShadesTintsTones = (base: string): string[] => {
  if (!chroma.valid(base)) return [];
  const shades = chroma.scale(['black', base]).mode('lab').colors(4);
  const tints = chroma.scale([base, 'white']).mode('lab').colors(4);
  // Remove duplicates (base color)
  return [...new Set([...shades, ...tints])];
};

