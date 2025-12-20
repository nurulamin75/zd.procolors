import React from 'react';
import { Lock, Unlock } from 'lucide-react';

interface GeneratedPaletteProps {
  colors: string[];
  lockedColors: string[];
  onToggleLock: (color: string) => void;
}

export const GeneratedPalette: React.FC<GeneratedPaletteProps> = ({ colors, lockedColors, onToggleLock }) => {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Could add toast here
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <h3 style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        Generated Palette
      </h3>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
        {colors.map((color, index) => {
            const isLocked = lockedColors.includes(color);
            return (
                <div key={`${color}-${index}`} style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
                    <div 
                        style={{ 
                          width: '64px', 
                          height: '64px', 
                          borderRadius: '50%', 
                          boxShadow: 'var(--shadow-md)', 
                          border: '1px solid rgba(0,0,0,0.05)',
                          position: 'relative',
                          backgroundColor: color,
                          cursor: 'pointer',
                          transition: 'transform 0.2s'
                        }}
                        className="group"
                    >
                        <div 
                          style={{
                            position: 'absolute',
                            inset: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '50%',
                            backgroundColor: 'rgba(0,0,0,0.1)',
                            opacity: 0, // Initially hidden
                            transition: 'opacity 0.2s'
                          }}
                          className="hover-overlay"
                          onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                          onMouseLeave={(e) => e.currentTarget.style.opacity = '0'}
                        >
                             <button 
                                onClick={(e) => { e.stopPropagation(); onToggleLock(color); }}
                                style={{
                                  padding: '4px',
                                  borderRadius: '50%',
                                  background: 'rgba(255,255,255,0.9)',
                                  border: 'none',
                                  cursor: 'pointer',
                                  color: '#333',
                                  boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                                }}
                             >
                                {isLocked ? <Lock size={12} /> : <Unlock size={12} />}
                             </button>
                        </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                         <span 
                            style={{ fontSize: '12px', fontFamily: 'monospace', color: 'var(--color-text-secondary)', cursor: 'pointer' }}
                            onClick={() => copyToClipboard(color)}
                         >
                            {color.toUpperCase()}
                         </span>
                         <span style={{ fontSize: '10px', color: 'var(--color-text-tertiary)' }}>
                            {index === 0 ? 'Base' : `Color ${index + 1}`}
                         </span>
                    </div>
                </div>
            );
        })}
      </div>
    </div>
  );
};
