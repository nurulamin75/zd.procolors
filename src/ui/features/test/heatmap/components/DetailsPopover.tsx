import React, { useEffect, useRef, useState } from 'react';
import { X, Wand2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { ColorToken } from '../../../../../utils/tokens';
import { getContrast, getAccessibleTextColor, getRating } from '../utils/calculateContrast';
import { suggestFix } from '../utils/wcagUtils';

interface DetailsPopoverProps {
  token: ColorToken;
  anchor: HTMLElement;
  onClose: () => void;
  onFix: (token: ColorToken, newHex: string) => void;
}

export const DetailsPopover: React.FC<DetailsPopoverProps> = ({ token, anchor, onClose, onFix }) => {
  const popoverRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (anchor && popoverRef.current) {
      const anchorRect = anchor.getBoundingClientRect();
      const popoverRect = popoverRef.current.getBoundingClientRect();
      
      // Position above the anchor by default
      let top = anchorRect.top - popoverRect.height - 12; // 12px gap
      let left = anchorRect.left + (anchorRect.width / 2) - (popoverRect.width / 2);

      // Check top boundary
      if (top < 10) {
        // Flip to bottom if not enough space on top
        top = anchorRect.bottom + 12;
      }

      // Check left/right boundaries
      const padding = 16;
      if (left < padding) left = padding;
      if (left + popoverRect.width > window.innerWidth - padding) {
        left = window.innerWidth - popoverRect.width - padding;
      }

      setPosition({ top, left });
    }
  }, [anchor, token]);

  // Click outside handling
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (popoverRef.current && !popoverRef.current.contains(event.target as Node) && !anchor.contains(event.target as Node)) {
            onClose();
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose, anchor]);

  const textColor = getAccessibleTextColor(token.value);
  const ratio = getContrast(textColor, token.value);
  const rating = getRating(ratio);
  const suggestedHex = !rating.passAA ? suggestFix(token.value, 'AA') : null;

  return (
    <div 
        ref={popoverRef}
        className="animate-fade-in"
        style={{
            position: 'fixed',
            top: position.top,
            left: position.left,
            width: '260px',
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
            border: '1px solid var(--color-border)',
            zIndex: 1000,
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
        }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>Token Details</h3>
        <button onClick={onClose} className="btn-icon" style={{ padding: '4px' }}><X size={16} /></button>
      </div>

      {/* Compact Preview */}
      <div style={{ 
        backgroundColor: token.value, 
        borderRadius: '8px', 
        padding: '16px', 
        color: textColor,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        border: '1px solid rgba(0,0,0,0.1)'
      }}>
        <div style={{ fontSize: '20px', fontWeight: 700, marginBottom: '4px' }}>Aa</div>
        <div style={{ fontSize: '12px', opacity: 0.9 }}>{token.name}</div>
        <div style={{ fontSize: '10px', opacity: 0.7 }}>{token.value}</div>
      </div>

      {/* Compact Stats */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
          <span style={{ color: 'var(--color-text-secondary)' }}>Ratio: <strong style={{ color: 'var(--color-text-primary)' }}>{ratio.toFixed(2)}:1</strong></span>
          <span style={{ 
            padding: '2px 6px', 
            borderRadius: '4px', 
            backgroundColor: `${rating.color}20`, 
            color: rating.color, 
            fontSize: '10px', 
            fontWeight: 700 
          }}>
            {rating.label}
          </span>
      </div>

      {/* Fix Action */}
      {suggestedHex && (
        <div style={{ 
          padding: '12px', 
          backgroundColor: '#fffbeb', 
          border: '1px solid #fcd34d', 
          borderRadius: '8px',
          fontSize: '12px'
        }}>
          <div style={{ display: 'flex', gap: '6px', marginBottom: '8px', alignItems: 'center' }}>
            <AlertTriangle size={14} color="#d97706" />
            <span style={{ fontWeight: 500, color: '#92400e' }}>Low Contrast</span>
          </div>
          
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
             <div style={{ width: '24px', height: '24px', backgroundColor: suggestedHex, borderRadius: '4px', border: '1px solid rgba(0,0,0,0.1)' }} />
             <span style={{ color: '#b45309' }}>Try <strong>{suggestedHex}</strong></span>
          </div>

          <button 
            onClick={() => onFix(token, suggestedHex)}
            className="btn btn-primary" 
            style={{ width: '100%', justifyContent: 'center', fontSize: '12px', padding: '6px 12px', height: 'auto' }}
          >
            <Wand2 size={12} style={{ marginRight: '6px' }} /> Apply Fix
          </button>
        </div>
      )}

      {!suggestedHex && rating.passAA && (
         <div style={{ 
            padding: '8px 12px', 
            backgroundColor: '#f0fdf4', 
            border: '1px solid #bbf7d0', 
            borderRadius: '8px',
            display: 'flex',
            gap: '8px',
            alignItems: 'center',
            fontSize: '12px'
          }}>
            <CheckCircle2 size={14} color="#16a34a" />
            <span style={{ color: '#15803d', fontWeight: 500 }}>Accessible</span>
         </div>
      )}

    </div>
  );
};

