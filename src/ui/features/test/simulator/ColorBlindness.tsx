import React, { useState } from 'react';
import { simulateColorBlindness, BlindnessType } from '../../../../utils/color-blindness';
import { ColorToken } from '../../../../utils/tokens';

interface ColorBlindnessProps {
  palettes: Record<string, ColorToken[]>;
}

export const ColorBlindness: React.FC<ColorBlindnessProps> = ({ palettes }) => {
  const [type, setType] = useState<BlindnessType>('none');

  const modes: { id: BlindnessType; label: string }[] = [
    { id: 'none', label: 'Normal Vision' },
    { id: 'protanopia', label: 'Protanopia (Red-Blind)' },
    { id: 'deuteranopia', label: 'Deuteranopia (Green-Blind)' },
    { id: 'tritanopia', label: 'Tritanopia (Blue-Blind)' },
  ];

  // Flatten tokens for preview
  const primaryTokens = palettes.primary || [];
  const successTokens = palettes.success || [];
  const errorTokens = palettes.error || [];

  return (
    <div className="animate-fade-in">
      <div className="section-card">
        <h2 className="section-title">Color Blindness Simulator</h2>
        
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
          {modes.map(m => (
            <button
              key={m.id}
              className={`btn ${type === m.id ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setType(m.id)}
            >
              {m.label}
            </button>
          ))}
        </div>

        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '14px', marginBottom: '8px' }}>Key Semantic Colors</h3>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
             {/* Primary */}
             <ColorSet title="Primary" tokens={primaryTokens} type={type} />
             {/* Success vs Error (Critical distinction) */}
             <ColorSet title="Success" tokens={successTokens} type={type} />
             <ColorSet title="Error" tokens={errorTokens} type={type} />
          </div>
        </div>

        <div style={{ padding: '16px', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
          <div style={{ fontWeight: 600, marginBottom: '8px' }}>UI Simulation</div>
          <div style={{ display: 'flex', gap: '8px' }}>
             <button style={{ 
               backgroundColor: simulateColorBlindness(palettes.success?.[5]?.value || '#22c55e', type), 
               color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px' 
             }}>
               Confirm
             </button>
             <button style={{ 
               backgroundColor: simulateColorBlindness(palettes.error?.[5]?.value || '#ef4444', type), 
               color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px' 
             }}>
               Delete
             </button>
          </div>
          <p style={{ fontSize: '12px', marginTop: '8px', color: 'var(--color-text-secondary)' }}>
             Check if buttons are distinguishable.
          </p>
        </div>
      </div>
    </div>
  );
};

const ColorSet = ({ title, tokens, type }: { title: string, tokens: ColorToken[], type: BlindnessType }) => {
    const mid = tokens.find(t => t.shade === 500)?.value || '#ccc';
    const sim = simulateColorBlindness(mid, type);

    return (
        <div style={{ textAlign: 'center' }}>
            <div style={{ 
                width: '60px', height: '60px', borderRadius: '8px', backgroundColor: sim,
                marginBottom: '4px', boxShadow: 'var(--shadow-sm)'
            }}></div>
            <div style={{ fontSize: '11px', fontWeight: 500 }}>{title}</div>
            <div style={{ fontSize: '10px', color: '#888' }}>{sim}</div>
        </div>
    )
}

