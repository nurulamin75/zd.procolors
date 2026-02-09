import React, { useState, useRef } from 'react';
import { Upload, FileText, FileSpreadsheet, File, AlertCircle, CheckCircle2, X } from 'lucide-react';
import { isValidColor } from '../../../../utils/color';

interface ImportColorsProps {
  onColorsImported: (colors: { name: string; color: string }[]) => void;
}

type FileType = 'csv' | 'json' | 'txt' | 'unknown';

export const ImportColors: React.FC<ImportColorsProps> = ({ onColorsImported }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [importedColors, setImportedColors] = useState<{ name: string; color: string }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const detectFileType = (file: File): FileType => {
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (extension === 'csv') return 'csv';
    if (extension === 'json') return 'json';
    if (extension === 'txt') return 'txt';
    return 'unknown';
  };

  const extractHexColors = (text: string): string[] => {
    // Match hex colors (#RGB, #RRGGBB, #RRGGBBAA)
    const hexPattern = /#([0-9A-Fa-f]{3}){1,2}([0-9A-Fa-f]{2})?\b/g;
    const matches = text.match(hexPattern) || [];
    return [...new Set(matches)].filter(color => isValidColor(color));
  };

  const parseCSV = (content: string): { name: string; color: string }[] => {
    const colors: { name: string; color: string }[] = [];
    const lines = content.split('\n').filter(line => line.trim());
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      // Try to parse as "name,color" or just "color"
      const parts = line.split(',').map(p => p.trim().replace(/"/g, ''));
      
      if (parts.length >= 2) {
        // Format: name,color or color,name
        const [first, second] = parts;
        if (isValidColor(first)) {
          colors.push({ name: second || `Color ${i + 1}`, color: first });
        } else if (isValidColor(second)) {
          colors.push({ name: first || `Color ${i + 1}`, color: second });
        }
      } else if (parts.length === 1 && isValidColor(parts[0])) {
        colors.push({ name: `Color ${i + 1}`, color: parts[0] });
      }
    }
    
    // If no structured data found, try extracting hex colors from the entire content
    if (colors.length === 0) {
      const hexColors = extractHexColors(content);
      hexColors.forEach((color, index) => {
        colors.push({ name: `Color ${index + 1}`, color });
      });
    }
    
    return colors;
  };

  const parseJSON = (content: string): { name: string; color: string }[] => {
    const colors: { name: string; color: string }[] = [];
    
    try {
      const data = JSON.parse(content);
      
      // Handle array format: [{name: "primary", color: "#fff"}, ...]
      if (Array.isArray(data)) {
        data.forEach((item, index) => {
          if (typeof item === 'string' && isValidColor(item)) {
            colors.push({ name: `Color ${index + 1}`, color: item });
          } else if (item.color && isValidColor(item.color)) {
            colors.push({ name: item.name || `Color ${index + 1}`, color: item.color });
          } else if (item.hex && isValidColor(item.hex)) {
            colors.push({ name: item.name || `Color ${index + 1}`, color: item.hex });
          } else if (item.value && isValidColor(item.value)) {
            colors.push({ name: item.name || `Color ${index + 1}`, color: item.value });
          }
        });
      }
      // Handle object format: {primary: "#fff", secondary: "#000", ...}
      else if (typeof data === 'object') {
        Object.entries(data).forEach(([name, value]) => {
          if (typeof value === 'string' && isValidColor(value)) {
            colors.push({ name, color: value });
          } else if (typeof value === 'object' && value !== null) {
            // Handle nested objects like {primary: {value: "#fff"}}
            const colorValue = (value as any).color || (value as any).hex || (value as any).value;
            if (colorValue && isValidColor(colorValue)) {
              colors.push({ name, color: colorValue });
            }
          }
        });
      }
    } catch (e) {
      // If JSON parsing fails, try extracting hex colors from the text
      const hexColors = extractHexColors(content);
      hexColors.forEach((color, index) => {
        colors.push({ name: `Color ${index + 1}`, color });
      });
    }
    
    return colors;
  };

  const parseTXT = (content: string): { name: string; color: string }[] => {
    const colors: { name: string; color: string }[] = [];
    const lines = content.split('\n').filter(line => line.trim());
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Try format: "name: #color" or "name = #color" or "name #color"
      const colonMatch = line.match(/^(.+?)[:=]\s*(#[0-9A-Fa-f]{3,8})/i);
      const spaceMatch = line.match(/^(.+?)\s+(#[0-9A-Fa-f]{3,8})/i);
      
      if (colonMatch && isValidColor(colonMatch[2])) {
        colors.push({ name: colonMatch[1].trim(), color: colonMatch[2] });
      } else if (spaceMatch && isValidColor(spaceMatch[2])) {
        colors.push({ name: spaceMatch[1].trim(), color: spaceMatch[2] });
      } else if (isValidColor(line)) {
        colors.push({ name: `Color ${i + 1}`, color: line });
      }
    }
    
    // If no structured data found, try extracting hex colors from the entire content
    if (colors.length === 0) {
      const hexColors = extractHexColors(content);
      hexColors.forEach((color, index) => {
        colors.push({ name: `Color ${index + 1}`, color });
      });
    }
    
    return colors;
  };

  const processFile = async (file: File) => {
    setError(null);
    setFileName(file.name);
    
    const fileType = detectFileType(file);
    
    try {
      const content = await file.text();
      let colors: { name: string; color: string }[] = [];
      
      switch (fileType) {
        case 'csv':
          colors = parseCSV(content);
          break;
        case 'json':
          colors = parseJSON(content);
          break;
        case 'txt':
        case 'unknown':
          // For unknown files, try to extract any hex colors
          colors = parseTXT(content);
          if (colors.length === 0) {
            colors = parseJSON(content);
          }
          if (colors.length === 0) {
            colors = parseCSV(content);
          }
          break;
      }
      
      if (colors.length === 0) {
        setError('No valid colors found in the file. Make sure the file contains hex colors (e.g., #FF5733).');
        setImportedColors([]);
      } else {
        setImportedColors(colors);
      }
    } catch (err) {
      setError('Failed to read the file. Please try again.');
      setImportedColors([]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      processFile(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleApplyColors = () => {
    if (importedColors.length > 0) {
      onColorsImported(importedColors);
    }
  };

  const handleClear = () => {
    setImportedColors([]);
    setFileName(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        style={{
          border: `2px dashed ${isDragging ? 'var(--color-primary)' : '#e5e7eb'}`,
          borderRadius: '12px',
          padding: '48px 24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
          cursor: 'pointer',
          transition: 'all 0.2s',
          backgroundColor: isDragging ? 'rgba(59, 130, 246, 0.05)' : 'white',
        }}
      >
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          backgroundColor: '#f3f4f6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Upload size={28} style={{ color: 'var(--color-text-secondary)' }} />
        </div>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '15px', fontWeight: 500, color: 'var(--color-text-primary)', margin: 0 }}>
            Drop your file here or click to browse
          </p>
          <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', margin: '8px 0 0' }}>
            Supports CSV, JSON, TXT, and other text files containing color values
          </p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.json,.txt,.doc,.docx,.md,.xml"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
      </div>

      {/* Supported Formats */}
      <div style={{
        display: 'flex',
        gap: '12px',
        flexWrap: 'wrap',
      }}>
        {[
          { icon: FileSpreadsheet, label: 'CSV', desc: 'name,#color' },
          { icon: FileText, label: 'JSON', desc: '{name: "#color"}' },
          { icon: File, label: 'TXT', desc: 'name: #color' },
        ].map(({ icon: Icon, label, desc }) => (
          <div
            key={label}
            style={{
              flex: '1',
              minWidth: '140px',
              padding: '16px',
              backgroundColor: '#f9fafb',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <Icon size={20} style={{ color: 'var(--color-text-secondary)' }} />
            <div>
              <p style={{ fontSize: '13px', fontWeight: 500, margin: 0 }}>{label}</p>
              <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)', margin: '2px 0 0', fontFamily: 'monospace' }}>{desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Error Message */}
      {error && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '12px 16px',
          backgroundColor: '#fef2f2',
          border: '1px solid #fee2e2',
          borderRadius: '8px',
          color: '#dc2626',
        }}>
          <AlertCircle size={18} />
          <span style={{ fontSize: '13px' }}>{error}</span>
        </div>
      )}

      {/* Imported Colors Preview */}
      {importedColors.length > 0 && (
        <div style={{
          backgroundColor: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          overflow: 'hidden',
        }}>
          <div style={{
            padding: '16px',
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <CheckCircle2 size={18} style={{ color: '#22c55e' }} />
              <div>
                <p style={{ fontSize: '14px', fontWeight: 500, margin: 0 }}>
                  {importedColors.length} color{importedColors.length > 1 ? 's' : ''} found
                </p>
                {fileName && (
                  <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: '2px 0 0' }}>
                    from {fileName}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={handleClear}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
                color: 'var(--color-text-secondary)',
              }}
            >
              <X size={18} />
            </button>
          </div>
          
          <div style={{
            padding: '16px',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
            maxHeight: '200px',
            overflowY: 'auto',
          }}>
            {importedColors.map((item, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 12px',
                  backgroundColor: '#f9fafb',
                  borderRadius: '6px',
                }}
              >
                <div
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '4px',
                    backgroundColor: item.color,
                    border: '1px solid rgba(0,0,0,0.1)',
                  }}
                />
                <div>
                  <p style={{ fontSize: '12px', fontWeight: 500, margin: 0 }}>{item.name}</p>
                  <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)', margin: 0, fontFamily: 'monospace' }}>
                    {item.color.toUpperCase()}
                  </p>
                </div>
              </div>
            ))}
          </div>
          
          <div style={{
            padding: '16px',
            borderTop: '1px solid #e5e7eb',
            display: 'flex',
            justifyContent: 'flex-end',
          }}>
            <button
              onClick={handleApplyColors}
              style={{
                padding: '10px 20px',
                backgroundColor: 'var(--color-primary)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              Apply Colors
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
