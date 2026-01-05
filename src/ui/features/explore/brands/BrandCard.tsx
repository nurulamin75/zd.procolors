import React, { useState } from 'react';
import { BrandPalette } from './data';
import { Check, ExternalLink, FileCode, Type } from 'lucide-react';
import { copyToClipboard } from '../../../../utils/export';

interface BrandCardProps {
  brand: BrandPalette;
  onViewDetails: () => void;
  isSelected?: boolean;
}

export const BrandCard: React.FC<BrandCardProps> = ({ brand, onViewDetails, isSelected }) => {
  const [copiedColor, setCopiedColor] = useState<string | null>(null);

  // Get all colors from all categories for the preview
  const allColors = brand.categories.flatMap(cat => cat.colors.map(c => c.hex));
  const previewColors = allColors.slice(0, 8); // Show first 8 colors

  const handleCopyColor = (e: React.MouseEvent, color: string) => {
    e.stopPropagation();
    copyToClipboard(color);
    setCopiedColor(color);
    setTimeout(() => setCopiedColor(null), 1500);
  };

  const handleAddVariables = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Create a palette format compatible with the existing system
    const paletteData = {
      name: brand.name,
      colors: allColors,
      description: brand.description
    };
    parent.postMessage({ 
      pluginMessage: { 
        type: 'explore-add-variables', 
        palette: paletteData 
      } 
    }, '*');
  };

  const handleAddStyles = (e: React.MouseEvent) => {
    e.stopPropagation();
    const paletteData = {
      name: brand.name,
      colors: allColors,
      description: brand.description
    };
    parent.postMessage({ 
      pluginMessage: { 
        type: 'explore-add-styles', 
        palette: paletteData 
      } 
    }, '*');
  };

  return (
    <div 
      className="section-card" 
      style={{ 
        padding: '16px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        position: 'relative',
        border: isSelected ? '.5px solid var(--color-primary)' : '.5px solid var(--color-border)',
      }}
      onClick={onViewDetails}
    >
      {/* Company Badge */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start', 
        marginBottom: '8px' 
      }}>
        <div>
          <span style={{ 
            fontSize: '11px', 
            fontWeight: 500,
            color: 'var(--color-text-tertiary)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            {brand.company}
          </span>
          <h3 style={{ 
            margin: '4px 0 0 0', 
            fontSize: '15px', 
            fontWeight: 600,
            color: 'var(--color-text-primary)'
          }}>
            {brand.name}
          </h3>
        </div>
        <a
          href={brand.website}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          style={{
            padding: '4px',
            color: 'var(--color-text-tertiary)',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          title="Visit website"
        >
          <ExternalLink size={14} />
        </a>
      </div>

      {/* Color Grid Preview */}
      <div style={{ 
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '4px',
        height: '80px',
        borderRadius: '8px',
        overflow: 'hidden',
        marginBottom: '12px'
      }}>
        {previewColors.map((color, idx) => (
          <div 
            key={`${color}-${idx}`}
            onClick={(e) => handleCopyColor(e, color)}
            style={{ 
              backgroundColor: color, 
              position: 'relative',
              cursor: 'copy',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'transform 0.1s ease'
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
                <Check size={12} color="white" />
              </div>
            )}
          </div>
        ))}
        {/* Fill remaining slots if less than 8 colors */}
        {previewColors.length < 8 && Array(8 - previewColors.length).fill(null).map((_, idx) => (
          <div 
            key={`empty-${idx}`}
            style={{ 
              backgroundColor: 'var(--color-bg-hover)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          />
        ))}
      </div>

      {/* Tags */}
      <div style={{ 
        display: 'flex', 
        gap: '6px', 
        flexWrap: 'wrap',
        marginBottom: '12px'
      }}>
        {brand.tags.slice(0, 3).map(tag => (
          <span
            key={tag}
            style={{
              fontSize: '11px',
              padding: '3px 8px',
              borderRadius: '4px',
              background: 'var(--color-bg-hover)',
              color: 'var(--color-text-secondary)'
            }}
          >
            {tag}
          </span>
        ))}
        <span style={{
          fontSize: '11px',
          padding: '3px 8px',
          borderRadius: '4px',
          background: 'var(--color-bg-hover)',
          color: 'var(--color-text-tertiary)'
        }}>
          {allColors.length} colors
        </span>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <button 
          className="btn btn-secondary" 
          onClick={handleAddVariables}
          style={{ flex: 1, fontSize: '12px', padding: '6px 10px' }}
        >
          <FileCode size={14} />
          Variables
        </button>
        <button 
          className="btn btn-secondary" 
          onClick={handleAddStyles}
          style={{ flex: 1, fontSize: '12px', padding: '6px 10px' }}
        >
          <Type size={14} />
          Styles
        </button>
      </div>
    </div>
  );
};
