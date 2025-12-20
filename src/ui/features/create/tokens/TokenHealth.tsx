import React, { useState, useEffect } from 'react';
import { TrendingUp, AlertCircle, CheckCircle2, XCircle, BarChart3 } from 'lucide-react';
import { ColorToken } from '../../../../utils/tokens';
import { SemanticToken } from '../../../../utils/semanticTokens';
import { calculateTokenHealth, TokenHealthScore } from '../../../../utils/tokenHealth';

interface TokenHealthProps {
  baseTokens: Record<string, ColorToken[]>;
  semanticTokens?: SemanticToken[];
  usageData?: Record<string, number>;
}

export const TokenHealth: React.FC<TokenHealthProps> = ({
  baseTokens,
  semanticTokens,
  usageData
}) => {
  const [healthScore, setHealthScore] = useState<TokenHealthScore | null>(null);

  useEffect(() => {
    const score = calculateTokenHealth(baseTokens, semanticTokens, usageData);
    setHealthScore(score);
  }, [baseTokens, semanticTokens, usageData]);

  if (!healthScore) {
    return (
      <div className="section-card" style={{ padding: '24px 24px 8px 24px', textAlign: 'center', marginBottom: 0 }}>
        <p>Calculating health score...</p>
      </div>
    );
  }

  const getScoreColor = (score: number): string => {
    if (score >= 90) return '#10b981';
    if (score >= 75) return '#3b82f6';
    if (score >= 60) return '#f59e0b';
    return '#ef4444';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 90) return <CheckCircle2 size={24} color={getScoreColor(score)} />;
    if (score >= 60) return <AlertCircle size={24} color={getScoreColor(score)} />;
    return <XCircle size={24} color={getScoreColor(score)} />;
  };

  return (
    <div className="section-card" style={{ padding: '24px 24px 8px 24px', marginBottom: 0 }}>
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '4px' }}>
          Token Health Score
        </h3>
        <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
          Overall quality assessment of your token system
        </p>
      </div>

      {/* Overall Score */}
      <div
        style={{
          padding: '24px',
          borderRadius: '12px',
          backgroundColor: 'var(--color-bg-hover)',
          marginBottom: '24px',
          textAlign: 'center'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '8px' }}>
          {getScoreIcon(healthScore.overallScore)}
          <div style={{ fontSize: '48px', fontWeight: 700, color: getScoreColor(healthScore.overallScore) }}>
            {healthScore.overallScore}
          </div>
        </div>
        <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>
          {healthScore.summary}
        </p>
      </div>

      {/* Metrics */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {healthScore.metrics.map((metric, idx) => {
          const percentage = (metric.value / metric.maxValue) * 100;
          const score = 100 - Math.min(100, percentage);
          const isGood = score >= 70;

          return (
            <div
              key={idx}
              style={{
                padding: '16px',
                border: '1px solid var(--color-border)',
                borderRadius: '8px',
                backgroundColor: 'white'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <BarChart3 size={16} color={isGood ? '#10b981' : '#ef4444'} />
                  <span style={{ fontWeight: 600, fontSize: '14px' }}>{metric.name}</span>
                </div>
                <span style={{ fontSize: '14px', fontWeight: 600, color: isGood ? '#10b981' : '#ef4444' }}>
                  {metric.value} / {metric.maxValue}
                </span>
              </div>

              {/* Progress Bar */}
              <div
                style={{
                  width: '100%',
                  height: '6px',
                  backgroundColor: 'var(--color-bg-hover)',
                  borderRadius: '3px',
                  marginBottom: '8px',
                  overflow: 'hidden'
                }}
              >
                <div
                  style={{
                    width: `${score}%`,
                    height: '100%',
                    backgroundColor: isGood ? '#10b981' : '#ef4444',
                    transition: 'width 0.3s'
                  }}
                />
              </div>

              {/* Issues */}
              {metric.issues.length > 0 && (
                <div style={{ marginTop: '8px' }}>
                  {metric.issues.map((issue, issueIdx) => (
                    <div
                      key={issueIdx}
                      style={{
                        fontSize: '12px',
                        color: '#ef4444',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        marginBottom: '4px'
                      }}
                    >
                      <AlertCircle size={12} />
                      {issue}
                    </div>
                  ))}
                </div>
              )}

              {/* Suggestions */}
              {metric.suggestions.length > 0 && (
                <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid var(--color-border)' }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, marginBottom: '4px', color: 'var(--color-text-secondary)' }}>
                    Suggestions:
                  </div>
                  {metric.suggestions.map((suggestion, sugIdx) => (
                    <div
                      key={sugIdx}
                      style={{
                        fontSize: '12px',
                        color: 'var(--color-text-secondary)',
                        marginBottom: '2px',
                        paddingLeft: '12px'
                      }}
                    >
                      • {suggestion}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

