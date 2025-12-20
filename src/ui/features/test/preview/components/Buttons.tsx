import React from 'react';
import { ColorToken } from '../../../../../utils/tokens';
import { ArrowRight, Trash2, Settings, Search, Download } from 'lucide-react';

interface PreviewComponentProps {
  palettes: Record<string, ColorToken[]>;
}

const getColor = (palettes: Record<string, ColorToken[]>, name: string, shade: number = 500) => {
  const palette = palettes[name];
  if (!palette) return '#ccc';
  const token = palette.find(t => t.shade === shade);
  return token ? token.value : '#ccc';
};

export const PreviewButtons: React.FC<PreviewComponentProps> = ({ palettes }) => {
  const primary = getColor(palettes, 'primary', 500);
  const primaryHover = getColor(palettes, 'primary', 600);
  const secondary = getColor(palettes, 'secondary', 500);
  const error = getColor(palettes, 'error', 500);
  const errorBg = getColor(palettes, 'error', 50);
  
  const btnBase = {
    padding: '10px 16px',
    borderRadius: '8px',
    fontWeight: 500,
    fontSize: '14px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    border: 'none',
    transition: 'all 0.2s'
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <button style={{ ...btnBase, backgroundColor: primary, color: 'white' }}>
          Primary
        </button>
        <button style={{ ...btnBase, backgroundColor: secondary, color: 'white' }}>
          Secondary
        </button>
        <button style={{ ...btnBase, backgroundColor: 'transparent', border: `1px solid ${primary}`, color: primary }}>
          Outline
        </button>
        <button style={{ ...btnBase, backgroundColor: 'transparent', color: primary }}>
          Ghost
        </button>
      </div>
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
         <button style={{ ...btnBase, backgroundColor: errorBg, color: error }}>
          <Trash2 size={16} /> Destructive
        </button>
        <button style={{ ...btnBase, padding: '10px', backgroundColor: primary, color: 'white' }}>
          <Settings size={18} />
        </button>
        <button style={{ ...btnBase, backgroundColor: primary, color: 'white' }}>
          <Search size={16} /> Leading Icon
        </button>
        <button style={{ ...btnBase, backgroundColor: secondary, color: 'white' }}>
          Trailing Icon <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};

