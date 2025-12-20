import React from 'react';
import { FileJson, FileCode, Palette, Download } from 'lucide-react';

interface ExportSectionProps {
  onExport: (format: 'json' | 'css' | 'tailwind' | 'figma' | 'download' | 'copy-all' | 'figma-variables') => void;
}

export const ExportSection: React.FC<ExportSectionProps> = ({ onExport }) => {
  return (
    <div style={{ paddingTop: '24px', borderTop: '1px solid var(--color-border)' }}>
      <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '20px' }}>Export Tokens</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        
        {/* JSON Card */}
        <div className="export-card" onClick={() => onExport('download')}>
           <div className="export-icon-wrapper">
              <FileJson size={24} strokeWidth={1.5} />
           </div>
           <div className="export-details">
              <div className="export-title">JSON</div>
              <div className="export-action">Download <Download size={12} /></div>
           </div>
        </div>

        {/* CSS Card */}
        <div className="export-card" onClick={() => onExport('css')}>
           <div className="export-icon-wrapper">
              <FileCode size={24} strokeWidth={1.5} />
           </div>
           <div className="export-details">
              <div className="export-title">CSS Variables</div>
              <div className="export-action">Copy Code</div>
           </div>
        </div>

        {/* Tailwind Card */}
        <div className="export-card" onClick={() => onExport('tailwind')}>
           <div className="export-icon-wrapper">
              <div style={{ fontSize: '20px', fontWeight: 700, fontFamily: 'sans-serif' }}>Tw</div>
           </div>
           <div className="export-details">
              <div className="export-title">Tailwind Config</div>
              <div className="export-action">Copy Code</div>
           </div>
        </div>

        {/* Figma Card */}
        <div className="export-card" onClick={() => onExport('figma-variables')}>
           <div className="export-icon-wrapper">
              <Palette size={24} strokeWidth={1.5} />
           </div>
           <div className="export-details">
              <div className="export-title">Figma Tokens</div>
              <div className="export-action">Sync Variables</div>
           </div>
        </div>

      </div>
    </div>
  );
};

// Add styles directly here for component specificity or could move to css
const styles = `
.export-card {
  background: white;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.export-card:hover {
  border-color: var(--color-primary);
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  transform: translateY(-2px);
}

.export-icon-wrapper {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  background-color: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-primary);
}

.export-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.export-title {
  font-size: 14px;
  fontWeight: 600;
  color: var(--color-text-primary);
}

.export-action {
  font-size: 12px;
  color: var(--color-text-secondary);
  display: flex;
  align-items: center;
  gap: 4px;
}
`;

// Inject styles (quick hack for MVP, better in CSS file)
const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);
