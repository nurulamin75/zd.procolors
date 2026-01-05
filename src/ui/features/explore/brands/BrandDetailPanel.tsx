import React, { useState } from 'react';
import { BrandPalette, BrandColor, BrandColorCategory, BRAND_PALETTES } from './data';
import { X, Copy, Check, ExternalLink, ChevronDown, ChevronRight, FileCode, Type } from 'lucide-react';
import { copyToClipboard } from '../../../../utils/export';

interface BrandDetailPanelProps {
  brand: BrandPalette;
  onClose: () => void;
}

export const BrandDetailPanel: React.FC<BrandDetailPanelProps> = ({ brand, onClose }) => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(brand.categories.map(c => c.name))
  );

  const toggleCategory = (categoryName: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryName)) {
        newSet.delete(categoryName);
      } else {
        newSet.add(categoryName);
      }
      return newSet;
    });
  };

  const allColors = brand.categories.flatMap(cat => cat.colors.map(c => c.hex));

  const handleAddAllVariables = () => {
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

  const handleAddAllStyles = () => {
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

  // Get similar brands (same tags)
  const similarBrands = BRAND_PALETTES
    .filter(b => b.id !== brand.id)
    .filter(b => b.tags.some(tag => brand.tags.includes(tag)))
    .slice(0, 4);

  return (
    <div className="animate-fade-in" style={{
      width: '400px',
      height: '100%',
      backgroundColor: 'white',
      border: '1px solid var(--color-border)',
      borderRadius: '16px',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      position: 'sticky',
      top: 0,
      right: 0,
      flexShrink: 0
    }}>
      
      {/* Header - Color Bars */}
      <div style={{ 
        height: '100px', 
        display: 'flex', 
        position: 'relative', 
        flexShrink: 0 
      }}>
        {allColors.slice(0, 10).map((color, i) => (
          <div key={i} style={{ flex: 1, backgroundColor: color }} />
        ))}
        
        {/* Close Button */}
        <button 
          className="btn-icon" 
          onClick={onClose}
          style={{ 
            position: 'absolute',
            top: '12px', 
            right: '12px',
            background: 'white', 
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            width: '28px',
            height: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%'
          }}
          title="Close"
        >
          <X size={16} />
        </button>
      </div>

      {/* Scrollable Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
        
        {/* Title & Meta */}
        <div style={{ marginBottom: '20px' }}>
          <span style={{ 
            fontSize: '11px', 
            fontWeight: 500,
            color: 'var(--color-text-tertiary)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            {brand.company}
          </span>
          <h1 style={{ 
            fontSize: '20px', 
            margin: '4px 0 8px 0', 
            fontWeight: 700 
          }}>
            {brand.name}
          </h1>
          <p style={{ 
            fontSize: '13px', 
            color: 'var(--color-text-secondary)', 
            lineHeight: 1.5,
            margin: 0
          }}>
            {brand.description}
          </p>
          
          {/* Website Link */}
          <a
            href={brand.website}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '13px',
              color: 'var(--color-primary)',
              textDecoration: 'none',
              marginTop: '8px'
            }}
          >
            <ExternalLink size={14} />
            View documentation
          </a>
        </div>

        {/* Tags */}
        <div style={{ 
          display: 'flex', 
          gap: '6px', 
          flexWrap: 'wrap',
          marginBottom: '20px'
        }}>
          {brand.tags.map(tag => (
            <span
              key={tag}
              style={{
                fontSize: '12px',
                padding: '4px 10px',
                borderRadius: '12px',
                background: 'var(--color-bg-hover)',
                color: 'var(--color-text-secondary)'
              }}
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Quick Actions */}
        <div style={{ 
          display: 'flex', 
          gap: '8px', 
          marginBottom: '24px' 
        }}>
          <button 
            className="btn btn-primary" 
            onClick={handleAddAllVariables}
            style={{ flex: 1, fontSize: '13px' }}
          >
            <FileCode size={14} />
            Add as Variables
          </button>
          <button 
            className="btn btn-secondary" 
            onClick={handleAddAllStyles}
            style={{ flex: 1, fontSize: '13px' }}
          >
            <Type size={14} />
            Add as Styles
          </button>
        </div>

        <div style={{ 
          height: '1px', 
          background: 'var(--color-border-light)', 
          marginBottom: '20px' 
        }} />

        {/* Color Categories */}
        <section>
          <h3 style={{ 
            fontSize: '14px', 
            marginBottom: '12px', 
            fontWeight: 600,
            color: 'var(--color-text-primary)'
          }}>
            Color Palette ({allColors.length} colors)
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {brand.categories.map((category) => (
              <CategorySection 
                key={category.name}
                category={category}
                isExpanded={expandedCategories.has(category.name)}
                onToggle={() => toggleCategory(category.name)}
              />
            ))}
          </div>
        </section>

        {/* Similar Brands */}
        {similarBrands.length > 0 && (
          <section style={{ marginTop: '32px' }}>
            <h3 style={{ 
              fontSize: '14px', 
              marginBottom: '12px', 
              fontWeight: 600 
            }}>
              Similar Design Systems
            </h3>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr', 
              gap: '8px' 
            }}>
              {similarBrands.map(b => (
                <SimilarBrandCard key={b.id} brand={b} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

// Category Section Component
const CategorySection: React.FC<{
  category: BrandColorCategory;
  isExpanded: boolean;
  onToggle: () => void;
}> = ({ category, isExpanded, onToggle }) => {
  return (
    <div style={{
      background: 'var(--color-bg-hover)',
      borderRadius: '8px',
      overflow: 'hidden'
    }}>
      {/* Category Header */}
      <button
        onClick={onToggle}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 12px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontSize: '13px',
          fontWeight: 500,
          color: 'var(--color-text-primary)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          {category.name}
          <span style={{ 
            fontSize: '11px', 
            color: 'var(--color-text-tertiary)',
            fontWeight: 400
          }}>
            ({category.colors.length})
          </span>
        </div>
        
        {/* Mini color preview */}
        <div style={{ display: 'flex', gap: '2px' }}>
          {category.colors.slice(0, 5).map((color, i) => (
            <div
              key={i}
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '3px',
                backgroundColor: color.hex,
                border: '1px solid rgba(0,0,0,0.1)'
              }}
            />
          ))}
        </div>
      </button>

      {/* Expanded Colors */}
      {isExpanded && (
        <div style={{ padding: '0 12px 12px 12px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {category.colors.map((color, i) => (
              <ColorRow key={i} color={color} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Color Row Component
const ColorRow: React.FC<{ color: BrandColor }> = ({ color }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    copyToClipboard(color.hex);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div 
      onClick={handleCopy}
      style={{ 
        display: 'flex', 
        alignItems: 'center', 
        padding: '8px', 
        background: 'white', 
        borderRadius: '6px',
        cursor: 'pointer',
        transition: 'background 0.1s ease'
      }}
    >
      <div style={{ 
        width: '28px', 
        height: '28px', 
        borderRadius: '6px', 
        backgroundColor: color.hex,
        marginRight: '10px',
        border: '1px solid rgba(0,0,0,0.08)',
        flexShrink: 0
      }} />
      
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ 
          fontWeight: 500, 
          fontSize: '12px',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}>
          {color.name}
        </div>
        <div style={{ 
          fontSize: '11px', 
          color: 'var(--color-text-tertiary)',
          fontFamily: 'monospace'
        }}>
          {color.hex}
        </div>
      </div>
      
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        color: copied ? '#22C55E' : 'var(--color-text-tertiary)',
        transition: 'color 0.15s ease'
      }}>
        {copied ? <Check size={14} /> : <Copy size={14} />}
      </div>
    </div>
  );
};

// Similar Brand Card
const SimilarBrandCard: React.FC<{ brand: BrandPalette }> = ({ brand }) => {
  const previewColors = brand.categories
    .flatMap(cat => cat.colors.map(c => c.hex))
    .slice(0, 5);

  return (
    <div style={{ 
      background: 'var(--color-bg-hover)', 
      borderRadius: '8px', 
      padding: '10px',
      cursor: 'pointer'
    }}>
      <div style={{ 
        display: 'flex', 
        height: '24px', 
        borderRadius: '4px', 
        overflow: 'hidden', 
        marginBottom: '8px' 
      }}>
        {previewColors.map((c, i) => (
          <div key={i} style={{ flex: 1, background: c }} />
        ))}
      </div>
      <div style={{ 
        fontSize: '11px', 
        fontWeight: 500,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        color: 'var(--color-text-primary)'
      }}>
        {brand.name}
      </div>
      <div style={{ 
        fontSize: '10px',
        color: 'var(--color-text-tertiary)'
      }}>
        {brand.company}
      </div>
    </div>
  );
};
