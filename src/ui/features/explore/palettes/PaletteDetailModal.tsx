import React, { useMemo } from 'react';
import { Palette, TRENDING_PALETTES } from './data';
import { X, Copy, Check, MoreHorizontal, Eye } from 'lucide-react';
import { checkAccessibility } from '../../../../utils/contrast';
import { copyToClipboard } from '../../../../utils/export';

interface PaletteDetailPanelProps {
  palette: Palette;
  onClose: () => void;
}

export const PaletteDetailPanel: React.FC<PaletteDetailPanelProps> = ({ palette, onClose }) => {
  // Memoize similar palettes to avoid reshuffling on every render
  const similarPalettes = useMemo(() => {
    return TRENDING_PALETTES
      .filter(p => p.name !== palette.name)
      .sort(() => 0.5 - Math.random())
      .slice(0, 4);
  }, [palette.name]);

  const accessibilityScores = useMemo(() => {
    const primary = palette.colors[0];
    const onWhite = checkAccessibility(primary, '#FFFFFF');
    const onBlack = checkAccessibility(primary, '#000000');
    
    return { onWhite, onBlack };
  }, [palette.colors]);

  return (
    <div className="animate-fade-in" style={{
      width: '380px', // Fixed width for sidebar
      height: '100%',
      backgroundColor: 'white',
      borderLeft: '1px solid var(--color-border)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      position: 'sticky',
      top: 0,
      right: 0,
      flexShrink: 0
    }}>
        
      {/* Header - Color Bars */}
      <div style={{ height: '120px', display: 'flex', position: 'relative', flexShrink: 0 }}>
        {palette.colors.map((color, i) => (
          <div key={i} style={{ flex: 1, backgroundColor: color }} />
        ))}
        
        {/* Controls Overlay */}
        <div style={{ 
          position: 'absolute', 
          top: '12px', 
          right: '12px', 
          display: 'flex', 
          gap: '8px' 
        }}>
          <button 
            className="btn-icon" 
            onClick={onClose}
            style={{ 
              background: 'white', 
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              width: '28px',
              height: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%'
            }}
            title="Close"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
        
        {/* Title & Description */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
             <h1 style={{ fontSize: '20px', margin: 0, fontWeight: 700 }}>{palette.name}</h1>
             <div style={{ display: 'flex', gap: '4px' }}>
                <button 
                  className="btn-icon" 
                  title="More options"
                  style={{ padding: '4px' }}
                >
                  <MoreHorizontal size={18} />
                </button>
             </div>
          </div>
          
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
            {palette.description || "A beautiful selection of harmonious colors suitable for modern interfaces and creative projects."}
          </p>
        </div>

        <div style={{ height: '1px', background: 'var(--color-border-light)', marginBottom: '24px' }}></div>

        {/* Colors List */}
        <section style={{ marginBottom: '32px' }}>
          <h3 style={{ fontSize: '16px', marginBottom: '12px', fontWeight: 600 }}>Colors</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {(palette.colorDetails || palette.colors.map((c, i) => ({ 
                hex: c, 
                name: `Color ${i+1}`, 
                description: 'Harmonious shade' 
            }))).map((color, i) => (
              <ColorRow key={i} color={color} />
            ))}
          </div>
        </section>

        {/* Tags Section */}
        {palette.tags && (
          <section style={{ marginBottom: '32px' }}>
             {palette.tags.psychology && (
               <div style={{ marginBottom: '16px' }}>
                 <h3 style={{ fontSize: '16px', marginBottom: '8px', fontWeight: 600 }}>Psychology</h3>
                 <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                   {palette.tags.psychology.map(tag => <Tag key={tag} label={tag} />)}
                 </div>
               </div>
             )}
             {/* Simplified tags for sidebar to save space */}
          </section>
        )}

        {/* Accessibility */}
        <section style={{ marginBottom: '32px' }}>
           <h3 style={{ fontSize: '16px', marginBottom: '12px', fontWeight: 600 }}>Accessibility</h3>
           
           <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <AccessibilityRow label="On White" score={accessibilityScores.onWhite.score} />
              <AccessibilityRow label="On Black" score={accessibilityScores.onBlack.score} />
           </div>
        </section>

        {/* Similar Palettes - Simplified grid */}
        <section>
           <h3 style={{ fontSize: '16px', marginBottom: '12px', fontWeight: 600 }}>Similar palettes</h3>
           <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {similarPalettes.map(p => (
                 <div key={p.name} style={{ 
                    background: 'var(--color-bg-hover)', 
                    borderRadius: '8px', 
                    padding: '8px',
                    cursor: 'pointer' 
                 }}>
                    <div style={{ display: 'flex', height: '24px', borderRadius: '4px', overflow: 'hidden', marginBottom: '6px' }}>
                      {p.colors.slice(0, 5).map(c => (
                        <div key={c} style={{ flex: 1, background: c }}></div>
                      ))}
                    </div>
                    <h4 style={{ margin: 0, fontSize: '12px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</h4>
                 </div>
              ))}
           </div>
        </section>

      </div>
    </div>
  );
};

const ColorRow: React.FC<{ color: { hex: string, name: string, description?: string } }> = ({ color }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    copyToClipboard(color.hex);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      padding: '8px', 
      background: 'var(--color-bg-hover)', 
      borderRadius: '6px'
    }}>
      <div style={{ 
        width: '32px', 
        height: '32px', 
        borderRadius: '6px', 
        backgroundColor: color.hex,
        marginRight: '12px',
        border: '1px solid rgba(0,0,0,0.05)'
      }}></div>
      
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontWeight: 600, fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{color.name}</span>
          <span style={{ 
             color: 'var(--color-text-secondary)', 
             fontSize: '12px', 
             fontFamily: 'monospace' 
          }}>{color.hex.toUpperCase()}</span>
        </div>
      </div>

      <button className="btn-icon" onClick={handleCopy} style={{ padding: '4px' }}>
        {copied ? <Check size={14} color="green" /> : <Copy size={14} />}
      </button>
    </div>
  );
};

const AccessibilityRow: React.FC<{ label: string, score: number }> = ({ label, score }) => (
    <div style={{ 
        background: 'var(--color-bg-hover)', 
        borderRadius: '6px', 
        padding: '10px 12px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    }}>
        <span style={{ fontSize: '13px', fontWeight: 500 }}>{label}</span>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', fontWeight: 600 }}>{score}:1</span>
            <Badge score={score} />
        </div>
    </div>
);

const Tag: React.FC<{ label: string }> = ({ label }) => (
  <span style={{ 
     padding: '4px 8px', 
     borderRadius: '4px', 
     background: '#e2e8f0', 
     fontSize: '11px', 
     color: '#334155',
     fontWeight: 500
  }}>
    {label}
  </span>
);

const Badge: React.FC<{ score: number }> = ({ score }) => {
  let bg = '#fee2e2';
  let color = '#b91c1c';
  let text = 'POOR';

  if (score >= 7) {
    bg = '#dcfce7';
    color = '#15803d';
    text = 'AAA';
  } else if (score >= 4.5) {
    bg = '#dcfce7';
    color = '#166534';
    text = 'AA';
  } else if (score >= 3) {
    bg = '#fef9c3';
    color = '#a16207';
    text = 'AA+';
  }

  return (
    <span style={{ 
      fontSize: '10px', 
      fontWeight: 700, 
      padding: '2px 6px', 
      borderRadius: '4px',
      background: bg,
      color: color
    }}>
      {text}
    </span>
  );
};
