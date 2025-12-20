import React from 'react';
import { X, Check, Unlink, Replace, XCircle, Layers, Palette } from 'lucide-react';
import { ColorMatch } from '../../../../../colorLinker/matcher';
import { ReplacementResult, UndoState } from '../../../../../colorLinker/replacer';

interface SummaryModalProps {
  totalScanned: number;
  totalReplaced: number;
  matches: ColorMatch[];
  results: ReplacementResult[];
  unmatchedColors: Array<{
    nodeId: string;
    nodeName: string;
    property: 'fill' | 'stroke' | 'text';
    color: { r: number; g: number; b: number };
  }>;
  onApply: () => void;
  onUndo: () => void;
  onClose: () => void;
}

function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => {
    const hex = Math.round(n * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

export const SummaryModal: React.FC<SummaryModalProps> = ({
  totalScanned,
  totalReplaced,
  matches,
  results,
  unmatchedColors,
  onApply,
  onUndo,
  onClose
}) => {
  const matchedItems = matches.filter(m => m.isMatched);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div className="card animate-fade-in" style={{ 
        width: '600px', 
        maxHeight: '80vh', 
        display: 'flex', 
        flexDirection: 'column',
        padding: 0,
        overflow: 'hidden',
        backgroundColor: 'white',
        borderRadius: '16px',
        boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)'
      }}>
        {/* Header */}
        <div style={{ 
          padding: '20px 24px', 
          borderBottom: '1px solid var(--color-border-light)', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center' 
        }}>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>Color Linking Summary</h3>
          <button 
            className="btn-icon" 
            onClick={onClose}
            style={{ 
              width: '32px', 
              height: '32px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              borderRadius: '8px'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
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
                {totalScanned}
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
                {totalReplaced}
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
          {unmatchedColors.length > 0 && (
            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <XCircle size={16} color="#ef4444" />
                Unmatched Colors ({unmatchedColors.length})
              </h4>
              <div style={{ 
                maxHeight: '150px', 
                overflowY: 'auto', 
                border: '1px solid #fee2e2', 
                borderRadius: '8px',
                backgroundColor: '#fef2f2'
              }}>
                {unmatchedColors.slice(0, 30).map((unmatched, i) => (
                  <div key={i} style={{ 
                    padding: '8px 12px', 
                    borderBottom: i < unmatchedColors.length - 1 ? '1px solid #fee2e2' : 'none',
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
                {unmatchedColors.length > 30 && (
                  <div style={{ padding: '8px 12px', fontSize: '12px', color: 'var(--color-text-secondary)', textAlign: 'center' }}>
                    + {unmatchedColors.length - 30} more unmatched
                  </div>
                )}
              </div>
              <p style={{ fontSize: '12px', color: '#b91c1c', marginTop: '8px' }}>
                These colors couldn't be matched to any variable or style within the threshold.
              </p>
            </div>
          )}

          {matchedItems.length === 0 && unmatchedColors.length === 0 && (
            <div style={{ 
              padding: '24px', 
              textAlign: 'center', 
              color: 'var(--color-text-secondary)',
              backgroundColor: '#f8fafc',
              borderRadius: '8px'
            }}>
              <Unlink size={32} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
              <p style={{ margin: 0, fontSize: '14px' }}>No unlinked colors found in the selection.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ 
          padding: '20px 24px', 
          borderTop: '1px solid var(--color-border-light)', 
          display: 'flex', 
          justifyContent: 'flex-end', 
          gap: '12px' 
        }}>
          <button 
            className="btn btn-secondary" 
            onClick={onUndo}
            disabled={totalReplaced === 0}
            style={{ opacity: totalReplaced === 0 ? 0.5 : 1 }}
          >
            Undo
          </button>
          <button 
            className="btn btn-primary" 
            onClick={onApply}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

