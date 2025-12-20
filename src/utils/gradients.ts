import chroma from 'chroma-js';

export interface Gradient {
  name: string;
  css: string;
  type: 'linear' | 'radial' | 'conic';
  stops: string[];
}

export const generateGradients = (colors: string[]): Gradient[] => {
  if (colors.length < 2) return [];
  
  const primary = colors[0];
  const secondary = colors[1] || chroma(primary).brighten().hex();
  const accent = colors[2] || chroma(secondary).darken().hex();
  
  return [
    {
      name: 'Soft Linear',
      css: `linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)`,
      type: 'linear',
      stops: [primary, secondary]
    },
    {
      name: 'Vibrant Radial',
      css: `radial-gradient(circle at center, ${secondary} 0%, ${primary} 100%)`,
      type: 'radial',
      stops: [secondary, primary]
    },
    {
      name: 'Conic Spin',
      css: `conic-gradient(from 180deg at 50% 50%, ${primary} 0deg, ${accent} 120deg, ${secondary} 240deg, ${primary} 360deg)`,
      type: 'conic',
      stops: [primary, accent, secondary, primary]
    }
  ];
};

