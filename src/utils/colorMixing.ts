import chroma from 'chroma-js';

// ============================================
// OKLAB Color Space Utilities
// ============================================

export interface OKLABColor {
  L: number;  // Lightness (0-1)
  a: number;  // Green-red (-0.4 to 0.4)
  b: number;  // Blue-yellow (-0.4 to 0.4)
}

export interface RGBColor {
  r: number;
  g: number;
  b: number;
}

// Convert sRGB to linear RGB
function srgbToLinear(c: number): number {
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

// Convert linear RGB to sRGB
function linearToSrgb(c: number): number {
  return c <= 0.0031308 ? c * 12.92 : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
}

// Convert hex to OKLAB
export function hexToOklab(hex: string): OKLABColor {
  const rgb = chroma(hex).rgb();
  const r = srgbToLinear(rgb[0] / 255);
  const g = srgbToLinear(rgb[1] / 255);
  const b = srgbToLinear(rgb[2] / 255);

  const l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b;
  const m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b;
  const s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b;

  const l_ = Math.cbrt(l);
  const m_ = Math.cbrt(m);
  const s_ = Math.cbrt(s);

  return {
    L: 0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_,
    a: 1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_,
    b: 0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_,
  };
}

// Convert OKLAB to hex
export function oklabToHex(oklab: OKLABColor): string {
  const l_ = oklab.L + 0.3963377774 * oklab.a + 0.2158037573 * oklab.b;
  const m_ = oklab.L - 0.1055613458 * oklab.a - 0.0638541728 * oklab.b;
  const s_ = oklab.L - 0.0894841775 * oklab.a - 1.2914855480 * oklab.b;

  const l = l_ * l_ * l_;
  const m = m_ * m_ * m_;
  const s = s_ * s_ * s_;

  const r = +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  const g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  const b = -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s;

  const rSrgb = Math.round(Math.max(0, Math.min(1, linearToSrgb(r))) * 255);
  const gSrgb = Math.round(Math.max(0, Math.min(1, linearToSrgb(g))) * 255);
  const bSrgb = Math.round(Math.max(0, Math.min(1, linearToSrgb(b))) * 255);

  return chroma(rSrgb, gSrgb, bSrgb).hex();
}

// ============================================
// Perceptual Color Mixing (OKLAB)
// ============================================

export type BlendMode = 'normal' | 'multiply' | 'screen' | 'overlay' | 'soft-light';

export function mixColorsOklab(color1: string, color2: string, ratio: number = 0.5): string {
  const oklab1 = hexToOklab(color1);
  const oklab2 = hexToOklab(color2);

  const mixed: OKLABColor = {
    L: oklab1.L * (1 - ratio) + oklab2.L * ratio,
    a: oklab1.a * (1 - ratio) + oklab2.a * ratio,
    b: oklab1.b * (1 - ratio) + oklab2.b * ratio,
  };

  return oklabToHex(mixed);
}

export function mixMultipleColorsOklab(colors: string[], weights?: number[]): string {
  if (colors.length === 0) return '#000000';
  if (colors.length === 1) return colors[0];

  const normalizedWeights = weights 
    ? weights.map(w => w / weights.reduce((a, b) => a + b, 0))
    : colors.map(() => 1 / colors.length);

  const oklabColors = colors.map(hexToOklab);
  
  const mixed: OKLABColor = {
    L: oklabColors.reduce((sum, c, i) => sum + c.L * normalizedWeights[i], 0),
    a: oklabColors.reduce((sum, c, i) => sum + c.a * normalizedWeights[i], 0),
    b: oklabColors.reduce((sum, c, i) => sum + c.b * normalizedWeights[i], 0),
  };

  return oklabToHex(mixed);
}

export function blendColorsOklab(base: string, blend: string, mode: BlendMode, opacity: number = 1): string {
  const baseOklab = hexToOklab(base);
  const blendOklab = hexToOklab(blend);
  
  let result: OKLABColor;

  switch (mode) {
    case 'multiply':
      result = {
        L: baseOklab.L * blendOklab.L,
        a: (baseOklab.a + blendOklab.a) / 2,
        b: (baseOklab.b + blendOklab.b) / 2,
      };
      break;
    case 'screen':
      result = {
        L: 1 - (1 - baseOklab.L) * (1 - blendOklab.L),
        a: (baseOklab.a + blendOklab.a) / 2,
        b: (baseOklab.b + blendOklab.b) / 2,
      };
      break;
    case 'overlay':
      result = {
        L: baseOklab.L < 0.5 
          ? 2 * baseOklab.L * blendOklab.L 
          : 1 - 2 * (1 - baseOklab.L) * (1 - blendOklab.L),
        a: (baseOklab.a + blendOklab.a) / 2,
        b: (baseOklab.b + blendOklab.b) / 2,
      };
      break;
    case 'soft-light':
      result = {
        L: blendOklab.L < 0.5
          ? baseOklab.L - (1 - 2 * blendOklab.L) * baseOklab.L * (1 - baseOklab.L)
          : baseOklab.L + (2 * blendOklab.L - 1) * (Math.sqrt(baseOklab.L) - baseOklab.L),
        a: (baseOklab.a + blendOklab.a) / 2,
        b: (baseOklab.b + blendOklab.b) / 2,
      };
      break;
    default:
      result = blendOklab;
  }

  // Apply opacity
  const final: OKLABColor = {
    L: baseOklab.L * (1 - opacity) + result.L * opacity,
    a: baseOklab.a * (1 - opacity) + result.a * opacity,
    b: baseOklab.b * (1 - opacity) + result.b * opacity,
  };

  return oklabToHex(final);
}

// ============================================
// Color Interpolation
// ============================================

export type ColorSpace = 'rgb' | 'hsl' | 'lab' | 'lch' | 'oklab' | 'hcl';

export interface InterpolationOptions {
  steps: number;
  colorSpace: ColorSpace;
  easing?: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';
}

// Easing functions
const easings = {
  'linear': (t: number) => t,
  'ease-in': (t: number) => t * t,
  'ease-out': (t: number) => t * (2 - t),
  'ease-in-out': (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
};

export function interpolateColors(
  colors: string[], 
  options: InterpolationOptions
): string[] {
  const { steps, colorSpace, easing = 'linear' } = options;
  
  if (colors.length < 2) return colors;
  if (steps < 2) return [colors[0]];

  const result: string[] = [];
  const easingFn = easings[easing];

  // Use OKLAB for perceptually uniform interpolation if selected
  if (colorSpace === 'oklab') {
    for (let i = 0; i < steps; i++) {
      const t = easingFn(i / (steps - 1));
      const totalSegments = colors.length - 1;
      const segmentIndex = Math.min(Math.floor(t * totalSegments), totalSegments - 1);
      const localT = (t * totalSegments) - segmentIndex;
      
      const color = mixColorsOklab(colors[segmentIndex], colors[segmentIndex + 1], localT);
      result.push(color);
    }
    return result;
  }

  // Use chroma-js for other color spaces
  const scale = chroma.scale(colors).mode(colorSpace as any);
  
  for (let i = 0; i < steps; i++) {
    const t = easingFn(i / (steps - 1));
    result.push(scale(t).hex());
  }

  return result;
}

export function interpolateBetweenTwo(
  color1: string, 
  color2: string, 
  steps: number, 
  colorSpace: ColorSpace = 'oklab'
): string[] {
  return interpolateColors([color1, color2], { steps, colorSpace });
}

// ============================================
// Color Ramp Generation
// ============================================

export interface ColorRampOptions {
  baseColor: string;
  steps: number;
  lightnessRange?: [number, number]; // 0-100
  saturationShift?: number; // -100 to 100
  hueShift?: number; // degrees to shift across ramp
  colorSpace?: ColorSpace;
}

export function generateColorRamp(options: ColorRampOptions): string[] {
  const {
    baseColor,
    steps,
    lightnessRange = [10, 95],
    saturationShift = 0,
    hueShift = 0,
    colorSpace = 'oklab',
  } = options;

  const baseHsl = chroma(baseColor).hsl();
  const [baseHue, baseSat] = baseHsl;
  
  const ramp: string[] = [];
  
  for (let i = 0; i < steps; i++) {
    const t = i / (steps - 1);
    const lightness = lightnessRange[0] + (lightnessRange[1] - lightnessRange[0]) * t;
    const hue = (baseHue + hueShift * (t - 0.5)) % 360;
    const saturation = Math.max(0, Math.min(1, baseSat + (saturationShift / 100) * (0.5 - Math.abs(t - 0.5))));
    
    ramp.push(chroma.hsl(hue, saturation, lightness / 100).hex());
  }

  // If using oklab, re-interpolate for perceptual uniformity
  if (colorSpace === 'oklab') {
    const endpoints = [ramp[0], ramp[ramp.length - 1]];
    return interpolateColors(endpoints, { steps, colorSpace: 'oklab' });
  }

  return ramp;
}

export function generateDataVizRamp(
  startColor: string, 
  endColor: string, 
  steps: number,
  diverging: boolean = false,
  midColor?: string
): string[] {
  if (diverging && midColor) {
    const halfSteps = Math.ceil(steps / 2);
    const firstHalf = interpolateColors([startColor, midColor], { steps: halfSteps, colorSpace: 'oklab' });
    const secondHalf = interpolateColors([midColor, endColor], { steps: halfSteps, colorSpace: 'oklab' });
    // Remove duplicate middle color
    return [...firstHalf.slice(0, -1), ...secondHalf];
  }
  
  return interpolateColors([startColor, endColor], { steps, colorSpace: 'oklab' });
}

export interface SequentialRampPreset {
  name: string;
  colors: string[];
}

export const SEQUENTIAL_PRESETS: SequentialRampPreset[] = [
  { name: 'Blues', colors: ['#f7fbff', '#08306b'] },
  { name: 'Greens', colors: ['#f7fcf5', '#00441b'] },
  { name: 'Oranges', colors: ['#fff5eb', '#7f2704'] },
  { name: 'Purples', colors: ['#fcfbfd', '#3f007d'] },
  { name: 'Reds', colors: ['#fff5f0', '#67000d'] },
  { name: 'Viridis', colors: ['#440154', '#21918c', '#fde725'] },
  { name: 'Plasma', colors: ['#0d0887', '#cc4778', '#f0f921'] },
  { name: 'Inferno', colors: ['#000004', '#bc3754', '#fcffa4'] },
  { name: 'Magma', colors: ['#000004', '#b63679', '#fcfdbf'] },
  { name: 'Warm', colors: ['#fff7ec', '#fc8d59', '#7f0000'] },
  { name: 'Cool', colors: ['#f7fcf0', '#41b6c4', '#081d58'] },
];

export const DIVERGING_PRESETS: SequentialRampPreset[] = [
  { name: 'Red-Blue', colors: ['#b2182b', '#f7f7f7', '#2166ac'] },
  { name: 'Brown-Teal', colors: ['#8c510a', '#f5f5f5', '#01665e'] },
  { name: 'Purple-Green', colors: ['#7b3294', '#f7f7f7', '#008837'] },
  { name: 'Orange-Purple', colors: ['#e66101', '#f7f7f7', '#5e3c99'] },
  { name: 'Pink-Green', colors: ['#d01c8b', '#f7f7f7', '#4dac26'] },
];

// ============================================
// Duotone Generation
// ============================================

export interface DuotoneResult {
  id: string;
  name: string;
  darkColor: string;
  lightColor: string;
  gradient: string;
  cssFilter: string;
}

export function generateDuotone(darkColor: string, lightColor: string, name?: string): DuotoneResult {
  const id = `duotone-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  // Generate CSS gradient
  const gradient = `linear-gradient(135deg, ${darkColor} 0%, ${lightColor} 100%)`;
  
  // Generate SVG filter approximation as CSS
  // This creates a duotone effect using CSS filters
  const darkRgb = chroma(darkColor).rgb();
  const lightRgb = chroma(lightColor).rgb();
  
  // Calculate color matrix values for duotone effect
  const cssFilter = generateDuotoneFilter(darkRgb, lightRgb);

  return {
    id,
    name: name || `${chroma(darkColor).name()} - ${chroma(lightColor).name()}`,
    darkColor,
    lightColor,
    gradient,
    cssFilter,
  };
}

function generateDuotoneFilter(dark: number[], light: number[]): string {
  // Normalize RGB values
  const dr = dark[0] / 255;
  const dg = dark[1] / 255;
  const db = dark[2] / 255;
  const lr = light[0] / 255;
  const lg = light[1] / 255;
  const lb = light[2] / 255;

  // Create CSS filter approximation
  // This uses grayscale + sepia + hue-rotate + saturate to approximate duotone
  const avgDark = (dr + dg + db) / 3;
  const avgLight = (lr + lg + lb) / 3;
  const contrast = (avgLight - avgDark) * 100 + 100;
  const brightness = avgDark * 100 + 50;
  
  // Calculate hue rotation based on dominant color
  const hue = chroma.mix(dark as any, light as any, 0.5).get('hsl.h') || 0;
  const saturation = chroma.mix(dark as any, light as any, 0.5).get('hsl.s') * 200 || 100;

  return `grayscale(100%) sepia(100%) hue-rotate(${Math.round(hue)}deg) saturate(${Math.round(saturation)}%) contrast(${Math.round(contrast)}%) brightness(${Math.round(brightness)}%)`;
}

export function generateDuotonePalette(baseColors: string[]): DuotoneResult[] {
  const results: DuotoneResult[] = [];
  
  // Generate combinations from base colors
  for (let i = 0; i < baseColors.length; i++) {
    for (let j = i + 1; j < baseColors.length; j++) {
      const color1 = baseColors[i];
      const color2 = baseColors[j];
      
      // Determine which is darker
      const lum1 = chroma(color1).luminance();
      const lum2 = chroma(color2).luminance();
      
      const [dark, light] = lum1 < lum2 ? [color1, color2] : [color2, color1];
      
      results.push(generateDuotone(dark, light));
    }
  }
  
  return results;
}

export const DUOTONE_PRESETS: { name: string; dark: string; light: string }[] = [
  { name: 'Midnight Blue', dark: '#0a192f', light: '#64ffda' },
  { name: 'Sunset', dark: '#1a1a2e', light: '#f9d423' },
  { name: 'Berry', dark: '#2d132c', light: '#ee4c7c' },
  { name: 'Ocean', dark: '#0f2027', light: '#2c5364' },
  { name: 'Forest', dark: '#134e5e', light: '#71b280' },
  { name: 'Lavender', dark: '#2c3e50', light: '#9b59b6' },
  { name: 'Coral', dark: '#16222a', light: '#ff6b6b' },
  { name: 'Mint', dark: '#0f3443', light: '#34e89e' },
  { name: 'Amber', dark: '#3c1810', light: '#ffb347' },
  { name: 'Indigo', dark: '#1a1a40', light: '#4f46e5' },
  { name: 'Rose', dark: '#2d1f3d', light: '#f472b6' },
  { name: 'Teal', dark: '#0d3b3e', light: '#14b8a6' },
];

// Apply duotone effect to an image (returns SVG filter definition)
export function getDuotoneSvgFilter(darkColor: string, lightColor: string, filterId: string): string {
  const darkRgb = chroma(darkColor).rgb().map(v => v / 255);
  const lightRgb = chroma(lightColor).rgb().map(v => v / 255);

  return `
    <svg style="display:none">
      <defs>
        <filter id="${filterId}" color-interpolation-filters="sRGB">
          <feColorMatrix type="matrix" values="
            0.33 0.33 0.33 0 0
            0.33 0.33 0.33 0 0
            0.33 0.33 0.33 0 0
            0    0    0    1 0
          "/>
          <feComponentTransfer>
            <feFuncR type="table" tableValues="${darkRgb[0]} ${lightRgb[0]}"/>
            <feFuncG type="table" tableValues="${darkRgb[1]} ${lightRgb[1]}"/>
            <feFuncB type="table" tableValues="${darkRgb[2]} ${lightRgb[2]}"/>
          </feComponentTransfer>
        </filter>
      </defs>
    </svg>
  `;
}
