import React from 'react';
import { SystemScore } from '../utils/shadeEvaluator';
import { AlertCircle, CheckCircle2, Check } from 'lucide-react';

interface ScoreCardProps {
  score: SystemScore;
}

export const ScoreCard: React.FC<ScoreCardProps> = ({ score }) => {
  return (
    <div className="section-card" style={{ display: 'flex', gap: '24px', alignItems: 'center', padding: '24px' }}>
      
      {/* Grade Circle */}
      <div style={{ 
        width: '80px', 
        height: '80px', 
        borderRadius: '50%', 
        border: `4px solid ${score.gradeColor}20`, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: 'white',
        flexShrink: 0
      }}>
        <span style={{ fontSize: '32px', fontWeight: 700, color: score.gradeColor }}>
          {score.grade}
        </span>
      </div>

      <div style={{ flex: 1 }}>
        <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '4px' }}>Overall Score</h3>
        <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', margin: 0, marginBottom: '12px' }}>
          {score.summary}
        </p>
        
        <div style={{ display: 'flex', gap: '24px' }}>
           <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', textTransform: 'uppercase', fontWeight: 600 }}>Avg. Ratio</span>
              <span style={{ fontSize: '16px', fontWeight: 600 }}>{score.avgContrast}:1</span>
           </div>
           <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', textTransform: 'uppercase', fontWeight: 600 }}>AA Pass</span>
              <span style={{ fontSize: '16px', fontWeight: 600, color: score.aaPassPercentage > 80 ? 'var(--color-success)' : 'var(--color-warning)' }}>
                {score.aaPassPercentage}%
              </span>
           </div>
           <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', textTransform: 'uppercase', fontWeight: 600 }}>Total Colors</span>
              <span style={{ fontSize: '16px', fontWeight: 600 }}>{score.totalTested}</span>
           </div>
        </div>
      </div>

    </div>
  );
};

