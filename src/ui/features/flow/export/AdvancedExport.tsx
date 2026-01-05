import React, { useState } from 'react';
import { ColorToken } from '../../../../utils/tokens';
import { Check } from 'lucide-react';
import { 
  formatJSON, 
  formatCSS, 
  formatTailwind, 
  formatAndroidXML, 
  formatIOSSwift, 
  formatCSV,
  downloadFile,
  copyToClipboard
} from '../../../../utils/export';

interface AdvancedExportProps {
  palettes: Record<string, ColorToken[]>;
}

export const AdvancedExport: React.FC<AdvancedExportProps> = ({ palettes }) => {
  const [namingStyle, setNamingStyle] = useState<'simple' | 'tailwind' | 'material' | 'radix'>('simple');
  const [selectedFormat, setSelectedFormat] = useState<string | null>(null);
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);

  const handleExport = async (type: string) => {
    setSelectedFormat(type);
    
    try {
      let content = '';
      let filename = '';
      let mimeType = '';
      let shouldCopy = false;

      switch (type) {
        case 'json':
          content = formatJSON(palettes);
          filename = 'tokens.json';
          mimeType = 'application/json';
          break;
        case 'css':
          content = formatCSS(palettes, namingStyle);
          filename = 'tokens.css';
          mimeType = 'text/css';
          shouldCopy = true;
          break;
        case 'tailwind':
          content = formatTailwind(palettes, namingStyle);
          filename = 'tailwind.config.js';
          mimeType = 'text/javascript';
          shouldCopy = true;
          break;
        case 'android':
          content = formatAndroidXML(palettes, namingStyle);
          filename = 'colors.xml';
          mimeType = 'application/xml';
          break;
        case 'ios':
          content = formatIOSSwift(palettes, namingStyle);
          filename = 'Colors.swift';
          mimeType = 'text/x-swift';
          break;
        case 'csv':
          content = formatCSV(palettes, namingStyle);
          filename = 'tokens.csv';
          mimeType = 'text/csv';
          break;
        default:
          return;
      }

      if (shouldCopy) {
        await copyToClipboard(content);
        setCopiedFormat(type);
        // Show a brief visual feedback
        setTimeout(() => {
          setSelectedFormat(null);
          setCopiedFormat(null);
        }, 2000);
      } else {
        downloadFile(content, filename, mimeType);
        // Reset selection after download
        setTimeout(() => setSelectedFormat(null), 300);
      }
    } catch (error) {
      console.error('Export error:', error);
      setSelectedFormat(null);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="section-card">
         <h2 className="section-title">Advanced Export</h2>

         <div style={{ marginBottom: '24px' }}>
             <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '8px' }}>Naming Convention</label>
             <select 
                value={namingStyle}
                onChange={(e) => setNamingStyle(e.target.value as any)}
                style={{ width: '100%', padding: '8px', borderRadius: '8px' }}
             >
                 <option value="simple">Simple (primary-500)</option>
                 <option value="tailwind">Tailwind (text-primary-500)</option>
                 <option value="material">Material (md.ref.palette.primary50)</option>
                 <option value="radix">Radix (blue1, blue2)</option>
             </select>
         </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <button 
              className="btn btn-secondary" 
              onClick={() => handleExport('json')}
              style={{ 
                position: 'relative',
                border: selectedFormat === 'json' ? '2px solid var(--color-primary)' : undefined,
                opacity: selectedFormat === 'json' ? 0.8 : 1
              }}
            >
              Raw JSON
            </button>
            <button 
              className="btn btn-secondary" 
              onClick={() => handleExport('css')}
              style={{ 
                position: 'relative',
                border: copiedFormat === 'css' ? '2px solid #10b981' : selectedFormat === 'css' ? '2px solid var(--color-primary)' : undefined,
                background: copiedFormat === 'css' ? '#ecfdf5' : undefined,
              }}
            >
              {copiedFormat === 'css' ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}>
                  <Check size={16} color="#10b981" /> Copied!
                </span>
              ) : 'CSS Variables'}
            </button>
            <button 
              className="btn btn-secondary" 
              onClick={() => handleExport('tailwind')}
              style={{ 
                position: 'relative',
                border: copiedFormat === 'tailwind' ? '2px solid #10b981' : selectedFormat === 'tailwind' ? '2px solid var(--color-primary)' : undefined,
                background: copiedFormat === 'tailwind' ? '#ecfdf5' : undefined,
              }}
            >
              {copiedFormat === 'tailwind' ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}>
                  <Check size={16} color="#10b981" /> Copied!
                </span>
              ) : 'Tailwind Config'}
            </button>
            <button 
              className="btn btn-secondary" 
              onClick={() => handleExport('android')}
              style={{ 
                position: 'relative',
                border: selectedFormat === 'android' ? '2px solid var(--color-primary)' : undefined,
                opacity: selectedFormat === 'android' ? 0.8 : 1
              }}
            >
              Android XML
            </button>
            <button 
              className="btn btn-secondary" 
              onClick={() => handleExport('ios')}
              style={{ 
                position: 'relative',
                border: selectedFormat === 'ios' ? '2px solid var(--color-primary)' : undefined,
                opacity: selectedFormat === 'ios' ? 0.8 : 1
              }}
            >
              iOS Swift
            </button>
            <button 
              className="btn btn-secondary" 
              onClick={() => handleExport('csv')}
              style={{ 
                position: 'relative',
                border: selectedFormat === 'csv' ? '2px solid var(--color-primary)' : undefined,
                opacity: selectedFormat === 'csv' ? 0.8 : 1
              }}
            >
              CSV
            </button>
        </div>
      </div>
    </div>
  );
};

