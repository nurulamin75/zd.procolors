import React from 'react';
import { simulateColorBlindness, BlindnessType } from '../../../../../utils/color-blindness';

interface SimulationThumbnailsProps {
  fg: string;
  bg: string;
}

export const SimulationThumbnails: React.FC<SimulationThumbnailsProps> = ({ fg, bg }) => {
  const modes: { id: BlindnessType; label: string }[] = [
    { id: 'protanopia', label: 'Protanopia' },
    { id: 'deuteranopia', label: 'Deuteranopia' },
    { id: 'tritanopia', label: 'Tritanopia' },
  ];

  return (
    <div style={{ marginTop: '24px' }}>
      <h4 style={{ fontSize: '14px', marginBottom: '12px', color: 'var(--color-text-secondary)' }}>Color Blindness Simulation</h4>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
        {modes.map(mode => {
            const simFg = simulateColorBlindness(fg, mode.id);
            const simBg = simulateColorBlindness(bg, mode.id);
            return (
                <div key={mode.id} className="card" style={{ padding: '12px', textAlign: 'center', cursor: 'pointer' }}>
                    <div style={{ 
                        backgroundColor: simBg, 
                        color: simFg, 
                        height: '60px', 
                        borderRadius: '8px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        fontSize: '14px',
                        fontWeight: 700,
                        marginBottom: '8px',
                        border: '1px solid rgba(0,0,0,0.1)'
                    }}>
                        Aa
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>{mode.label}</div>
                </div>
            );
        })}
      </div>
    </div>
  );
};

