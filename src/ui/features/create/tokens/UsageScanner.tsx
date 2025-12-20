import React, { useState } from 'react';
import { ScanEye, RefreshCw, CheckCircle2, X, ArrowRight } from 'lucide-react';
import { ColorToken } from '../../../../utils/tokens';
import chroma from 'chroma-js';

interface ColorUsage {
  color: string;
  count: number;
  locations: string[];
  suggestedToken?: string;
}

interface UsageScannerProps {
  onConvertToToken?: (color: string, tokenName: string) => void;
  onReplaceEverywhere?: (color: string, tokenName: string) => void;
}

export const UsageScanner: React.FC<UsageScannerProps> = ({
  onConvertToToken,
  onReplaceEverywhere
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [colorUsages, setColorUsages] = useState<ColorUsage[]>([]);
  const [selectedScope, setSelectedScope] = useState<'selection' | 'page' | 'file'>('selection');
  const [similarityThreshold, setSimilarityThreshold] = useState(5); // Color difference threshold

  const handleScan = async () => {
    setIsScanning(true);
    
    // Request scan from plugin
    parent.postMessage(
      {
        pluginMessage: {
          type: 'scan-colors',
          scope: selectedScope,
          threshold: similarityThreshold
        }
      },
      '*'
    );

    // Listen for results
    const handleMessage = (event: MessageEvent) => {
      if (event.data.pluginMessage?.type === 'scan-colors-result') {
        const colors = event.data.pluginMessage.colors;
        processColorData(colors);
        setIsScanning(false);
        window.removeEventListener('message', handleMessage);
      }
    };

    window.addEventListener('message', handleMessage);
  };

  const processColorData = (colors: Array<{ color: string; count: number; locations: string[] }>) => {
    // Group similar colors
    const grouped: ColorUsage[] = [];
    const processed = new Set<string>();

    colors.forEach(({ color, count, locations }) => {
      if (processed.has(color)) return;

      // Find similar colors
      const similar: ColorUsage = {
        color,
        count,
        locations
      };

      colors.forEach(({ color: otherColor, count: otherCount, locations: otherLocations }) => {
        if (color === otherColor) return;

        const color1 = chroma(color);
        const color2 = chroma(otherColor);
        const distance = chroma.deltaE(color1, color2);

        if (distance < similarityThreshold) {
          similar.count += otherCount;
          similar.locations.push(...otherLocations);
          processed.add(otherColor);
        }
      });

      // Suggest token name
      similar.suggestedToken = suggestTokenName(similar.color, grouped.length);

      grouped.push(similar);
      processed.add(color);
    });

    // Sort by usage count
    grouped.sort((a, b) => b.count - a.count);
    setColorUsages(grouped);
  };

  const suggestTokenName = (color: string, index: number): string => {
    const c = chroma(color);
    const hue = c.get('hsl.h') || 0;
    const saturation = c.get('hsl.s');
    const lightness = c.get('hsl.l');

    // Categorize by hue
    let category = 'neutral';
    if (hue >= 0 && hue < 30) category = 'red';
    else if (hue >= 30 && hue < 60) category = 'yellow';
    else if (hue >= 60 && hue < 150) category = 'green';
    else if (hue >= 150 && hue < 240) category = 'blue';
    else if (hue >= 240 && hue < 300) category = 'purple';
    else if (hue >= 300 && hue < 360) category = 'pink';

    // Determine shade based on lightness
    let shade = 500;
    if (lightness > 0.9) shade = 50;
    else if (lightness > 0.8) shade = 100;
    else if (lightness > 0.7) shade = 200;
    else if (lightness > 0.6) shade = 300;
    else if (lightness > 0.5) shade = 400;
    else if (lightness > 0.4) shade = 600;
    else if (lightness > 0.3) shade = 700;
    else if (lightness > 0.2) shade = 800;
    else if (lightness > 0.1) shade = 900;
    else shade = 950;

    return `color.${category}.${shade}`;
  };

  const handleConvert = (color: string, tokenName: string) => {
    if (onConvertToToken) {
      onConvertToToken(color, tokenName);
    }
  };

  const handleReplace = (color: string, tokenName: string) => {
    if (onReplaceEverywhere) {
      onReplaceEverywhere(color, tokenName);
    }
  };

  return (
    <div className="section-card" style={{ padding: '24px 24px 8px 24px', marginBottom: 0 }}>
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '4px' }}>
          Usage-Based Token Suggestions
        </h3>
        <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
          Scan your design to find colors and suggest tokens
        </p>
      </div>

      {/* Scan Controls */}
      <div style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 500 }}>
            Scan Scope
          </label>
          <select
            value={selectedScope}
            onChange={(e) => setSelectedScope(e.target.value as any)}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid var(--color-border)',
              borderRadius: '6px',
              fontSize: '14px'
            }}
          >
            <option value="selection">Selection</option>
            <option value="page">Current Page</option>
            <option value="file">Entire File</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 500 }}>
            Similarity Threshold ({similarityThreshold})
          </label>
          <input
            type="range"
            min="1"
            max="20"
            value={similarityThreshold}
            onChange={(e) => setSimilarityThreshold(parseInt(e.target.value))}
            style={{ width: '100%' }}
          />
          <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
            Lower values group more similar colors together
          </div>
        </div>

        <button
          onClick={handleScan}
          disabled={isScanning}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
        >
          {isScanning ? (
            <>
              <RefreshCw size={16} className="spinning" />
              Scanning...
            </>
          ) : (
            <>
              <ScanEye size={16} />
              Scan Colors
            </>
          )}
        </button>
      </div>

      {/* Results */}
      {colorUsages.length > 0 && (
        <div>
          <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>
            Found {colorUsages.length} unique colors
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '500px', overflowY: 'auto' }}>
            {colorUsages.map((usage, idx) => (
              <div
                key={idx}
                style={{
                  padding: '12px',
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px',
                  backgroundColor: 'white'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '6px',
                      backgroundColor: usage.color,
                      border: '1px solid var(--color-border)'
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '13px', marginBottom: '2px' }}>
                      {usage.color}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                      Used {usage.count} time{usage.count !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>

                {usage.suggestedToken && (
                  <div style={{ marginBottom: '8px', padding: '8px', backgroundColor: 'var(--color-bg-hover)', borderRadius: '6px' }}>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                      Suggested token:
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: 600 }}>
                      {usage.suggestedToken}
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => handleConvert(usage.color, usage.suggestedToken || `color.${idx}`)}
                    className="btn btn-secondary"
                    style={{ flex: 1, fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                  >
                    <CheckCircle2 size={14} />
                    Convert to Token
                  </button>
                  <button
                    onClick={() => handleReplace(usage.color, usage.suggestedToken || `color.${idx}`)}
                    className="btn btn-primary"
                    style={{ flex: 1, fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                  >
                    <ArrowRight size={14} />
                    Replace Everywhere
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {colorUsages.length === 0 && !isScanning && (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-secondary)' }}>
          <ScanEye size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
          <p>Click "Scan Colors" to analyze your design</p>
        </div>
      )}
    </div>
  );
};

