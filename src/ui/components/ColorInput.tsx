import React, { useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { HexColorPicker } from 'react-colorful';
import { X } from 'lucide-react';
import { isValidColor } from '../../utils/color';

interface ColorInputProps {
  value: string;
  onChange: (color: string) => void;
  label?: string;
  last?: boolean;
  isCustom?: boolean;
  onDelete?: () => void;
}

export const ColorInput: React.FC<ColorInputProps> = ({ value, onChange, label = "Brand Color", isCustom = false, onDelete }) => {
  const [showDelete, setShowDelete] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [inputText, setInputText] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const [popoverPosition, setPopoverPosition] = useState({ top: 0, left: 0 });

  // Keep local text state in sync if prop changes externally
  useEffect(() => {
    setInputText(value);
  }, [value]);

  // Calculate popover position when opening
  useEffect(() => {
    if (isOpen && cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      const scrollY = window.scrollY || window.pageYOffset;
      const scrollX = window.scrollX || window.pageXOffset;
      
      setPopoverPosition({
        top: rect.bottom + scrollY + 8,
        left: rect.left + scrollX + (rect.width / 2)
      });
    }
  }, [isOpen]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current && !popoverRef.current.contains(event.target as Node) &&
        cardRef.current && !cardRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setInputText(text);
    
    if (isValidColor(text)) {
      onChange(text);
    }
  };

  // Trigger color picker when clicking card, unless clicking the text input
  const handleCardClick = (e: React.MouseEvent) => {
    // Check if click target is the text input
    if ((e.target as HTMLElement).tagName === 'INPUT' && (e.target as HTMLInputElement).type === 'text') {
      return;
    }
    setIsOpen(!isOpen);
  };

  return (
    <>
      <div 
        ref={cardRef}
        className="color-card" 
        onClick={handleCardClick}
        onMouseEnter={() => isCustom && setShowDelete(true)}
        onMouseLeave={() => setShowDelete(false)}
        style={{
            position: 'relative',
            backgroundColor: 'white',
            border: '0.25px solid #f2f2f2',
            borderRadius: '16px',
            padding: '12px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            marginBottom: '8px',
        }}
      >
        {/* Delete Button for Custom Colors */}
        {isCustom && onDelete && showDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              backgroundColor: '#ef4444',
              border: 'none',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              zIndex: 10,
              transition: 'all 0.2s',
              padding: 0
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#dc2626';
              e.currentTarget.style.transform = 'scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#ef4444';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <X size={12} />
          </button>
        )}

        {/* Color Swatch */}
        <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: isValidColor(value) ? value : '#000000',
            marginBottom: '8px',
            boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.05), 0 2px 4px rgba(0,0,0,0.05)',
            border: '2px solid white',
            outline: '1px solid var(--color-border-light)'
        }}></div>

        {/* Label */}
        <div style={{
            fontSize: '13px',
            fontWeight: 600,
            color: 'var(--color-text-primary)',
            marginBottom: '6px',
            textAlign: 'center',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: '100%'
        }}>
            {label}
        </div>

        {/* Editable Hex Input */}
        <input
            type="text"
            value={inputText.toUpperCase()}
            onChange={handleTextChange}
            onClick={(e) => e.stopPropagation()} // Prevent triggering color picker
            style={{
                fontSize: '11px',
                color: 'var(--color-text-secondary)',
                fontFamily: 'monospace',
                backgroundColor: 'var(--color-bg-hover)',
                padding: '4px 6px',
                borderRadius: '100px',
                border: '1px solid transparent',
                textAlign: 'center',
                width: '100%',
                outline: 'none',
                letterSpacing: '0.5px'
            }}
            onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
            onBlur={(e) => e.target.style.borderColor = 'transparent'}
        />
        
        <style>
        {`
          .color-card:hover {
            border-color: var(--color-primary);
            transform: translateY(-2px);
            box-shadow: var(--shadow-md);
          }
          .color-card:hover div[style*="outline"] {
             outline-color: var(--color-primary-light);
          }
        `}
        </style>
      </div>

      {/* Color Picker Popover - Rendered in Portal */}
      {isOpen && createPortal(
        <div 
          ref={popoverRef}
          style={{ 
            position: 'fixed', 
            top: `${popoverPosition.top}px`, 
            left: `${popoverPosition.left}px`,
            transform: 'translateX(-50%)',
            zIndex: 99999,
            padding: '12px',
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(0,0,0,0.05)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <HexColorPicker color={isValidColor(value) ? value : '#000000'} onChange={onChange} />
          <style>
          {`
             .react-colorful {
               width: 200px;
               height: 200px;
             }
             .react-colorful__saturation {
               border-radius: 8px 8px 0 0;
               margin-bottom: 12px;
             }
             .react-colorful__hue {
               height: 16px;
               border-radius: 8px;
             }
             .react-colorful__pointer {
               width: 20px;
               height: 20px;
             }
          `}
          </style>
        </div>,
        document.body
      )}
    </>
  );
};
