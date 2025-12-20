import React from 'react';
import { ColorToken } from '../../../utils/tokens';
import { Eye, UploadCloud, Check } from 'lucide-react';

interface PreviewComponentProps {
  palettes: Record<string, ColorToken[]>;
}

const getColor = (palettes: Record<string, ColorToken[]>, name: string, shade: number = 500) => {
  const palette = palettes[name];
  if (!palette) return '#ccc';
  const token = palette.find(t => t.shade === shade);
  return token ? token.value : '#ccc';
};

export const PreviewInputs: React.FC<PreviewComponentProps> = ({ palettes }) => {
  const primary = getColor(palettes, 'primary', 500);
  const error = getColor(palettes, 'error', 500);
  const border = getColor(palettes, 'neutral', 200);
  const text = getColor(palettes, 'neutral', 900);
  const textLight = getColor(palettes, 'neutral', 500);
  
  const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '100px',
    border: `1px solid ${border}`,
    fontSize: '14px',
    outline: 'none',
    marginBottom: '12px',
    color: text
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, marginBottom: '4px', color: text }}>Text Input</label>
          <input type="text" placeholder="Default input..." style={inputStyle} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, marginBottom: '4px', color: primary }}>Focused Input</label>
          <input type="text" placeholder="Focused..." style={{ ...inputStyle, borderColor: primary, boxShadow: `0 0 0 2px ${primary}20` }} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
         <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, marginBottom: '4px', color: error }}>Error State</label>
          <input type="text" defaultValue="Invalid input" style={{ ...inputStyle, borderColor: error }} />
        </div>
         <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, marginBottom: '4px', color: text }}>Password</label>
          <div style={{ position: 'relative' }}>
             <input type="password" defaultValue="password123" style={inputStyle} />
             <Eye size={16} color={textLight} style={{ position: 'absolute', right: '12px', top: '12px' }} />
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
           <div style={{ width: '18px', height: '18px', borderRadius: '4px', border: `1px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }} />
           <span style={{ fontSize: '14px', color: text }}>Checkbox</span>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
           <div style={{ width: '18px', height: '18px', borderRadius: '4px', backgroundColor: primary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Check size={12} color="white" />
           </div>
           <span style={{ fontSize: '14px', color: text }}>Checked</span>
        </div>
        
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
           <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: `1px solid ${border}` }} />
           <span style={{ fontSize: '14px', color: text }}>Radio</span>
        </div>
         <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
           <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: `5px solid ${primary}` }} />
           <span style={{ fontSize: '14px', color: text }}>Selected</span>
        </div>

        <div style={{ width: '36px', height: '20px', backgroundColor: primary, borderRadius: '20px', position: 'relative' }}>
           <div style={{ width: '16px', height: '16px', backgroundColor: 'white', borderRadius: '50%', position: 'absolute', right: '2px', top: '2px' }} />
        </div>
      </div>

      <div style={{ border: `1px dashed ${border}`, borderRadius: '8px', padding: '24px', textAlign: 'center', cursor: 'pointer' }}>
        <UploadCloud size={24} color={textLight} style={{ marginBottom: '8px' }} />
        <div style={{ fontSize: '13px', color: textLight }}>Click to upload file</div>
      </div>

    </div>
  );
};

