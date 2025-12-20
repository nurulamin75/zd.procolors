import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, CheckCircle2, Circle, SkipForward } from 'lucide-react';
import { ColorToken } from '../../../../utils/tokens';
import { SemanticToken } from '../../../../utils/semanticTokens';
import { ALL_PRESETS, TokenPreset, generatePresetTokens } from '../../../../utils/tokenPresets';

interface TokenWizardProps {
  onComplete?: (tokens: Record<string, ColorToken[]>, semanticTokens: SemanticToken[]) => void;
  onSkip?: () => void;
}

type WizardStep = 'preset' | 'brand' | 'scales' | 'semantic' | 'modes' | 'apply';

export const TokenWizard: React.FC<TokenWizardProps> = ({
  onComplete,
  onSkip
}) => {
  const [currentStep, setCurrentStep] = useState<WizardStep>('preset');
  const [selectedPreset, setSelectedPreset] = useState<TokenPreset | null>(null);
  const [brandColors, setBrandColors] = useState<Record<string, string>>({});
  const [generatedTokens, setGeneratedTokens] = useState<Record<string, ColorToken[]>>({});
  const [semanticTokens, setSemanticTokens] = useState<SemanticToken[]>([]);
  const [enableModes, setEnableModes] = useState(false);

  const steps: WizardStep[] = ['preset', 'brand', 'scales', 'semantic', 'modes', 'apply'];
  const currentStepIndex = steps.indexOf(currentStep);

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStep(steps[currentStepIndex + 1]);
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStep(steps[currentStepIndex - 1]);
    }
  };

  const handlePresetSelect = (preset: TokenPreset) => {
    setSelectedPreset(preset);
    setBrandColors(preset.baseColors);
    const tokens = generatePresetTokens(preset);
    setGeneratedTokens(tokens);
    setSemanticTokens(preset.semanticTokens);
    setEnableModes(preset.structure.hasModes);
  };

  const handleComplete = () => {
    if (onComplete && Object.keys(generatedTokens).length > 0) {
      onComplete(generatedTokens, semanticTokens);
    } else {
      alert('Please select a preset or generate tokens first.');
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'preset':
        return (
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>
              Choose a Preset
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '20px' }}>
              Start with a pre-configured token system or build from scratch
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {ALL_PRESETS.map(preset => (
                <div
                  key={preset.id}
                  onClick={() => handlePresetSelect(preset)}
                  style={{
                    padding: '16px',
                    border: selectedPreset?.id === preset.id ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    backgroundColor: selectedPreset?.id === preset.id ? 'var(--color-bg-hover)' : 'white'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '4px' }}>
                        {preset.name}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                        {preset.description}
                      </div>
                    </div>
                    {selectedPreset?.id === preset.id && (
                      <CheckCircle2 size={20} color="var(--color-brand-primary)" />
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
                    {Object.entries(preset.baseColors).map(([name, color]) => (
                      <div
                        key={name}
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '6px',
                          backgroundColor: color,
                          border: '1px solid var(--color-border)'
                        }}
                        title={name}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'brand':
        return (
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>
              Choose Brand Colors
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '20px' }}>
              Select your primary brand colors
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {Object.entries(brandColors).map(([name, color]) => (
                <div key={name} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <label style={{ width: '100px', fontSize: '13px', fontWeight: 500 }}>
                    {name.charAt(0).toUpperCase() + name.slice(1)}
                  </label>
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setBrandColors({ ...brandColors, [name]: e.target.value })}
                    style={{ width: '60px', height: '36px', border: '1px solid var(--color-border)', borderRadius: '6px' }}
                  />
                  <input
                    type="text"
                    value={color}
                    onChange={(e) => setBrandColors({ ...brandColors, [name]: e.target.value })}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      border: '1px solid var(--color-border)',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        );

      case 'scales':
        return (
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>
              Generate Scales
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '20px' }}>
              Color scales have been generated from your brand colors
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '400px', overflowY: 'auto' }}>
              {Object.entries(generatedTokens).map(([name, tokens]) => (
                <div key={name} style={{ padding: '12px', border: '1px solid var(--color-border)', borderRadius: '8px' }}>
                  <div style={{ fontWeight: 600, fontSize: '13px', marginBottom: '8px' }}>
                    {name.charAt(0).toUpperCase() + name.slice(1)}
                  </div>
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                    {tokens.map(token => (
                      <div
                        key={token.shade}
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '4px',
                          backgroundColor: token.value,
                          border: '1px solid var(--color-border)',
                          title: `${name}-${token.shade}`
                        }}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'semantic':
        return (
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>
              Create Semantic Tokens
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '20px' }}>
              {semanticTokens.length} semantic tokens have been suggested
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '400px', overflowY: 'auto' }}>
              {semanticTokens.map((token, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '12px',
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px',
                    backgroundColor: 'white'
                  }}
                >
                  <div style={{ fontWeight: 600, fontSize: '13px', marginBottom: '4px' }}>
                    {token.name}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                    → {token.aliasTo}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'modes':
        return (
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>
              Add Modes
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '20px' }}>
              Enable light, dark, and high-contrast modes for your tokens
            </p>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={enableModes}
                onChange={(e) => setEnableModes(e.target.checked)}
                style={{ width: '18px', height: '18px' }}
              />
              <span style={{ fontSize: '14px' }}>Enable multi-mode support</span>
            </label>
          </div>
        );

      case 'apply':
        return (
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>
              Apply Tokens
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '20px' }}>
              Your token system is ready! Click "Complete" to create tokens in Figma.
            </p>
            <div style={{ padding: '16px', backgroundColor: 'var(--color-bg-hover)', borderRadius: '8px' }}>
              <div style={{ fontSize: '13px', marginBottom: '8px', fontWeight: 600 }}>
                Summary:
              </div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                • {Object.keys(generatedTokens).length} color groups
                <br />
                • {Object.values(generatedTokens).reduce((sum, tokens) => sum + tokens.length, 0)} base tokens
                <br />
                • {semanticTokens.length} semantic tokens
                <br />
                • {enableModes ? 'Multi-mode enabled' : 'Single mode'}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="section-card" style={{ padding: '24px' }}>
      {/* Progress Indicator */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          {steps.map((step, idx) => (
            <React.Fragment key={step}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: idx <= currentStepIndex ? 'var(--color-primary)' : 'var(--color-bg-hover)',
                    color: idx <= currentStepIndex ? 'white' : 'var(--color-text-secondary)',
                    fontWeight: 600,
                    fontSize: '14px'
                  }}
                >
                  {idx < currentStepIndex ? <CheckCircle2 size={18} /> : idx + 1}
                </div>
                <div style={{ fontSize: '11px', marginTop: '4px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                  {step.charAt(0).toUpperCase() + step.slice(1)}
                </div>
              </div>
              {idx < steps.length - 1 && (
                <div
                  style={{
                    flex: 1,
                    height: '2px',
                    backgroundColor: idx < currentStepIndex ? 'var(--color-primary)' : 'var(--color-border)',
                    margin: '0 8px',
                    marginTop: '-16px'
                  }}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div style={{ marginBottom: '24px', minHeight: '300px' }}>
        {renderStep()}
      </div>

      {/* Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          {onSkip && (
            <button onClick={onSkip} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <SkipForward size={14} />
              Skip Wizard
            </button>
          )}
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {currentStepIndex > 0 && (
            <button onClick={handlePrevious} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ChevronLeft size={14} />
              Previous
            </button>
          )}
          {currentStepIndex < steps.length - 1 ? (
            <button onClick={handleNext} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              Next
              <ChevronRight size={14} />
            </button>
          ) : (
            <button onClick={handleComplete} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              Complete
              <CheckCircle2 size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

