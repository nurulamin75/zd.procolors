import { ColorToken } from './tokens';

export const formatJSON = (palettes: Record<string, ColorToken[]>): string => {
  const result: Record<string, Record<string, string>> = {};
  
  Object.entries(palettes).forEach(([name, tokens]) => {
    result[name] = {};
    tokens.forEach(token => {
      result[name][token.shade] = token.value;
    });
  });
  
  return JSON.stringify(result, null, 2);
};

export const formatCSS = (palettes: Record<string, ColorToken[]>, namingStyle: 'simple' | 'tailwind' | 'material' | 'radix' = 'simple'): string => {
  let css = ':root {\n';
  
  Object.entries(palettes).forEach(([name, tokens]) => {
    tokens.forEach(token => {
      const colorName = getColorName(name, token.shade, namingStyle);
      css += `  --color-${colorName}: ${token.value};\n`;
    });
    css += '\n';
  });
  
  css += '}';
  return css;
};

export const formatTailwind = (palettes: Record<string, ColorToken[]>, namingStyle: 'simple' | 'tailwind' | 'material' | 'radix' = 'simple'): string => {
  const result: Record<string, Record<string, string>> = {};
  
  Object.entries(palettes).forEach(([name, tokens]) => {
    result[name] = {};
    tokens.forEach(token => {
      result[name][token.shade] = token.value;
    });
  });

  return `module.exports = {\n  theme: {\n    extend: {\n      colors: ${JSON.stringify(result, null, 6).replace(/\n\s{6}"/g, '\n        "').replace(/\}/g, '      }')}\n    }\n  }\n}`;
};

// Helper to convert hex to RGB
const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
};

// Helper to get color name based on naming convention
const getColorName = (paletteName: string, shade: string | number, namingStyle: 'simple' | 'tailwind' | 'material' | 'radix'): string => {
  switch (namingStyle) {
    case 'simple':
      return `${paletteName}-${shade}`;
    case 'tailwind':
      return `text-${paletteName}-${shade}`;
    case 'material':
      return `md.ref.palette.${paletteName}${shade}`;
    case 'radix':
      // Map common palette names to radix-style names
      const radixMap: Record<string, string> = {
        primary: 'blue',
        secondary: 'purple',
        neutral: 'gray',
        success: 'green',
        warning: 'yellow',
        error: 'red',
        info: 'cyan'
      };
      const baseName = radixMap[paletteName] || paletteName;
      const shadeNum = typeof shade === 'number' ? shade : parseInt(shade.toString());
      return `${baseName}${shadeNum}`;
    default:
      return `${paletteName}-${shade}`;
  }
};

export const formatAndroidXML = (palettes: Record<string, ColorToken[]>, namingStyle: 'simple' | 'tailwind' | 'material' | 'radix' = 'simple'): string => {
  let xml = '<?xml version="1.0" encoding="utf-8"?>\n<resources>\n';
  
  Object.entries(palettes).forEach(([name, tokens]) => {
    tokens.forEach(token => {
      const colorName = getColorName(name, token.shade, namingStyle).replace(/[^a-zA-Z0-9_]/g, '_');
      const { r, g, b } = hexToRgb(token.value);
      xml += `    <color name="${colorName}">#${token.value.replace('#', '')}</color>\n`;
    });
    xml += '\n';
  });
  
  xml += '</resources>';
  return xml;
};

export const formatIOSSwift = (palettes: Record<string, ColorToken[]>, namingStyle: 'simple' | 'tailwind' | 'material' | 'radix' = 'simple'): string => {
  let swift = 'import UIKit\n\n';
  swift += 'extension UIColor {\n';
  
  Object.entries(palettes).forEach(([name, tokens]) => {
    tokens.forEach(token => {
      const colorName = getColorName(name, token.shade, namingStyle);
      const { r, g, b } = hexToRgb(token.value);
      const rFloat = (r / 255).toFixed(3);
      const gFloat = (g / 255).toFixed(3);
      const bFloat = (b / 255).toFixed(3);
      swift += `    static let ${colorName.replace(/[^a-zA-Z0-9]/g, '')} = UIColor(red: ${rFloat}, green: ${gFloat}, blue: ${bFloat}, alpha: 1.0)\n`;
    });
    swift += '\n';
  });
  
  swift += '}';
  return swift;
};

export const formatCSV = (palettes: Record<string, ColorToken[]>, namingStyle: 'simple' | 'tailwind' | 'material' | 'radix' = 'simple'): string => {
  let csv = 'Name,Shade,Value\n';
  
  Object.entries(palettes).forEach(([name, tokens]) => {
    tokens.forEach(token => {
      const colorName = getColorName(name, token.shade, namingStyle);
      csv += `"${colorName}",${token.shade},"${token.value}"\n`;
    });
  });
  
  return csv;
};

// Generic download function
export const downloadFile = (content: string, filename: string, mimeType: string = 'text/plain') => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// Copy to clipboard function
export const copyToClipboard = (content: string): Promise<void> => {
  return navigator.clipboard.writeText(content).catch(() => {
    // Fallback for older browsers
    const textArea = document.createElement("textarea");
    textArea.value = content;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("copy");
    document.body.removeChild(textArea);
  });
};

export const downloadTokens = (palettes: Record<string, ColorToken[]>) => {
    const json = formatJSON(palettes);
    downloadFile(json, "tokens.json", "application/json");
};

// Style Dictionary compatible format
export const formatStyleDictionary = (
  palettes: Record<string, ColorToken[]>,
  semanticTokens?: Array<{ name: string; aliasTo?: string; value?: string }>
): string => {
  const result: Record<string, any> = {
    color: {
      base: {},
      semantic: {}
    }
  };
  
  // Base tokens
  Object.entries(palettes).forEach(([name, tokens]) => {
    result.color.base[name] = {};
    tokens.forEach(token => {
      result.color.base[name][token.shade] = {
        value: token.value
      };
    });
  });
  
  // Semantic tokens
  if (semanticTokens) {
    semanticTokens.forEach(token => {
      const parts = token.name.split('.');
      let current = result.color.semantic;
      
      for (let i = 0; i < parts.length - 1; i++) {
        if (!current[parts[i]]) {
          current[parts[i]] = {};
        }
        current = current[parts[i]];
      }
      
      const lastPart = parts[parts.length - 1];
      if (token.aliasTo) {
        // Convert alias path to Style Dictionary reference
        const aliasParts = token.aliasTo.split('/');
        if (aliasParts.length === 3 && aliasParts[0] === 'Base Tokens') {
          current[lastPart] = {
            value: `{color.base.${aliasParts[1]}.${aliasParts[2]}.value}`
          };
        } else {
          current[lastPart] = { value: token.value || '#000000' };
        }
      } else if (token.value) {
        current[lastPart] = { value: token.value };
      }
    });
  }
  
  return JSON.stringify(result, null, 2);
};

// Enhanced CSS with semantic tokens
export const formatCSSWithSemantics = (
  palettes: Record<string, ColorToken[]>,
  semanticTokens?: Array<{ name: string; aliasTo?: string; value?: string }>
): string => {
  let css = ':root {\n';
  
  // Base tokens
  Object.entries(palettes).forEach(([name, tokens]) => {
    tokens.forEach(token => {
      css += `  --color-${name}-${token.shade}: ${token.value};\n`;
    });
  });
  
  css += '\n';
  
  // Semantic tokens
  if (semanticTokens) {
    semanticTokens.forEach(token => {
      const cssName = token.name.replace(/\./g, '-');
      if (token.aliasTo) {
        // Resolve alias
        const aliasParts = token.aliasTo.split('/');
        if (aliasParts.length === 3 && aliasParts[0] === 'Base Tokens') {
          css += `  --${cssName}: var(--color-${aliasParts[1]}-${aliasParts[2]});\n`;
        } else {
          css += `  --${cssName}: ${token.value || '#000000'};\n`;
        }
      } else if (token.value) {
        css += `  --${cssName}: ${token.value};\n`;
      }
    });
  }
  
  css += '}';
  return css;
};

// Enhanced Tailwind with semantic tokens
export const formatTailwindWithSemantics = (
  palettes: Record<string, ColorToken[]>,
  semanticTokens?: Array<{ name: string; aliasTo?: string; value?: string }>
): string => {
  const colors: Record<string, any> = {};
  
  // Base tokens
  Object.entries(palettes).forEach(([name, tokens]) => {
    colors[name] = {};
    tokens.forEach(token => {
      colors[name][token.shade] = token.value;
    });
  });
  
  // Semantic tokens
  if (semanticTokens) {
    semanticTokens.forEach(token => {
      const parts = token.name.split('.');
      let current = colors;
      
      for (let i = 1; i < parts.length - 1; i++) {
        if (!current[parts[i]]) {
          current[parts[i]] = {};
        }
        current = current[parts[i]];
      }
      
      const lastPart = parts[parts.length - 1];
      if (token.aliasTo) {
        // Resolve alias to Tailwind reference
        const aliasParts = token.aliasTo.split('/');
        if (aliasParts.length === 3 && aliasParts[0] === 'Base Tokens') {
          current[lastPart] = `theme('colors.${aliasParts[1]}.${aliasParts[2]}')`;
        } else {
          current[lastPart] = token.value || '#000000';
        }
      } else if (token.value) {
        current[lastPart] = token.value;
      }
    });
  }
  
  return `module.exports = {\n  theme: {\n    extend: {\n      colors: ${JSON.stringify(colors, null, 6).replace(/\n\s{6}"/g, '\n        "').replace(/\}/g, '      }')}\n    }\n  }\n}`;
};
