import React, { useState } from 'react';
import { ArrowRightLeft, Settings2 } from 'lucide-react';
import { ColorInput } from './components/ColorInput';
import { getContrast } from './utils/contrastUtils';

export const ContrastPage: React.FC = () => {
  const [fg, setFg] = useState('#e2e2e2');
  const [bg, setBg] = useState('#166534'); // Default to a nice green/white combo or similar
  const [isLargeText, setIsLargeText] = useState(false);

  // Calculate Contrast
  const ratio = getContrast(fg, bg);
  
  // Determine Status based on WCAG 2.1
  // Normal Text: AA >= 4.5, AAA >= 7
  // Large Text: AA >= 3, AAA >= 4.5
  let status = 'FAIL';
  let level = '';
  
  if (isLargeText) {
      if (ratio >= 4.5) { status = 'PASS'; level = 'AAA'; }
      else if (ratio >= 3) { status = 'PASS'; level = 'AA'; }
  } else {
      if (ratio >= 7) { status = 'PASS'; level = 'AAA'; }
      else if (ratio >= 4.5) { status = 'PASS'; level = 'AA'; }
  }

  const handleSwap = () => {
    setFg(bg);
    setBg(fg);
  };

  return (
    <div className="animate-fade-in" style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        minHeight: 'calc(100vh - 140px)', // Adjust for header/nav
        borderRadius: '16px',
        overflow: 'hidden',
        border: '1px solid rgba(0,0,0,0.1)'
    }}>
        {/* Top Bar - Minimal Inputs */}
        <div style={{ 
            padding: '16px 24px', 
            backgroundColor: 'white', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '24px',
            borderBottom: '1px solid rgba(0,0,0,0.05)'
        }}>
            <div style={{ flex: 1 }}>
                 <ColorInput label="Foreground" color={fg} onChange={setFg} />
            </div>
            
            <button 
                onClick={handleSwap} 
                className="btn-icon" 
                style={{ marginTop: '20px', flexShrink: 0 }}
                title="Swap Colors"
            >
                <ArrowRightLeft size={16} />
            </button>

            <div style={{ flex: 1 }}>
                <ColorInput label="Background" color={bg} onChange={setBg} />
            </div>
        </div>

        {/* Main Display Area */}
        <div style={{ 
            flex: 1, 
            backgroundColor: bg, 
            color: fg, 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            transition: 'all 0.2s ease',
            padding: '40px',
            position: 'relative'
        }}>
            {/* Ratio */}
            <div style={{ 
                fontSize: '120px', 
                fontWeight: 700, 
                lineHeight: 1,
                fontVariantNumeric: 'tabular-nums',
                letterSpacing: '-4px'
            }}>
                {ratio.toFixed(1)}
            </div>

            {/* Status */}
            <div style={{ 
                fontSize: '16px', 
                fontWeight: 600, 
                marginTop: '16px',
                letterSpacing: '2px',
                opacity: 0.8
            }}>
                {status} {status === 'PASS' && `(${level})`}
            </div>

            {/* Toggle Switch for Text Size */}
            <div style={{ marginTop: '60px' }}>
                 <button 
                    onClick={() => setIsLargeText(!isLargeText)}
                    style={{
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        borderRadius: '999px',
                        padding: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        border: 'none',
                        cursor: 'pointer',
                        width: '64px',
                        height: '36px',
                        position: 'relative',
                        transition: 'all 0.2s'
                    }}
                 >
                    <div style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        backgroundColor: 'white',
                        position: 'absolute',
                        left: isLargeText ? '32px' : '4px',
                        transition: 'all 0.2s cubic-bezier(0.4, 0.0, 0.2, 1)',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                    }} />
                 </button>
                 <div style={{ 
                     marginTop: '12px', 
                     fontSize: '12px', 
                     fontWeight: 500, 
                     opacity: 0.7,
                     textAlign: 'center' 
                 }}>
                     {isLargeText ? 'Large Text' : 'Normal Text'}
                 </div>
            </div>
        </div>
    </div>
  );
};
