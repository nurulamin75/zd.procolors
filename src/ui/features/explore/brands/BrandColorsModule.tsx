import React, { useState, useMemo } from 'react';
import { BRAND_PALETTES, getAllBrandTags, BrandPalette } from './data';
import { BrandCard } from './BrandCard';
import { BrandDetailPanel } from './BrandDetailPanel';
import { Search, Filter, X } from 'lucide-react';

export const BrandColorsModule: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrand, setSelectedBrand] = useState<BrandPalette | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const allTags = useMemo(() => getAllBrandTags(), []);

  const filteredBrands = useMemo(() => {
    return BRAND_PALETTES.filter(brand => {
      // Search filter
      const matchesSearch = 
        brand.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        brand.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        brand.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (!matchesSearch) return false;

      // Tag filter
      if (selectedTags.length > 0) {
        const hasTag = selectedTags.some(tag => brand.tags.includes(tag));
        if (!hasTag) return false;
      }

      return true;
    });
  }, [searchTerm, selectedTags]);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setSelectedTags([]);
    setSearchTerm('');
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
        paddingBottom: '40px'
      }}>
        <div style={{ padding: '0 0 24px 0' }}>

          {/* Search and Filter Bar */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
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
                placeholder="Search brands, companies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ paddingLeft: '40px', width: '100%', boxSizing: 'border-box' }}
              />
            </div>
            
            <button
              className={`btn ${showFilters ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setShowFilters(!showFilters)}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '6px',
                position: 'relative'
              }}
            >
              <Filter size={16} />
              Filters
              {selectedTags.length > 0 && (
                <span style={{
                  background: 'var(--color-primary)',
                  color: 'white',
                  borderRadius: '10px',
                  padding: '2px 6px',
                  fontSize: '11px',
                  fontWeight: 600,
                  marginLeft: '4px'
                }}>
                  {selectedTags.length}
                </span>
              )}
            </button>
          </div>

          {/* Filter Tags */}
          {showFilters && (
            <div style={{ 
              padding: '16px',
              background: 'var(--color-bg-hover)',
              borderRadius: '8px',
              marginBottom: '16px'
            }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '12px'
              }}>
                <span style={{ 
                  fontSize: '13px', 
                  fontWeight: 600, 
                  color: 'var(--color-text-primary)' 
                }}>
                  Filter by Category
                </span>
                {selectedTags.length > 0 && (
                  <button
                    onClick={clearFilters}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '12px',
                      color: 'var(--color-text-secondary)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '4px 8px',
                      borderRadius: '4px'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-bg-tertiary)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                  >
                    <X size={12} />
                    Clear all
                  </button>
                )}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {allTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '16px',
                      border: '1px solid',
                      borderColor: selectedTags.includes(tag) 
                        ? 'var(--color-primary)' 
                        : 'var(--color-border)',
                      background: selectedTags.includes(tag) 
                        ? 'var(--color-primary)' 
                        : 'white',
                      color: selectedTags.includes(tag) 
                        ? 'white' 
                        : 'var(--color-text-primary)',
                      fontSize: '13px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Results count */}
          <div style={{ 
            marginBottom: '16px', 
            fontSize: '13px', 
            color: 'var(--color-text-secondary)' 
          }}>
            Showing {filteredBrands.length} of {BRAND_PALETTES.length} brand palettes
          </div>

          {/* Brand Cards Grid */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: selectedBrand 
              ? 'repeat(auto-fill, minmax(260px, 1fr))' 
              : 'repeat(auto-fill, minmax(300px, 1fr))', 
            gap: '16px' 
          }}>
            {filteredBrands.map((brand) => (
              <BrandCard 
                key={brand.id} 
                brand={brand} 
                onViewDetails={() => setSelectedBrand(brand)}
                isSelected={selectedBrand?.id === brand.id}
              />
            ))}
          </div>
          
          {filteredBrands.length === 0 && (
            <div style={{ 
              textAlign: 'center', 
              padding: '60px 40px', 
              color: 'var(--color-text-secondary)' 
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎨</div>
              <div style={{ fontSize: '16px', fontWeight: 500, marginBottom: '8px' }}>
                No brands found
              </div>
              <div style={{ fontSize: '14px' }}>
                Try adjusting your search or filters.
              </div>
              {(selectedTags.length > 0 || searchTerm) && (
                <button
                  onClick={clearFilters}
                  className="btn btn-secondary"
                  style={{ marginTop: '16px' }}
                >
                  Clear all filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right Sidebar - Brand Detail */}
      {selectedBrand && (
        <BrandDetailPanel 
          brand={selectedBrand} 
          onClose={() => setSelectedBrand(null)} 
        />
      )}
    </div>
  );
};
