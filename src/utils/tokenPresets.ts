import { ColorToken } from './tokens';
import { SemanticToken } from './semanticTokens';
import { generateShades, SHADE_Scale } from './tokens';

export interface TokenPreset {
  id: string;
  name: string;
  description: string;
  baseColors: Record<string, string>;
  semanticTokens: SemanticToken[];
  structure: {
    hasModes: boolean;
    hasStates: boolean;
    hasBrandLayer: boolean;
  };
}

// SaaS Starter System
export const SAAS_STARTER_PRESET: TokenPreset = {
  id: 'saas-starter',
  name: 'SaaS Starter System',
  description: 'Complete token system for SaaS applications with brand colors, semantic tokens, and state variants',
  baseColors: {
    primary: '#3b82f6', // Blue
    secondary: '#8b5cf6', // Purple
    neutral: '#6b7280', // Gray
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#06b6d4'
  },
  semanticTokens: [
    // Brand
    { name: 'color.brand.primary', aliasTo: 'Base Tokens/primary/500', category: 'brand', subcategory: 'primary' },
    { name: 'color.brand.secondary', aliasTo: 'Base Tokens/secondary/500', category: 'brand', subcategory: 'secondary' },
    // Text
    { name: 'color.text.primary', aliasTo: 'Base Tokens/neutral/900', category: 'text', subcategory: 'primary' },
    { name: 'color.text.secondary', aliasTo: 'Base Tokens/neutral/700', category: 'text', subcategory: 'secondary' },
    { name: 'color.text.tertiary', aliasTo: 'Base Tokens/neutral/500', category: 'text', subcategory: 'tertiary' },
    { name: 'color.text.disabled', aliasTo: 'Base Tokens/neutral/300', category: 'text', subcategory: 'disabled' },
    // Background
    { name: 'color.bg.surface', aliasTo: 'Base Tokens/neutral/50', category: 'bg', subcategory: 'surface' },
    { name: 'color.bg.elevated', aliasTo: 'Base Tokens/neutral/100', category: 'bg', subcategory: 'elevated' },
    { name: 'color.bg.overlay', aliasTo: 'Base Tokens/neutral/200', category: 'bg', subcategory: 'overlay' },
    // Border
    { name: 'color.border.subtle', aliasTo: 'Base Tokens/neutral/200', category: 'border', subcategory: 'subtle' },
    { name: 'color.border.default', aliasTo: 'Base Tokens/neutral/300', category: 'border', subcategory: 'default' },
    { name: 'color.border.strong', aliasTo: 'Base Tokens/neutral/400', category: 'border', subcategory: 'strong' },
    // State
    { name: 'color.state.success', aliasTo: 'Base Tokens/success/500', category: 'state', subcategory: 'success' },
    { name: 'color.state.error', aliasTo: 'Base Tokens/error/500', category: 'state', subcategory: 'error' },
    { name: 'color.state.warning', aliasTo: 'Base Tokens/warning/500', category: 'state', subcategory: 'warning' },
    { name: 'color.state.info', aliasTo: 'Base Tokens/info/500', category: 'state', subcategory: 'info' }
  ],
  structure: {
    hasModes: true,
    hasStates: true,
    hasBrandLayer: true
  }
};

// Startup Design System
export const STARTUP_PRESET: TokenPreset = {
  id: 'startup',
  name: 'Startup Design System',
  description: 'Modern, vibrant token system optimized for fast-moving startups',
  baseColors: {
    primary: '#6366f1', // Indigo
    secondary: '#ec4899', // Pink
    neutral: '#64748b', // Slate
    success: '#22c55e',
    warning: '#eab308',
    error: '#f43f5e',
    info: '#0ea5e9'
  },
  semanticTokens: [
    { name: 'color.brand.primary', aliasTo: 'Base Tokens/primary/500', category: 'brand', subcategory: 'primary' },
    { name: 'color.brand.secondary', aliasTo: 'Base Tokens/secondary/500', category: 'brand', subcategory: 'secondary' },
    { name: 'color.text.primary', aliasTo: 'Base Tokens/neutral/900', category: 'text', subcategory: 'primary' },
    { name: 'color.text.secondary', aliasTo: 'Base Tokens/neutral/600', category: 'text', subcategory: 'secondary' },
    { name: 'color.bg.surface', aliasTo: 'Base Tokens/neutral/50', category: 'bg', subcategory: 'surface' },
    { name: 'color.bg.elevated', aliasTo: 'Base Tokens/neutral/100', category: 'bg', subcategory: 'elevated' },
    { name: 'color.border.subtle', aliasTo: 'Base Tokens/neutral/200', category: 'border', subcategory: 'subtle' },
    { name: 'color.state.success', aliasTo: 'Base Tokens/success/500', category: 'state', subcategory: 'success' },
    { name: 'color.state.error', aliasTo: 'Base Tokens/error/500', category: 'state', subcategory: 'error' }
  ],
  structure: {
    hasModes: false,
    hasStates: true,
    hasBrandLayer: false
  }
};

// Accessibility-First System
export const ACCESSIBILITY_FIRST_PRESET: TokenPreset = {
  id: 'accessibility-first',
  name: 'Accessibility-First System',
  description: 'WCAG AAA compliant token system with high contrast ratios and accessibility best practices',
  baseColors: {
    primary: '#0052cc', // High contrast blue
    secondary: '#5243aa', // High contrast purple
    neutral: '#172b4d', // Dark gray for text
    success: '#00875a',
    warning: '#ff991f',
    error: '#de350b',
    info: '#0052cc'
  },
  semanticTokens: [
    { name: 'color.brand.primary', aliasTo: 'Base Tokens/primary/700', category: 'brand', subcategory: 'primary' },
    { name: 'color.text.primary', aliasTo: 'Base Tokens/neutral/900', category: 'text', subcategory: 'primary' },
    { name: 'color.text.secondary', aliasTo: 'Base Tokens/neutral/800', category: 'text', subcategory: 'secondary' },
    { name: 'color.bg.surface', aliasTo: 'Base Tokens/neutral/50', category: 'bg', subcategory: 'surface' },
    { name: 'color.bg.elevated', aliasTo: 'Base Tokens/neutral/100', category: 'bg', subcategory: 'elevated' },
    { name: 'color.border.default', aliasTo: 'Base Tokens/neutral/400', category: 'border', subcategory: 'default' },
    { name: 'color.state.success', aliasTo: 'Base Tokens/success/700', category: 'state', subcategory: 'success' },
    { name: 'color.state.error', aliasTo: 'Base Tokens/error/700', category: 'state', subcategory: 'error' },
    { name: 'color.state.warning', aliasTo: 'Base Tokens/warning/700', category: 'state', subcategory: 'warning' }
  ],
  structure: {
    hasModes: true,
    hasStates: true,
    hasBrandLayer: true
  }
};

// Generate base tokens from preset
export function generatePresetTokens(preset: TokenPreset): Record<string, ColorToken[]> {
  const tokens: Record<string, ColorToken[]> = {};
  
  Object.entries(preset.baseColors).forEach(([name, color]) => {
    tokens[name] = generateShades(color, name, SHADE_Scale);
  });
  
  return tokens;
}

// All available presets
export const ALL_PRESETS: TokenPreset[] = [
  SAAS_STARTER_PRESET,
  STARTUP_PRESET,
  ACCESSIBILITY_FIRST_PRESET
];

