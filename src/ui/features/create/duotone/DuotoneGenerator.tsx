import React, { useState, useMemo, useEffect } from 'react';
import { Copy, Download, Plus, Trash2, RefreshCw, Image, Palette } from 'lucide-react';
import chroma from 'chroma-js';
import { 
  generateDuotone, 
  generateDuotonePalette, 
  getDuotoneSvgFilter,
  DUOTONE_PRESETS,
  DuotoneResult 
} from '../../../../utils/colorMixing';

interface DuotoneGeneratorProps {
  palettes?: Record<string, { hex: string }[]>;
}

export const DuotoneGenerator: React.FC<DuotoneGeneratorProps> = ({ palettes }) => {
  const [darkColor, setDarkColor] = useState('#0a192f');
  const [lightColor, setLightColor] = useState('#64ffda');
  const [customDuotones, setCustomDuotones] = useState<DuotoneResult[]>([]);
  const [selectedPreset, setSelectedPreset] = useState<number | null>(null);
  const [showImagePreview, setShowImagePreview] = useState(false);

  // Generate duotone from current colors
  const currentDuotone = useMemo(() => {
    try {
      return generateDuotone(darkColor, lightColor, 'Custom');
    } catch {
      return null;
    }
  }, [darkColor, lightColor]);

  // Generate from palette colors if available
  const paletteDuotones = useMemo(() => {
    if (!palettes) return [];
    const colors = Object.values(palettes)
      .flatMap(p => p.slice(2, 8)) // Get mid-range shades
      .map(c => c.hex)
      .filter((c, i, arr) => arr.indexOf(c) === i) // Unique
      .slice(0, 6);
    return generateDuotonePalette(colors);
  }, [palettes]);

  const handlePresetSelect = (index: number) => {
    const preset = DUOTONE_PRESETS[index];
    setDarkColor(preset.dark);
    setLightColor(preset.light);
    setSelectedPreset(index);
  };

  const handleAddCustom = () => {
    if (currentDuotone) {
      setCustomDuotones([...customDuotones, currentDuotone]);
    }
  };

  const handleDeleteCustom = (id: string) => {
    setCustomDuotones(customDuotones.filter(d => d.id !== id));
  };

  const handleSwapColors = () => {
    const temp = darkColor;
    setDarkColor(lightColor);
    setLightColor(temp);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const exportDuotone = (duotone: DuotoneResult) => {
    parent.postMessage({
      pluginMessage: {
        type: 'create-duotone-style',
        duotone
      }
    }, '*');
  };

  // Listen for export event from header button
  useEffect(() => {
    const handleExport = () => {
      if (currentDuotone) {
        exportDuotone(currentDuotone);
      }
    };

    window.addEventListener('duotone-export', handleExport);
    return () => window.removeEventListener('duotone-export', handleExport);
  }, [currentDuotone]);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Color Picker Section */}
      <div style={{ 
        background: 'white', 
        borderRadius: '16px', 
        padding: '20px',
      }}>
        <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
          {/* Dark Color */}
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: '12px', fontWeight: 500, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '8px' }}>
              Dark Color (Shadows)
            </label>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <div style={{ position: 'relative' }}>
                <input
                  type="color"
                  value={darkColor}
                  onChange={(e) => setDarkColor(e.target.value)}
                  style={{
                    width: '48px',
                    height: '48px',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    padding: 0
                  }}
                />
              </div>
              <input
                type="text"
                value={darkColor}
                onChange={(e) => chroma.valid(e.target.value) && setDarkColor(e.target.value)}
                style={{
                  flex: 1,
                  padding: '10px 12px',
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontFamily: 'monospace'
                }}
              />
            </div>
          </div>

          {/* Swap Button */}
          <button
            onClick={handleSwapColors}
            style={{
              marginTop: '28px',
              padding: '10px',
              border: '1px solid var(--color-border)',
              borderRadius: '8px',
              background: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Swap colors"
          >
            <RefreshCw size={16} />
          </button>

          {/* Light Color */}
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: '12px', fontWeight: 500, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '8px' }}>
              Light Color (Highlights)
            </label>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <div style={{ position: 'relative' }}>
                <input
                  type="color"
                  value={lightColor}
                  onChange={(e) => setLightColor(e.target.value)}
                  style={{
                    width: '48px',
                    height: '48px',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    padding: 0
                  }}
                />
              </div>
              <input
                type="text"
                value={lightColor}
                onChange={(e) => chroma.valid(e.target.value) && setLightColor(e.target.value)}
                style={{
                  flex: 1,
                  padding: '10px 12px',
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontFamily: 'monospace'
                }}
              />
            </div>
          </div>
        </div>

        {/* Preview */}
        {currentDuotone && (
          <div style={{ marginTop: '20px' }}>
            <div style={{ 
              height: '120px', 
              borderRadius: '12px', 
              background: currentDuotone.gradient,
              position: 'relative',
              overflow: 'hidden'
            }}>
              {showImagePreview && (
                <>
                  <div 
                    dangerouslySetInnerHTML={{ __html: getDuotoneSvgFilter(darkColor, lightColor, 'preview-filter') }}
                  />
                  <img
                    src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800"
                    alt="Preview"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      filter: `url(#preview-filter)`
                    }}
                  />
                </>
              )}
            </div>
            
            <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
              <button
                onClick={() => setShowImagePreview(!showImagePreview)}
                className="btn btn-secondary"
                style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}
              >
                <Image size={14} />
                {showImagePreview ? 'Hide' : 'Show'} Image Preview
              </button>
              <button
                onClick={handleAddCustom}
                className="btn btn-secondary"
                style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}
              >
                <Plus size={14} />
                Save Duotone
              </button>
              <button
                onClick={() => copyToClipboard(currentDuotone.gradient)}
                className="btn btn-secondary"
                style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}
              >
                <Copy size={14} />
                Copy CSS
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Presets */}
      <div>
        <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>Presets</h3>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', 
          gap: '12px' 
        }}>
          {DUOTONE_PRESETS.map((preset, index) => (
            <button
              key={preset.name}
              onClick={() => handlePresetSelect(index)}
              style={{
                padding: '0',
                border: selectedPreset === index ? '.5px solid var(--color-primary)' : '.5px solid var(--color-border)',
                borderRadius: '12px',
                background: 'white',
                cursor: 'pointer',
                overflow: 'hidden',
                transition: 'all 0.2s'
              }}
            >
              <div style={{
                height: '60px',
                background: `linear-gradient(135deg, ${preset.dark} 0%, ${preset.light} 100%)`
              }} />
              <div style={{ padding: '8px', fontSize: '11px', fontWeight: 500 }}>
                {preset.name}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* From Palette */}
      {paletteDuotones.length > 0 && (
        <div>
          <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Palette size={16} />
            Generated from Your Palette
          </h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', 
            gap: '12px' 
          }}>
            {paletteDuotones.slice(0, 8).map((duotone) => (
              <div
                key={duotone.id}
                style={{
                  border: '1px solid var(--color-border)',
                  borderRadius: '10px',
                  background: 'white',
                  overflow: 'hidden'
                }}
              >
                <div style={{
                  height: '80px',
                  background: duotone.gradient
                }} />
                <div style={{ padding: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <div style={{ 
                      width: '20px', 
                      height: '20px', 
                      borderRadius: '4px', 
                      background: duotone.darkColor,
                      border: '1px solid rgba(0,0,0,0.1)'
                    }} />
                    <div style={{ 
                      width: '20px', 
                      height: '20px', 
                      borderRadius: '4px', 
                      background: duotone.lightColor,
                      border: '1px solid rgba(0,0,0,0.1)'
                    }} />
                  </div>
                  <button
                    onClick={() => exportDuotone(duotone)}
                    className="btn btn-secondary"
                    style={{ padding: '4px 8px', fontSize: '11px' }}
                  >
                    <Download size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Custom Duotones */}
      {customDuotones.length > 0 && (
        <div>
          <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>Saved Duotones</h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', 
            gap: '12px' 
          }}>
            {customDuotones.map((duotone) => (
              <div
                key={duotone.id}
                style={{
                  border: '1px solid var(--color-border)',
                  borderRadius: '10px',
                  background: 'white',
                  overflow: 'hidden'
                }}
              >
                <div style={{
                  height: '80px',
                  background: duotone.gradient
                }} />
                <div style={{ padding: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>
                    {duotone.darkColor} → {duotone.lightColor}
                  </span>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button
                      onClick={() => exportDuotone(duotone)}
                      className="btn btn-secondary"
                      style={{ padding: '4px 8px', fontSize: '11px' }}
                    >
                      <Download size={12} />
                    </button>
                    <button
                      onClick={() => handleDeleteCustom(duotone.id)}
                      className="btn btn-secondary"
                      style={{ padding: '4px 8px', fontSize: '11px', color: '#ef4444' }}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CSS Output */}
      {currentDuotone && (
        <div style={{
          background: '#1e1e1e',
          borderRadius: '12px',
          padding: '16px',
          fontFamily: 'monospace',
          fontSize: '12px',
          color: '#d4d4d4'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ color: '#808080' }}>/* CSS Gradient */</span>
            <button
              onClick={() => copyToClipboard(`background: ${currentDuotone.gradient};`)}
              style={{ background: 'transparent', border: 'none', color: '#808080', cursor: 'pointer' }}
            >
              <Copy size={14} />
            </button>
          </div>
          <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
            <span style={{ color: '#9cdcfe' }}>background</span>
            <span style={{ color: '#d4d4d4' }}>: </span>
            <span style={{ color: '#ce9178' }}>{currentDuotone.gradient}</span>
            <span style={{ color: '#d4d4d4' }}>;</span>
          </pre>
        </div>
      )}
    </div>
  );
};
