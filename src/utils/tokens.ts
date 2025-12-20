import chroma from 'chroma-js';

export interface ColorToken {
  name: string;
  value: string; // Hex
  shade: number;
}

export const SHADE_Scale = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];

export const generateShades = (baseColor: string, name: string, scale: number[] = SHADE_Scale): ColorToken[] => {
  if (!chroma.valid(baseColor)) return [];

  const base = chroma(baseColor);
  
  // Sort scale just in case
  const sortedScale = [...scale].sort((a, b) => a - b);

  const shades: ColorToken[] = sortedScale.map((shade) => {
    let color;
    if (shade === 500) {
      color = base;
    } else if (shade < 500) {
      const factor = (500 - shade) / 500; 
      color = chroma.mix(base, 'white', factor * 0.9, 'rgb'); 
    } else {
      const factor = (shade - 500) / 500; 
      color = chroma.mix(base, 'black', factor * 0.8, 'rgb');
    }
    
    return {
      name: `${name}-${shade}`,
      value: color.hex(),
      shade: shade
    };
  });

  return shades;
};

export const generateSemanticPalette = (baseColor: string): Record<string, string> => {
  if (!chroma.valid(baseColor)) return {};
  
  const base = chroma(baseColor);
  const primary = base.hex();
  const secondary = base.set('hsl.h', '+30').hex(); 
  const neutral = chroma.mix(base, 'gray', 0.8).hex(); 
  
  const success = '#22c55e';
  const warning = '#eab308';
  const error = '#ef4444';
  const info = '#3b82f6';
  
  return {
    primary,
    secondary,
    neutral,
    success,
    warning,
    error,
    info
  };
};
