import React from 'react';
import { Wand2, Copy, ArrowRight } from 'lucide-react';
import { suggestAccessibleColor, getContrast } from '../utils/contrastUtils';

interface SuggestedFixCardProps {
  fg: string;
  bg: string;
  onApply: (fg: string, bg: string) => void;
}

export const SuggestedFixCard: React.FC<SuggestedFixCardProps> = ({ fg, bg, onApply }) => {
  const suggestedFg = suggestAccessibleColor(fg, bg, 4.5);
  const suggestedBg = suggestAccessibleColor(bg, fg, 4.5); // Try adjusting BG as fallback

  // Prefer adjusting foreground first
  const suggestion = suggestedFg || suggestedBg;
  const isFgFix = !!suggestedFg;
  
  if (!suggestion) return null;

  const newRatio = isFgFix ? getContrast(suggestion, bg) : getContrast(fg, suggestion);

  return (
    <div className="card" style={{ 
        padding: '20px', 
        backgroundColor: '#fffbeb', 
        border: '1px solid #fcd34d',
        marginTop: '24px'
    }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <div style={{ padding: '8px', backgroundColor: '#fef3c7', borderRadius: '8px', color: '#d97706' }}>
                <Wand2 size={20} />
            </div>
            <div style={{ flex: 1 }}>
                <h4 style={{ margin: '0 0 4px 0', color: '#92400e', fontSize: '16px' }}>Contrast Issue Detected</h4>
                <p style={{ margin: 0, fontSize: '13px', color: '#b45309' }}>
                    The current contrast ratio fails WCAG AA. Try using this suggested color instead.
                </p>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ 
                            width: '32px', height: '32px', borderRadius: '6px', 
                            backgroundColor: isFgFix ? fg : bg, 
                            border: '1px solid rgba(0,0,0,0.1)' 
                        }} title="Original" />
                        <ArrowRight size={16} color="#d97706" />
                        <div style={{ 
                            width: '32px', height: '32px', borderRadius: '6px', 
                            backgroundColor: suggestion, 
                            border: '1px solid rgba(0,0,0,0.1)' 
                        }} title="Suggested" />
                    </div>
                    
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#92400e' }}>
                         New Ratio: {newRatio.toFixed(2)}:1
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                    <button 
                        className="btn btn-primary" 
                        onClick={() => onApply(isFgFix ? suggestion : fg, isFgFix ? bg : suggestion)}
                        style={{ backgroundColor: '#d97706', borderColor: '#d97706' }}
                    >
                        Apply Fix
                    </button>
                    <button 
                        className="btn btn-secondary"
                        onClick={() => {
                             const textArea = document.createElement("textarea");
                             textArea.value = suggestion;
                             document.body.appendChild(textArea);
                             textArea.select();
                             document.execCommand("copy");
                             document.body.removeChild(textArea);
                             parent.postMessage({ pluginMessage: { type: 'notify', message: `Copied ${suggestion}` } }, '*');
                        }}
                        style={{ backgroundColor: 'white' }}
                    >
                        <Copy size={14} style={{ marginRight: '6px' }} /> Copy {suggestion}
                    </button>
                </div>
            </div>
        </div>
    </div>
  );
};

