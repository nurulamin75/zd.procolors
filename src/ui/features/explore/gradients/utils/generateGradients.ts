import chroma from 'chroma-js';
import { GradientData } from './gradientUtils';
import { ColorToken } from '../../../../../utils/tokens';

export const generateGradients = (
  palettes: Record<string, ColorToken[]>, 
  options: { intensity: number } = { intensity: 100 }
): GradientData[] => {
  const gradients: GradientData[] = [];
  
  // Helper to get a color value
  const c = (name: string, shade: number = 500) => {
    if (!palettes || !palettes[name]) return '#cccccc';
    const token = palettes[name].find(t => t.shade === shade);
    return token ? token.value : '#cccccc';
  };

  // Safe chroma wrapper
  const safeChroma = (color: string) => {
      try {
          return chroma(color);
      } catch (e) {
          console.warn("Invalid color:", color);
          // Return a mock object to prevent crashes if chroma fails
          return {
              alpha: () => ({ hex: () => '#cccccc' }),
              darken: () => ({ hex: () => '#cccccc' }),
              brighten: () => ({ hex: () => '#cccccc' }),
              blacken: () => ({ hex: () => '#cccccc' }),
              hex: () => '#cccccc'
          } as any;
      }
  };

  const primary = c('primary');
  const secondary = c('secondary');
  const success = c('success');
  const error = c('error');
  const info = c('info');
  const warning = c('warning');
  const neutral100 = c('neutral', 100);
  const neutral900 = c('neutral', 900);

  // 1. Linear Gradients
  gradients.push({
    id: 'linear-primary-fade',
    name: 'Primary Fade',
    type: 'linear',
    angle: 180,
    stops: [
      { color: primary, position: 0 },
      { color: safeChroma(primary).alpha(0.2).hex(), position: 100 }
    ]
  });

  gradients.push({
    id: 'linear-oceanic',
    name: 'Oceanic Flow',
    type: 'linear',
    angle: 135,
    stops: [
      { color: info, position: 0 },
      { color: primary, position: 100 }
    ]
  });

  gradients.push({
    id: 'linear-sunset',
    name: 'Warm Sunset',
    type: 'linear',
    angle: 90,
    stops: [
      { color: warning, position: 0 },
      { color: error, position: 100 }
    ]
  });
  
  gradients.push({
    id: 'linear-brand-accent',
    name: 'Brand Accent',
    type: 'linear',
    angle: 45,
    stops: [
      { color: primary, position: 0 },
      { color: secondary, position: 100 }
    ]
  });

  gradients.push({
    id: 'linear-soft-neutral',
    name: 'Soft Neutral',
    type: 'linear',
    angle: 180,
    stops: [
        { color: neutral100, position: 0 },
        { color: safeChroma(neutral100).darken(0.1).hex(), position: 100 }
    ]
  });

  // 2. Radial Gradients
  gradients.push({
    id: 'radial-center-glow',
    name: 'Center Glow',
    type: 'radial',
    position: 'center',
    stops: [
      { color: safeChroma(primary).brighten(1).hex(), position: 0 },
      { color: primary, position: 100 }
    ]
  });

  gradients.push({
    id: 'radial-soft-bloom',
    name: 'Soft Bloom',
    type: 'radial',
    position: 'center',
    stops: [
        { color: safeChroma(secondary).alpha(0.5).hex(), position: 0 },
        { color: 'transparent', position: 70 }
    ]
  });

  gradients.push({
    id: 'radial-corner',
    name: 'Corner Spotlight',
    type: 'radial',
    position: 'top left',
    stops: [
        { color: safeChroma(info).brighten(0.5).hex(), position: 0 },
        { color: 'transparent', position: 60 }
    ]
  });

  // 3. Conic Gradients
  gradients.push({
    id: 'conic-spectrum',
    name: 'Brand Spectrum',
    type: 'conic',
    angle: 0,
    stops: [
      { color: primary, position: 0 },
      { color: secondary, position: 33 },
      { color: info, position: 66 },
      { color: primary, position: 100 }
    ]
  });
  
   gradients.push({
    id: 'conic-status',
    name: 'Status Wheel',
    type: 'conic',
    angle: 0,
    stops: [
      { color: success, position: 0 },
      { color: warning, position: 120 },
      { color: error, position: 240 },
      { color: success, position: 360 } // Conic usually uses degrees in CSS if supported, or % stops. We use % here for consistency in data structure, handled in css gen.
      // Note: CSS conic-gradient uses degrees or percentage. gradientUtils needs to handle if stops are > 100? or assume 0-100 range maps to 0-360.
      // Let's assume standard 0-100% mapping in utils for now.
    ]
  });


  // 4. UI Friendly
  gradients.push({
      id: 'ui-primary-neutral',
      name: 'Subtle Header',
      type: 'linear',
      angle: 180,
      stops: [
          { color: 'white', position: 0 },
          { color: neutral100, position: 100 }
      ]
  });

   gradients.push({
      id: 'ui-dark-mode',
      name: 'Deep Night',
      type: 'linear',
      angle: 160,
      stops: [
          { color: neutral900, position: 0 },
          { color: safeChroma(neutral900).darken(0.5).hex(), position: 100 }
      ]
  });


  return gradients;
};

