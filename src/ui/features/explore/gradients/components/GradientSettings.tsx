import React from 'react';
import { Sliders, Plus } from 'lucide-react';

interface GradientSettingsProps {
  intensity: number;
  setIntensity: (val: number) => void;
  onCreateCustom: () => void;
}

export const GradientSettings: React.FC<GradientSettingsProps> = ({ intensity, setIntensity, onCreateCustom }) => {
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      marginBottom: '24px',
      padding: '16px',
      backgroundColor: 'white',
      borderRadius: '12px',
      border: '1px solid var(--color-border-light)',
      boxShadow: 'var(--shadow-sm)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sliders size={18} color="var(--color-text-secondary)" />
          <span style={{ fontSize: '14px', fontWeight: 500 }}>Intensity</span>
        </div>
        <input 
          type="range" 
          min="0" 
          max="100" 
          value={intensity} 
          onChange={(e) => setIntensity(parseInt(e.target.value))}
          style={{ width: '120px' }}
        />
        <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>{intensity}%</span>
      </div>

      <button className="btn btn-primary" onClick={onCreateCustom}>
        <Plus size={16} style={{ marginRight: '6px' }} />
        Create Custom Gradient
      </button>
    </div>
  );
};

