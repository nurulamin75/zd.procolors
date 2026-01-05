import React, { useState, useMemo } from 'react';
import { Sun, Moon, Eye, AlertTriangle, CheckCircle2, Plus, Trash2, Copy, Download, Sparkles, Palette, Grid3x3, Sliders } from 'lucide-react';
import { ColorToken } from '../../../../utils/tokens';
import { generateModeToken, ModeToken } from '../../../../utils/semanticTokens';
import { checkAccessibility } from '../../../../utils/contrast';
import chroma from 'chroma-js';

interface MultiModeTokensProps {
  baseTokens: Record<string, ColorToken[]>;
  onModeTokensChange?: (modeTokens: Record<string, ModeToken[]>) => void;
}

type ViewMode = 'single' | 'comparison' | 'preview';

interface ColorPreset {
  name: string;
  description: string;
  colors: string[];
  icon: React.ReactNode;
}

export const MultiModeTokens: React.FC<MultiModeTokensProps> = ({
  baseTokens,
  onModeTokensChange
}) => {
  const [selectedMode, setSelectedMode] = useState<'light' | 'dark' | 'high-contrast'>('light');
  const [viewMode, setViewMode] = useState<ViewMode>('single');
  const [modeTokens, setModeTokens] = useState<Record<string, ModeToken[]>>({});
  const [bgColor, setBgColor] = useState('#ffffff');
  const [isCreating, setIsCreating] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [customColors, setCustomColors] = useState<string[]>([]);
  const [showPresets, setShowPresets] = useState(false);
  const [createSemanticTokens, setCreateSemanticTokens] = useState(true);
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [collections, setCollections] = useState<Array<{ id: string; name: string }>>([]);
  const [isLoadingCollections, setIsLoadingCollections] = useState(false);
  
  // Advanced adjustments
  const [darkModeShift, setDarkModeShift] = useState({ hue: 0, saturation: 0, lightness: 0 });
  const [contrastBoost, setContrastBoost] = useState(1.5);

  const colorPresets: ColorPreset[] = [
    {
      name: 'Neutral Pro',
      description: 'Professional gray scale with subtle blue undertones',
      colors: ['#1a1a1a', '#3d3d3d', '#666666', '#999999', '#cccccc', '#e6e6e6'],
      icon: <Palette size={20} />
    },
    {
      name: 'Vibrant Startup',
      description: 'Bold, energetic colors for modern brands',
      colors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F'],
      icon: <Sparkles size={20} />
    },
    {
      name: 'Accessible Focus',
      description: 'WCAG AAA compliant color combinations',
      colors: ['#000000', '#1a1a1a', '#0066CC', '#CC0000', '#006600', '#ffffff'],
      icon: <Eye size={20} />
    },
    {
      name: 'Ocean Breeze',
      description: 'Calming blues and teals',
      colors: ['#003D5B', '#00688B', '#0095B6', '#30D5C8', '#B8E0D2', '#E8F5F2'],
      icon: <Sun size={20} />
    }
  ];

  const handleGenerateModes = () => {
    console.log('=== GENERATING MODE TOKENS ===');
    console.log('Base tokens:', Object.keys(baseTokens), Object.values(baseTokens).map(t => t.length));
    console.log('BG Color:', bgColor);
    
    const generated: Record<string, ModeToken[]> = {
      light: [],
      dark: [],
      'high-contrast': []
    };

    // Generate from base tokens
    Object.entries(baseTokens).forEach(([group, tokens]) => {
      tokens.forEach(token => {
        const tokenName = `${group}/${token.shade}`;
        
        ['light', 'dark', 'high-contrast'].forEach(mode => {
          let modeToken = generateModeToken(
            token,
            tokenName,
            mode as any,
            bgColor
          );

          console.log(`Generated ${tokenName} for ${mode}:`, {
            original: token.value,
            generated: modeToken.value,
            mode: mode
          });

          // Apply advanced adjustments for dark mode
          if (mode === 'dark' && (darkModeShift.hue !== 0 || darkModeShift.saturation !== 0 || darkModeShift.lightness !== 0)) {
            const color = chroma(modeToken.value);
            const [h, s, l] = color.hsl();
            const adjusted = chroma.hsl(
              h + darkModeShift.hue,
              Math.max(0, Math.min(1, s + darkModeShift.saturation / 100)),
              Math.max(0, Math.min(1, l + darkModeShift.lightness / 100))
            );
            modeToken.value = adjusted.hex();
            console.log(`Applied dark mode shift to ${tokenName}:`, modeToken.value);
          }

          // Apply contrast boost for high-contrast mode
          if (mode === 'high-contrast') {
            const color = chroma(modeToken.value);
            const [h, s, l] = color.hsl();
            const adjusted = l > 0.5 
              ? chroma.hsl(h, s, Math.min(1, l * contrastBoost))
              : chroma.hsl(h, s, Math.max(0, l / contrastBoost));
            modeToken.value = adjusted.hex();
            console.log(`Applied high contrast boost to ${tokenName}:`, modeToken.value);
          }

          generated[mode].push(modeToken);
        });
      });
    });

    console.log('Generated tokens summary:', {
      light: generated.light.length,
      dark: generated.dark.length,
      'high-contrast': generated['high-contrast'].length
    });
    console.log('Sample dark tokens:', generated.dark.slice(0, 3).map(t => ({ name: t.name, value: t.value })));
    console.log('Sample high-contrast tokens:', generated['high-contrast'].slice(0, 3).map(t => ({ name: t.name, value: t.value })));

    // Generate from custom colors
    customColors.forEach((colorValue, index) => {
      const tokenName = `custom/color-${index + 1}`;
      const tempToken: ColorToken = {
        value: colorValue,
        name: `Custom ${index + 1}`,
        shade: (index + 1) * 100
      };

      ['light', 'dark', 'high-contrast'].forEach(mode => {
        const modeToken = generateModeToken(
          tempToken,
          tokenName,
          mode as any,
          bgColor
        );
        generated[mode].push(modeToken);
      });
    });

    setModeTokens(generated);
    if (onModeTokensChange) {
      onModeTokensChange(generated);
    }
  };

  const generateSemanticTokensFromModes = () => {
    // Generate semantic tokens based on the mode tokens
    // These will reference base tokens as aliases
    const semanticMapping: Record<string, { category: string; purpose: string; baseTokenPattern: string }> = {
      'color.text.primary': { category: 'text', purpose: 'primary', baseTokenPattern: 'primary/800' },
      'color.text.secondary': { category: 'text', purpose: 'secondary', baseTokenPattern: 'primary/600' },
      'color.text.tertiary': { category: 'text', purpose: 'tertiary', baseTokenPattern: 'neutral/500' },
      'color.text.inverse': { category: 'text', purpose: 'inverse', baseTokenPattern: 'primary/50' },
      
      'color.bg.surface': { category: 'bg', purpose: 'surface', baseTokenPattern: 'primary/50' },
      'color.bg.surface-elevated': { category: 'bg', purpose: 'surface-elevated', baseTokenPattern: 'primary/100' },
      'color.bg.subtle': { category: 'bg', purpose: 'subtle', baseTokenPattern: 'primary/200' },
      'color.bg.muted': { category: 'bg', purpose: 'muted', baseTokenPattern: 'neutral/300' },
      
      'color.border.default': { category: 'border', purpose: 'default', baseTokenPattern: 'neutral/300' },
      'color.border.strong': { category: 'border', purpose: 'strong', baseTokenPattern: 'neutral/500' },
      'color.border.subtle': { category: 'border', purpose: 'subtle', baseTokenPattern: 'neutral/200' },
      
      'color.action.primary': { category: 'action', purpose: 'primary', baseTokenPattern: 'primary/500' },
      'color.action.primary-hover': { category: 'action', purpose: 'primary-hover', baseTokenPattern: 'primary/600' },
      'color.action.secondary': { category: 'action', purpose: 'secondary', baseTokenPattern: 'secondary/500' },
      'color.action.secondary-hover': { category: 'action', purpose: 'secondary-hover', baseTokenPattern: 'secondary/600' },
      
      'color.status.success': { category: 'status', purpose: 'success', baseTokenPattern: 'success/500' },
      'color.status.warning': { category: 'status', purpose: 'warning', baseTokenPattern: 'warning/500' },
      'color.status.error': { category: 'status', purpose: 'error', baseTokenPattern: 'error/500' },
      'color.status.info': { category: 'status', purpose: 'info', baseTokenPattern: 'info/500' },
    };

    const semanticTokens: Record<string, Array<ModeToken & { aliasTo: string }>> = {
      light: [],
      dark: [],
      'high-contrast': []
    };

    Object.entries(semanticMapping).forEach(([semanticName, config]) => {
      ['light', 'dark', 'high-contrast'].forEach(mode => {
        const modeTokenList = modeTokens[mode] || [];
        
        // Try to find the exact base token by pattern
        let matchingToken = modeTokenList.find(t => t.name === config.baseTokenPattern);
        
        // If not found, try to find by similar pattern (fallback to first available)
        if (!matchingToken) {
          const [group] = config.baseTokenPattern.split('/');
          matchingToken = modeTokenList.find(t => t.name.startsWith(group + '/'));
        }
        
        // Final fallback
        if (!matchingToken) {
          matchingToken = modeTokenList[0];
        }
        
        if (matchingToken) {
          semanticTokens[mode].push({
            name: semanticName,
            mode: mode as any,
            value: matchingToken.value,
            baseValue: matchingToken.baseValue,
            aliasTo: matchingToken.name // Store the base token name to alias to
          });
        }
      });
    });

    return semanticTokens;
  };

  const loadCollections = async () => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.pluginMessage?.type === 'target-options-response' && event.data.pluginMessage.targetType === 'variables') {
        const options = event.data.pluginMessage.options || [];
        const collectionsList = options.map((opt: any) => ({
          id: opt.value || opt.id,
          name: opt.label || opt.name
        }));
        
        setCollections(collectionsList);
        window.removeEventListener('message', handleMessage);
        setIsLoadingCollections(false);
      }
    };

    window.addEventListener('message', handleMessage);
    setIsLoadingCollections(true);
    try {
      (window as any).parent.postMessage({ pluginMessage: { type: 'get-target-options', targetType: 'variables' } }, '*');
    } catch (err) {
      console.error('Error loading collections:', err);
      window.removeEventListener('message', handleMessage);
      setIsLoadingCollections(false);
    }
  };

  const handleCreateInFigma = () => {
    if (Object.keys(modeTokens).length === 0) {
      alert('Please generate mode tokens first!');
      return;
    }

    // Show collection selection modal
    loadCollections();
    setShowCollectionModal(true);
  };

  const handleCollectionSelect = (collectionId: string | undefined, createNew: boolean) => {
    setShowCollectionModal(false);
    
    // Proceed with creation
    setTimeout(() => {
      createModeVariables(collectionId, createNew);
    }, 50);
  };

  const createModeVariables = (collectionId: string | undefined, createNew: boolean) => {
    setIsCreating(true);
    const timestamp = new Date().toLocaleString('en-GB', { month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' });
    const collectionName = createNew ? `Multi-Mode Tokens (${timestamp})` : undefined;

    let semanticTokensByMode: Record<string, ModeToken[]> | undefined;
    if (createSemanticTokens) {
      semanticTokensByMode = generateSemanticTokensFromModes();
    }

    (window as any).parent.postMessage({
      pluginMessage: {
        type: 'create-mode-variables',
        modeTokensByMode: modeTokens,
        semanticTokensByMode: semanticTokensByMode,
        collectionName: collectionName,
        collectionId: createNew ? undefined : collectionId,
        createNewCollection: createNew,
        createSemanticTokens: createSemanticTokens
      }
    }, '*');

    const handleMessage = (event: MessageEvent) => {
      if (event.data.pluginMessage?.type === 'create-mode-variables-result') {
        const { success, error, count, semanticCount } = event.data.pluginMessage;
        setIsCreating(false);
        window.removeEventListener('message', handleMessage);
        if (success) {
          const msg = semanticCount 
            ? `Successfully created ${count} mode variables and ${semanticCount} semantic tokens in Figma!`
            : `Successfully created ${count} mode variables in Figma!`;
          alert(msg);
        } else {
          alert(`Error creating multi-mode variables: ${error || 'Unknown error'}`);
        }
      }
    };
    window.addEventListener('message', handleMessage);

    setTimeout(() => {
      setIsCreating(false);
      window.removeEventListener('message', handleMessage);
    }, 30000);
  };

  const handleApplyPreset = (preset: ColorPreset) => {
    setCustomColors(preset.colors);
    setShowPresets(false);
  };

  const handleAddCustomColor = () => {
    setCustomColors([...customColors, '#' + Math.floor(Math.random()*16777215).toString(16)]);
  };

  const handleRemoveCustomColor = (index: number) => {
    setCustomColors(customColors.filter((_, i) => i !== index));
  };

  const handleExportCSS = () => {
    let css = ':root {\n';
    Object.entries(modeTokens).forEach(([mode, tokens]) => {
      css += `  /* ${mode} mode */\n`;
      tokens.forEach(token => {
        const varName = token.name.replace(/\//g, '-');
        css += `  --color-${varName}-${mode}: ${token.value};\n`;
      });
      css += '\n';
    });
    css += '}';

    const blob = new Blob([css], { type: 'text/css' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mode-tokens.css';
    a.click();
  };

  const getCurrentModeTokens = (): ModeToken[] => {
    return modeTokens[selectedMode] || [];
  };

  const checkContrast = (token: ModeToken): { passes: boolean; ratio: number } => {
    const modeBackground = selectedMode === 'dark' ? '#000000' : bgColor;
    const contrast = checkAccessibility(token.value, modeBackground);
    return {
      passes: contrast.aa,
      ratio: contrast.score
    };
  };

  const overallAccessibility = useMemo(() => {
    const current = getCurrentModeTokens();
    if (current.length === 0) return { score: 0, passing: 0, total: 0 };
    
    let passing = 0;
    current.forEach(token => {
      const { passes } = checkContrast(token);
      if (passes) passing++;
    });

    return {
      score: Math.round((passing / current.length) * 100),
      passing,
      total: current.length
    };
  }, [modeTokens, selectedMode, bgColor]);

  return (
    <div className="section-card" style={{ padding: '4px 24px 8px 24px', marginBottom: 0 }}>
      {/* Header */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '4px' }}>
              Multi-Mode Tokens
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
              Generate intelligent tokens for light, dark, and high-contrast modes
            </p>
          </div>
          
          {/* View Mode Switcher */}
          <div style={{ display: 'flex', gap: '4px', background: 'var(--color-bg-surface)', padding: '4px', borderRadius: '8px' }}>
            <button
              onClick={() => setViewMode('single')}
              title="Single view"
              style={{
                padding: '6px',
                background: viewMode === 'single' ? 'white' : 'transparent',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                color: viewMode === 'single' ? '#4F7FFF' : 'var(--color-text-secondary)'
              }}
            >
              <Sun size={16} />
            </button>
            <button
              onClick={() => setViewMode('comparison')}
              title="Comparison view"
              style={{
                padding: '6px',
                background: viewMode === 'comparison' ? 'white' : 'transparent',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                color: viewMode === 'comparison' ? '#4F7FFF' : 'var(--color-text-secondary)'
              }}
            >
              <Grid3x3 size={16} />
            </button>
            <button
              onClick={() => setViewMode('preview')}
              title="Preview mode"
              style={{
                padding: '6px',
                background: viewMode === 'preview' ? 'white' : 'transparent',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                color: viewMode === 'preview' ? '#4F7FFF' : 'var(--color-text-secondary)'
              }}
            >
              <Eye size={16} />
            </button>
          </div>
        </div>

        {/* Accessibility Score */}
        {getCurrentModeTokens().length > 0 && (
          <div style={{ 
            padding: '12px', 
            background: overallAccessibility.score >= 70 ? '#f0fdf4' : '#fef2f2', 
            borderRadius: '8px',
            border: `1px solid ${overallAccessibility.score >= 70 ? '#86efac' : '#fecaca'}`,
            marginTop: '12px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {overallAccessibility.score >= 70 ? (
                  <CheckCircle2 size={18} color="#16a34a" />
                ) : (
                  <AlertTriangle size={18} color="#dc2626" />
                )}
                <span style={{ fontSize: '13px', fontWeight: 600 }}>
                  Accessibility: {overallAccessibility.score}%
                </span>
              </div>
              <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                {overallAccessibility.passing} / {overallAccessibility.total} passing WCAG AA
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Mode Switcher (Single View) */}
      {viewMode === 'single' && (
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
          <button
            onClick={() => setSelectedMode('light')}
            className={selectedMode === 'light' ? 'btn btn-primary' : 'btn btn-secondary'}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1 }}
          >
            <Sun size={16} />
            Light
          </button>
          <button
            onClick={() => setSelectedMode('dark')}
            className={selectedMode === 'dark' ? 'btn btn-primary' : 'btn btn-secondary'}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1 }}
          >
            <Moon size={16} />
            Dark
          </button>
          <button
            onClick={() => setSelectedMode('high-contrast')}
            className={selectedMode === 'high-contrast' ? 'btn btn-primary' : 'btn btn-secondary'}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1 }}
          >
            <Eye size={16} />
            High Contrast
          </button>
        </div>
      )}

      {/* Color Presets */}
      {showPresets && (
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h4 style={{ fontSize: '14px', fontWeight: 600 }}>Quick Start Presets</h4>
            <button onClick={() => setShowPresets(false)} style={{ fontSize: '12px', color: 'var(--color-text-secondary)', background: 'none', border: 'none', cursor: 'pointer' }}>
              Close
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {colorPresets.map((preset, idx) => (
              <div
                key={idx}
                onClick={() => handleApplyPreset(preset)}
                style={{
                  padding: '12px',
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = '#4F7FFF'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--color-border)'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  {preset.icon}
                  <span style={{ fontSize: '13px', fontWeight: 600 }}>{preset.name}</span>
                </div>
                <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginBottom: '8px' }}>
                  {preset.description}
                </p>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {preset.colors.slice(0, 6).map((color, i) => (
                    <div
                      key={i}
                      style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '4px',
                        backgroundColor: color,
                        border: '1px solid rgba(0,0,0,0.1)'
                      }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Custom Colors */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <label style={{ fontSize: '13px', fontWeight: 500 }}>Custom Colors</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            {!showPresets && (
              <button
                onClick={() => setShowPresets(true)}
                className="btn btn-secondary"
                style={{ fontSize: '12px', padding: '4px 10px', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <Sparkles size={14} />
                Presets
              </button>
            )}
            <button
              onClick={handleAddCustomColor}
              className="btn btn-secondary"
              style={{ fontSize: '12px', padding: '4px 10px', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <Plus size={14} />
              Add
            </button>
          </div>
        </div>
        
        {customColors.length > 0 ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {customColors.map((color, idx) => (
              <div key={idx} style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <input
                  type="color"
                  value={color}
                  onChange={(e) => {
                    const newColors = [...customColors];
                    newColors[idx] = e.target.value;
                    setCustomColors(newColors);
                  }}
                  style={{ width: '40px', height: '40px', border: '1px solid var(--color-border)', borderRadius: '6px', cursor: 'pointer' }}
                />
                <button
                  onClick={() => handleRemoveCustomColor(idx)}
                  style={{
                    position: 'absolute',
                    top: '-6px',
                    right: '-6px',
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    background: '#ef4444',
                    border: 'none',
                    color: 'white',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '10px'
                  }}
                >
                  <Trash2 size={10} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>
            Add custom colors to include them in all modes
          </p>
        )}
      </div>

      {/* Advanced Settings */}
      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          style={{
            fontSize: '13px',
            color: '#4F7FFF',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: 0
          }}
        >
          <Sliders size={14} />
          Advanced Settings
          <span style={{ fontSize: '11px' }}>{showAdvanced ? '▲' : '▼'}</span>
        </button>

        {showAdvanced && (
          <div style={{ marginTop: '12px', padding: '16px', background: 'var(--color-bg-surface)', borderRadius: '8px' }}>
            <h5 style={{ fontSize: '13px', fontWeight: 600, marginBottom: '12px' }}>Dark Mode Adjustments</h5>
            
            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '12px', display: 'block', marginBottom: '4px' }}>
                Hue Shift: {darkModeShift.hue}°
              </label>
              <input
                type="range"
                min="-180"
                max="180"
                value={darkModeShift.hue}
                onChange={(e) => setDarkModeShift({ ...darkModeShift, hue: Number(e.target.value) })}
                style={{ width: '100%' }}
              />
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '12px', display: 'block', marginBottom: '4px' }}>
                Saturation: {darkModeShift.saturation}%
              </label>
              <input
                type="range"
                min="-50"
                max="50"
                value={darkModeShift.saturation}
                onChange={(e) => setDarkModeShift({ ...darkModeShift, saturation: Number(e.target.value) })}
                style={{ width: '100%' }}
              />
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '12px', display: 'block', marginBottom: '4px' }}>
                Lightness: {darkModeShift.lightness}%
              </label>
              <input
                type="range"
                min="-50"
                max="50"
                value={darkModeShift.lightness}
                onChange={(e) => setDarkModeShift({ ...darkModeShift, lightness: Number(e.target.value) })}
                style={{ width: '100%' }}
              />
            </div>

            <h5 style={{ fontSize: '13px', fontWeight: 600, marginBottom: '8px', marginTop: '16px' }}>
              High Contrast Boost
            </h5>
            <div>
              <label style={{ fontSize: '12px', display: 'block', marginBottom: '4px' }}>
                Contrast Multiplier: {contrastBoost.toFixed(1)}x
              </label>
              <input
                type="range"
                min="1"
                max="3"
                step="0.1"
                value={contrastBoost}
                onChange={(e) => setContrastBoost(Number(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Semantic Tokens Option */}
      <div style={{ 
        marginBottom: '20px', 
        padding: '16px', 
        background: createSemanticTokens ? '#f0f9ff' : 'var(--color-bg-surface)', 
        borderRadius: '8px',
        border: `1px solid ${createSemanticTokens ? '#bfdbfe' : 'var(--color-border)'}`
      }}>
        <label style={{ 
          display: 'flex', 
          alignItems: 'flex-start', 
          gap: '12px', 
          cursor: 'pointer',
          userSelect: 'none'
        }}>
          <input
            type="checkbox"
            checked={createSemanticTokens}
            onChange={(e) => setCreateSemanticTokens(e.target.checked)}
            style={{ 
              width: '18px', 
              height: '18px', 
              marginTop: '2px',
              cursor: 'pointer',
              accentColor: '#4F7FFF'
            }}
          />
          <div style={{ flex: 1 }}>
            <div style={{ 
              fontSize: '14px', 
              fontWeight: 600, 
              marginBottom: '4px',
              color: 'var(--color-text-primary)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <Sparkles size={16} color="#4F7FFF" />
              Generate Semantic Tokens
            </div>
            <p style={{ 
              fontSize: '12px', 
              color: 'var(--color-text-secondary)',
              lineHeight: '1.5',
              margin: 0
            }}>
              Automatically creates semantic tokens like <code style={{ 
                background: 'rgba(0,0,0,0.05)', 
                padding: '2px 4px', 
                borderRadius: '3px',
                fontSize: '11px'
              }}>color.text.primary</code>, <code style={{ 
                background: 'rgba(0,0,0,0.05)', 
                padding: '2px 4px', 
                borderRadius: '3px',
                fontSize: '11px'
              }}>color.bg.surface</code>, etc. that adapt across all modes.
            </p>
            {createSemanticTokens && (
              <div style={{ 
                marginTop: '8px', 
                padding: '8px', 
                background: 'white', 
                borderRadius: '6px',
                fontSize: '11px',
                color: 'var(--color-text-secondary)'
              }}>
                <strong style={{ color: 'var(--color-text-primary)' }}>Will create:</strong> Text, Background, Border, Action, and Status semantic tokens
              </div>
            )}
          </div>
        </label>
      </div>

      {/* Background Color Input */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 500 }}>
          Light Mode Background
        </label>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <input
            type="color"
            value={bgColor}
            onChange={(e) => setBgColor(e.target.value)}
            style={{ width: '60px', height: '36px', border: '1px solid var(--color-border)', borderRadius: '6px', cursor: 'pointer' }}
          />
          <input
            type="text"
            value={bgColor}
            onChange={(e) => setBgColor(e.target.value)}
            style={{
              flex: 1,
              padding: '8px 12px',
              border: '1px solid var(--color-border)',
              borderRadius: '6px',
              fontSize: '14px'
            }}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <button
          onClick={handleGenerateModes}
          className="btn btn-primary"
          style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
        >
          <Sparkles size={16} />
          Generate Tokens
        </button>

        {getCurrentModeTokens().length > 0 && (
          <>
            <button
              onClick={handleExportCSS}
              className="btn btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              title="Export as CSS"
            >
              <Download size={16} />
            </button>
            <button
              onClick={() => {
                navigator.clipboard.writeText(JSON.stringify(modeTokens, null, 2));
                alert('Copied to clipboard!');
              }}
              className="btn btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              title="Copy JSON"
            >
              <Copy size={16} />
            </button>
          </>
        )}
      </div>

      {/* Create in Figma Button */}
      {getCurrentModeTokens().length > 0 && (
        <button
          onClick={handleCreateInFigma}
          disabled={isCreating}
          className="btn btn-primary"
          style={{ width: '100%', marginBottom: '16px', opacity: isCreating ? 0.6 : 1 }}
        >
          {isCreating ? 'Creating...' : 'Create in Figma'}
        </button>
      )}

      {/* Collection Selection Modal */}
      {showCollectionModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '24px',
            width: '90%',
            maxWidth: '500px',
            maxHeight: '80vh',
            overflow: 'auto',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>
              Choose Collection
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '20px' }}>
              Select an existing collection to add modes, or create a new one.
            </p>

            {/* Create New Collection Option */}
            <button
              onClick={() => handleCollectionSelect(undefined, true)}
              className="btn btn-primary"
              style={{
                width: '100%',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '12px'
              }}
            >
              <Plus size={18} />
              Create New Collection
            </button>

            {/* Existing Collections */}
            {isLoadingCollections ? (
              <div style={{ textAlign: 'center', padding: '20px', color: 'var(--color-text-secondary)' }}>
                Loading collections...
              </div>
            ) : collections.length > 0 ? (
              <div>
                <div style={{ fontSize: '12px', fontWeight: 600, marginBottom: '8px', color: 'var(--color-text-secondary)' }}>
                  OR ADD TO EXISTING COLLECTION:
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '300px', overflowY: 'auto' }}>
                  {collections.map((collection) => (
                    <button
                      key={collection.id}
                      onClick={() => handleCollectionSelect(collection.id, false)}
                      className="btn btn-secondary"
                      style={{
                        width: '100%',
                        padding: '12px',
                        textAlign: 'left',
                        justifyContent: 'flex-start'
                      }}
                    >
                      {collection.name}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ 
                textAlign: 'center', 
                padding: '20px', 
                color: 'var(--color-text-secondary)',
                fontSize: '13px'
              }}>
                No existing collections found. Create a new one to get started.
              </div>
            )}

            <button
              onClick={() => setShowCollectionModal(false)}
              className="btn btn-secondary"
              style={{ width: '100%', marginTop: '16px' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Token Display */}
      {viewMode === 'single' && getCurrentModeTokens().length > 0 && (
        <div>
          <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>
            {selectedMode.charAt(0).toUpperCase() + selectedMode.slice(1).replace('-', ' ')} Mode ({getCurrentModeTokens().length} tokens)
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '400px', overflowY: 'auto' }} className="no-scrollbar">
            {getCurrentModeTokens().map((token, idx) => {
              const contrast = checkContrast(token);
              return (
                <div
                  key={idx}
                  style={{
                    padding: '12px',
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    backgroundColor: contrast.passes ? 'white' : '#fef2f2'
                  }}
                >
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '6px',
                      backgroundColor: token.value,
                      border: '1px solid var(--color-border)'
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '13px', marginBottom: '2px' }}>
                      {token.name}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                      {token.value}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {contrast.passes ? (
                      <CheckCircle2 size={16} color="#10b981" />
                    ) : (
                      <AlertTriangle size={16} color="#ef4444" />
                    )}
                    <span style={{ fontSize: '12px', color: contrast.passes ? '#10b981' : '#ef4444', fontWeight: 600 }}>
                      {contrast.ratio.toFixed(1)}:1
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Comparison View */}
      {viewMode === 'comparison' && Object.keys(modeTokens).length > 0 && (
        <div>
          <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>All Modes Comparison</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', maxHeight: '500px', overflowY: 'auto' }} className="no-scrollbar">
            {['light', 'dark', 'high-contrast'].map(mode => (
              <div key={mode}>
                <h5 style={{ fontSize: '12px', fontWeight: 600, marginBottom: '8px', textTransform: 'capitalize' }}>
                  {mode.replace('-', ' ')} ({modeTokens[mode]?.length || 0})
                </h5>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {(modeTokens[mode] || []).map((token, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '8px',
                        border: '1px solid var(--color-border)',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        backgroundColor: 'white'
                      }}
                    >
                      <div
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '4px',
                          backgroundColor: token.value,
                          border: '1px solid rgba(0,0,0,0.1)',
                          flexShrink: 0
                        }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '10px', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {token.name.split('/').pop()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Preview Mode */}
      {viewMode === 'preview' && getCurrentModeTokens().length > 0 && (
        <div>
          <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>
            UI Preview - {selectedMode.charAt(0).toUpperCase() + selectedMode.slice(1).replace('-', ' ')} Mode
          </h4>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
            <button
              onClick={() => setSelectedMode('light')}
              className="btn btn-secondary"
              style={{ fontSize: '11px', padding: '4px 8px' }}
            >
              Light
            </button>
            <button
              onClick={() => setSelectedMode('dark')}
              className="btn btn-secondary"
              style={{ fontSize: '11px', padding: '4px 8px' }}
            >
              Dark
            </button>
            <button
              onClick={() => setSelectedMode('high-contrast')}
              className="btn btn-secondary"
              style={{ fontSize: '11px', padding: '4px 8px' }}
            >
              High Contrast
            </button>
          </div>
          <div style={{
            padding: '20px',
            background: selectedMode === 'dark' ? '#1a1a1a' : selectedMode === 'high-contrast' ? '#ffffff' : '#f9fafb',
            borderRadius: '12px',
            border: '1px solid var(--color-border)'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Sample buttons */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {getCurrentModeTokens().slice(0, 4).map((token, idx) => (
                  <button
                    key={idx}
                    style={{
                      padding: '8px 16px',
                      background: token.value,
                      color: chroma.contrast(token.value, '#fff') > 4.5 ? '#fff' : '#000',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Button
                  </button>
                ))}
              </div>
              
              {/* Sample cards */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {getCurrentModeTokens().slice(0, 2).map((token, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '16px',
                      background: selectedMode === 'dark' ? '#2a2a2a' : '#ffffff',
                      borderRadius: '8px',
                      border: `2px solid ${token.value}`
                    }}
                  >
                    <div style={{ 
                      width: '100%', 
                      height: '40px', 
                      background: token.value, 
                      borderRadius: '4px',
                      marginBottom: '8px'
                    }} />
                    <div style={{ 
                      fontSize: '11px', 
                      color: selectedMode === 'dark' ? '#fff' : '#000',
                      fontWeight: 600
                    }}>
                      Card {idx + 1}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {getCurrentModeTokens().length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-secondary)' }}>
          <Sparkles size={32} style={{ marginBottom: '12px', opacity: 0.5 }} />
          <p style={{ marginBottom: '8px', fontWeight: 600 }}>Ready to Generate!</p>
          <p style={{ fontSize: '13px' }}>
            Click "Generate Tokens" to create intelligent color tokens for all three modes.
          </p>
        </div>
      )}
    </div>
  );
};
