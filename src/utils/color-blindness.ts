import chroma from 'chroma-js';

// Matrices for color blindness simulation
// Source: https://www.inf.ufrgs.br/~oliveira/pubs_files/CVD_Simulation/CVD_Simulation.html (approximate matrices)
// or commonly used transformations.

const SIMULATION_MATRICES = {
  protanopia: [
    0.567, 0.433, 0,
    0.558, 0.442, 0,
    0, 0.242, 0.758
  ],
  deuteranopia: [
    0.625, 0.375, 0,
    0.7, 0.3, 0,
    0, 0.3, 0.7
  ],
  tritanopia: [
    0.95, 0.05, 0,
    0, 0.433, 0.567,
    0, 0.475, 0.525
  ]
};

export type BlindnessType = 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';

export const simulateColorBlindness = (hex: string, type: BlindnessType): string => {
  if (type === 'none') return hex;
  if (!chroma.valid(hex)) return hex;

  const [r, g, b] = chroma(hex).rgb();
  const m = SIMULATION_MATRICES[type];

  // Apply matrix
  // R' = R*m0 + G*m1 + B*m2
  const r_ = r * m[0] + g * m[1] + b * m[2];
  const g_ = r * m[3] + g * m[4] + b * m[5];
  const b_ = r * m[6] + g * m[7] + b * m[8];

  return chroma.rgb(r_, g_, b_).hex();
};

