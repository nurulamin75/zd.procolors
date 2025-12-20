import React from 'react';
import { Layers, Circle, Palette, LayoutGrid, Check } from 'lucide-react';

export type HarmonyType = 'analogous' | 'monochromatic' | 'complementary' | 'split-complementary' | 'triadic' | 'tetradic' | 'square' | 'shades';

interface HarmonyPresetsProps {
  activePreset: HarmonyType;
  onSelectPreset: (preset: HarmonyType) => void;
}

export const HarmonyPresets: React.FC<HarmonyPresetsProps> = ({ activePreset, onSelectPreset }) => {
  const presets: { id: HarmonyType; label: string; icon: React.ElementType }[] = [
    { id: 'analogous', label: 'Analogous', icon: Layers },
    { id: 'monochromatic', label: 'Monochromatic', icon: Circle },
    { id: 'complementary', label: 'Complementary', icon: Palette },
    { id: 'split-complementary', label: 'Split Comp', icon: Palette },
    { id: 'triadic', label: 'Triadic', icon: LayoutGrid },
    { id: 'tetradic', label: 'Tetradic', icon: LayoutGrid }, // Fallback icon
    { id: 'square', label: 'Square', icon: LayoutGrid }, // Fallback icon
    { id: 'shades', label: 'Shades', icon: Layers },
  ];

  return (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: '1fr 1fr', 
      gap: '8px', 
      marginBottom: '24px' 
    }}>
      {presets.map((preset) => (
        <button
          key={preset.id}
          onClick={() => onSelectPreset(preset.id)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 12px',
            borderRadius: 'var(--radius-lg)',
            border: activePreset === preset.id ? '1px solid var(--color-primary)' : '1px solid var(--color-border)',
            fontSize: '13px',
            transition: 'all 0.2s',
            background: activePreset === preset.id ? 'var(--color-primary-light)' : 'white',
            color: activePreset === preset.id ? 'var(--color-primary)' : 'var(--color-text-primary)',
            cursor: 'pointer'
          }}
        >
          <preset.icon size={16} />
          <span>{preset.label}</span>
          {activePreset === preset.id && <Check size={14} style={{ marginLeft: 'auto' }} />}
        </button>
      ))}
    </div>
  );
};
