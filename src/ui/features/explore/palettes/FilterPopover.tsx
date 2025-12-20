import React, { useRef, useState, useEffect } from 'react';
import { Filter } from 'lucide-react';

export type StyleFilter = 'Warm' | 'Cold' | 'Bright' | 'Dark' | 'Pastel' | 'Vintage' | 'Monochromatic' | 'Gradient';
export type ColorFilter = 'Red' | 'Orange' | 'Brown' | 'Yellow' | 'Green' | 'Blue' | 'Purple' | 'Pink' | 'Black' | 'White';

interface FilterPopoverProps {
  selectedStyles: StyleFilter[];
  selectedColors: ColorFilter[];
  onStyleChange: (style: StyleFilter) => void;
  onColorChange: (color: ColorFilter) => void;
  onClear: () => void;
}

const STYLES: StyleFilter[] = ['Warm', 'Cold', 'Bright', 'Dark', 'Pastel', 'Vintage', 'Monochromatic', 'Gradient'];
const COLORS: { label: ColorFilter; color: string }[] = [
  { label: 'Red', color: '#EF4444' },
  { label: 'Orange', color: '#F97316' },
  { label: 'Brown', color: '#A16207' },
  { label: 'Yellow', color: '#EAB308' },
  { label: 'Green', color: '#22C55E' },
  { label: 'Blue', color: '#3B82F6' },
  { label: 'Purple', color: '#A855F7' },
  { label: 'Pink', color: '#EC4899' },
  { label: 'Black', color: '#1F2937' },
  { label: 'White', color: '#F3F4F6' }
];

export const FilterPopover: React.FC<FilterPopoverProps> = ({
  selectedStyles,
  selectedColors,
  onStyleChange,
  onColorChange,
  onClear
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeCount = selectedStyles.length + selectedColors.length;

  return (
    <div className="relative" ref={containerRef} style={{ position: 'relative' }}>
      <button
        type="button"
        className="btn btn-secondary"
        onClick={() => setIsOpen(!isOpen)}
        style={{ 
          height: '42px', // Match input height roughly
          borderColor: activeCount > 0 ? 'var(--color-primary)' : 'var(--color-border)',
          color: activeCount > 0 ? 'var(--color-primary)' : 'var(--color-text-primary)'
        }}
      >
        <Filter size={16} />
        {activeCount > 0 && (
            <span style={{ 
                background: 'var(--color-primary)', 
                color: 'white', 
                fontSize: '10px', 
                width: '16px', 
                height: '16px', 
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                {activeCount}
            </span>
        )}
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          right: 0,
          marginTop: '8px',
          width: '280px',
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          border: '1px solid var(--color-border)',
          zIndex: 50,
          padding: '16px'
        }}>
          
          {/* Styles Section */}
          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '13px', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Style</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {STYLES.map(style => {
                const isSelected = selectedStyles.includes(style);
                return (
                  <button
                    type="button"
                    key={style}
                    onClick={() => onStyleChange(style)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '6px',
                      border: `1px solid ${isSelected ? 'var(--color-primary)' : 'var(--color-border)'}`,
                      backgroundColor: isSelected ? 'var(--color-primary-light)' : 'transparent',
                      color: isSelected ? 'var(--color-primary)' : 'var(--color-text-primary)',
                      fontSize: '13px',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    {style}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Colors Section */}
          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '13px', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Color</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {COLORS.map(({ label, color }) => {
                const isSelected = selectedColors.includes(label);
                return (
                  <button
                    type="button"
                    key={label}
                    onClick={() => onColorChange(label)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      border: `1px solid ${isSelected ? 'var(--color-primary)' : 'var(--color-border)'}`,
                      backgroundColor: isSelected ? 'var(--color-primary-light)' : 'transparent',
                      color: isSelected ? 'var(--color-primary)' : 'var(--color-text-primary)',
                      fontSize: '13px',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ 
                        width: '12px', 
                        height: '12px', 
                        borderRadius: '50%', 
                        backgroundColor: color,
                        border: '1px solid rgba(0,0,0,0.1)' 
                    }} />
                    <span>{label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '12px', display: 'flex', justifyContent: 'flex-end' }}>
             <button
               type="button"
               onClick={onClear}
               style={{
                   fontSize: '12px',
                   color: 'var(--color-text-secondary)',
                   background: 'transparent',
                   border: 'none',
                   cursor: 'pointer',
                   textDecoration: 'underline'
               }}
             >
               Clear all
             </button>
          </div>

        </div>
      )}
    </div>
  );
};
