import React, { useState, useMemo } from 'react';
import { TRENDING_PALETTES, Palette } from './data';
import { PaletteCard } from './PaletteCard';
import { PaletteDetailPanel } from './PaletteDetailModal';
import { Search, Shuffle } from 'lucide-react';
import { FilterPopover, StyleFilter, ColorFilter } from './FilterPopover';

export const ExplorePalettesModule: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [palettes, setPalettes] = useState<Palette[]>(() => {
    return [...TRENDING_PALETTES].sort(() => 0.5 - Math.random());
  });
  const [selectedPalette, setSelectedPalette] = useState<Palette | null>(null);
  
  // Filter States
  const [selectedStyles, setSelectedStyles] = useState<StyleFilter[]>([]);
  const [selectedColors, setSelectedColors] = useState<ColorFilter[]>([]);

  const filteredPalettes = useMemo(() => {
    return palettes.filter(p => {
      // 1. Search Term
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
      if (!matchesSearch) return false;

      // 2. Style Filter
      if (selectedStyles.length > 0) {
        const paletteStyles = (p.tags?.styles || []).map(s => s.toLowerCase());
        const hasStyle = selectedStyles.some(s => paletteStyles.includes(s.toLowerCase()));
        if (!hasStyle) return false;
      }

      // 3. Color Filter
      if (selectedColors.length > 0) {
          const paletteColors = (p.tags?.colors || []).map(c => c.toLowerCase());
          const hasColor = selectedColors.some(c => paletteColors.includes(c.toLowerCase()));
          if (!hasColor) return false;
      }

      return true;
    });
  }, [palettes, searchTerm, selectedStyles, selectedColors]);

  const handleStyleChange = (style: StyleFilter) => {
      setSelectedStyles(prev => 
        prev.includes(style) ? prev.filter(s => s !== style) : [...prev, style]
      );
  };

  const handleColorChange = (color: ColorFilter) => {
      setSelectedColors(prev => 
        prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color]
      );
  };

  const clearFilters = () => {
      setSelectedStyles([]);
      setSelectedColors([]);
  };

  return (
    <div className="animate-fade-in" style={{ 
        display: 'flex',
        height: '100%',
        width: '100%',
        overflow: 'hidden',
        gap: '16px'
    }}>
      {/* Main Content Area */}
      <div className="no-scrollbar" style={{ 
          flex: 1, 
          height: '100%', 
          overflowY: 'auto', 
          paddingBottom: '40px',
          paddingRight: selectedPalette ? '0' : '0' 
      }}>
          <div style={{ padding: '0 0 24px 0' }}>
            
            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                    <div style={{ 
                    position: 'absolute', 
                    left: '12px', 
                    top: '50%', 
                    transform: 'translateY(-50%)',
                    color: 'var(--color-text-tertiary)' 
                    }}>
                    <Search size={18} />
                    </div>
                    <input
                    type="text"
                    placeholder="Search palettes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ paddingLeft: '40px', width: '100%', boxSizing: 'border-box' }}
                    />
                </div>
                
                <FilterPopover 
                    selectedStyles={selectedStyles}
                    selectedColors={selectedColors}
                    onStyleChange={handleStyleChange}
                    onColorChange={handleColorChange}
                    onClear={clearFilters}
                />
            </div>

            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: selectedPalette 
                    ? 'repeat(auto-fill, minmax(240px, 1fr))' 
                    : 'repeat(auto-fill, minmax(280px, 1fr))', 
                gap: '16px' 
            }}>
                {filteredPalettes.map((palette) => (
                <PaletteCard 
                    key={palette.name} 
                    palette={palette} 
                    onViewDetails={() => setSelectedPalette(palette)}
                />
                ))}
            </div>
            
            {filteredPalettes.length === 0 && (
                <div style={{ 
                textAlign: 'center', 
                padding: '40px', 
                color: 'var(--color-text-secondary)' 
                }}>
                No palettes found matching "{searchTerm}"
                {(selectedStyles.length > 0 || selectedColors.length > 0) && (
                    <div style={{ marginTop: '8px' }}>
                        Try clearing your filters.
                    </div>
                )}
                </div>
            )}
          </div>
      </div>

      {/* Right Sidebar */}
      {selectedPalette && (
        <PaletteDetailPanel 
          palette={selectedPalette} 
          onClose={() => setSelectedPalette(null)} 
        />
      )}
    </div>
  );
};
