import React, { useState, useEffect } from 'react';
import { Blend, BarChart3, Spline, Droplets } from 'lucide-react';
import { DuotoneGenerator } from '../duotone/DuotoneGenerator';
import { ColorRampGenerator } from '../ramp/ColorRampGenerator';
import { ColorInterpolator } from '../interpolation/ColorInterpolator';
import { PerceptualMixer } from '../mixing/PerceptualMixer';

interface ColorOpsProps {
  palettes?: Record<string, { hex: string }[]>;
}

type TabId = 'ramp' | 'interpolation' | 'mixing' | 'duotone';

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'ramp', label: 'Color Ramp', icon: BarChart3 },
  { id: 'interpolation', label: 'Interpolate', icon: Spline },
  { id: 'mixing', label: 'Color Mixer', icon: Droplets },
  { id: 'duotone', label: 'Duotone', icon: Blend },
];

export const ColorOps: React.FC<ColorOpsProps> = ({ palettes }) => {
  const [activeTab, setActiveTab] = useState<TabId>('ramp');

  // Listen for export event from header and dispatch to active tab
  useEffect(() => {
    const handleExport = () => {
      // Dispatch to the appropriate sub-component based on active tab
      const eventMap: Record<TabId, string> = {
        duotone: 'duotone-export',
        ramp: 'color-ramp-export',
        interpolation: 'interpolation-export',
        mixing: 'mixing-export',
      };
      window.dispatchEvent(new CustomEvent(eventMap[activeTab]));
    };

    window.addEventListener('color-ops-export', handleExport);
    return () => window.removeEventListener('color-ops-export', handleExport);
  }, [activeTab]);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Tabs */}
      <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '4px' }}>
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 16px',
                borderRadius: '100px',
                fontSize: '13px',
                fontWeight: 500,
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s',
                background: activeTab === id ? 'white' : 'transparent',
                color: activeTab === id ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                boxShadow: activeTab === id ? 'var(--shadow-sm)' : 'none'
              }}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'duotone' && <DuotoneGenerator palettes={palettes} />}
      {activeTab === 'ramp' && <ColorRampGenerator palettes={palettes} />}
      {activeTab === 'interpolation' && <ColorInterpolator palettes={palettes} />}
      {activeTab === 'mixing' && <PerceptualMixer palettes={palettes} />}
    </div>
  );
};
