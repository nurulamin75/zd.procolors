import React, { useState, useEffect, useRef } from 'react';
import { HexColorPicker } from 'react-colorful';
import { Pipette, RefreshCcw, Hash } from 'lucide-react';
import { isValidColor } from '../../../../../utils/color';

interface ColorInputProps {
  label: string;
  color: string;
  onChange: (color: string) => void;
  onReset?: () => void;
}

export const ColorInput: React.FC<ColorInputProps> = ({ label, color, onChange, onReset }) => {
  const [showPicker, setShowPicker] = useState(false);
  const [inputValue, setInputValue] = useState(color);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setInputValue(color);
  }, [color]);

  const handleChange = (val: string) => {
    setInputValue(val);
    if (isValidColor(val)) {
      onChange(val);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setShowPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div style={{ flex: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>{label}</label>
        {onReset && (
            <button onClick={onReset} className="btn-icon" title="Reset">
                <RefreshCcw size={12} />
            </button>
        )}
      </div>
      
      <div style={{ position: 'relative' }}>
        <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            padding: '8px', 
            backgroundColor: 'white', 
            border: '1px solid var(--color-border)', 
            borderRadius: '10px',
            boxShadow: 'var(--shadow-sm)'
        }}>
            <div 
                onClick={() => setShowPicker(!showPicker)}
                style={{ 
                    width: '32px', 
                    height: '32px', 
                    borderRadius: '6px', 
                    backgroundColor: color,
                    border: '1px solid rgba(0,0,0,0.1)',
                    cursor: 'pointer',
                    flexShrink: 0
                }} 
            />
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Hash size={14} color="var(--color-text-tertiary)" />
                <input 
                    type="text" 
                    value={inputValue.replace('#', '')} 
                    onChange={(e) => handleChange('#' + e.target.value)}
                    style={{ 
                        width: '100%', 
                        border: 'none', 
                        outline: 'none', 
                        fontSize: '14px', 
                        fontFamily: 'monospace',
                        color: 'var(--color-text-primary)',
                        textTransform: 'uppercase'
                    }}
                />
            </div>
            {/* Mock Eyedropper - in a real app this would need browser API support which is limited in iframes */}
            <button className="btn-icon" title="Pick color" style={{ opacity: 0.5, cursor: 'not-allowed' }}>
                <Pipette size={16} />
            </button>
        </div>

        {showPicker && (
            <div ref={pickerRef} style={{ position: 'absolute', top: 'calc(100% + 8px)', left: 0, zIndex: 100 }}>
                <HexColorPicker color={color} onChange={onChange} />
            </div>
        )}
      </div>
    </div>
  );
};

