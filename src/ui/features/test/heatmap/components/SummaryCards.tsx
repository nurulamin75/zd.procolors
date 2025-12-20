import React from 'react';
import { SystemScore } from '../utils/shadeEvaluator';

interface SummaryCardsProps {
  score: SystemScore;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ score }) => {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '24px' }}>
      <div className="section-card" style={{ padding: '20px' }}>
        <h4 style={{ margin: '0 0 16px 0', fontSize: '14px' }}>Contrast Coverage</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
           <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
             <span style={{ color: 'var(--color-text-secondary)' }}>AAA Pass</span>
             <span style={{ fontWeight: 600 }}>{score.aaaPassPercentage}%</span>
           </div>
           <div style={{ width: '100%', height: '6px', backgroundColor: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ width: `${score.aaaPassPercentage}%`, height: '100%', backgroundColor: 'var(--color-success)' }} />
           </div>
           
           <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
             <span style={{ color: 'var(--color-text-secondary)' }}>AA Pass</span>
             <span style={{ fontWeight: 600 }}>{score.aaPassPercentage}%</span>
           </div>
           <div style={{ width: '100%', height: '6px', backgroundColor: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ width: `${score.aaPassPercentage}%`, height: '100%', backgroundColor: 'var(--color-primary)' }} />
           </div>
        </div>
      </div>

      <div className="section-card" style={{ padding: '20px' }}>
        <h4 style={{ margin: '0 0 16px 0', fontSize: '14px' }}>Issues</h4>
        <div style={{ textAlign: 'center', padding: '12px 0' }}>
           <div style={{ fontSize: '32px', fontWeight: 700, color: score.failedCount > 0 ? 'var(--color-error)' : 'var(--color-success)' }}>
             {score.failedCount}
           </div>
           <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>Colors failing AA</div>
        </div>
      </div>
    </div>
  );
};

