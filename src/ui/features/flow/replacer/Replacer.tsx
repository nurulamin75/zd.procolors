import React, { useState, useEffect } from 'react';
import { Link2, Layers, Palette, Check, Replace, XCircle, Unlink } from 'lucide-react';
import { ColorMatch } from '../../../../colorLinker/matcher';
import { ReplacementResult, UndoState } from '../../../../colorLinker/replacer';
import { getSettings } from '../../../../utils/settings';

function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => {
    const hex = Math.round(n * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

export const Replacer: React.FC = () => {
  const [isLinking, setIsLinking] = useState(false);
  const [showPreferenceSelection, setShowPreferenceSelection] = useState(false);
  const [preference, setPreference] = useState<'variables' | 'styles' | null>(null);
  const [linkingResult, setLinkingResult] = useState<{
    totalScanned: number;
    totalReplaced: number;
    matches: ColorMatch[];
    results: ReplacementResult[];
    undoStates: UndoState[];
    unmatchedColors: Array<{
      nodeId: string;
      nodeName: string;
      property: 'fill' | 'stroke' | 'text';
      color: { r: number; g: number; b: number };
    }>;
  } | null>(null);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.pluginMessage) {
        const msg = event.data.pluginMessage;
        
        if (msg.type === 'link-colors-result') {
          setIsLinking(false);
          setLinkingResult(msg.result);
          setShowPreferenceSelection(false);
        } else if (msg.type === 'link-colors-error') {
          setIsLinking(false);
          // Show error toast (you can enhance this with a toast component)
          console.error('Linking error:', msg.error);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleScanAndLink = () => {
    // Check if there's a default preference from settings
    const settings = getSettings();
    if (settings.defaultLinkPreference) {
      // Auto-select the default preference
      handlePreferenceSelected(settings.defaultLinkPreference);
    } else {
      // Show preference selection inline
      setShowPreferenceSelection(true);
    }
  };

  const handlePreferenceSelected = (pref: 'variables' | 'styles') => {
    setPreference(pref);
    setIsLinking(true);
    
    // Get settings for threshold
    const settings = getSettings();
    const threshold = settings.colorMatchingThreshold || 10;
    
    parent.postMessage({ 
        pluginMessage: { 
            type: 'link-colors',
            scope: 'selection',
            preference: pref,
            threshold: threshold
        } 
    }, '*');
  };

  const handleUndo = () => {
    if (linkingResult?.undoStates) {
      parent.postMessage({
        pluginMessage: {
          type: 'undo-linking',
          undoStates: linkingResult.undoStates
        }
      }, '*');
      setLinkingResult(null);
      setPreference(null);
    }
  };

  const handleReset = () => {
    setLinkingResult(null);
    setPreference(null);
    setShowPreferenceSelection(false);
  };

  const matchedItems = linkingResult?.matches.filter(m => m.isMatched) || [];

  return (
    <div className="animate-fade-in">
      {/* Link Colors to Variables/Styles Section */}
      <div className="section-card" style={{ marginBottom: '24px' }}>
        <h2 className="section-title">Link Colors to Variables/Styles</h2>
        <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '24px' }}>
          Scan the selected frame for unlinked colors and automatically replace them with the closest matching variables or styles.
        </p>

        {!showPreferenceSelection && !linkingResult && (
          <button 
            className="btn btn-primary" 
            style={{ width: '100%' }} 
            onClick={handleScanAndLink}
            disabled={isLinking}
          >
            {isLinking ? (
              <>
                <span style={{ display: 'inline-block', marginRight: '8px' }}>Scanning...</span>
              </>
            ) : (
              <>
                <Link2 size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                Scan & Link Colors
              </>
            )}
          </button>
        )}
      </div>

      {/* Preference Selection - Inline */}
      {showPreferenceSelection && !linkingResult && (
        <div className="section-card" style={{ marginBottom: '24px' }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: 600 }}>Link Colors To</h3>
          <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '20px' }}>
            Choose whether to link colors to Variables or Styles:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button
              onClick={() => handlePreferenceSelected('variables')}
              className="btn"
              style={{
                width: '100%',
                padding: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                textAlign: 'left',
                backgroundColor: 'white',
                border: '2px solid var(--color-border)',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#3b82f6';
                e.currentTarget.style.backgroundColor = '#eff6ff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-border)';
                e.currentTarget.style.backgroundColor = 'white';
              }}
            >
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                backgroundColor: '#eff6ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Layers size={20} color="#3b82f6" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '4px' }}>Variables</div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                  Link colors to Figma Variables (recommended for design systems)
                </div>
              </div>
            </button>

            <button
              onClick={() => handlePreferenceSelected('styles')}
              className="btn"
              style={{
                width: '100%',
                padding: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                textAlign: 'left',
                backgroundColor: 'white',
                border: '2px solid var(--color-border)',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#3b82f6';
                e.currentTarget.style.backgroundColor = '#eff6ff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-border)';
                e.currentTarget.style.backgroundColor = 'white';
              }}
            >
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                backgroundColor: '#fef3c7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Palette size={20} color="#f59e0b" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '4px' }}>Styles</div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                  Link colors to Figma Paint Styles (traditional approach)
                </div>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Summary - Inline */}
      {linkingResult && (
        <div className="section-card">
          <h3 style={{ margin: '0 0 24px 0', fontSize: '18px', fontWeight: 600 }}>Color Linking Summary</h3>
          
          {/* Stats Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
            <div style={{ 
              padding: '16px', 
              backgroundColor: '#f8fafc', 
              borderRadius: '12px', 
              border: '1px solid #e2e8f0' 
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#64748b' }}>
                <Layers size={16} />
                <span style={{ fontSize: '12px', fontWeight: 600 }}>Nodes Scanned</span>
              </div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a' }}>
                {linkingResult.totalScanned}
              </div>
            </div>
            <div style={{ 
              padding: '16px', 
              backgroundColor: '#f0fdf4', 
              borderRadius: '12px', 
              border: '1px solid #bbf7d0' 
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#64748b' }}>
                <Check size={16} color="#22c55e" />
                <span style={{ fontSize: '12px', fontWeight: 600 }}>Colors Replaced</span>
              </div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#15803d' }}>
                {linkingResult.totalReplaced}
              </div>
            </div>
          </div>

          {/* Matched Colors */}
          {matchedItems.length > 0 && (
            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Replace size={16} color="#3b82f6" />
                Matched Colors ({matchedItems.length})
              </h4>
              <div style={{ 
                maxHeight: '200px', 
                overflowY: 'auto', 
                border: '1px solid var(--color-border)', 
                borderRadius: '8px',
                backgroundColor: '#f8fafc'
              }}>
                {matchedItems.slice(0, 50).map((match, i) => (
                  <div key={i} style={{ 
                    padding: '10px 12px', 
                    borderBottom: i < matchedItems.length - 1 ? '1px solid var(--color-border-light)' : 'none',
                    fontSize: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    <div style={{ 
                      width: '24px', 
                      height: '24px', 
                      borderRadius: '4px', 
                      backgroundColor: rgbToHex(match.originalColor.r, match.originalColor.g, match.originalColor.b),
                      border: '1px solid rgba(0,0,0,0.1)',
                      flexShrink: 0
                    }}></div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {match.nodeName}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span>{match.property} → {match.matchedVariable?.name || match.matchedStyle?.name || 'Unknown'}</span>
                        {match.isCloseMatch && (
                          <span style={{ 
                            fontSize: '9px', 
                            color: '#f59e0b',
                            fontWeight: 500
                          }}>
                            (close match)
                          </span>
                        )}
                      </div>
                    </div>
                    <div style={{ 
                      fontSize: '10px', 
                      color: match.isCloseMatch ? '#f59e0b' : 'var(--color-text-tertiary)',
                      fontFamily: 'monospace',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      {match.isCloseMatch && (
                        <span style={{ fontSize: '9px' }}>⚠️</span>
                      )}
                      ΔE: {match.deltaE.toFixed(1)}
                    </div>
                  </div>
                ))}
                {matchedItems.length > 50 && (
                  <div style={{ padding: '8px 12px', fontSize: '12px', color: 'var(--color-text-secondary)', textAlign: 'center' }}>
                    + {matchedItems.length - 50} more matches
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Unmatched Colors */}
          {linkingResult.unmatchedColors.length > 0 && (
            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <XCircle size={16} color="#ef4444" />
                Unmatched Colors ({linkingResult.unmatchedColors.length})
              </h4>
              <div style={{ 
                maxHeight: '150px', 
                overflowY: 'auto', 
                border: '1px solid #fee2e2', 
                borderRadius: '8px',
                backgroundColor: '#fef2f2'
              }}>
                {linkingResult.unmatchedColors.slice(0, 30).map((unmatched, i) => (
                  <div key={i} style={{ 
                    padding: '8px 12px', 
                    borderBottom: i < linkingResult.unmatchedColors.length - 1 ? '1px solid #fee2e2' : 'none',
                    fontSize: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    <div style={{ 
                      width: '20px', 
                      height: '20px', 
                      borderRadius: '4px', 
                      backgroundColor: rgbToHex(unmatched.color.r, unmatched.color.g, unmatched.color.b),
                      border: '1px solid rgba(0,0,0,0.1)',
                      flexShrink: 0
                    }}></div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {unmatched.nodeName}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>
                        {unmatched.property} • {rgbToHex(unmatched.color.r, unmatched.color.g, unmatched.color.b)}
                      </div>
                    </div>
                  </div>
                ))}
                {linkingResult.unmatchedColors.length > 30 && (
                  <div style={{ padding: '8px 12px', fontSize: '12px', color: 'var(--color-text-secondary)', textAlign: 'center' }}>
                    + {linkingResult.unmatchedColors.length - 30} more unmatched
                  </div>
                )}
              </div>
              <p style={{ fontSize: '12px', color: '#b91c1c', marginTop: '8px' }}>
                These colors couldn't be matched to any variable or style within the threshold.
              </p>
            </div>
          )}

          {matchedItems.length === 0 && linkingResult.unmatchedColors.length === 0 && (
            <div style={{ 
              padding: '24px', 
              textAlign: 'center', 
              color: 'var(--color-text-secondary)',
              backgroundColor: '#f8fafc',
              borderRadius: '8px',
              marginBottom: '24px'
            }}>
              <Unlink size={32} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
              <p style={{ margin: 0, fontSize: '14px' }}>No unlinked colors found in the selection.</p>
            </div>
          )}

          {/* Footer Actions */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'flex-end', 
            gap: '12px',
            paddingTop: '20px',
            borderTop: '1px solid var(--color-border-light)'
          }}>
            <button 
              className="btn btn-secondary" 
              onClick={handleUndo}
              disabled={linkingResult.totalReplaced === 0}
              style={{ opacity: linkingResult.totalReplaced === 0 ? 0.5 : 1 }}
            >
              Undo
            </button>
            <button 
              className="btn btn-primary" 
              onClick={handleReset}
            >
              Start New Scan
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

