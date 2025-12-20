import React, { useState } from 'react';
import { Play, Eye } from 'lucide-react';
import { ColorToken } from '../../../../utils/tokens';
import { generateStateTokens, StateToken } from '../../../../utils/semanticTokens';

interface StateTokensProps {
  baseTokens: Record<string, ColorToken[]>;
  onStateTokensChange?: (stateTokens: Record<string, StateToken[]>) => void;
}

export const StateTokens: React.FC<StateTokensProps> = ({
  baseTokens,
  onStateTokensChange
}) => {
  const [stateTokens, setStateTokens] = useState<Record<string, StateToken[]>>({});
  const [selectedComponent, setSelectedComponent] = useState<string>('button');

  const handleGenerateStates = () => {
    const generated: Record<string, StateToken[]> = {};

    Object.entries(baseTokens).forEach(([group, tokens]) => {
      // Generate states for primary color (shade 500)
      const primaryToken = tokens.find(t => t.shade === 500);
      if (primaryToken) {
        const baseName = `color.${selectedComponent}.${group}`;
        const states = generateStateTokens(primaryToken, baseName);
        generated[baseName] = states;
      }
    });

    setStateTokens(generated);
    if (onStateTokensChange) {
      onStateTokensChange(generated);
    }
  };

  return (
    <div className="section-card" style={{ padding: '24px 24px 8px 24px', marginBottom: 0 }}>
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '4px' }}>
          State-Based Token Generation
        </h3>
        <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
          Automatically generate UI state tokens (default, hover, active, disabled, focus)
        </p>
      </div>

      {/* Component Selector */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 500 }}>
          Component Type
        </label>
        <select
          value={selectedComponent}
          onChange={(e) => setSelectedComponent(e.target.value)}
          style={{
            width: '100%',
            padding: '8px 12px',
            border: '1px solid var(--color-border)',
            borderRadius: '6px',
            fontSize: '14px'
          }}
        >
          <option value="button">Button</option>
          <option value="link">Link</option>
          <option value="input">Input</option>
          <option value="card">Card</option>
          <option value="badge">Badge</option>
        </select>
      </div>

      {/* Generate Button */}
      <button
        onClick={handleGenerateStates}
        className="btn btn-primary"
        style={{ width: '100%', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
      >
        <Play size={16} />
        Generate State Tokens
      </button>

      {/* Preview */}
      {Object.keys(stateTokens).length > 0 && (
        <div>
          <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>
            Generated State Tokens
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '500px', overflowY: 'auto' }}>
            {Object.entries(stateTokens).map(([baseName, states]) => (
              <div
                key={baseName}
                style={{
                  padding: '16px',
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px',
                  backgroundColor: 'white'
                }}
              >
                <div style={{ fontWeight: 600, fontSize: '13px', marginBottom: '12px' }}>
                  {baseName}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '8px' }}>
                  {states.map((state, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '12px',
                        border: '1px solid var(--color-border)',
                        borderRadius: '6px',
                        backgroundColor: 'var(--color-bg-hover)'
                      }}
                    >
                      <div
                        style={{
                          width: '100%',
                          height: '40px',
                          borderRadius: '4px',
                          backgroundColor: state.value,
                          border: '1px solid var(--color-border)',
                          marginBottom: '8px'
                        }}
                      />
                      <div style={{ fontSize: '11px', fontWeight: 600, marginBottom: '2px' }}>
                        {state.state}
                      </div>
                      <div style={{ fontSize: '10px', color: 'var(--color-text-secondary)' }}>
                        {state.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {Object.keys(stateTokens).length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-secondary)' }}>
          <Eye size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
          <p>Click "Generate State Tokens" to create state variants</p>
        </div>
      )}
    </div>
  );
};

