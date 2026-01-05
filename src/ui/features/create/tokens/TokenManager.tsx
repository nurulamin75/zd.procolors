import React, { useState, useEffect } from 'react';
import { Layers, Sparkles, Eye, ScanEye, BarChart3, BookOpen, Zap, Wand2, X } from 'lucide-react';
import { ColorToken } from '../../../../utils/tokens';
import { SemanticToken } from '../../../../utils/semanticTokens';
import { SemanticTokens } from './SemanticTokens';
import { MultiModeTokens } from './MultiModeTokens';
import { TokenHealth } from './TokenHealth';
import { UsageScanner } from './UsageScanner';
import { TokenWizard } from './TokenWizard';
import { BrandProductTokens } from './BrandProductTokens';
import { StateTokens } from './StateTokens';
import { TokenVersioning } from './TokenVersioning';
import { formatCSSWithSemantics, formatTailwindWithSemantics, formatStyleDictionary, downloadFile } from '../../../../utils/export';

interface TokenManagerProps {
  baseTokens: Record<string, ColorToken[]>;
  onTokensChange?: (tokens: Record<string, ColorToken[]>) => void;
}

type TokenView = 'semantic' | 'modes' | 'states' | 'brand-product' | 'usage' | 'health' | 'versioning' | 'export';

export const TokenManager: React.FC<TokenManagerProps> = ({
  baseTokens,
  onTokensChange
}) => {
  const [currentView, setCurrentView] = useState<TokenView>('semantic');
  const [semanticTokens, setSemanticTokens] = useState<SemanticToken[]>([]);
  const [showWizard, setShowWizard] = useState(false);
  const [showWizardBanner, setShowWizardBanner] = useState(true);
  const [generatedTokens, setGeneratedTokens] = useState<Record<string, ColorToken[]>>(baseTokens);

  // Update generated tokens when baseTokens prop changes
  React.useEffect(() => {
    setGeneratedTokens(baseTokens);
  }, [baseTokens]);

  const views = [
    { id: 'semantic' as TokenView, label: 'Semantic', icon: Sparkles },
    { id: 'modes' as TokenView, label: 'Modes', icon: Eye },
    { id: 'states' as TokenView, label: 'States', icon: Zap },
    { id: 'brand-product' as TokenView, label: 'Brand/Product', icon: Layers },
    { id: 'usage' as TokenView, label: 'Usage Scanner', icon: ScanEye },
    { id: 'health' as TokenView, label: 'Health', icon: BarChart3 },
    // { id: 'versioning' as TokenView, label: 'Versioning', icon: BookOpen }, // Temporarily removed
    { id: 'export' as TokenView, label: 'Export', icon: Layers }
  ];

  const handleWizardComplete = (tokens: Record<string, ColorToken[]>, semantics: SemanticToken[]) => {
    setGeneratedTokens(tokens);
    setSemanticTokens(semantics);
    setShowWizard(false);
    setShowWizardBanner(false);
    setCurrentView('semantic'); // Switch to semantic view after wizard
    if (onTokensChange) {
      onTokensChange(tokens);
    }
  };

  const handleWizardSkip = () => {
    setShowWizard(false);
    setShowWizardBanner(false);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', margin: '0px' }}>
      {showWizard ? (
        <TokenWizard
          onComplete={handleWizardComplete}
          onSkip={handleWizardSkip}
        />
      ) : (
        <>
          {/* Wizard Featured Banner */}
          {showWizardBanner && (
            <div style={{ padding: '0px' }}>
              <div style={{ 
                padding: '12px 20px 20px 20px',
                background: '#4F7FFF',
                borderRadius: '12px',
                position: 'relative',
                marginBottom: '16px'
              }}>
                <button
                  onClick={() => setShowWizardBanner(false)}
                  style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    background: 'rgba(255, 255, 255, 0.2)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '24px',
                    height: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    color: 'white'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                  }}
                >
                  <X size={14} />
                </button>
                
                <div>
                  <h3 style={{ 
                    fontSize: '16px', 
                    fontWeight: 700, 
                    color: 'white',
                    marginBottom: '4px'
                  }}>
                    Token Setup Wizard
                  </h3>
                  <p style={{ 
                    fontSize: '13px', 
                    color: 'rgba(255, 255, 255, 0.95)',
                    lineHeight: '1.5',
                    marginBottom: '12px'
                  }}>
                    Need help setting up your tokens? The wizard will guide you through creating a complete token system in minutes.
                  </p>
                  
                  <button
                    onClick={() => setShowWizard(true)}
                    style={{
                      padding: '10px 20px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: 600,
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      background: 'white',
                      color: '#4F7FFF',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-1px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.15)';
                    }}
                  >
                    Launch Wizard
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* View Tabs */}
          <div style={{ padding: showWizardBanner ? '0px' : '0px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-start',
                alignItems: 'center',
                gap: '4px',
                whiteSpace: 'nowrap',
                paddingBottom: '16px',
                overflowX: 'auto',
                overflowY: 'hidden',
                WebkitOverflowScrolling: 'touch'
              }}
              className="no-scrollbar"
            >
              {views.map(view => {
                const Icon = view.icon;
                const isActive = currentView === view.id;
                return (
                  <button
                    key={view.id}
                    onClick={() => setCurrentView(view.id)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '12px 16px',
                      borderRadius: '100px',
                      fontSize: '13px',
                      fontWeight: 500,
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      background: isActive ? 'white' : 'transparent',
                      color: isActive ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                      boxShadow: isActive ? 'var(--shadow-sm)' : 'none',
                      whiteSpace: 'nowrap',
                      flex: '0 0 auto'
                    }}
                  >
                    <Icon size={14} />
                    {view.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* View Content */}
          <div style={{ flex: 1, overflowY: 'auto', borderRadius: '12px', overflowX: 'hidden', padding: '0px', backgroundColor: '#F5F7FB' }} className="no-scrollbar">
            {currentView === 'semantic' && (
              <SemanticTokens
                baseTokens={generatedTokens}
                onTokensChange={setSemanticTokens}
              />
            )}

            {currentView === 'modes' && (
              <MultiModeTokens
                baseTokens={generatedTokens}
              />
            )}

            {currentView === 'states' && (
              <StateTokens
                baseTokens={generatedTokens}
              />
            )}

            {currentView === 'brand-product' && (
              <BrandProductTokens
                baseTokens={generatedTokens}
              />
            )}

            {currentView === 'usage' && (
              <UsageScanner
                onConvertToToken={(color, tokenName) => {
                  console.log('Convert to token:', color, tokenName);
                }}
                onReplaceEverywhere={(color, tokenName) => {
                  console.log('Replace everywhere:', color, tokenName);
                }}
              />
            )}

            {currentView === 'health' && (
              <TokenHealth
                baseTokens={generatedTokens}
                semanticTokens={semanticTokens}
              />
            )}

            {currentView === 'versioning' && (
              <TokenVersioning
                baseTokens={generatedTokens}
                semanticTokens={semanticTokens}
              />
            )}

            {currentView === 'export' && (
              <div className="section-card" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>
                  Export Tokens
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '20px' }}>
                  Export your tokens in various formats for development use
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <button
                    onClick={() => {
                      const css = formatCSSWithSemantics(generatedTokens, semanticTokens);
                      downloadFile(css, 'tokens.css', 'text/css');
                    }}
                    className="btn btn-primary"
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    Export as CSS Variables
                  </button>
                  <button
                    onClick={() => {
                      const tailwind = formatTailwindWithSemantics(generatedTokens, semanticTokens);
                      downloadFile(tailwind, 'tailwind.config.js', 'text/javascript');
                    }}
                    className="btn btn-primary"
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    Export as Tailwind Config
                  </button>
                  <button
                    onClick={() => {
                      const json = JSON.stringify({ baseTokens: generatedTokens, semanticTokens }, null, 2);
                      downloadFile(json, 'tokens.json', 'application/json');
                    }}
                    className="btn btn-primary"
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    Export as JSON
                  </button>
                  <button
                    onClick={() => {
                      const sd = formatStyleDictionary(generatedTokens, semanticTokens);
                      downloadFile(sd, 'tokens-style-dictionary.json', 'application/json');
                    }}
                    className="btn btn-primary"
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    Export as Style Dictionary
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

