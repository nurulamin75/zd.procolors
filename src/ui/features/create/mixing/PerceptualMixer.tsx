import React, { useState, useMemo, useEffect } from 'react';
import { Copy, Download, Plus, Trash2, Blend, Droplets, Palette, RefreshCw } from 'lucide-react';
import chroma from 'chroma-js';
import { 
  mixColorsOklab,
  mixMultipleColorsOklab,
  blendColorsOklab,
  hexToOklab,
  oklabToHex,
  BlendMode,
  OKLABColor
} from '../../../../utils/colorMixing';

interface PerceptualMixerProps {
  palettes?: Record<string, { hex: string }[]>;
}

export const PerceptualMixer: React.FC<PerceptualMixerProps> = ({ palettes }) => {
  // Two-color mixing
  const [color1, setColor1] = useState('#3b82f6');
  const [color2, setColor2] = useState('#f59e0b');
  const [mixRatio, setMixRatio] = useState(50);
  
  // Multi-color mixing
  const [multiColors, setMultiColors] = useState<{ color: string; weight: number }[]>([
    { color: '#ef4444', weight: 1 },
    { color: '#22c55e', weight: 1 },
    { color: '#3b82f6', weight: 1 }
  ]);
  
  // Blend modes
  const [baseColor, setBaseColor] = useState('#3b82f6');
  const [blendColor, setBlendColor] = useState('#f59e0b');
  const [blendMode, setBlendMode] = useState<BlendMode>('normal');
  const [blendOpacity, setBlendOpacity] = useState(100);
  
  // Active tab
  const [activeTab, setActiveTab] = useState<'mix' | 'multi' | 'blend' | 'explore'>('mix');

  // Two-color mix result
  const mixResult = useMemo(() => {
    try {
      return mixColorsOklab(color1, color2, mixRatio / 100);
    } catch {
      return '#000000';
    }
  }, [color1, color2, mixRatio]);

  // Mix scale (showing full range)
  const mixScale = useMemo(() => {
    const steps: string[] = [];
    for (let i = 0; i <= 10; i++) {
      try {
        steps.push(mixColorsOklab(color1, color2, i / 10));
      } catch {
        steps.push('#000000');
      }
    }
    return steps;
  }, [color1, color2]);

  // Multi-color mix result
  const multiMixResult = useMemo(() => {
    try {
      const colors = multiColors.map(c => c.color);
      const weights = multiColors.map(c => c.weight);
      return mixMultipleColorsOklab(colors, weights);
    } catch {
      return '#000000';
    }
  }, [multiColors]);

  // Blend result
  const blendResult = useMemo(() => {
    try {
      return blendColorsOklab(baseColor, blendColor, blendMode, blendOpacity / 100);
    } catch {
      return '#000000';
    }
  }, [baseColor, blendColor, blendMode, blendOpacity]);

  // All blend modes preview
  const allBlendModes: BlendMode[] = ['normal', 'multiply', 'screen', 'overlay', 'soft-light'];
  const blendPreviews = useMemo(() => {
    return allBlendModes.map(mode => ({
      mode,
      result: blendColorsOklab(baseColor, blendColor, mode, blendOpacity / 100)
    }));
  }, [baseColor, blendColor, blendOpacity]);

  // OKLAB space exploration
  const oklabColor1 = useMemo(() => hexToOklab(color1), [color1]);
  const oklabColor2 = useMemo(() => hexToOklab(color2), [color2]);

  const handleAddMultiColor = () => {
    setMultiColors([...multiColors, { color: chroma.random().hex(), weight: 1 }]);
  };

  const handleRemoveMultiColor = (index: number) => {
    if (multiColors.length > 2) {
      setMultiColors(multiColors.filter((_, i) => i !== index));
    }
  };

  const handleUpdateMultiColor = (index: number, updates: Partial<{ color: string; weight: number }>) => {
    const newColors = [...multiColors];
    newColors[index] = { ...newColors[index], ...updates };
    setMultiColors(newColors);
  };

  const handleSwapColors = () => {
    setColor1(color2);
    setColor2(color1);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const exportToFigma = (colors: string[], name: string) => {
    parent.postMessage({
      pluginMessage: {
        type: 'create-mix-palette',
        colors,
        name
      }
    }, '*');
  };

  const formatOklab = (oklab: OKLABColor) => {
    return `oklab(${(oklab.L * 100).toFixed(1)}% ${oklab.a.toFixed(3)} ${oklab.b.toFixed(3)})`;
  };

  // Listen for export event from header button
  useEffect(() => {
    const handleExport = () => {
      if (mixScale.length > 0) {
        exportToFigma(mixScale, 'OKLAB Mix Scale');
      }
    };

    window.addEventListener('mixing-export', handleExport);
    return () => window.removeEventListener('mixing-export', handleExport);
  }, [mixScale]);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Tabs - Underlined style */}
      <div style={{ display: 'flex', gap: '0', borderBottom: '1px solid var(--color-border)' }}>
        {[
          { id: 'mix', label: 'Two Colors', icon: Droplets },
          { id: 'multi', label: 'Multi Mix', icon: Palette },
          { id: 'blend', label: 'Blend Modes', icon: Blend },
          { id: 'explore', label: 'OKLAB Explorer', icon: RefreshCw }
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id as any)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 16px',
              fontSize: '13px',
              fontWeight: 500,
              border: 'none',
              cursor: 'pointer',
              background: 'transparent',
              color: activeTab === id ? 'var(--color-primary)' : 'var(--color-text-secondary)',
              borderBottom: activeTab === id ? '2px solid var(--color-primary)' : '2px solid transparent',
              marginBottom: '-1px',
              transition: 'all 0.2s'
            }}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {/* Two Color Mix */}
      {activeTab === 'mix' && (
        <div style={{ 
          background: 'white', 
          borderRadius: '16px', 
          padding: '20px',
        }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', marginBottom: '20px' }}>
            {/* Color 1 */}
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '11px', fontWeight: 500, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '6px' }}>
                Color A
              </label>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  type="color"
                  value={color1}
                  onChange={(e) => setColor1(e.target.value)}
                  style={{ width: '48px', height: '48px', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                />
                <input
                  type="text"
                  value={color1}
                  onChange={(e) => chroma.valid(e.target.value) && setColor1(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '10px',
                    border: '1px solid var(--color-border)',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontFamily: 'monospace'
                  }}
                />
              </div>
            </div>

            {/* Swap */}
            <button
              onClick={handleSwapColors}
              style={{
                marginTop: '24px',
                padding: '10px',
                border: '1px solid var(--color-border)',
                borderRadius: '8px',
                background: 'white',
                cursor: 'pointer'
              }}
            >
              <RefreshCw size={16} />
            </button>

            {/* Color 2 */}
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '11px', fontWeight: 500, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '6px' }}>
                Color B
              </label>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  type="color"
                  value={color2}
                  onChange={(e) => setColor2(e.target.value)}
                  style={{ width: '48px', height: '48px', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                />
                <input
                  type="text"
                  value={color2}
                  onChange={(e) => chroma.valid(e.target.value) && setColor2(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '10px',
                    border: '1px solid var(--color-border)',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontFamily: 'monospace'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Mix Ratio Slider */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <label style={{ fontSize: '11px', fontWeight: 500, color: 'var(--color-text-secondary)' }}>
                Mix Ratio
              </label>
              <span style={{ fontSize: '12px', fontWeight: 600 }}>{mixRatio}% Color B</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={mixRatio}
              onChange={(e) => setMixRatio(parseInt(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>

          {/* Mix Scale Preview */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '11px', fontWeight: 500, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '8px' }}>
              Full Mix Scale
            </label>
            <div style={{ 
              display: 'flex', 
              borderRadius: '8px', 
              overflow: 'hidden',
              border: '1px solid var(--color-border)'
            }}>
              {mixScale.map((color, index) => (
                <div
                  key={index}
                  style={{
                    flex: 1,
                    height: '40px',
                    background: color,
                    cursor: 'pointer',
                    position: 'relative'
                  }}
                  onClick={() => copyToClipboard(color)}
                  title={color}
                >
                  {index === Math.round(mixRatio / 10) && (
                    <div style={{
                      position: 'absolute',
                      bottom: '-8px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: 0,
                      height: 0,
                      borderLeft: '6px solid transparent',
                      borderRight: '6px solid transparent',
                      borderBottom: '6px solid var(--color-primary)'
                    }} />
                  )}
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
              <span style={{ fontSize: '10px', color: 'var(--color-text-secondary)' }}>0%</span>
              <span style={{ fontSize: '10px', color: 'var(--color-text-secondary)' }}>100%</span>
            </div>
          </div>

          {/* Result */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px',
            padding: '12px',
            background: 'var(--color-bg-hover)',
            borderRadius: '8px'
          }}>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '8px',
              background: mixResult,
              border: '2px solid white',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '4px' }}>
                Mixed Result
              </div>
              <div style={{ fontSize: '12px', fontFamily: 'monospace', color: 'var(--color-text-secondary)' }}>
                {mixResult}
              </div>
            </div>
            <button
              onClick={() => copyToClipboard(mixResult)}
              className="btn btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}
            >
              <Copy size={14} />
              Copy
            </button>
          </div>
        </div>
      )}

      {/* Multi-Color Mix */}
      {activeTab === 'multi' && (
        <div style={{ 
          background: 'white', 
          borderRadius: '16px', 
          padding: '20px',
        }}>
          <label style={{ fontSize: '12px', fontWeight: 500, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '12px' }}>
            Colors to Mix ({multiColors.length})
          </label>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
            {multiColors.map((item, index) => (
              <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <input
                  type="color"
                  value={item.color}
                  onChange={(e) => handleUpdateMultiColor(index, { color: e.target.value })}
                  style={{ width: '40px', height: '40px', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                />
                <input
                  type="text"
                  value={item.color}
                  onChange={(e) => chroma.valid(e.target.value) && handleUpdateMultiColor(index, { color: e.target.value })}
                  style={{
                    width: '90px',
                    padding: '8px',
                    border: '1px solid var(--color-border)',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontFamily: 'monospace'
                  }}
                />
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                  <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>Weight:</span>
                  <input
                    type="range"
                    min={0}
                    max={3}
                    step={0.1}
                    value={item.weight}
                    onChange={(e) => handleUpdateMultiColor(index, { weight: parseFloat(e.target.value) })}
                    style={{ flex: 1 }}
                  />
                  <span style={{ fontSize: '11px', width: '30px' }}>{item.weight.toFixed(1)}</span>
                </div>
                {multiColors.length > 2 && (
                  <button
                    onClick={() => handleRemoveMultiColor(index)}
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#ef4444' }}
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>

          <button
            onClick={handleAddMultiColor}
            style={{
              width: '100%',
              padding: '10px',
              border: '2px dashed var(--color-border)',
              borderRadius: '8px',
              background: 'transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              color: 'var(--color-text-secondary)',
              marginBottom: '20px'
            }}
          >
            <Plus size={16} />
            Add Color
          </button>

          {/* Result */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px',
            padding: '16px',
            background: 'var(--color-bg-hover)',
            borderRadius: '8px'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '12px',
              background: multiMixResult,
              border: '3px solid white',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '4px' }}>
                Mixed Result
              </div>
              <div style={{ fontSize: '13px', fontFamily: 'monospace', color: 'var(--color-text-secondary)' }}>
                {multiMixResult}
              </div>
            </div>
            <button
              onClick={() => copyToClipboard(multiMixResult)}
              className="btn btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px' }}
            >
              <Copy size={14} />
              Copy
            </button>
          </div>
        </div>
      )}

      {/* Blend Modes */}
      {activeTab === 'blend' && (
        <div style={{ 
          background: 'white', 
          borderRadius: '16px', 
          padding: '20px',
        }}>
          <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '11px', fontWeight: 500, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '6px' }}>
                Base Color
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="color"
                  value={baseColor}
                  onChange={(e) => setBaseColor(e.target.value)}
                  style={{ width: '40px', height: '36px', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                />
                <input
                  type="text"
                  value={baseColor}
                  onChange={(e) => chroma.valid(e.target.value) && setBaseColor(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '8px',
                    border: '1px solid var(--color-border)',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontFamily: 'monospace'
                  }}
                />
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '11px', fontWeight: 500, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '6px' }}>
                Blend Color
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="color"
                  value={blendColor}
                  onChange={(e) => setBlendColor(e.target.value)}
                  style={{ width: '40px', height: '36px', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                />
                <input
                  type="text"
                  value={blendColor}
                  onChange={(e) => chroma.valid(e.target.value) && setBlendColor(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '8px',
                    border: '1px solid var(--color-border)',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontFamily: 'monospace'
                  }}
                />
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '11px', fontWeight: 500, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '6px' }}>
              Opacity: {blendOpacity}%
            </label>
            <input
              type="range"
              min={0}
              max={100}
              value={blendOpacity}
              onChange={(e) => setBlendOpacity(parseInt(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>

          {/* Blend Mode Comparison */}
          <label style={{ fontSize: '12px', fontWeight: 500, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '12px' }}>
            Blend Mode Comparison
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px' }}>
            {blendPreviews.map(({ mode, result }) => (
              <button
                key={mode}
                onClick={() => setBlendMode(mode)}
                style={{
                  padding: '0',
                  border: blendMode === mode ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                  borderRadius: '8px',
                  background: 'white',
                  cursor: 'pointer',
                  overflow: 'hidden'
                }}
              >
                <div style={{ height: '50px', background: result }} />
                <div style={{ 
                  padding: '6px', 
                  fontSize: '10px', 
                  fontWeight: 500,
                  textTransform: 'capitalize'
                }}>
                  {mode}
                </div>
              </button>
            ))}
          </div>

          {/* Result */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px',
            padding: '12px',
            background: 'var(--color-bg-hover)',
            borderRadius: '8px',
            marginTop: '16px'
          }}>
            <div style={{
              width: '50px',
              height: '50px',
              borderRadius: '8px',
              background: blendResult,
              border: '2px solid white',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '2px', textTransform: 'capitalize' }}>
                {blendMode} Result
              </div>
              <div style={{ fontSize: '11px', fontFamily: 'monospace', color: 'var(--color-text-secondary)' }}>
                {blendResult}
              </div>
            </div>
            <button
              onClick={() => copyToClipboard(blendResult)}
              className="btn btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px' }}
            >
              <Copy size={14} />
              Copy
            </button>
          </div>
        </div>
      )}

      {/* OKLAB Explorer */}
      {activeTab === 'explore' && (
        <div style={{ 
          background: 'white', 
          borderRadius: '16px', 
          padding: '20px',
        }}>
          <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '16px' }}>
            Explore the OKLAB color space values. L = Lightness, a = green↔red, b = blue↔yellow
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {/* Color 1 OKLAB */}
            <div style={{ padding: '16px', background: 'var(--color-bg-hover)', borderRadius: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: color1 }} />
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 600 }}>{color1}</div>
                  <div style={{ fontSize: '10px', color: 'var(--color-text-secondary)' }}>Color A</div>
                </div>
              </div>
              <div style={{ fontFamily: 'monospace', fontSize: '11px' }}>
                <div style={{ marginBottom: '4px' }}>
                  <span style={{ color: 'var(--color-text-secondary)' }}>L:</span> {(oklabColor1.L * 100).toFixed(1)}%
                </div>
                <div style={{ marginBottom: '4px' }}>
                  <span style={{ color: 'var(--color-text-secondary)' }}>a:</span> {oklabColor1.a.toFixed(3)}
                </div>
                <div>
                  <span style={{ color: 'var(--color-text-secondary)' }}>b:</span> {oklabColor1.b.toFixed(3)}
                </div>
              </div>
              <div style={{ marginTop: '8px', fontSize: '10px', fontFamily: 'monospace', color: 'var(--color-text-secondary)' }}>
                {formatOklab(oklabColor1)}
              </div>
            </div>

            {/* Color 2 OKLAB */}
            <div style={{ padding: '16px', background: 'var(--color-bg-hover)', borderRadius: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: color2 }} />
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 600 }}>{color2}</div>
                  <div style={{ fontSize: '10px', color: 'var(--color-text-secondary)' }}>Color B</div>
                </div>
              </div>
              <div style={{ fontFamily: 'monospace', fontSize: '11px' }}>
                <div style={{ marginBottom: '4px' }}>
                  <span style={{ color: 'var(--color-text-secondary)' }}>L:</span> {(oklabColor2.L * 100).toFixed(1)}%
                </div>
                <div style={{ marginBottom: '4px' }}>
                  <span style={{ color: 'var(--color-text-secondary)' }}>a:</span> {oklabColor2.a.toFixed(3)}
                </div>
                <div>
                  <span style={{ color: 'var(--color-text-secondary)' }}>b:</span> {oklabColor2.b.toFixed(3)}
                </div>
              </div>
              <div style={{ marginTop: '8px', fontSize: '10px', fontFamily: 'monospace', color: 'var(--color-text-secondary)' }}>
                {formatOklab(oklabColor2)}
              </div>
            </div>
          </div>

          {/* Comparison: OKLAB vs RGB mixing */}
          <div style={{ marginTop: '20px' }}>
            <h4 style={{ fontSize: '13px', fontWeight: 600, marginBottom: '12px' }}>
              OKLAB vs RGB Mixing Comparison
            </h4>
            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '10px', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '4px' }}>
                  OKLAB (Perceptual)
                </label>
                <div style={{ 
                  display: 'flex', 
                  height: '40px', 
                  borderRadius: '6px', 
                  overflow: 'hidden',
                  border: '2px solid var(--color-primary)'
                }}>
                  {Array.from({ length: 11 }, (_, i) => (
                    <div
                      key={i}
                      style={{ flex: 1, background: mixColorsOklab(color1, color2, i / 10) }}
                    />
                  ))}
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '10px', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '4px' }}>
                  RGB (Linear)
                </label>
                <div style={{ 
                  display: 'flex', 
                  height: '40px', 
                  borderRadius: '6px', 
                  overflow: 'hidden',
                  border: '1px solid var(--color-border)'
                }}>
                  {Array.from({ length: 11 }, (_, i) => (
                    <div
                      key={i}
                      style={{ flex: 1, background: chroma.mix(color1, color2, i / 10, 'rgb').hex() }}
                    />
                  ))}
                </div>
              </div>
            </div>
            <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '8px' }}>
              Notice how OKLAB produces more natural-looking transitions without muddy midtones.
            </p>
          </div>
        </div>
      )}

      {/* Info Box */}
      <div style={{ 
        background: 'white',
        borderRadius: '16px', 
        padding: '16px',
      }}>
        <h4 style={{ fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: '#92400e' }}>
          🎨 Why OKLAB?
        </h4>
        <p style={{ fontSize: '12px', color: '#78350f', margin: 0, lineHeight: 1.6 }}>
          OKLAB is a perceptually uniform color space designed to match how humans perceive color differences. 
          When mixing colors in OKLAB, you get smooth, natural-looking gradients without the muddy browns 
          often seen when mixing in RGB or HSL. It's the gold standard for modern color manipulation.
        </p>
      </div>
    </div>
  );
};
