import React from 'react';
import { Check, X } from 'lucide-react';
import { getWcagStatus, getScoreData } from '../utils/wcag';

interface ScoreCardProps {
  ratio: number;
  fontSize: number;
  isBold: boolean;
}

export const ScoreCard: React.FC<ScoreCardProps> = ({ ratio, fontSize, isBold }) => {
  const isLargeText = fontSize >= 18 || (fontSize >= 14 && isBold);
  const { aa, aaa } = getWcagStatus(ratio);

  const renderScore = (label: string, pass: boolean, req: number) => (
    <div style={{ 
        flex: 1, 
        padding: '16px', 
        borderRadius: '12px', 
        backgroundColor: pass ? '#f0fdf4' : '#fef2f2',
        border: `1px solid ${pass ? '#bbf7d0' : '#fecaca'}`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px'
    }}>
        <div style={{ fontSize: '12px', fontWeight: 600, color: pass ? '#166534' : '#991b1b' }}>
            {label}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {pass ? <Check size={20} color="#16a34a" /> : <X size={20} color="#dc2626" />}
            <span style={{ fontSize: '20px', fontWeight: 700, color: pass ? '#15803d' : '#b91c1c' }}>
                {pass ? 'PASS' : 'FAIL'}
            </span>
        </div>
        <div style={{ fontSize: '11px', color: pass ? '#166534' : '#991b1b', opacity: 0.8 }}>
            Requires {req}:1
        </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Main Ratio */}
        <div className="card" style={{ padding: '24px', textAlign: 'center' }}>
            <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>
                Contrast Ratio
            </div>
            <div style={{ fontSize: '48px', fontWeight: 800, color: 'var(--color-text-primary)', lineHeight: 1 }}>
                {ratio.toFixed(2)}
            </div>
            <div style={{ fontSize: '14px', color: 'var(--color-text-tertiary)', marginTop: '4px' }}>
                : 1
            </div>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
            {renderScore('AA (Minimum)', aa, 4.5)}
            {renderScore('AAA (Enhanced)', aaa, 7)}
        </div>

         <div style={{ display: 'flex', gap: '12px' }}>
            {renderScore('AA Large', isLargeText ? aa : ratio >= 3, 3)}
            {renderScore('AAA Large', isLargeText ? aaa : ratio >= 4.5, 4.5)}
        </div>
    </div>
  );
};

