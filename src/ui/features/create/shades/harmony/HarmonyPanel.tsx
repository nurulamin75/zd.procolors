import React, { useState, useEffect, useCallback } from 'react';
import { ColorWheel } from './ColorWheel';
import { HarmonyType } from './HarmonyPresets';
import { GeneratedPalette } from './GeneratedPalette';
import { ApplyToManualButton } from './ApplyToManualButton';
import { 
  getAnalogous, 
  getMonochromatic, 
  getComplementary, 
  getSplitComplementary, 
  getTriadic, 
  getTetradic, 
  getSquare, 
  getShadesTintsTones 
} from '../../../../../utils/harmony';
import { isValidColor } from '../../../../../utils/color';
import { ChevronDown } from 'lucide-react';

// Simple Error Boundary
class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: string}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false, error: '' };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error: error.toString() };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("HarmonyPanel Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 20, color: '#ef4444', background: '#fee2e2', borderRadius: 8 }}>
          <h3 style={{ margin: '0 0 8px 0' }}>Something went wrong</h3>
          <pre style={{ fontSize: 11, overflow: 'auto' }}>{this.state.error}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

interface HarmonyPanelProps {
  onApply: (colors: string[]) => void;
}

const STORAGE_KEY = 'harmony_state';

interface HarmonyState {
  baseColor: string;
  harmonyType: HarmonyType;
  lockedColors: string[];
}

const HarmonyPanelContent: React.FC<HarmonyPanelProps> = ({ onApply }) => {
  const [baseColor, setBaseColor] = useState<string>('#3B82F6');
  const [harmonyType, setHarmonyType] = useState<HarmonyType>('analogous');
  const [lockedColors, setLockedColors] = useState<string[]>([]);
  const [generatedColors, setGeneratedColors] = useState<string[]>([]);

  // Load state from local storage safely
  useEffect(() => {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            const parsed: HarmonyState = JSON.parse(saved);
            if (isValidColor(parsed.baseColor)) setBaseColor(parsed.baseColor);
            if (parsed.harmonyType) setHarmonyType(parsed.harmonyType);
            if (parsed.lockedColors) setLockedColors(parsed.lockedColors);
        }
    } catch (e) {
        // Ignore security errors or parsing errors
        console.warn('Failed to load harmony state (likely restricted environment)', e);
    }
  }, []);

  // Save state to local storage safely
  useEffect(() => {
    try {
        const state: HarmonyState = {
            baseColor,
            harmonyType,
            lockedColors
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
        // Ignore security errors
        console.warn('Failed to save harmony state (likely restricted environment)', e);
    }
  }, [baseColor, harmonyType, lockedColors]);

  const generateColors = useCallback(() => {
    if (!isValidColor(baseColor)) return;

    let newColors: string[] = [];
    try {
        switch (harmonyType) {
        case 'analogous': newColors = getAnalogous(baseColor); break;
        case 'monochromatic': newColors = getMonochromatic(baseColor); break;
        case 'complementary': newColors = getComplementary(baseColor); break;
        case 'split-complementary': newColors = getSplitComplementary(baseColor); break;
        case 'triadic': newColors = getTriadic(baseColor); break;
        case 'tetradic': newColors = getTetradic(baseColor); break;
        case 'square': newColors = getSquare(baseColor); break;
        case 'shades': newColors = getShadesTintsTones(baseColor); break;
        default: newColors = [baseColor];
        }
    } catch (e) {
        console.error("Error generating colors:", e);
        newColors = [baseColor];
    }

    setGeneratedColors(prev => {
        if (prev.length === 0) return newColors;
        
        const finalColors = newColors.map((col, i) => {
            if (prev[i] && lockedColors.includes(prev[i])) {
                return prev[i];
            }
            return col;
        });
        
        return finalColors;
    });

  }, [baseColor, harmonyType, lockedColors]);

  // Initial generation
  useEffect(() => {
    generateColors();
  }, [generateColors]);

  const handleToggleLock = (color: string) => {
    setLockedColors(prev => {
      if (prev.includes(color)) {
        return prev.filter(c => c !== color);
      }
      return [...prev, color];
    });
  };

  const harmonyOptions: { id: HarmonyType; label: string }[] = [
    { id: 'analogous', label: 'Analogous' },
    { id: 'monochromatic', label: 'Monochromatic' },
    { id: 'complementary', label: 'Complementary' },
    { id: 'split-complementary', label: 'Split Complementary' },
    { id: 'triadic', label: 'Triadic' },
    { id: 'tetradic', label: 'Tetradic' },
    { id: 'square', label: 'Square' },
    { id: 'shades', label: 'Shades' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', opacity: 1 }}>
      {/* Box containing Color Wheel and Harmony Rule */}
      <div style={{ 
        background: 'white',
        // border: '1px solid var(--color-border)',
        borderRadius: '20px',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
      }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr', 
          gap: '24px',
          alignItems: 'start' 
        }}>
          <div>
            <h3 style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: '16px' }}>
              Base Color
            </h3>
            <ColorWheel color={baseColor} onChange={setBaseColor} />
          </div>
          
          <div>
            <h3 style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: '16px' }}>
              Color Harmony
            </h3>
            <div style={{ position: 'relative', marginBottom: '16px' }}>
              <select
                value={harmonyType}
                onChange={(e) => setHarmonyType(e.target.value as HarmonyType)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  paddingRight: '36px',
                  borderRadius: '8px',
                  border: '1px solid var(--color-border)',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: 'var(--color-text-primary)',
                  backgroundColor: 'white',
                  cursor: 'pointer',
                  appearance: 'none',
                  outline: 'none',
                  transition: 'all 0.2s'
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#3b82f6'}
                onBlur={(e) => e.currentTarget.style.borderColor = 'var(--color-border)'}
              >
                {harmonyOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown 
                size={16} 
                style={{ 
                  position: 'absolute', 
                  right: '12px', 
                  top: '50%', 
                  transform: 'translateY(-50%)',
                  pointerEvents: 'none',
                  color: 'var(--color-text-secondary)'
                }} 
              />
            </div>
            
            <div>
              <GeneratedPalette 
                colors={generatedColors} 
                lockedColors={lockedColors} 
                onToggleLock={handleToggleLock} 
              />
            </div>
          </div>
        </div>
      </div>
      
      <ApplyToManualButton onApply={() => onApply(generatedColors)} />
    </div>
  );
};

export const HarmonyPanel: React.FC<HarmonyPanelProps> = (props) => {
  return (
    <ErrorBoundary>
      <HarmonyPanelContent {...props} />
    </ErrorBoundary>
  );
};
