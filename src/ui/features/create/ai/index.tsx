import React, { useState } from 'react';
import { AIColorGenerator } from './AIColorGenerator';
import { isValidColor } from '../../../../utils/color';
import { generateSemanticPalette } from '../../../../utils/tokens';

interface AIPaletteModuleProps {
  onColorChange?: (name: string, color: string) => void;
  onPaletteGenerated?: (colors: Record<string, string>) => void;
  onNavigateToGenerator?: () => void;
}

export const AIPaletteModule: React.FC<AIPaletteModuleProps> = ({
  onColorChange,
  onPaletteGenerated,
  onNavigateToGenerator,
}) => {
  const [generatedColors, setGeneratedColors] = useState<Record<string, string>>({});

  const handleColorsGenerated = (colors: string[]) => {
    // Map colors to semantic color names
    const colorMap: Record<string, string> = {};
    const semanticNames = ['primary', 'secondary', 'neutral', 'info', 'success', 'warning', 'error'];
    
    colors.forEach((color, index) => {
      if (isValidColor(color)) {
        const name = semanticNames[index] || `custom-${index}`;
        colorMap[name] = color;
        
        // Update individual colors
        if (onColorChange) {
          onColorChange(name, color);
        }
      }
    });

    // If we have a primary color, generate semantic palette
    if (colorMap.primary && isValidColor(colorMap.primary)) {
      const semanticPalette = generateSemanticPalette(colorMap.primary);
      const mergedPalette = { ...semanticPalette, ...colorMap };
      
      setGeneratedColors(mergedPalette);
      if (onPaletteGenerated) {
        onPaletteGenerated(mergedPalette);
      }
    } else {
      setGeneratedColors(colorMap);
      if (onPaletteGenerated) {
        onPaletteGenerated(colorMap);
      }
    }
  };

  return (
    <div style={{ padding: '20px', height: '100%' }}>
      <AIColorGenerator onColorsGenerated={handleColorsGenerated} />
    </div>
  );
};
