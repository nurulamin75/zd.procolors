import { ColorToken } from "../../../../../utils/tokens";
import chroma from 'chroma-js';

export interface MeshPoint {
  id: string;
  x: number; // 0-100 percentage
  y: number; // 0-100 percentage
  color: string;
  influence?: number; // individual influence 0-100
}

export type MirrorMode = 'none' | 'x' | 'y' | 'both';
export type EasingMode = 'smooth' | 'bouncy' | 'linear';

export const generateMeshId = () => Math.random().toString(36).substr(2, 9);

export const getRandomColorFromPalette = (palettes: Record<string, ColorToken[]>): string => {
  const families = Object.keys(palettes);
  if (families.length === 0) return '#000000';

  const randomFamily = families[Math.floor(Math.random() * families.length)];
  const tokens = palettes[randomFamily];
  if (!tokens || tokens.length === 0) return '#000000';

  // Prefer mid-range shades for better gradients
  const preferredShades = [300, 400, 500, 600];
  const filteredTokens = tokens.filter(t => preferredShades.includes(t.shade));
  const pool = filteredTokens.length > 0 ? filteredTokens : tokens;

  return pool[Math.floor(Math.random() * pool.length)].value;
};

export const generateInitialMesh = (palettes: Record<string, ColorToken[]>, density: number = 3): MeshPoint[] => {
  const points: MeshPoint[] = [];

  if (density < 2) density = 2; // Min 2x2

  // Generate a grid of points
  for (let row = 0; row < density; row++) {
    for (let col = 0; col < density; col++) {
      const x = (col / (density - 1)) * 100;
      const y = (row / (density - 1)) * 100;

      points.push({
        id: generateMeshId(),
        x,
        y,
        color: getRandomColorFromPalette(palettes),
        influence: 50
      });
    }
  }

  return points;
};

export const getHarmoniousColors = (palettes: Record<string, ColorToken[]>): string[] => {
  const families = Object.keys(palettes);
  if (families.length === 0) return ['#000000'];

  const randomFamily = families[Math.floor(Math.random() * families.length)];
  const tokens = palettes[randomFamily];
  if (!tokens || tokens.length === 0) return ['#000000'];

  const sorted = [...tokens].sort((a, b) => a.shade - b.shade);
  const subsetSize = Math.min(sorted.length, 5);
  const maxStart = Math.max(0, sorted.length - subsetSize);
  const start = Math.floor(Math.random() * (maxStart + 1));

  const subset = sorted.slice(start, start + subsetSize);
  return subset.map(t => t.value);
};

export const getHarmonyFromBase = (baseColor: string, type: 'analogous' | 'triadic' | 'split-complementary'): string[] => {
  const color = chroma(baseColor);
  switch (type) {
    case 'analogous':
      return [
        color.set('hsl.h', '-30').hex(),
        baseColor,
        color.set('hsl.h', '+30').hex()
      ];
    case 'triadic':
      return [
        color.set('hsl.h', '-120').hex(),
        baseColor,
        color.set('hsl.h', '+120').hex()
      ];
    case 'split-complementary':
      return [
        baseColor,
        color.set('hsl.h', '+150').hex(),
        color.set('hsl.h', '+210').hex()
      ];
    default:
      return [baseColor];
  }
};

export const generateSVGGradient = (
  points: MeshPoint[],
  globalInfluence: number = 50,
  vignette: number = 0
): string => {
  const genGradients = (pts: MeshPoint[]) => pts.map(p => {
    const x = p.x;
    const y = p.y;
    const stopValue = p.influence !== undefined ? p.influence : globalInfluence;
    const stop = Math.max(5, Math.min(100, stopValue));
    return `radial-gradient(at ${x}% ${y}%, ${p.color} 0px, transparent ${stop}%)`;
  });

  const gradients = genGradients(points);
  if (vignette > 0) {
    const vOpacity = (vignette / 100) * 0.5;
    gradients.push(`radial-gradient(circle, transparent 20%, rgba(0,0,0,${vOpacity}) 100%)`);
  }

  return gradients.reverse().join(', ');
};

export const getTextureFilter = (type: string, opacity: number) => {
  const op = opacity / 100;
  switch (type) {
    case 'fiber':
      return `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='fiber'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.01 0.5' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3CfeComponentTransfer%3E%3CfeFuncR type='linear' slope='2' intercept='-0.5'/%3E%3C/feComponentTransfer%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23fiber)' opacity='${op}'/%3E%3C/svg%3E")`;
    case 'paper':
      return `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='paper'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.04' numOctaves='5' stitchTiles='stitch'/%3E%3CfeDiffuseLighting lighting-color='white' surfaceScale='2'%3E%3CfeDistantLight azimuth='45' elevation='60'/%3E%3C/feDiffuseLighting%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23paper)' opacity='${op}'/%3E%3C/svg%3E")`;
    case 'film':
      return `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='film'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='1' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23film)' opacity='${op}'/%3E%3C/svg%3E")`;
    case 'canvas':
      return `url("data:image/svg+xml,%3Csvg viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='20' height='20' fill='white'/%3E%3Cpath d='M0 0h20v20H0z' fill='none'/%3E%3Cpath d='M0 10h20M10 0v20' stroke='black' stroke-opacity='${op / 5}' stroke-width='0.5'/%3E%3C/svg%3E")`;
    default:
      return `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='${op}'/%3E%3C/svg%3E")`;
  }
};

export const mirrorPoints = (points: MeshPoint[], mode: MirrorMode, sourceId: string): MeshPoint[] => {
  const source = points.find(p => p.id === sourceId);
  if (!source || mode === 'none') return points;

  return points.map(p => {
    if (p.id === sourceId) return p;

    // Logic: find points that are symmetrically opposite to the source
    // This is complex for arbitrary grids, so we'll do a simple distance-based "partner" update
    // if points are roughly at mirrored positions.
    const isMirroredX = Math.abs((100 - source.x) - p.x) < 5 && Math.abs(source.y - p.y) < 5;
    const isMirroredY = Math.abs(source.x - p.x) < 5 && Math.abs((100 - source.y) - p.y) < 5;
    const isMirroredBoth = Math.abs((100 - source.x) - p.x) < 5 && Math.abs((100 - source.y) - p.y) < 5;

    if ((mode === 'x' || mode === 'both') && isMirroredX) {
      return { ...p, color: source.color };
    }
    if ((mode === 'y' || mode === 'both') && isMirroredY) {
      return { ...p, color: source.color };
    }
    if (mode === 'both' && isMirroredBoth) {
      return { ...p, color: source.color };
    }

    return p;
  });
};

export const scalePoints = (points: MeshPoint[], scale: number): MeshPoint[] => {
  // scale is 0.5 to 1.5
  return points.map(p => {
    const dx = p.x - 50;
    const dy = p.y - 50;
    return {
      ...p,
      x: Math.max(0, Math.min(100, 50 + dx * scale)),
      y: Math.max(0, Math.min(100, 50 + dy * scale))
    };
  });
};

export const generateCSSElement = (points: MeshPoint[]): React.CSSProperties => {
  return {
    background: '#ffffff',
    backgroundImage: generateSVGGradient(points),
  };
};

export const adjustMeshGlobal = (points: MeshPoint[], hue: number, saturation: number, lightness: number): MeshPoint[] => {
  return points.map(p => {
    let color = chroma(p.color);

    if (hue !== 0) {
      color = color.set('hsl.h', '+' + hue);
    }

    if (saturation !== 100) {
      const satFactor = saturation / 100;
      const currentS = color.get('hsl.s');
      color = color.set('hsl.s', currentS * satFactor);
    }

    if (lightness !== 100) {
      const lightFactor = lightness / 100;
      const currentL = color.get('hsl.l');
      color = color.set('hsl.l', currentL * lightFactor);
    }

    return {
      ...p,
      color: color.hex()
    };
  });
};
