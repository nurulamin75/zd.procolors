import React from 'react';
import { ColorToken } from '../../../utils/tokens';
import { MoreHorizontal, ArrowUp } from 'lucide-react';

interface PreviewComponentProps {
  palettes: Record<string, ColorToken[]>;
}

const getColor = (palettes: Record<string, ColorToken[]>, name: string, shade: number = 500) => {
  const palette = palettes[name];
  if (!palette) return '#ccc';
  const token = palette.find(t => t.shade === shade);
  return token ? token.value : '#ccc';
};

export const PreviewDataDisplay: React.FC<PreviewComponentProps> = ({ palettes }) => {
  const primary = getColor(palettes, 'primary', 500);
  const primaryBg = getColor(palettes, 'primary', 50);
  const success = getColor(palettes, 'success', 500);
  const successBg = getColor(palettes, 'success', 50);
  const border = getColor(palettes, 'neutral', 200);
  const text = getColor(palettes, 'neutral', 900);
  const textLight = getColor(palettes, 'neutral', 500);
  const neutralBg = getColor(palettes, 'neutral', 50);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Badges */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <span style={{ padding: '2px 8px', borderRadius: '12px', backgroundColor: primaryBg, color: primary, fontSize: '12px', fontWeight: 600 }}>Primary</span>
        <span style={{ padding: '2px 8px', borderRadius: '12px', backgroundColor: successBg, color: success, fontSize: '12px', fontWeight: 600 }}>Success</span>
        <span style={{ padding: '2px 8px', borderRadius: '12px', backgroundColor: neutralBg, color: text, fontSize: '12px', fontWeight: 600, border: `1px solid ${border}` }}>Neutral</span>
        <span style={{ padding: '2px 8px', borderRadius: '4px', backgroundColor: primary, color: 'white', fontSize: '12px', fontWeight: 600 }}>Tag</span>
      </div>

      {/* Table */}
      <div style={{ border: `1px solid ${border}`, borderRadius: '8px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
          <thead style={{ backgroundColor: neutralBg, borderBottom: `1px solid ${border}` }}>
            <tr>
              <th style={{ padding: '10px 16px', textAlign: 'left', color: textLight, fontWeight: 500, fontSize: '12px' }}>NAME</th>
              <th style={{ padding: '10px 16px', textAlign: 'left', color: textLight, fontWeight: 500, fontSize: '12px' }}>STATUS</th>
              <th style={{ padding: '10px 16px', textAlign: 'left', color: textLight, fontWeight: 500, fontSize: '12px' }}>ROLE</th>
              <th style={{ padding: '10px 16px', width: '40px' }}></th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: `1px solid ${border}` }}>
              <td style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                 <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: primaryBg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: primary, fontWeight: 600, fontSize: '12px' }}>JD</div>
                 <span style={{ fontWeight: 500, color: text }}>John Doe</span>
              </td>
              <td style={{ padding: '12px 16px' }}><span style={{ padding: '2px 8px', borderRadius: '12px', backgroundColor: successBg, color: success, fontSize: '11px', fontWeight: 600 }}>Active</span></td>
              <td style={{ padding: '12px 16px', color: textLight }}>Admin</td>
              <td style={{ padding: '12px 16px' }}><MoreHorizontal size={16} color={textLight} /></td>
            </tr>
            <tr>
              <td style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                 <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: neutralBg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: textLight, fontWeight: 600, fontSize: '12px' }}>AS</div>
                 <span style={{ fontWeight: 500, color: text }}>Alice Smith</span>
              </td>
              <td style={{ padding: '12px 16px' }}><span style={{ padding: '2px 8px', borderRadius: '12px', backgroundColor: neutralBg, color: textLight, fontSize: '11px', fontWeight: 600 }}>Offline</span></td>
              <td style={{ padding: '12px 16px', color: textLight }}>Editor</td>
              <td style={{ padding: '12px 16px' }}><MoreHorizontal size={16} color={textLight} /></td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* List Items */}
      <div style={{ border: `1px solid ${border}`, borderRadius: '8px', overflow: 'hidden' }}>
        <div style={{ padding: '12px 16px', borderBottom: `1px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
           <span style={{ color: text }}>Settings Item 1</span>
           <span style={{ fontSize: '12px', color: textLight }}>Enabled</span>
        </div>
         <div style={{ padding: '12px 16px', borderBottom: `1px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
           <span style={{ color: text }}>Settings Item 2</span>
           <div style={{ width: '32px', height: '18px', backgroundColor: border, borderRadius: '20px', position: 'relative' }}>
             <div style={{ width: '14px', height: '14px', backgroundColor: 'white', borderRadius: '50%', position: 'absolute', left: '2px', top: '2px' }} />
           </div>
        </div>
      </div>

    </div>
  );
};

