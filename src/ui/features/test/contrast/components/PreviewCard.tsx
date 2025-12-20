import React, { useState } from 'react';
import { Type, Minus, Plus, Eye, Moon, Sun, ArrowLeftRight } from 'lucide-react';

interface PreviewCardProps {
  fg: string;
  bg: string;
  fontSize: number;
  isBold: boolean;
  onFontSizeChange: (size: number) => void;
  onBoldChange: (bold: boolean) => void;
}

export const PreviewCard: React.FC<PreviewCardProps> = ({ 
    fg, bg, fontSize, isBold, onFontSizeChange, onBoldChange 
}) => {
  const [text, setText] = useState("The quick brown fox jumps over the lazy dog.");
  const [mode, setMode] = useState<'light' | 'dark' | 'inverted'>('light');

  // Simulation transforms
  const getContainerStyle = () => {
      if (mode === 'dark') return { backgroundColor: '#1e293b', padding: '24px', borderRadius: '16px' };
      if (mode === 'inverted') return { filter: 'invert(1)', padding: '24px', borderRadius: '16px' };
      return { padding: '0' }; // Default transparent/none
  };

  return (
    <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 className="card-title">Accessible Text</h3>
            
            <div style={{ display: 'flex', gap: '4px', backgroundColor: 'var(--color-bg-secondary)', padding: '4px', borderRadius: '8px' }}>
                <button 
                    className={`btn-icon ${mode === 'light' ? 'active' : ''}`} 
                    onClick={() => setMode('light')}
                    title="Light Mode"
                >
                    <Sun size={14} />
                </button>
                <button 
                    className={`btn-icon ${mode === 'dark' ? 'active' : ''}`} 
                    onClick={() => setMode('dark')}
                    title="Dark Mode"
                >
                    <Moon size={14} />
                </button>
                <button 
                    className={`btn-icon ${mode === 'inverted' ? 'active' : ''}`} 
                    onClick={() => setMode('inverted')}
                    title="Inverted"
                >
                    <ArrowLeftRight size={14} />
                </button>
            </div>
        </div>

        <div style={getContainerStyle()}>
            <div style={{ 
                backgroundColor: bg, 
                color: fg, 
                padding: '32px', 
                borderRadius: '12px', 
                border: '1px solid rgba(0,0,0,0.05)',
                minHeight: '160px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                transition: 'all 0.2s ease'
            }}>
                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    style={{
                        backgroundColor: 'transparent',
                        border: 'none',
                        color: 'inherit',
                        fontSize: `${fontSize}px`,
                        fontWeight: isBold ? 700 : 400,
                        width: '100%',
                        resize: 'none',
                        textAlign: 'center',
                        outline: 'none',
                        fontFamily: 'Inter, sans-serif',
                        lineHeight: 1.5
                    }}
                    rows={3}
                />
            </div>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                <Type size={16} color="var(--color-text-secondary)" />
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button className="btn-icon" onClick={() => onFontSizeChange(Math.max(12, fontSize - 1))}><Minus size={14} /></button>
                    <span style={{ fontSize: '12px', fontWeight: 500, minWidth: '30px', textAlign: 'center' }}>{fontSize}px</span>
                    <button className="btn-icon" onClick={() => onFontSizeChange(Math.min(72, fontSize + 1))}><Plus size={14} /></button>
                    <input 
                        type="range" 
                        min="12" 
                        max="72" 
                        value={fontSize} 
                        onChange={(e) => onFontSizeChange(parseInt(e.target.value))}
                        style={{ flex: 1, marginLeft: '8px' }}
                    />
                </div>
            </div>
            
            <button 
                className={`btn ${isBold ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => onBoldChange(!isBold)}
                style={{ padding: '8px 16px' }}
            >
                B
            </button>
        </div>

        <div style={{ padding: '12px', backgroundColor: 'var(--color-bg-secondary)', borderRadius: '8px', fontSize: '12px', color: 'var(--color-text-secondary)' }}>
            WCAG Level is calculated based on size and weight. 
            <strong>{fontSize >= 18 || (fontSize >= 14 && isBold) ? ' Large Text' : ' Normal Text'}</strong> rules apply.
        </div>
    </div>
  );
};

