import React from 'react';
import { History, RotateCcw } from 'lucide-react';

interface HistoryItem {
  fg: string;
  bg: string;
  ratio: number;
}

interface HistoryListProps {
  history: HistoryItem[];
  onSelect: (fg: string, bg: string) => void;
  onClear: () => void;
}

export const HistoryList: React.FC<HistoryListProps> = ({ history, onSelect, onClear }) => {
  if (history.length === 0) return null;

  return (
    <div style={{ marginTop: '32px', borderTop: '1px solid var(--color-border-light)', paddingTop: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <History size={16} color="var(--color-text-secondary)" />
                <h4 style={{ margin: 0, fontSize: '14px', color: 'var(--color-text-primary)' }}>Recent</h4>
            </div>
            <button onClick={onClear} className="btn-icon" title="Clear History">
                <RotateCcw size={12} />
            </button>
        </div>
        
        <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '4px' }}>
            {history.map((item, idx) => (
                <div 
                    key={idx}
                    onClick={() => onSelect(item.fg, item.bg)}
                    style={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center', 
                        gap: '4px', 
                        cursor: 'pointer',
                        minWidth: '48px'
                    }}
                >
                    <div style={{ 
                        width: '32px', 
                        height: '32px', 
                        borderRadius: '50%', 
                        backgroundColor: item.bg, 
                        border: '2px solid white',
                        boxShadow: '0 0 0 1px var(--color-border)',
                        position: 'relative'
                    }}>
                        <div style={{ 
                            width: '14px', 
                            height: '14px', 
                            borderRadius: '50%', 
                            backgroundColor: item.fg,
                            position: 'absolute',
                            bottom: '-2px',
                            right: '-2px',
                            border: '1px solid white'
                        }} />
                    </div>
                    <span style={{ fontSize: '10px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
                        {item.ratio.toFixed(1)}
                    </span>
                </div>
            ))}
        </div>
    </div>
  );
};

