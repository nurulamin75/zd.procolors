import React, { useState } from 'react';
import { Palette } from './data';
import { Copy, Type, FileCode, Check } from 'lucide-react';
import { copyToClipboard } from '../../../../utils/export';

interface PaletteCardProps {
  palette: Palette;
  onViewDetails: () => void;
}

export const PaletteCard: React.FC<PaletteCardProps> = ({ palette, onViewDetails }) => {
  const [copiedColor, setCopiedColor] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  const handleCopyColor = (color: string) => {
    copyToClipboard(color);
    setCopiedColor(color);
    setTimeout(() => setCopiedColor(null), 1500);
  };

  const handleCopyAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    const colors = JSON.stringify(palette.colors);
    copyToClipboard(colors);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 1500);
  };

  const handleAddVariables = (e: React.MouseEvent) => {
    e.stopPropagation();
    parent.postMessage({ 
      pluginMessage: { 
        type: 'explore-add-variables', 
        palette 
      } 
    }, '*');
  };

  const handleAddStyles = (e: React.MouseEvent) => {
    e.stopPropagation();
    parent.postMessage({ 
      pluginMessage: { 
        type: 'explore-add-styles', 
        palette 
      } 
    }, '*');
  };

  return (
    <div className="section-card" style={{ 
      padding: '16px',
      marginBottom: '4px',
      cursor: 'default',
      transition: 'transform 0.2s, box-shadow 0.2s',
      position: 'relative'
    }}>
      {/* Clickable Header Area to Open Details */}
      <div 
        onClick={onViewDetails}
        style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '8px',
          cursor: 'pointer' // Indicate interactivity
        }}
      >
        <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 600 }}>{palette.name}</h3>
        
        {/* Re-added simple Copy All button as a lightweight action */}
        {/* <button 
          className="btn-icon" 
          onClick={handleCopyAll}
          title="Copy all colors as JSON"
          style={{ padding: '6px' }}
        >
          {copiedAll ? <Check size={16} color="green" /> : <Copy size={16} />}
        </button> */}
      </div>

      <div style={{ 
        display: 'flex', 
        height: '96px', 
        borderRadius: '8px', 
        overflow: 'hidden',
        marginBottom: '16px',
        // boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.05)'
      }}>
        {palette.colors.map((color, idx) => (
          <div 
            key={`${color}-${idx}`}
            onClick={() => handleCopyColor(color)}
            style={{ 
              flex: 1, 
              backgroundColor: color, 
              position: 'relative',
              cursor: 'copy',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title={`Click to copy ${color}`}
          >
            {copiedColor === color && (
              <div style={{ 
                backgroundColor: 'rgba(0,0,0,0.6)', 
                borderRadius: '4px', 
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Check size={14} color="white" />
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '8px' }}>
        <button 
          className="btn btn-secondary" 
          onClick={handleAddVariables}
          style={{ flex: 1, fontSize: '13px', padding: '6px 12px' }}
        >
          <FileCode size={14} />
          Variables
        </button>
        <button 
          className="btn btn-secondary" 
          onClick={handleAddStyles}
          style={{ flex: 1, fontSize: '13px', padding: '6px 12px' }}
        >
          <Type size={14} />
          Styles
        </button>
      </div>
    </div>
  );
};
