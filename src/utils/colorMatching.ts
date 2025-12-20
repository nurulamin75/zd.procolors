/**
 * Color Matching Utility
 * Uses DeltaE (CIEDE2000) algorithm for accurate color matching
 */

export interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface LAB {
  l: number;
  a: number;
  b: number;
}

/**
 * Convert RGB (0-1 range) to LAB color space
 */
export function rgbToLab(rgb: RGB): LAB {
  // Convert to linear RGB
  const r = rgb.r > 0.04045 ? Math.pow((rgb.r + 0.055) / 1.055, 2.4) : rgb.r / 12.92;
  const g = rgb.g > 0.04045 ? Math.pow((rgb.g + 0.055) / 1.055, 2.4) : rgb.g / 12.92;
  const b = rgb.b > 0.04045 ? Math.pow((rgb.b + 0.055) / 1.055, 2.4) : rgb.b / 12.92;

  // Convert to XYZ (using D65 illuminant)
  let x = (r * 0.4124564 + g * 0.3575761 + b * 0.1804375) / 0.95047;
  let y = (r * 0.2126729 + g * 0.7151522 + b * 0.0721750) / 1.00000;
  let z = (r * 0.0193339 + g * 0.1191920 + b * 0.9503041) / 1.08883;

  // Convert to LAB
  const fx = x > 0.008856 ? Math.pow(x, 1/3) : (7.787 * x + 16/116);
  const fy = y > 0.008856 ? Math.pow(y, 1/3) : (7.787 * y + 16/116);
  const fz = z > 0.008856 ? Math.pow(z, 1/3) : (7.787 * z + 16/116);

  return {
    l: 116 * fy - 16,
    a: 500 * (fx - fy),
    b: 200 * (fy - fz)
  };
}

/**
 * Calculate DeltaE (CIEDE2000) color difference
 * Returns a value where lower is more similar (0 = identical)
 */
export function deltaE(lab1: LAB, lab2: LAB): number {
  const L1 = lab1.l;
  const a1 = lab1.a;
  const b1 = lab1.b;
  const L2 = lab2.l;
  const a2 = lab2.a;
  const b2 = lab2.b;

  // Calculate C (chroma) and h (hue)
  const C1 = Math.sqrt(a1 * a1 + b1 * b1);
  const C2 = Math.sqrt(a2 * a2 + b2 * b2);
  const Cbar = (C1 + C2) / 2;

  const G = 0.5 * (1 - Math.sqrt(Math.pow(Cbar, 7) / (Math.pow(Cbar, 7) + Math.pow(25, 7))));
  const a1p = (1 + G) * a1;
  const a2p = (1 + G) * a2;

  const C1p = Math.sqrt(a1p * a1p + b1 * b1);
  const C2p = Math.sqrt(a2p * a2p + b2 * b2);

  const h1p = Math.atan2(b1, a1p) * 180 / Math.PI;
  const h2p = Math.atan2(b2, a2p) * 180 / Math.PI;

  const dLp = L2 - L1;
  const dCp = C2p - C1p;

  let dh = h2p - h1p;
  if (dh > 180) dh -= 360;
  else if (dh < -180) dh += 360;

  const dHp = 2 * Math.sqrt(C1p * C2p) * Math.sin(dh * Math.PI / 360);

  const Lpbar = (L1 + L2) / 2;
  const Cpbar = (C1p + C2p) / 2;

  let hpbar = (h1p + h2p) / 2;
  if (Math.abs(h1p - h2p) > 180) {
    hpbar += 180;
  }

  const T = 1 - 0.17 * Math.cos((hpbar - 30) * Math.PI / 180) +
            0.24 * Math.cos(2 * hpbar * Math.PI / 180) +
            0.32 * Math.cos((3 * hpbar + 6) * Math.PI / 180) -
            0.20 * Math.cos((4 * hpbar - 63) * Math.PI / 180);

  const dTheta = 30 * Math.exp(-Math.pow((hpbar - 275) / 25, 2));
  const RC = 2 * Math.sqrt(Math.pow(Cpbar, 7) / (Math.pow(Cpbar, 7) + Math.pow(25, 7)));

  const RT = -Math.sin(2 * dTheta * Math.PI / 180) * RC;

  const SL = 1 + (0.015 * Math.pow(Lpbar - 50, 2)) / Math.sqrt(20 + Math.pow(Lpbar - 50, 2));
  const SC = 1 + 0.045 * Cpbar;
  const SH = 1 + 0.015 * Cpbar * T;

  const kL = 1;
  const kC = 1;
  const kH = 1;

  const dE = Math.sqrt(
    Math.pow(dLp / (kL * SL), 2) +
    Math.pow(dCp / (kC * SC), 2) +
    Math.pow(dHp / (kH * SH), 2) +
    RT * (dCp / (kC * SC)) * (dHp / (kH * SH))
  );

  return dE;
}

/**
 * Match threshold - colors with DeltaE below this are considered matches
 */
export const MATCH_THRESHOLD = 10;

/**
 * Find the closest matching color from a list using DeltaE
 * Always returns the best match, even if outside threshold
 */
export function findClosestColor(
  targetColor: RGB,
  colorList: Array<{ valueRGB: RGB; [key: string]: any }>
): { match: typeof colorList[0] | null; deltaE: number } {
  if (colorList.length === 0) {
    return { match: null, deltaE: Infinity };
  }

  const targetLab = rgbToLab(targetColor);
  let bestMatch = colorList[0];
  let bestDeltaE = deltaE(targetLab, rgbToLab(colorList[0].valueRGB));

  for (let i = 1; i < colorList.length; i++) {
    const currentLab = rgbToLab(colorList[i].valueRGB);
    const currentDeltaE = deltaE(targetLab, currentLab);
    
    if (currentDeltaE < bestDeltaE) {
      bestDeltaE = currentDeltaE;
      bestMatch = colorList[i];
    }
  }

  // Always return the best match, even if outside threshold
  return {
    match: bestMatch,
    deltaE: bestDeltaE
  };
}

