import React from 'react';
import { getContrast, getAccessibleTextColor, getRating } from '../utils/calculateContrast';
import { ColorToken } from '../../../../../utils/tokens';
import { Wand2 } from 'lucide-react';

interface HeatmapBlockProps {
  token: ColorToken;
  onSelect: (token: ColorToken, anchor: HTMLElement) => void;
}

export const HeatmapBlock: React.FC<HeatmapBlockProps> = ({ token, onSelect }) => {
  const textColor = getAccessibleTextColor(token.value);
  const ratio = getContrast(textColor, token.value);
  const rating = getRating(ratio);

  // Overlay color based on rating status
  // We want a subtle indicator.
  // Maybe a border color?
  const borderColor = rating.color;

  return (
    <div 
      onClick={(e) => onSelect(token, e.currentTarget)}
      style={{
        backgroundColor: token.value,
        borderRadius: '8px',
        height: '60px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        cursor: 'pointer',
        border: `2px solid ${borderColor}40`, // Subtle border indicator
        transition: 'transform 0.1s ease',
        overflow: 'hidden'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.05)';
        e.currentTarget.style.zIndex = '10';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.zIndex = '1';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <span style={{ 
        fontSize: '12px', 
        fontWeight: 700, 
        color: textColor,
        opacity: 0.9
      }}>
        {token.shade}
      </span>
      <span style={{ 
        fontSize: '10px', 
        color: textColor, 
        opacity: 0.7,
        marginTop: '2px'
      }}>
        {ratio.toFixed(1)}
      </span>

      {/* Hover fix icon? Or status dot? */}
      {!rating.passAA && (
         <div style={{ 
             position: 'absolute', 
             top: '4px', 
             right: '4px', 
             width: '6px', 
             height: '6px', 
             borderRadius: '50%', 
             backgroundColor: '#ef4444',
             border: '1px solid white'
         }} />
      )}
    </div>
  );
};

