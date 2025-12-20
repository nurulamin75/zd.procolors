import React from 'react';
import { ColorToken } from '../../utils/tokens';
import { PreviewButtons } from './preview/Buttons';
import { PreviewInputs } from './preview/Inputs';
import { PreviewCards } from './preview/Cards';
import { PreviewAlerts } from './preview/Alerts';
import { PreviewNavigation } from './preview/Navigation';
import { PreviewDataDisplay } from './preview/DataDisplay';
import { PreviewMisc } from './preview/Misc';

interface LivePreviewProps {
  palettes: Record<string, ColorToken[]>;
}

const PreviewSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="section-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', minHeight: 'fit-content' }}>
    <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-text-primary)', margin: 0, marginBottom: '4px' }}>{title}</h3>
    <div style={{ overflow: 'visible' }}>
      {children}
    </div>
  </div>
);

export const LivePreview: React.FC<LivePreviewProps> = ({ palettes }) => {
  return (
    <div className="animate-fade-in" style={{ width: '100%', maxWidth: '100%' }}>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
        gap: '20px',
        paddingBottom: '40px',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        <PreviewSection title="Buttons">
          <PreviewButtons palettes={palettes} />
        </PreviewSection>

        <PreviewSection title="Inputs & Forms">
          <PreviewInputs palettes={palettes} />
        </PreviewSection>

        <PreviewSection title="Cards">
          <PreviewCards palettes={palettes} />
        </PreviewSection>

        <PreviewSection title="Alerts & Notifications">
          <PreviewAlerts palettes={palettes} />
        </PreviewSection>

        <PreviewSection title="Navigation">
          <PreviewNavigation palettes={palettes} />
        </PreviewSection>

        <PreviewSection title="Data Display">
          <PreviewDataDisplay palettes={palettes} />
        </PreviewSection>

        <PreviewSection title="Misc Components">
          <PreviewMisc palettes={palettes} />
        </PreviewSection>

      </div>
    </div>
  );
};
