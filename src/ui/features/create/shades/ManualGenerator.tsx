import React, { useState } from 'react';
import { ColorInput } from "../../../components/ColorInput";
import { PaletteDisplay } from "../../../components/PaletteDisplay";
import { ExportSection } from "../../../components/ExportSection";
import { ColorToken } from "../../../../utils/tokens";
import { Plus } from 'lucide-react';
import { isValidColor } from '../../../../utils/color';

interface ManualGeneratorProps {
  primaryColor: string;
  semanticColors: Record<string, string>;
  allPalettes: Record<string, ColorToken[]>;
  onColorChange: (name: string, val: string) => void;
  onExport: (format: 'json' | 'css' | 'tailwind' | 'figma' | 'download' | 'copy-all' | 'figma-variables') => void;
  shadeScale: number[];
  onUpdateScale: (scale: number[]) => void;
  customColors?: Record<string, string>;
  onAddCustomColor?: (name: string, color: string) => void;
  onDeleteCustomColor?: (name: string) => void;
}

export const ManualGenerator: React.FC<ManualGeneratorProps> = ({
  primaryColor,
  semanticColors,
  allPalettes,
  onColorChange,
  onExport,
  shadeScale,
  onUpdateScale,
  customColors = {},
  onAddCustomColor,
  onDeleteCustomColor
}) => {
  const [customColorInput, setCustomColorInput] = useState('');
  const [customColorName, setCustomColorName] = useState('');
  const otherColors = Object.entries(semanticColors).filter(([name]) => name !== 'primary');
  const allColors = [
    ['primary', primaryColor],
    ...otherColors,
    ...Object.entries(customColors)
  ];

  const handleAddShade = (position: 'start' | 'end') => {
      if (position === 'start') {
          const min = Math.min(...shadeScale);
          let newShade = min - 10; 
          if (min === 50) newShade = 25;
          if (min === 100) newShade = 50;
          if (min > 100) newShade = min - 100;
          
          newShade = Math.max(0, newShade);
          
          if (!shadeScale.includes(newShade)) {
              const newScale = [...shadeScale, newShade].sort((a,b)=>a-b);
              console.log('Adding shade to start:', newShade, 'New scale:', newScale);
              onUpdateScale(newScale);
          } else {
              console.warn('Shade already exists:', newShade);
          }
      } else {
          const max = Math.max(...shadeScale);
          let newShade = max + 10; 
          if (max === 900) newShade = 950;
          if (max === 950) newShade = 975;
          if (max === 975) newShade = 990;
          if (max === 990) newShade = 995;
          
          newShade = Math.min(1000, newShade);

          if (!shadeScale.includes(newShade)) {
              const newScale = [...shadeScale, newShade].sort((a,b)=>a-b);
              console.log('Adding shade to end:', newShade, 'New scale:', newScale);
              onUpdateScale(newScale);
          } else {
              console.warn('Shade already exists:', newShade);
          }
      }
  };

  const handleRemoveShade = (position: 'start' | 'end') => {
      if (shadeScale.length <= 3) {
          console.warn('Cannot remove shade: minimum 3 shades required');
          return; // Prevent emptying too much
      }

      if (position === 'start') {
          // Remove first element
          const newScale = shadeScale.slice(1);
          console.log('Removing shade from start:', shadeScale[0], 'New scale:', newScale);
          onUpdateScale(newScale);
      } else {
          // Remove last element
          const newScale = shadeScale.slice(0, -1);
          console.log('Removing shade from end:', shadeScale[shadeScale.length - 1], 'New scale:', newScale);
          onUpdateScale(newScale);
      }
  };

  const handleAddCustomColor = () => {
    if (isValidColor(customColorInput) && customColorName.trim() && onAddCustomColor) {
      onAddCustomColor(customColorName.trim(), customColorInput);
      setCustomColorInput('');
      setCustomColorName('');
    }
  };

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '16px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '12px'
        }}>
          {allColors.map(([name, value]) => {
            const isCustom = customColors[name] !== undefined;
            return (
              <ColorInput
                key={name}
                label={name.charAt(0).toUpperCase() + name.slice(1)}
                value={value}
                onChange={(val) => onColorChange(name, val)}
                isCustom={isCustom}
                onDelete={isCustom && onDeleteCustomColor ? () => onDeleteCustomColor(name) : undefined}
              />
            );
          })}
          
          {/* Custom Color Input Box */}
          {onAddCustomColor && (
            <div 
              style={{
                position: 'relative',
                backgroundColor: 'white',
                border: '0.25px solid #f2f2f2',
                borderRadius: '16px',
                padding: '12px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                marginBottom: '8px',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-primary)';
                // e.currentTarget.style.backgroundColor = 'var(--color-primary-light)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#e2e8f0';
                e.currentTarget.style.backgroundColor = 'white';
              }}
            >
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: customColorInput && isValidColor(customColorInput) ? customColorInput : '#f3f4f6',
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid white',
                outline: '1px solid var(--color-border-light)',
                transition: 'all 0.2s',
                boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.05), 0 2px 4px rgba(0,0,0,0.05)'
              }}>
                {!customColorInput && <Plus size={20} color="#94a3b8" />}
              </div>
              
              <input
                type="text"
                placeholder="Name"
                value={customColorName}
                onChange={(e) => setCustomColorName(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && isValidColor(customColorInput) && customColorName.trim()) {
                    handleAddCustomColor();
                  }
                }}
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: customColorName ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                  backgroundColor: 'transparent',
                  border: 'none',
                  textAlign: 'center',
                  width: '100%',
                  outline: 'none',
                  marginBottom: '6px',
                  padding: 0
                }}
              />
              
              <input
                type="text"
                placeholder="#000000"
                value={customColorInput}
                onChange={(e) => setCustomColorInput(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && isValidColor(customColorInput) && customColorName.trim()) {
                    handleAddCustomColor();
                  }
                }}
                style={{
                  fontSize: '11px',
                  color: 'var(--color-text-secondary)',
                  fontFamily: 'monospace',
                  backgroundColor: 'var(--color-bg-hover)',
                  padding: '4px 6px',
                  borderRadius: '100px',
                  border: '1px solid transparent',
                  textAlign: 'center',
                  width: '100%',
                  outline: 'none',
                  letterSpacing: '0.5px'
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
                onBlur={(e) => e.target.style.borderColor = 'transparent'}
              />
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {Object.entries(allPalettes).map(([name, tokens]) => (
          <PaletteDisplay 
            key={name} 
            paletteName={name} 
            tokens={tokens} 
            onAddShade={handleAddShade}
            onRemoveShade={handleRemoveShade}
          />
        ))}
      </div>
    </div>
  );
};

