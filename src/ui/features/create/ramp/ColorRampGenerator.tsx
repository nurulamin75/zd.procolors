import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Copy, Download, Plus, Trash2, BarChart3, Sliders, RefreshCw, ChevronDown, MoreVertical } from 'lucide-react';
import chroma from 'chroma-js';
import { 
  generateColorRamp,
  generateDataVizRamp,
  interpolateColors,
  SEQUENTIAL_PRESETS,
  DIVERGING_PRESETS,
  ColorSpace
} from '../../../../utils/colorMixing';

interface ColorRampGeneratorProps {
  palettes?: Record<string, { hex: string }[]>;
}

type RampType = 'sequential' | 'diverging' | 'custom';

export const ColorRampGenerator: React.FC<ColorRampGeneratorProps> = ({ palettes }) => {
  const [rampType, setRampType] = useState<RampType>('sequential');
  const [steps, setSteps] = useState(9);
  const [colorSpace, setColorSpace] = useState<ColorSpace>('oklab');
  
  // Sequential/Custom settings
  const [baseColor, setBaseColor] = useState('#3b82f6');
  const [lightnessRange, setLightnessRange] = useState<[number, number]>([10, 95]);
  const [saturationShift, setSaturationShift] = useState(0);
  const [hueShift, setHueShift] = useState(0);
  
  // Diverging settings
  const [startColor, setStartColor] = useState('#b2182b');
  const [midColor, setMidColor] = useState('#f7f7f7');
  const [endColor, setEndColor] = useState('#2166ac');
  
  // Custom stops
  const [customStops, setCustomStops] = useState<string[]>(['#3b82f6', '#8b5cf6']);
  
  // Saved ramps
  const [savedRamps, setSavedRamps] = useState<{ name: string; colors: string[] }[]>([]);
  
  // Actions dropdown
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const actionsMenuRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (actionsMenuRef.current && !actionsMenuRef.current.contains(event.target as Node)) {
        setShowActionsMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Generate the current ramp
  const currentRamp = useMemo(() => {
    try {
      switch (rampType) {
        case 'sequential':
          return generateColorRamp({
            baseColor,
            steps,
            lightnessRange,
            saturationShift,
            hueShift,
            colorSpace
          });
        case 'diverging':
          return generateDataVizRamp(startColor, endColor, steps, true, midColor);
        case 'custom':
          return interpolateColors(customStops, { steps, colorSpace });
        default:
          return [];
      }
    } catch {
      return [];
    }
  }, [rampType, baseColor, steps, lightnessRange, saturationShift, hueShift, colorSpace, startColor, midColor, endColor, customStops]);

  // Listen for export event from header button
  useEffect(() => {
    const handleExport = () => {
      if (currentRamp.length > 0) {
        exportToFigma(currentRamp);
      }
    };

    window.addEventListener('color-ramp-export', handleExport);
    return () => window.removeEventListener('color-ramp-export', handleExport);
  }, [currentRamp]);

  const handlePresetSelect = (preset: { colors: string[] }) => {
    if (preset.colors.length === 2) {
      setStartColor(preset.colors[0]);
      setEndColor(preset.colors[1]);
      setRampType('sequential');
      setCustomStops(preset.colors);
    } else if (preset.colors.length === 3) {
      setStartColor(preset.colors[0]);
      setMidColor(preset.colors[1]);
      setEndColor(preset.colors[2]);
      setRampType('diverging');
    }
  };

  const handleAddCustomStop = () => {
    const lastColor = customStops[customStops.length - 1] || '#000000';
    setCustomStops([...customStops, chroma(lastColor).brighten(0.5).hex()]);
  };

  const handleRemoveCustomStop = (index: number) => {
    if (customStops.length > 2) {
      setCustomStops(customStops.filter((_, i) => i !== index));
    }
  };

  const handleUpdateCustomStop = (index: number, color: string) => {
    const newStops = [...customStops];
    newStops[index] = color;
    setCustomStops(newStops);
  };

  const handleSaveRamp = () => {
    const name = `Ramp ${savedRamps.length + 1}`;
    setSavedRamps([...savedRamps, { name, colors: currentRamp }]);
  };

  const handleDeleteSavedRamp = (index: number) => {
    setSavedRamps(savedRamps.filter((_, i) => i !== index));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const exportToFigma = (colors: string[]) => {
    parent.postMessage({
      pluginMessage: {
        type: 'create-color-ramp',
        colors,
        name: `Color Ramp ${rampType}`
      }
    }, '*');
  };

  const getCSSArray = (colors: string[]) => {
    return `[${colors.map(c => `'${c}'`).join(', ')}]`;
  };

  const getCSSGradient = (colors: string[]) => {
    const stops = colors.map((c, i) => `${c} ${(i / (colors.length - 1) * 100).toFixed(1)}%`).join(', ');
    return `linear-gradient(90deg, ${stops})`;
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Settings Panel */}
      <div style={{ 
        background: 'white', 
        borderRadius: '16px', 
        padding: '20px',
        position: 'relative'
      }}>
        {/* Actions dropdown - top right */}
        <div ref={actionsMenuRef} style={{ position: 'absolute', top: '16px', right: '16px' }}>
          <button
            onClick={() => setShowActionsMenu(!showActionsMenu)}
            className="btn btn-secondary"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 12px',
              fontSize: '12px'
            }}
          >
            Actions
            <ChevronDown size={14} />
          </button>
          {showActionsMenu && (
            <div style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: '4px',
              background: 'white',
              border: '1px solid var(--color-border)',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              minWidth: '160px',
              zIndex: 100,
              overflow: 'hidden'
            }}>
              <button
                onClick={() => { handleSaveRamp(); setShowActionsMenu(false); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  width: '100%',
                  padding: '10px 14px',
                  border: 'none',
                  background: 'transparent',
                  fontSize: '13px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  color: 'var(--color-text-primary)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#f3f4f6'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <Plus size={14} />
                Save Ramp
              </button>
              <button
                onClick={() => { copyToClipboard(getCSSArray(currentRamp)); setShowActionsMenu(false); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  width: '100%',
                  padding: '10px 14px',
                  border: 'none',
                  background: 'transparent',
                  fontSize: '13px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  color: 'var(--color-text-primary)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#f3f4f6'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <Copy size={14} />
                Copy Array
              </button>
              <button
                onClick={() => { copyToClipboard(getCSSGradient(currentRamp)); setShowActionsMenu(false); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  width: '100%',
                  padding: '10px 14px',
                  border: 'none',
                  background: 'transparent',
                  fontSize: '13px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  color: 'var(--color-text-primary)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#f3f4f6'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <Copy size={14} />
                Copy Gradient
              </button>
            </div>
          )}
        </div>

        {/* Settings Row - Ramp Type dropdown, Steps, Color Space */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap', marginBottom: '16px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 500, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '6px' }}>
              Ramp Type
            </label>
            <select
              value={rampType}
              onChange={(e) => setRampType(e.target.value as RampType)}
              style={{
                padding: '8px 12px',
                border: '1px solid var(--color-border)',
                borderRadius: '6px',
                fontSize: '13px',
                background: 'white',
                minWidth: '140px',
                cursor: 'pointer'
              }}
            >
              <option value="sequential">Sequential</option>
              <option value="diverging">Diverging</option>
              <option value="custom">Custom</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 500, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '6px' }}>
              Steps
            </label>
            <input
              type="number"
              min={2}
              max={20}
              value={steps}
              onChange={(e) => setSteps(Math.max(2, Math.min(20, parseInt(e.target.value) || 2)))}
              style={{
                width: '80px',
                padding: '8px 12px',
                border: '1px solid var(--color-border)',
                borderRadius: '6px',
                fontSize: '13px'
              }}
            />
          </div>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 500, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '6px' }}>
              Color Space
            </label>
            <select
              value={colorSpace}
              onChange={(e) => setColorSpace(e.target.value as ColorSpace)}
              style={{
                padding: '8px 12px',
                border: '1px solid var(--color-border)',
                borderRadius: '6px',
                fontSize: '13px',
                background: 'white',
                cursor: 'pointer'
              }}
            >
              <option value="oklab">OKLAB (Perceptual)</option>
              <option value="lab">LAB</option>
              <option value="lch">LCH</option>
              <option value="hsl">HSL</option>
              <option value="rgb">RGB</option>
            </select>
          </div>
        </div>

        {/* Type-specific Settings */}
        {rampType === 'sequential' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-end' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 500, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '6px' }}>
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
                      width: '100px',
                      padding: '8px 12px',
                      border: '1px solid var(--color-border)',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontFamily: 'monospace'
                    }}
                  />
                </div>
              </div>
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 500, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '6px' }}>
                Lightness Range: {lightnessRange[0]}% - {lightnessRange[1]}%
              </label>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <input
                  type="range"
                  min={0}
                  max={50}
                  value={lightnessRange[0]}
                  onChange={(e) => setLightnessRange([parseInt(e.target.value), lightnessRange[1]])}
                  style={{ flex: 1 }}
                />
                <input
                  type="range"
                  min={50}
                  max={100}
                  value={lightnessRange[1]}
                  onChange={(e) => setLightnessRange([lightnessRange[0], parseInt(e.target.value)])}
                  style={{ flex: 1 }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '12px', fontWeight: 500, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '6px' }}>
                  Saturation Shift: {saturationShift}%
                </label>
                <input
                  type="range"
                  min={-50}
                  max={50}
                  value={saturationShift}
                  onChange={(e) => setSaturationShift(parseInt(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '12px', fontWeight: 500, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '6px' }}>
                  Hue Shift: {hueShift}°
                </label>
                <input
                  type="range"
                  min={-30}
                  max={30}
                  value={hueShift}
                  onChange={(e) => setHueShift(parseInt(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>
            </div>
          </div>
        )}

        {rampType === 'diverging' && (
          <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-end' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 500, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '6px' }}>
                Start (Low)
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="color"
                  value={startColor}
                  onChange={(e) => setStartColor(e.target.value)}
                  style={{ width: '40px', height: '36px', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                />
                <input
                  type="text"
                  value={startColor}
                  onChange={(e) => chroma.valid(e.target.value) && setStartColor(e.target.value)}
                  style={{ width: '90px', padding: '8px', border: '1px solid var(--color-border)', borderRadius: '6px', fontSize: '11px', fontFamily: 'monospace' }}
                />
              </div>
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 500, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '6px' }}>
                Middle (Neutral)
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="color"
                  value={midColor}
                  onChange={(e) => setMidColor(e.target.value)}
                  style={{ width: '40px', height: '36px', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                />
                <input
                  type="text"
                  value={midColor}
                  onChange={(e) => chroma.valid(e.target.value) && setMidColor(e.target.value)}
                  style={{ width: '90px', padding: '8px', border: '1px solid var(--color-border)', borderRadius: '6px', fontSize: '11px', fontFamily: 'monospace' }}
                />
              </div>
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 500, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '6px' }}>
                End (High)
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="color"
                  value={endColor}
                  onChange={(e) => setEndColor(e.target.value)}
                  style={{ width: '40px', height: '36px', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                />
                <input
                  type="text"
                  value={endColor}
                  onChange={(e) => chroma.valid(e.target.value) && setEndColor(e.target.value)}
                  style={{ width: '90px', padding: '8px', border: '1px solid var(--color-border)', borderRadius: '6px', fontSize: '11px', fontFamily: 'monospace' }}
                />
              </div>
            </div>
          </div>
        )}

        {rampType === 'custom' && (
          <div>
            <label style={{ fontSize: '12px', fontWeight: 500, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '8px' }}>
              Color Stops
            </label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
              {customStops.map((color, index) => (
                <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => handleUpdateCustomStop(index, e.target.value)}
                    style={{ width: '36px', height: '36px', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                  />
                  {customStops.length > 2 && (
                    <button
                      onClick={() => handleRemoveCustomStop(index)}
                      style={{ 
                        background: 'transparent', 
                        border: 'none', 
                        cursor: 'pointer', 
                        padding: '4px',
                        color: 'var(--color-text-secondary)'
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={handleAddCustomStop}
                style={{
                  width: '36px',
                  height: '36px',
                  border: '2px dashed var(--color-border)',
                  borderRadius: '6px',
                  background: 'transparent',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Plus size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Ramp Preview */}
        <div style={{ marginTop: '20px' }}>
          <label style={{ fontSize: '12px', fontWeight: 500, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '8px' }}>
            Preview
          </label>
          <div style={{ 
            display: 'flex', 
            borderRadius: '8px', 
            overflow: 'hidden',
            border: '1px solid var(--color-border)'
          }}>
            {currentRamp.map((color, index) => (
              <div
                key={index}
                style={{
                  flex: 1,
                  height: '60px',
                  background: color,
                  position: 'relative',
                  cursor: 'pointer'
                }}
                onClick={() => copyToClipboard(color)}
                title={`Click to copy: ${color}`}
              />
            ))}
          </div>
          <div style={{ display: 'flex', marginTop: '4px' }}>
            {currentRamp.map((color, index) => (
              <div
                key={index}
                style={{
                  flex: 1,
                  fontSize: '9px',
                  fontFamily: 'monospace',
                  textAlign: 'center',
                  color: 'var(--color-text-secondary)',
                  padding: '4px 2px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                {color}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Presets */}
      <div>
        <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>Sequential Presets</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '12px', marginBottom: '20px' }}>
          {SEQUENTIAL_PRESETS.map((preset) => (
            <button
              key={preset.name}
              onClick={() => handlePresetSelect(preset)}
              style={{
                padding: '0',
                border: '.5px solid var(--color-border)',
                borderRadius: '12px',
                background: 'white',
                cursor: 'pointer',
                overflow: 'hidden'
              }}
            >
              <div style={{
                height: '56px',
                background: `linear-gradient(90deg, ${preset.colors.join(', ')})`
              }} />
              <div style={{ padding: '8px', fontSize: '12px', fontWeight: 500 }}>
                {preset.name}
              </div>
            </button>
          ))}
        </div>

        <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>Diverging Presets</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '12px' }}>
          {DIVERGING_PRESETS.map((preset) => (
            <button
              key={preset.name}
              onClick={() => handlePresetSelect(preset)}
              style={{
                padding: '0',
                border: '.5px solid var(--color-border)',
                borderRadius: '12px',
                background: 'white',
                cursor: 'pointer',
                overflow: 'hidden'
              }}
            >
              <div style={{
                height: '56px',
                background: `linear-gradient(90deg, ${preset.colors.join(', ')})`
              }} />
              <div style={{ padding: '8px', fontSize: '12px', fontWeight: 500 }}>
                {preset.name}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Saved Ramps */}
      {savedRamps.length > 0 && (
        <div>
          <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>Saved Ramps</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {savedRamps.map((ramp, index) => (
              <div
                key={index}
                style={{
                  background: 'white',
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px',
                  padding: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}
              >
                <div style={{ 
                  flex: 1, 
                  height: '32px', 
                  borderRadius: '4px',
                  background: getCSSGradient(ramp.colors)
                }} />
                <button
                  onClick={() => exportToFigma(ramp.colors)}
                  className="btn btn-secondary"
                  style={{ padding: '6px 10px', fontSize: '11px' }}
                >
                  <Download size={12} />
                </button>
                <button
                  onClick={() => handleDeleteSavedRamp(index)}
                  className="btn btn-secondary"
                  style={{ padding: '6px 10px', fontSize: '11px', color: '#ef4444' }}
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
