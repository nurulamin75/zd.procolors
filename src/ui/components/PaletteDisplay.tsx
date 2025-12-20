import React, { useState, useEffect } from 'react';
import { ColorToken, getTextColor } from '../../utils/color';
import { Copy, MoreVertical, Plus, Minus } from 'lucide-react';
import { formatShadeName } from '../../utils/naming';
import { getSettings } from '../../utils/settings';

interface PaletteDisplayProps {
  paletteName: string;
  tokens: ColorToken[];
  onAddShade?: (position: 'start' | 'end') => void;
  onRemoveShade?: (position: 'start' | 'end') => void;
}

export const PaletteDisplay: React.FC<PaletteDisplayProps> = ({ paletteName, tokens, onAddShade, onRemoveShade }) => {
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showRemoveMenu, setShowRemoveMenu] = useState(false);
  const [settings, setSettings] = useState(() => getSettings());

  // Listen for settings changes
  useEffect(() => {
    const handleSettingsChange = () => {
      setSettings(getSettings());
    };

    // Listen for storage events (settings saved in localStorage)
    window.addEventListener('storage', handleSettingsChange);
    
    // Listen for custom settings-changed event
    window.addEventListener('settings-changed', handleSettingsChange as EventListener);

    return () => {
      window.removeEventListener('storage', handleSettingsChange);
      window.removeEventListener('settings-changed', handleSettingsChange as EventListener);
    };
  }, []);

  const handleCopy = (value: string) => {
    const textArea = document.createElement("textarea");
    textArea.value = value;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("copy");
    document.body.removeChild(textArea);
    
    setCopiedToken(value);
    setTimeout(() => setCopiedToken(null), 1500);
  };

  return (
    <div className="section-card" style={{ padding: '12px 24px 24px 24px', position: 'relative', overflow: 'visible' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', position: 'relative', zIndex: 1 }} onClick={(e) => e.stopPropagation()}>
        <h3 style={{ textTransform: 'capitalize', fontSize: '18px', fontWeight: 700 }}>
          {paletteName}
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', position: 'relative', zIndex: 100 }}>
        <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>{tokens.length} shades</span>
             {onAddShade && (
                 <div style={{ position: 'relative', zIndex: 100 }}>
                     <button 
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          console.log('Add shade button clicked');
                          setShowAddMenu(!showAddMenu);
                        }}
                        className="btn-icon"
                        style={{ 
                            padding: '4px', 
                            width: '24px', 
                            height: '24px', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            border: '1px solid var(--color-border)',
                            borderRadius: '100px',
                            position: 'relative',
                            zIndex: 101,
                            cursor: 'pointer',
                            backgroundColor: 'transparent'
                        }}
                     >
                        <Plus size={14} />
                     </button>
                     {showAddMenu && (
                         <div style={{
                             position: 'absolute',
                             top: '100%',
                             right: 0,
                             marginTop: '4px',
                             background: 'white',
                             border: '1px solid var(--color-border)',
                             borderRadius: '6px',
                             boxShadow: 'var(--shadow-md)',
                             zIndex: 1000,
                             minWidth: '140px',
                             overflow: 'hidden'
                         }}>
                             <button 
                                type="button"
                                onClick={(e) => { 
                                  e.preventDefault();
                                  e.stopPropagation();
                                  console.log('Add shade start clicked', onAddShade);
                                  setShowAddMenu(false);
                                  if (onAddShade) {
                                    setTimeout(() => {
                                      onAddShade('start');
                                    }, 0);
                                  } else {
                                    console.error('onAddShade handler is not defined!');
                                  }
                                }}
                                style={{ 
                                  display: 'block', 
                                  width: '100%', 
                                  textAlign: 'left', 
                                  padding: '8px 12px', 
                                  fontSize: '12px', 
                                  border: 'none', 
                                  background: 'transparent', 
                                  cursor: 'pointer', 
                                  color: 'var(--color-text-primary)',
                                  position: 'relative',
                                  zIndex: 1002
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-bg-hover)'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                             >
                                Add lighter (start)
                             </button>
                             <button 
                                type="button"
                                onClick={(e) => { 
                                  e.preventDefault();
                                  e.stopPropagation();
                                  console.log('Add shade end clicked', onAddShade);
                                  setShowAddMenu(false);
                                  if (onAddShade) {
                                    setTimeout(() => {
                                      onAddShade('end');
                                    }, 0);
                                  } else {
                                    console.error('onAddShade handler is not defined!');
                                  }
                                }}
                                style={{ 
                                  display: 'block', 
                                  width: '100%', 
                                  textAlign: 'left', 
                                  padding: '8px 12px', 
                                  fontSize: '12px', 
                                  border: 'none', 
                                  background: 'transparent', 
                                  cursor: 'pointer', 
                                  color: 'var(--color-text-primary)',
                                  position: 'relative',
                                  zIndex: 1002
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-bg-hover)'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                             >
                                Add darker (end)
                             </button>
                         </div>
                     )}
                     {showAddMenu && (
                         <div 
                            style={{ 
                              position: 'fixed', 
                              inset: 0, 
                              zIndex: 998,
                              backgroundColor: 'transparent'
                            }} 
                            onClick={(e) => {
                              if (e.target === e.currentTarget) {
                                setShowAddMenu(false);
                              }
                            }} 
                         />
                     )}
                 </div>
             )}
             {onRemoveShade && tokens.length > 3 && (
                 <div style={{ position: 'relative', zIndex: 100 }}>
                     <button 
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          console.log('Remove shade button clicked');
                          setShowRemoveMenu(!showRemoveMenu);
                        }}
                        className="btn-icon"
                        style={{ 
                            padding: '4px', 
                            width: '24px', 
                            height: '24px', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            border: '1px solid var(--color-border)',
                            borderRadius: '100px',
                            position: 'relative',
                            zIndex: 101,
                            cursor: 'pointer',
                            backgroundColor: 'transparent'
                        }}
                     >
                        <Minus size={14} />
                     </button>
                     {showRemoveMenu && (
                         <div 
                            onClick={(e) => e.stopPropagation()}
                            style={{
                             position: 'absolute',
                             top: '100%',
                             right: 0,
                             marginTop: '4px',
                             background: 'white',
                             border: '1px solid var(--color-border)',
                             borderRadius: '6px',
                             boxShadow: 'var(--shadow-md)',
                             zIndex: 1001,
                             minWidth: '140px',
                             overflow: 'hidden'
                         }}>
                             <button 
                                type="button"
                                onClick={(e) => { 
                                  e.preventDefault();
                                  e.stopPropagation();
                                  console.log('Remove shade start clicked', onRemoveShade);
                                  setShowRemoveMenu(false);
                                  if (onRemoveShade) {
                                    setTimeout(() => {
                                      onRemoveShade('start');
                                    }, 0);
                                  } else {
                                    console.error('onRemoveShade handler is not defined!');
                                  }
                                }}
                                style={{ 
                                  display: 'block', 
                                  width: '100%', 
                                  textAlign: 'left', 
                                  padding: '8px 12px', 
                                  fontSize: '12px', 
                                  border: 'none', 
                                  background: 'transparent', 
                                  cursor: 'pointer', 
                                  color: 'var(--color-text-primary)',
                                  position: 'relative',
                                  zIndex: 1002
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-bg-hover)'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                             >
                                Remove lighter
                             </button>
                             <button 
                                type="button"
                                onClick={(e) => { 
                                  e.preventDefault();
                                  e.stopPropagation();
                                  console.log('Remove shade end clicked', onRemoveShade);
                                  setShowRemoveMenu(false);
                                  if (onRemoveShade) {
                                    setTimeout(() => {
                                      onRemoveShade('end');
                                    }, 0);
                                  } else {
                                    console.error('onRemoveShade handler is not defined!');
                                  }
                                }}
                                style={{ 
                                  display: 'block', 
                                  width: '100%', 
                                  textAlign: 'left', 
                                  padding: '8px 12px', 
                                  fontSize: '12px', 
                                  border: 'none', 
                                  background: 'transparent', 
                                  cursor: 'pointer', 
                                  color: 'var(--color-text-primary)',
                                  position: 'relative',
                                  zIndex: 1002
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-bg-hover)'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                             >
                                Remove darker
                             </button>
                         </div>
                     )}
                     {showRemoveMenu && (
                         <div 
                            style={{ 
                              position: 'fixed', 
                              inset: 0, 
                              zIndex: 998,
                              backgroundColor: 'transparent'
                            }} 
                            onClick={(e) => {
                              if (e.target === e.currentTarget) {
                                setShowRemoveMenu(false);
                              }
                            }} 
                         />
                     )}
                 </div>
             )}
        </div>
      </div>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', 
        gap: '16px' 
      }}>
        {tokens.map((token) => {
          const textColor = getTextColor(token.value);
          const isCopied = copiedToken === token.value;
          
          return (
            <div key={token.shade} style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                <div 
                  className="color-chip"
                  onClick={() => handleCopy(token.value)}
                  style={{ 
                    width: '100%',
                    height: '120px', // More horizontal/squarish
                    backgroundColor: token.value, 
                    color: textColor,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '8px',
                    // boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.05)',
                    position: 'relative'
                  }}
                  title={`Click to copy ${token.value}`}
                >
                    {isCopied && <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '10px', fontWeight: 600 }}>COPIED</div>}
                </div>
                
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                      {formatShadeName(paletteName, token.shade, settings.namingConvention, settings.customNamingPattern)}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '2px', fontFamily: 'monospace' }}>{token.value}</div>
                </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// New Component for the "Table List" view shown in Image 2 (Top part)
interface TokenTableProps {
    palettes: Record<string, ColorToken[]>;
}

export const TokenTable: React.FC<TokenTableProps> = ({ palettes }) => {
    return (
        <div className="section-card" style={{ padding: '0', overflow: 'hidden', border: '1px solid var(--color-border)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ borderBottom: '1px solid var(--color-border)', backgroundColor: '#f8fafc' }}>
                        <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Token Name</th>
                        <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Preview</th>
                        <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Value (Hex)</th>
                        <th style={{ padding: '16px 24px', textAlign: 'right', fontSize: '11px', fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {Object.entries(palettes).map(([name, tokens]) => {
                        const baseToken = tokens.find(t => t.shade === 500) || tokens[Math.floor(tokens.length / 2)];
                        if (!baseToken) return null;
                        
                        return (
                            <tr key={name} style={{ borderBottom: '1px solid var(--color-border)' }}>
                                <td style={{ padding: '20px 24px' }}>
                                    <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '4px' }}>{name}</div>
                                    <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Base color for {name} tokens</div>
                                </td>
                                <td style={{ padding: '20px 24px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: baseToken.value, boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.1)' }}></div>
                                        <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>100%</span>
                                    </div>
                                </td>
                                <td style={{ padding: '20px 24px' }}>
                                    <div style={{ 
                                        display: 'inline-block', 
                                        padding: '6px 10px', 
                                        backgroundColor: 'white', 
                                        border: '1px solid var(--color-border)', 
                                        borderRadius: '6px',
                                        fontFamily: 'monospace',
                                        fontSize: '13px',
                                        color: 'var(--color-text-primary)'
                                    }}>
                                        {baseToken.value}
                                    </div>
                                </td>
                                <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                        <button className="btn-icon"><Copy size={16} /></button>
                                        <button className="btn-icon"><MoreVertical size={16} /></button>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    )
}
