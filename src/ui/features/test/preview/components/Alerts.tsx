import React from 'react';
import { ColorToken } from '../../../../../utils/tokens';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

interface PreviewComponentProps {
  palettes: Record<string, ColorToken[]>;
}

const getColor = (palettes: Record<string, ColorToken[]>, name: string, shade: number = 500) => {
  const palette = palettes[name];
  if (!palette) return '#ccc';
  const token = palette.find(t => t.shade === shade);
  return token ? token.value : '#ccc';
};

export const PreviewAlerts: React.FC<PreviewComponentProps> = ({ palettes }) => {
  const success = getColor(palettes, 'success', 500);
  const successBg = getColor(palettes, 'success', 50);
  const warning = getColor(palettes, 'warning', 500);
  const warningBg = getColor(palettes, 'warning', 50);
  const error = getColor(palettes, 'error', 500);
  const errorBg = getColor(palettes, 'error', 50);
  const info = getColor(palettes, 'info', 500);
  const infoBg = getColor(palettes, 'info', 50);
  const text = getColor(palettes, 'neutral', 900);

  const alertStyle = (bg: string, border: string) => ({
    padding: '12px 16px',
    borderRadius: '8px',
    backgroundColor: bg,
    border: `1px solid ${border}40`,
    display: 'flex',
    gap: '12px',
    alignItems: 'flex-start',
    fontSize: '14px',
    color: text,
    marginBottom: '12px'
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <div style={alertStyle(successBg, success)}>
        <CheckCircle2 size={20} color={success} style={{ flexShrink: 0 }} />
        <div>
          <div style={{ fontWeight: 600, color: success }}>Success</div>
          <div style={{ fontSize: '13px', opacity: 0.9 }}>Your changes have been saved successfully.</div>
        </div>
      </div>

      <div style={alertStyle(warningBg, warning)}>
        <AlertTriangle size={20} color={warning} style={{ flexShrink: 0 }} />
        <div>
          <div style={{ fontWeight: 600, color: '#b45309' }}>Warning</div>
          <div style={{ fontSize: '13px', opacity: 0.9 }}>Your account storage is almost full.</div>
        </div>
      </div>

      <div style={alertStyle(errorBg, error)}>
        <XCircle size={20} color={error} style={{ flexShrink: 0 }} />
        <div>
          <div style={{ fontWeight: 600, color: error }}>Error</div>
          <div style={{ fontSize: '13px', opacity: 0.9 }}>Failed to upload file. Please try again.</div>
        </div>
      </div>

      <div style={alertStyle(infoBg, info)}>
        <Info size={20} color={info} style={{ flexShrink: 0 }} />
        <div>
          <div style={{ fontWeight: 600, color: info }}>Note</div>
          <div style={{ fontSize: '13px', opacity: 0.9 }}>Scheduled maintenance will occur tonight.</div>
        </div>
      </div>

      <div style={{ 
        padding: '12px 16px', 
        backgroundColor: '#1f2937', 
        color: 'white', 
        borderRadius: '8px', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        fontSize: '14px',
        marginTop: '8px'
      }}>
        <span>New update available.</span>
        <button style={{ background: 'none', border: 'none', color: 'white', fontWeight: 600, cursor: 'pointer' }}>Update</button>
      </div>
    </div>
  );
};

