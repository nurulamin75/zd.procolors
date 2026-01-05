import chroma from 'chroma-js';
import { ColorToken } from './tokens';
import { checkAccessibility, getContrast } from './contrast';

export interface SemanticToken {
  name: string; // e.g., "color.brand.primary"
  aliasTo?: string; // Base token path it aliases to
  value?: string; // Direct value if not aliased
  category: 'brand' | 'text' | 'bg' | 'border' | 'state';
  subcategory: string;
  mode?: string; // For multi-mode support
}

export interface TokenAlias {
  semanticToken: string;
  baseToken: string;
  relationship: 'alias' | 'derived';
}

// Semantic naming patterns
export const SEMANTIC_PATTERNS = {
  brand: ['primary', 'secondary', 'accent'],
  text: ['primary', 'secondary', 'tertiary', 'disabled', 'inverse'],
  bg: ['surface', 'elevated', 'overlay', 'base'],
  border: ['subtle', 'default', 'strong', 'focus'],
  state: ['success', 'error', 'warning', 'info', 'neutral']
};

// Generate semantic token suggestions from base colors
export function suggestSemanticTokens(
  baseTokens: Record<string, ColorToken[]>
): SemanticToken[] {
  const suggestions: SemanticToken[] = [];
  
  // Brand tokens
  if (baseTokens.primary) {
    const primary500 = baseTokens.primary.find(t => t.shade === 500);
    if (primary500) {
      suggestions.push({
        name: 'color.brand.primary',
        aliasTo: `Base Tokens/primary/500`,
        category: 'brand',
        subcategory: 'primary'
      });
    }
  }
  
  if (baseTokens.secondary) {
    const secondary500 = baseTokens.secondary.find(t => t.shade === 500);
    if (secondary500) {
      suggestions.push({
        name: 'color.brand.secondary',
        aliasTo: `Base Tokens/secondary/500`,
        category: 'brand',
        subcategory: 'secondary'
      });
    }
  }
  
  // Text tokens
  if (baseTokens.neutral) {
    const neutral900 = baseTokens.neutral.find(t => t.shade === 900);
    const neutral700 = baseTokens.neutral.find(t => t.shade === 700);
    const neutral500 = baseTokens.neutral.find(t => t.shade === 500);
    const neutral300 = baseTokens.neutral.find(t => t.shade === 300);
    
    if (neutral900) {
      suggestions.push({
        name: 'color.text.primary',
        aliasTo: `Base Tokens/neutral/900`,
        category: 'text',
        subcategory: 'primary'
      });
    }
    
    if (neutral700) {
      suggestions.push({
        name: 'color.text.secondary',
        aliasTo: `Base Tokens/neutral/700`,
        category: 'text',
        subcategory: 'secondary'
      });
    }
    
    if (neutral500) {
      suggestions.push({
        name: 'color.text.tertiary',
        aliasTo: `Base Tokens/neutral/500`,
        category: 'text',
        subcategory: 'tertiary'
      });
    }
    
    if (neutral300) {
      suggestions.push({
        name: 'color.text.disabled',
        aliasTo: `Base Tokens/neutral/300`,
        category: 'text',
        subcategory: 'disabled'
      });
    }
  }
  
  // Background tokens
  if (baseTokens.neutral) {
    const neutral50 = baseTokens.neutral.find(t => t.shade === 50);
    const neutral100 = baseTokens.neutral.find(t => t.shade === 100);
    const neutral200 = baseTokens.neutral.find(t => t.shade === 200);
    
    if (neutral50) {
      suggestions.push({
        name: 'color.bg.surface',
        aliasTo: `Base Tokens/neutral/50`,
        category: 'bg',
        subcategory: 'surface'
      });
    }
    
    if (neutral100) {
      suggestions.push({
        name: 'color.bg.elevated',
        aliasTo: `Base Tokens/neutral/100`,
        category: 'bg',
        subcategory: 'elevated'
      });
    }
    
    if (neutral200) {
      suggestions.push({
        name: 'color.bg.overlay',
        aliasTo: `Base Tokens/neutral/200`,
        category: 'bg',
        subcategory: 'overlay'
      });
    }
  }
  
  // Border tokens
  if (baseTokens.neutral) {
    const neutral200 = baseTokens.neutral.find(t => t.shade === 200);
    const neutral300 = baseTokens.neutral.find(t => t.shade === 300);
    const neutral400 = baseTokens.neutral.find(t => t.shade === 400);
    
    if (neutral200) {
      suggestions.push({
        name: 'color.border.subtle',
        aliasTo: `Base Tokens/neutral/200`,
        category: 'border',
        subcategory: 'subtle'
      });
    }
    
    if (neutral300) {
      suggestions.push({
        name: 'color.border.default',
        aliasTo: `Base Tokens/neutral/300`,
        category: 'border',
        subcategory: 'default'
      });
    }
    
    if (neutral400) {
      suggestions.push({
        name: 'color.border.strong',
        aliasTo: `Base Tokens/neutral/400`,
        category: 'border',
        subcategory: 'strong'
      });
    }
  }
  
  // State tokens
  if (baseTokens.success) {
    const success500 = baseTokens.success.find(t => t.shade === 500);
    if (success500) {
      suggestions.push({
        name: 'color.state.success',
        aliasTo: `Base Tokens/success/500`,
        category: 'state',
        subcategory: 'success'
      });
    }
  }
  
  if (baseTokens.error) {
    const error500 = baseTokens.error.find(t => t.shade === 500);
    if (error500) {
      suggestions.push({
        name: 'color.state.error',
        aliasTo: `Base Tokens/error/500`,
        category: 'state',
        subcategory: 'error'
      });
    }
  }
  
  if (baseTokens.warning) {
    const warning500 = baseTokens.warning.find(t => t.shade === 500);
    if (warning500) {
      suggestions.push({
        name: 'color.state.warning',
        aliasTo: `Base Tokens/warning/500`,
        category: 'state',
        subcategory: 'warning'
      });
    }
  }
  
  if (baseTokens.info) {
    const info500 = baseTokens.info.find(t => t.shade === 500);
    if (info500) {
      suggestions.push({
        name: 'color.state.info',
        aliasTo: `Base Tokens/info/500`,
        category: 'state',
        subcategory: 'info'
      });
    }
  }
  
  return suggestions;
}

// Generate state-based tokens (default, hover, active, disabled, focus)
export interface StateToken {
  name: string; // e.g., "color.button.primary.default"
  baseToken: string;
  state: 'default' | 'hover' | 'active' | 'disabled' | 'focus';
  value: string;
}

export function generateStateTokens(
  baseToken: ColorToken,
  baseName: string
): StateToken[] {
  const base = chroma(baseToken.value);
  const states: StateToken[] = [];
  
  // Default state - use base color
  states.push({
    name: `${baseName}.default`,
    baseToken: baseName,
    state: 'default',
    value: base.hex()
  });
  
  // Hover state - slightly darker/more saturated
  const hover = base.darken(0.1).saturate(0.1);
  states.push({
    name: `${baseName}.hover`,
    baseToken: baseName,
    state: 'hover',
    value: hover.hex()
  });
  
  // Active state - darker
  const active = base.darken(0.2);
  states.push({
    name: `${baseName}.active`,
    baseToken: baseName,
    state: 'active',
    value: active.hex()
  });
  
  // Disabled state - desaturated and lighter
  const disabled = base.desaturate(0.5).brighten(0.2);
  states.push({
    name: `${baseName}.disabled`,
    baseToken: baseName,
    state: 'disabled',
    value: disabled.hex()
  });
  
  // Focus state - slightly brighter with ring color
  const focus = base.brighten(0.1);
  states.push({
    name: `${baseName}.focus`,
    baseToken: baseName,
    state: 'focus',
    value: focus.hex()
  });
  
  return states;
}

// Generate multi-mode tokens (light, dark, high-contrast)
export interface ModeToken {
  name: string;
  mode: 'light' | 'dark' | 'high-contrast';
  value: string;
  baseValue: string;
}

export function generateModeToken(
  baseToken: ColorToken,
  tokenName: string,
  mode: 'light' | 'dark' | 'high-contrast',
  bgColor?: string
): ModeToken {
  console.log(`generateModeToken called for ${tokenName} in ${mode} mode, base color: ${baseToken.value}`);
  
  const base = chroma(baseToken.value);
  let adjusted = base;
  
  if (mode === 'dark') {
    // For dark mode, invert the luminance intelligently
    const [h, s, l] = base.hsl();
    const luminance = base.luminance();
    
    console.log(`Dark mode - Original HSL: [${h}, ${s}, ${l}], luminance: ${luminance}`);
    
    let newL;
    if (luminance > 0.5) {
      // Light colors become darker
      newL = 0.15 + (luminance * 0.2); // Map to darker range
    } else {
      // Dark colors become lighter  
      newL = 0.7 + (luminance * 0.3); // Map to lighter range
    }
    
    adjusted = chroma.hsl(h, Math.min(1, s * 1.1), newL);
    console.log(`Dark mode - New HSL: [${h}, ${Math.min(1, s * 1.1)}, ${newL}], result: ${adjusted.hex()}`);
    
  } else if (mode === 'high-contrast') {
    // Increase contrast significantly
    const [h, s, l] = base.hsl();
    const luminance = base.luminance();
    
    console.log(`High contrast - Original HSL: [${h}, ${s}, ${l}], luminance: ${luminance}`);
    
    let newL;
    if (luminance > 0.5) {
      // Make very light
      newL = Math.min(0.98, l + 0.4);
    } else {
      // Make very dark
      newL = Math.max(0.02, l - 0.4);
    }
    
    adjusted = chroma.hsl(h, Math.min(1, s * 1.2), newL);
    console.log(`High contrast - New HSL: [${h}, ${Math.min(1, s * 1.2)}, ${newL}], result: ${adjusted.hex()}`);
  }
  // Light mode uses base color
  
  const result = {
    name: tokenName,
    mode,
    value: adjusted.hex(),
    baseValue: baseToken.value
  };
  
  console.log(`generateModeToken result for ${tokenName} in ${mode}:`, result.value);
  
  return result;
}

// Helper to invert shade for dark mode
function invertShadeForDark(shade: number): number {
  const shadeMap: Record<number, number> = {
    50: 950,
    100: 900,
    200: 800,
    300: 700,
    400: 600,
    500: 500,
    600: 400,
    700: 300,
    800: 200,
    900: 100,
    950: 50
  };
  return shadeMap[shade] || shade;
}

// Check if semantic token alias is valid
export function validateAlias(
  semanticToken: SemanticToken,
  baseTokens: Record<string, ColorToken[]>
): { valid: boolean; error?: string } {
  if (!semanticToken.aliasTo) {
    return { valid: false, error: 'No alias target specified' };
  }
  
  // Parse alias path: "Base Tokens/primary/500"
  const parts = semanticToken.aliasTo.split('/');
  if (parts.length !== 3 || parts[0] !== 'Base Tokens') {
    return { valid: false, error: 'Invalid alias path format' };
  }
  
  const groupName = parts[1];
  const shade = parseInt(parts[2]);
  
  if (!baseTokens[groupName]) {
    return { valid: false, error: `Base token group "${groupName}" not found` };
  }
  
  const token = baseTokens[groupName].find(t => t.shade === shade);
  if (!token) {
    return { valid: false, error: `Base token "${groupName}/${shade}" not found` };
  }
  
  return { valid: true };
}

