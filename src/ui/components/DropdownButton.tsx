import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronRight, Loader2 } from 'lucide-react';

interface DropdownButtonProps {
  label: string;
  options: { label: string; action: string }[];
  onSelect: (action: string, targetId?: string) => void;
  variant?: 'primary' | 'secondary';
  targetType?: 'variables' | 'styles';
}

export const DropdownButton: React.FC<DropdownButtonProps> = ({ 
    label, 
    options, 
    onSelect, 
    variant = 'primary',
    targetType 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const [targetOptions, setTargetOptions] = useState<{ label: string; value: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setActiveSubmenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    
    // Listen for data from backend
    const messageHandler = (event: MessageEvent) => {
        const data = event.data.pluginMessage || event.data;
        if (data && data.type === 'target-options-response' && data.targetType === targetType) {
            setTargetOptions(data.options);
            setIsLoading(false);
        }
    };
    
    window.addEventListener('message', messageHandler);
    
    return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        window.removeEventListener('message', messageHandler);
    };
  }, [targetType]);

  const handleOptionClick = (action: string) => {
      if (action === 'update') {
          // Trigger fetch
          setIsLoading(true);
          setActiveSubmenu(action);
          parent.postMessage({ pluginMessage: { type: 'get-target-options', targetType } }, '*');
      } else {
          onSelect(action);
          setIsOpen(false);
          setActiveSubmenu(null);
      }
  };

  const handleSubOptionClick = (targetId: string) => {
      onSelect('update', targetId);
      setIsOpen(false);
      setActiveSubmenu(null);
  };

  return (
    <div className="relative" ref={menuRef} style={{ position: 'relative' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`btn btn-${variant}`}
        style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            paddingRight: '12px'
        }}
      >
        {label}
        <ChevronDown size={14} style={{ opacity: 0.7 }} />
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          right: 0,
          marginTop: '4px',
          background: 'white',
          border: '1px solid var(--color-border)',
          borderRadius: '8px',
          boxShadow: 'var(--shadow-md)',
          zIndex: 50,
          minWidth: '200px',
          overflow: 'visible', // Allow submenu to spill out
          display: 'flex',
          flexDirection: 'column',
          padding: '4px 0'
        }}>
          {options.map((option) => (
            <div key={option.action} style={{ position: 'relative' }}>
                <button
                  onClick={() => handleOptionClick(option.action)}
                  style={{
                    padding: '10px 12px',
                    textAlign: 'left',
                    background: activeSubmenu === option.action ? 'var(--color-bg-hover)' : 'transparent',
                    border: 'none',
                    fontSize: '13px',
                    color: 'var(--color-text-primary)',
                    cursor: 'pointer',
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                  onMouseEnter={(e) => {
                      if (activeSubmenu !== option.action) {
                          e.currentTarget.style.backgroundColor = 'var(--color-bg-hover)';
                      }
                  }}
                  onMouseLeave={(e) => {
                      if (activeSubmenu !== option.action) {
                          e.currentTarget.style.backgroundColor = 'transparent';
                      }
                  }}
                >
                  {option.label}
                  {option.action === 'update' && <ChevronRight size={14} style={{ opacity: 0.5 }} />}
                </button>

                {/* Submenu for Update */}
                {option.action === 'update' && activeSubmenu === 'update' && (
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        right: '100%', // Show on left side
                        marginRight: '4px',
                        background: 'white',
                        border: '1px solid var(--color-border)',
                        borderRadius: '8px',
                        boxShadow: 'var(--shadow-md)',
                        zIndex: 51,
                        minWidth: '180px',
                        maxHeight: '200px',
                        overflowY: 'auto',
                        display: 'flex',
                        flexDirection: 'column',
                        padding: '4px 0'
                    }}>
                        {isLoading ? (
                            <div style={{ padding: '12px', display: 'flex', justifyContent: 'center' }}>
                                <Loader2 size={16} className="animate-spin" style={{ opacity: 0.5 }} />
                            </div>
                        ) : targetOptions.length > 0 ? (
                            targetOptions.map(target => (
                                <button
                                    key={target.value}
                                    onClick={() => handleSubOptionClick(target.value)}
                                    style={{
                                        padding: '8px 12px',
                                        textAlign: 'left',
                                        background: 'transparent',
                                        border: 'none',
                                        fontSize: '13px',
                                        color: 'var(--color-text-primary)',
                                        cursor: 'pointer',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-bg-hover)'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                    title={target.label}
                                >
                                    {target.label || '(Default)'}
                                </button>
                            ))
                        ) : (
                            <div style={{ padding: '8px 12px', fontSize: '12px', color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>
                                No existing targets found
                            </div>
                        )}
                    </div>
                )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
