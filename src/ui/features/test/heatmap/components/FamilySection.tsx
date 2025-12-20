import React from 'react';
import { ColorToken } from '../../../../../utils/tokens';
import { HeatmapBlock } from './HeatmapBlock';
import { ChevronRight } from 'lucide-react';

interface FamilySectionProps {
  name: string;
  tokens: ColorToken[];
  onSelectToken: (token: ColorToken, anchor: HTMLElement) => void;
}

export const FamilySection: React.FC<FamilySectionProps> = ({ name, tokens, onSelectToken }) => {
  return (
    <div style={{ marginBottom: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h4 style={{ textTransform: 'capitalize', margin: 0, fontSize: '14px', color: 'var(--color-text-primary)' }}>
          {name}
        </h4>
        <button 
          style={{ 
            background: 'none', 
            border: 'none', 
            color: 'var(--color-primary)', 
            fontSize: '12px', 
            cursor: 'pointer', 
            display: 'flex', 
            alignItems: 'center',
            fontWeight: 500
          }}
        >
          Details <ChevronRight size={14} />
        </button>
      </div>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(60px, 1fr))', 
        gap: '8px' 
      }}>
        {tokens.map(t => (
          <HeatmapBlock key={t.shade} token={t} onSelect={onSelectToken} />
        ))}
      </div>
    </div>
  );
};

