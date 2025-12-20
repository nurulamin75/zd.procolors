import React, { useState } from 'react';
import { ManualGenerator } from './ManualGenerator';
import { HarmonyPanel } from './harmony/HarmonyPanel';
import { ColorToken } from '../../../../utils/tokens';
import { SlidersHorizontal, Palette, Image as ImageIcon } from 'lucide-react';
import { ImageExtractor } from '../../../features/flow/extractor/ImageExtractor';

interface GeneratorPageProps {
  primaryColor: string;
  semanticColors: Record<string, string>;
  allPalettes: Record<string, ColorToken[]>;
  onColorChange: (name: string, val: string) => void;
  onExport: (format: 'json' | 'css' | 'tailwind' | 'figma' | 'download' | 'copy-all' | 'figma-variables', action?: string, targetId?: string) => void;
  shadeScale: number[];
  onUpdateScale: (scale: number[]) => void;
  customColors?: Record<string, string>;
  onAddCustomColor?: (name: string, color: string) => void;
  onDeleteCustomColor?: (name: string) => void;
}

export const GeneratorPage: React.FC<GeneratorPageProps> = ({
  primaryColor,
  semanticColors,
  allPalettes,
  onColorChange,
  onExport,
  shadeScale,
  onUpdateScale,
  customColors,
  onAddCustomColor,
  onDeleteCustomColor
}) => {
  const [activeTab, setActiveTab] = useState<'manual' | 'harmony' | 'extract'>('manual');

  const handleApplyHarmony = (colors: string[]) => {
    const targets = ['primary', 'secondary', 'neutral', 'info', 'success', 'warning', 'error'];
    
    colors.forEach((color, index) => {
        if (index < targets.length) {
            onColorChange(targets[index], color);
        }
    });

    setActiveTab('manual');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
        {/* Tabs on the Left */}
        <div style={{ 
          // background: 'var(--color-bg-hover)', 
          // padding: '6px', 
          // borderRadius: '100px', 
          // border: '0.25px solid #e6e6e6',
          display: 'flex', 
          gap: '4px' 
        }}>
          <button
            onClick={() => setActiveTab('manual')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 16px',
              borderRadius: '100px',
              fontSize: '13px',
              fontWeight: 500,
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s',
              background: activeTab === 'manual' ? 'white' : 'transparent',
              color: activeTab === 'manual' ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
              boxShadow: activeTab === 'manual' ? 'var(--shadow-sm)' : 'none'
            }}
          >
            <SlidersHorizontal size={14} />
            Manual Input
          </button>
          <button
            onClick={() => setActiveTab('harmony')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 16px',
              borderRadius: '100px',
              fontSize: '13px',
              fontWeight: 500,
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s',
              background: activeTab === 'harmony' ? 'white' : 'transparent',
              color: activeTab === 'harmony' ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
              boxShadow: activeTab === 'harmony' ? 'var(--shadow-sm)' : 'none'
            }}
          >
            <Palette size={14} />
            Color Wheel
          </button>
          <button
            onClick={() => setActiveTab('extract')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 16px',
              borderRadius: '100px',
              fontSize: '13px',
              fontWeight: 500,
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s',
              background: activeTab === 'extract' ? 'white' : 'transparent',
              color: activeTab === 'extract' ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
              boxShadow: activeTab === 'extract' ? 'var(--shadow-sm)' : 'none'
            }}
          >
            <ImageIcon size={14} />
            Extract from Image
          </button>
        </div>
      </div>

      {activeTab === 'manual' ? (
        <ManualGenerator 
          primaryColor={primaryColor}
          semanticColors={semanticColors}
          allPalettes={allPalettes}
          onColorChange={onColorChange}
          onExport={onExport}
          shadeScale={shadeScale}
          onUpdateScale={onUpdateScale}
          customColors={customColors}
          onAddCustomColor={onAddCustomColor}
          onDeleteCustomColor={onDeleteCustomColor}
        />
      ) : activeTab === 'harmony' ? (
        <HarmonyPanel onApply={handleApplyHarmony} />
      ) : (
        <ImageExtractor 
          onColorSelect={onColorChange}
          onApplyColors={(colors) => {
            // Apply extracted colors to available color slots
            const targets = ['primary', 'secondary', 'neutral', 'info', 'success', 'warning', 'error'];
            colors.forEach((color, index) => {
              if (index < targets.length) {
                onColorChange(targets[index], color);
              }
            });
            // Switch back to manual input tab to see the applied colors
            setActiveTab('manual');
          }}
        />
      )}
    </div>
  );
};
