import React, { useState, useRef, useEffect } from 'react';
import { Copy, Download, Palette, Plus, FileCode, MoreHorizontal } from 'lucide-react';
import { GradientData, gradientToCSS, gradientToJSON, gradientToTailwind, copyToClipboard } from '../utils/gradientUtils';

interface GradientCardProps {
  gradient: GradientData;
  onAddStyle: (gradient: GradientData) => void;
}

export const GradientCard: React.FC<GradientCardProps> = ({ gradient, onAddStyle }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const css = gradientToCSS(gradient);

  const handleCopy = (type: 'css' | 'json' | 'tailwind') => {
    let content = '';
    if (type === 'css') content = css;
    if (type === 'json') content = gradientToJSON(gradient);
    if (type === 'tailwind') content = gradientToTailwind(gradient);
    
    copyToClipboard(content);
    setShowDropdown(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div 
      style={{ 
        background: 'white', 
        borderRadius: '16px', 
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)', 
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.2s ease',
        border: '1px solid #f1f5f9',
        position: 'relative'
      }}
      onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 10px 20px -5px rgba(0, 0, 0, 0.1)';
      }}
      onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';
      }}
    >
      {/* Dropdown Button - Absolute positioned top-right */}
      <div style={{ position: 'absolute', top: '12px', right: '12px', zIndex: 10 }}>
          <button
              ref={buttonRef}
              onClick={() => setShowDropdown(!showDropdown)}
              className="btn"
              style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'white',
                  borderRadius: '50%', // Fully rounded
                  width: '32px',
                  height: '32px',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))'
              }}
          >
              <MoreHorizontal size={18} />
          </button>

          {showDropdown && (
              <div 
                  ref={dropdownRef}
                  style={{
                      position: 'absolute',
                      top: '100%',
                      right: 0,
                      marginTop: '4px',
                      background: 'white',
                      borderRadius: '12px',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                      border: '1px solid #f1f5f9',
                      padding: '4px',
                      minWidth: '140px',
                      zIndex: 50,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '2px'
                  }}
              >
                  <button 
                      onClick={() => handleCopy('css')}
                      style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '8px 12px',
                          border: 'none',
                          background: 'transparent',
                          width: '100%',
                          textAlign: 'left',
                          fontSize: '13px',
                          color: '#1e293b',
                          cursor: 'pointer',
                          borderRadius: '8px',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                      <Copy size={14} /> Copy CSS
                  </button>
                  <button 
                      onClick={() => handleCopy('json')}
                      style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '8px 12px',
                          border: 'none',
                          background: 'transparent',
                          width: '100%',
                          textAlign: 'left',
                          fontSize: '13px',
                          color: '#1e293b',
                          cursor: 'pointer',
                          borderRadius: '8px',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                      <FileCode size={14} /> Copy JSON
                  </button>
                  <button 
                      onClick={() => handleCopy('tailwind')}
                      style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '8px 12px',
                          border: 'none',
                          background: 'transparent',
                          width: '100%',
                          textAlign: 'left',
                          fontSize: '13px',
                          color: '#1e293b',
                          cursor: 'pointer',
                          borderRadius: '8px',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                      <Download size={14} /> Tailwind
                  </button>
              </div>
          )}
      </div>

      {/* Preview */}
      <div 
        style={{ 
          height: '100px', 
          width: '100%', 
          background: css,
          position: 'relative',
          borderTopLeftRadius: '16px',
          borderTopRightRadius: '16px'
        }}
      />
      
      {/* Content */}
      <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#1e293b' }}>{gradient.name}</h4>
          <span style={{ fontSize: '10px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {gradient.type}
          </span>
        </div>

        {/* Main Actions */}
        <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              onClick={() => onAddStyle(gradient)}
              className="btn"
              style={{ 
                  flex: 1, 
                  background: 'white', 
                  border: '1px solid #e2e8f0', 
                  color: '#1e293b',
                  borderRadius: '9999px', // Fully rounded
                  padding: '8px',
                  fontSize: '12px',
                  fontWeight: 600,
                  height: '32px'
              }}
            >
              <Palette size={14} /> Style
            </button>
             <button 
              onClick={() => parent.postMessage({ pluginMessage: { type: 'create-gradient-variables', gradient } }, '*')}
              className="btn"
              style={{ 
                  flex: 1, 
                  background: 'white', 
                  border: '1px solid #e2e8f0', 
                  color: '#1e293b',
                  borderRadius: '9999px', // Fully rounded
                  padding: '8px',
                  fontSize: '12px',
                  fontWeight: 600,
                  height: '32px'
              }}
            >
              <Plus size={14} /> Variable
            </button>
        </div>
      </div>
    </div>
  );
};
