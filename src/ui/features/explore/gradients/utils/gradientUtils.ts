import chroma from 'chroma-js';

export interface GradientStop {
  color: string;
  position: number;
}

export interface GradientData {
  id: string;
  name: string;
  type: 'linear' | 'radial' | 'conic';
  stops: GradientStop[];
  angle?: number; // degrees for linear
  shape?: string; // circle/ellipse for radial
  position?: string; // center, top left, etc.
}

export const gradientToCSS = (gradient: GradientData): string => {
  const stopsStr = gradient.stops
    .map(s => `${s.color} ${s.position}%`)
    .join(', ');

  switch (gradient.type) {
    case 'linear':
      return `linear-gradient(${gradient.angle || 180}deg, ${stopsStr})`;
    case 'radial':
      return `radial-gradient(${gradient.shape || 'circle'} at ${gradient.position || 'center'}, ${stopsStr})`;
    case 'conic':
      return `conic-gradient(from ${gradient.angle || 0}deg at ${gradient.position || 'center'}, ${stopsStr})`;
    default:
      return '';
  }
};

export const gradientToJSON = (gradient: GradientData): string => {
  return JSON.stringify(gradient, null, 2);
};

export const gradientToTailwind = (gradient: GradientData): string => {
    // This is a simplified representation for a tailwind config extension
    // Real tailwind usually uses classes, but custom gradients go in theme.extend.backgroundImage
    const css = gradientToCSS(gradient);
    return `'${gradient.name}': '${css}'`;
};

export const copyToClipboard = (text: string) => {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  document.body.removeChild(textarea);
};

