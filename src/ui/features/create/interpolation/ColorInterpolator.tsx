import React, { useState, useMemo, useEffect } from 'react';
import { Copy, Download, Plus, Trash2, Spline, ArrowRight, Play } from 'lucide-react';
import chroma from 'chroma-js';
import { 
  interpolateColors,
  interpolateBetweenTwo,
  ColorSpace
} from '../../../../utils/colorMixing';

interface ColorInterpolatorProps {
  palettes?: Record<string, { hex: string }[]>;
}

type Easing = 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';

export const ColorInterpolator: React.FC<ColorInterpolatorProps> = ({ palettes }) => {
  const [colorStops, setColorStops] = useState<string[]>(['#3b82f6', '#8b5cf6', '#ec4899']);
  const [steps, setSteps] = useState(7);
  const [colorSpace, setColorSpace] = useState<ColorSpace>('oklab');
  const [easing, setEasing] = useState<Easing>('linear');
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationProgress, setAnimationProgress] = useState(0);

  // Generate interpolated colors
  const interpolatedColors = useMemo(() => {
    try {
      return interpolateColors(colorStops, { steps, colorSpace, easing });
    } catch {
      return [];
    }
  }, [colorStops, steps, colorSpace, easing]);

  // Color space comparison
  const colorSpaceComparison = useMemo(() => {
    const spaces: ColorSpace[] = ['rgb', 'hsl', 'lab', 'lch', 'oklab'];
    return spaces.map(space => ({
      space,
      colors: interpolateColors(colorStops, { steps, colorSpace: space, easing })
    }));
  }, [colorStops, steps, easing]);

  const handleAddStop = () => {
    const lastColor = colorStops[colorStops.length - 1] || '#000000';
    setColorStops([...colorStops, chroma(lastColor).set('hsl.h', '+60').hex()]);
  };

  const handleRemoveStop = (index: number) => {
    if (colorStops.length > 2) {
      setColorStops(colorStops.filter((_, i) => i !== index));
    }
  };

  const handleUpdateStop = (index: number, color: string) => {
    const newStops = [...colorStops];
    newStops[index] = color;
    setColorStops(newStops);
  };

  const handleMoveStop = (index: number, direction: 'left' | 'right') => {
    const newIndex = direction === 'left' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= colorStops.length) return;
    
    const newStops = [...colorStops];
    [newStops[index], newStops[newIndex]] = [newStops[newIndex], newStops[index]];
    setColorStops(newStops);
  };

  const startAnimation = () => {
    setIsAnimating(true);
    setAnimationProgress(0);
    
    const duration = 2000;
    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      setAnimationProgress(progress);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setIsAnimating(false);
      }
    };
    
    requestAnimationFrame(animate);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const exportToFigma = () => {
    parent.postMessage({
      pluginMessage: {
        type: 'create-interpolation-palette',
        colors: interpolatedColors,
        name: `Interpolation (${colorSpace})`
      }
    }, '*');
  };

  const getCurrentAnimationColor = () => {
    if (!isAnimating || interpolatedColors.length === 0) return null;
    const index = Math.floor(animationProgress * (interpolatedColors.length - 1));
    return interpolatedColors[Math.min(index, interpolatedColors.length - 1)];
  };

  // Listen for export event from header button
  useEffect(() => {
    const handleExport = () => {
      if (interpolatedColors.length > 0) {
        exportToFigma();
      }
    };

    window.addEventListener('interpolation-export', handleExport);
    return () => window.removeEventListener('interpolation-export', handleExport);
  }, [interpolatedColors]);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Color Stops */}
      <div style={{ 
        background: 'white', 
        borderRadius: '16px', 
        padding: '20px',
      }}>
        <label style={{ fontSize: '12px', fontWeight: 500, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '12px' }}>
          Color Stops ({colorStops.length})
        </label>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
          {colorStops.map((color, index) => (
            <div 
              key={index} 
              style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <input
                  type="color"
                  value={color}
                  onChange={(e) => handleUpdateStop(index, e.target.value)}
                  style={{
                    width: '48px',
                    height: '48px',
                    border: '2px solid var(--color-border)',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    padding: 0
                  }}
                />
              </div>
              <input
                type="text"
                value={color}
                onChange={(e) => chroma.valid(e.target.value) && handleUpdateStop(index, e.target.value)}
                style={{
                  width: '70px',
                  padding: '4px',
                  border: '1px solid var(--color-border)',
                  borderRadius: '4px',
                  fontSize: '10px',
                  fontFamily: 'monospace',
                  textAlign: 'center'
                }}
              />
              {colorStops.length > 2 && (
                <button
                  onClick={() => handleRemoveStop(index)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '2px',
                    color: '#ef4444',
                    fontSize: '10px'
                  }}
                >
                  <Trash2 size={12} />
                </button>
              )}
              {index < colorStops.length - 1 && (
                <ArrowRight size={16} style={{ color: 'var(--color-text-secondary)', marginTop: '8px' }} />
              )}
            </div>
          ))}
          
          <button
            onClick={handleAddStop}
            style={{
              width: '48px',
              height: '48px',
              border: '2px dashed var(--color-border)',
              borderRadius: '8px',
              background: 'transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-text-secondary)'
            }}
          >
            <Plus size={20} />
          </button>
        </div>

        {/* Settings */}
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '20px' }}>
          <div>
            <label style={{ fontSize: '11px', fontWeight: 500, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '4px' }}>
              Steps
            </label>
            <input
              type="number"
              min={2}
              max={30}
              value={steps}
              onChange={(e) => setSteps(Math.max(2, Math.min(30, parseInt(e.target.value) || 2)))}
              style={{
                width: '70px',
                padding: '8px',
                border: '1px solid var(--color-border)',
                borderRadius: '6px',
                fontSize: '13px'
              }}
            />
          </div>
          
          <div>
            <label style={{ fontSize: '11px', fontWeight: 500, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '4px' }}>
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
                background: 'white'
              }}
            >
              <option value="oklab">OKLAB (Perceptual)</option>
              <option value="lab">LAB</option>
              <option value="lch">LCH</option>
              <option value="hsl">HSL</option>
              <option value="hcl">HCL</option>
              <option value="rgb">RGB</option>
            </select>
          </div>
          
          <div>
            <label style={{ fontSize: '11px', fontWeight: 500, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '4px' }}>
              Easing
            </label>
            <select
              value={easing}
              onChange={(e) => setEasing(e.target.value as Easing)}
              style={{
                padding: '8px 12px',
                border: '1px solid var(--color-border)',
                borderRadius: '6px',
                fontSize: '13px',
                background: 'white'
              }}
            >
              <option value="linear">Linear</option>
              <option value="ease-in">Ease In</option>
              <option value="ease-out">Ease Out</option>
              <option value="ease-in-out">Ease In-Out</option>
            </select>
          </div>
        </div>

        {/* Animation Preview */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <label style={{ fontSize: '11px', fontWeight: 500, color: 'var(--color-text-secondary)' }}>
              Animation Preview
            </label>
            <button
              onClick={startAnimation}
              disabled={isAnimating}
              style={{
                padding: '4px 10px',
                border: '1px solid var(--color-border)',
                borderRadius: '4px',
                background: isAnimating ? 'var(--color-bg-hover)' : 'white',
                cursor: isAnimating ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '11px'
              }}
            >
              <Play size={12} />
              {isAnimating ? 'Playing...' : 'Play'}
            </button>
          </div>
          <div style={{ 
            height: '40px', 
            borderRadius: '8px',
            background: getCurrentAnimationColor() || interpolatedColors[0] || '#ccc',
            transition: 'background 0.1s ease',
            border: '1px solid var(--color-border)'
          }} />
        </div>

        {/* Result Preview */}
        <div>
          <label style={{ fontSize: '11px', fontWeight: 500, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '8px' }}>
            Interpolation Result
          </label>
          <div style={{ 
            display: 'flex', 
            borderRadius: '8px', 
            overflow: 'hidden',
            border: '1px solid var(--color-border)'
          }}>
            {interpolatedColors.map((color, index) => (
              <div
                key={index}
                style={{
                  flex: 1,
                  height: '50px',
                  background: color,
                  cursor: 'pointer',
                  transition: 'transform 0.15s'
                }}
                onClick={() => copyToClipboard(color)}
                title={`Click to copy: ${color}`}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'scaleY(1.1)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'scaleY(1)')}
              />
            ))}
          </div>
          <div style={{ display: 'flex', marginTop: '2px' }}>
            {interpolatedColors.map((color, index) => (
              <div
                key={index}
                style={{
                  flex: 1,
                  fontSize: '8px',
                  fontFamily: 'monospace',
                  textAlign: 'center',
                  color: 'var(--color-text-secondary)',
                  padding: '2px 1px'
                }}
              >
                {color}
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
          <button
            onClick={() => copyToClipboard(JSON.stringify(interpolatedColors))}
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}
          >
            <Copy size={14} />
            Copy Array
          </button>
        </div>
      </div>

      {/* Color Space Comparison */}
      <div style={{ 
        background: 'white', 
        borderRadius: '16px', 
        padding: '20px',
      }}>
        <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '16px' }}>
          Color Space Comparison
        </h3>
        <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '16px' }}>
          See how different color spaces interpolate between your colors. OKLAB provides the most perceptually uniform results.
        </p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {colorSpaceComparison.map(({ space, colors }) => (
            <div key={space} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ 
                width: '60px', 
                fontSize: '11px', 
                fontWeight: 500,
                color: space === colorSpace ? 'var(--color-primary)' : 'var(--color-text-secondary)'
              }}>
                {space.toUpperCase()}
              </div>
              <div style={{ 
                flex: 1, 
                display: 'flex', 
                height: '32px',
                borderRadius: '4px',
                overflow: 'hidden',
                border: space === colorSpace ? '2px solid var(--color-primary)' : '1px solid var(--color-border)'
              }}>
                {colors.map((color, index) => (
                  <div
                    key={index}
                    style={{
                      flex: 1,
                      background: color
                    }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Educational Info */}
      <div style={{ 
        background: 'white',
        borderRadius: '16px', 
        padding: '16px',
      }}>
        <h4 style={{ fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: '#0369a1' }}>
          💡 Understanding Color Spaces
        </h4>
        <ul style={{ fontSize: '12px', color: '#0c4a6e', margin: 0, paddingLeft: '16px', lineHeight: 1.6 }}>
          <li><strong>OKLAB:</strong> Best for perceptual uniformity. Colors appear evenly spaced to the human eye.</li>
          <li><strong>LAB:</strong> Device-independent, good for general color work.</li>
          <li><strong>LCH:</strong> Like LAB but with intuitive hue control.</li>
          <li><strong>HSL:</strong> Simple but can produce muddy midtones.</li>
          <li><strong>RGB:</strong> Direct but not perceptually uniform.</li>
        </ul>
      </div>
    </div>
  );
};
