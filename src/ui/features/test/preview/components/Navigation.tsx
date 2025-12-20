import React from 'react';
import { ColorToken } from '../../../../../utils/tokens';
import { ChevronRight, Home, User, Settings, ChevronLeft } from 'lucide-react';

interface PreviewComponentProps {
  palettes: Record<string, ColorToken[]>;
}

const getColor = (palettes: Record<string, ColorToken[]>, name: string, shade: number = 500) => {
  const palette = palettes[name];
  if (!palette) return '#ccc';
  const token = palette.find(t => t.shade === shade);
  return token ? token.value : '#ccc';
};

export const PreviewNavigation: React.FC<PreviewComponentProps> = ({ palettes }) => {
  const primary = getColor(palettes, 'primary', 500);
  const primaryLight = getColor(palettes, 'primary', 50);
  const border = getColor(palettes, 'neutral', 200);
  const text = getColor(palettes, 'neutral', 900);
  const textLight = getColor(palettes, 'neutral', 500);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Tabs */}
      <div>
        <div style={{ display: 'flex', borderBottom: `1px solid ${border}`, gap: '24px' }}>
          <div style={{ padding: '8px 4px', color: primary, borderBottom: `2px solid ${primary}`, fontWeight: 500, fontSize: '14px' }}>Account</div>
          <div style={{ padding: '8px 4px', color: textLight, fontSize: '14px' }}>Security</div>
          <div style={{ padding: '8px 4px', color: textLight, fontSize: '14px' }}>Billing</div>
        </div>
      </div>

      {/* Breadcrumbs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: textLight }}>
        <Home size={14} />
        <ChevronRight size={14} />
        <span>Projects</span>
        <ChevronRight size={14} />
        <span style={{ color: text, fontWeight: 500 }}>Marketing Site</span>
      </div>

      {/* Navbar Mockup */}
      <div style={{ border: `1px solid ${border}`, borderRadius: '8px', overflow: 'hidden' }}>
        <div style={{ padding: '12px 16px', borderBottom: `1px solid ${border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white' }}>
          <div style={{ fontWeight: 700, color: primary }}>Logo</div>
          <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: text }}>
            <span>Dashboard</span>
            <span style={{ color: textLight }}>Team</span>
            <span style={{ color: textLight }}>Settings</span>
          </div>
          <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: primaryLight }}></div>
        </div>
      </div>

      {/* Sidebar List */}
      <div style={{ display: 'flex', gap: '16px' }}>
        <div style={{ width: '200px', border: `1px solid ${border}`, borderRadius: '8px', padding: '8px', backgroundColor: 'white' }}>
          <div style={{ padding: '8px 12px', borderRadius: '6px', backgroundColor: primaryLight, color: primary, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 500 }}>
            <Home size={16} /> Dashboard
          </div>
          <div style={{ padding: '8px 12px', color: text, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
            <User size={16} color={textLight} /> Profile
          </div>
          <div style={{ padding: '8px 12px', color: text, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
            <Settings size={16} color={textLight} /> Settings
          </div>
        </div>

        {/* Pagination */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
           <button style={{ padding: '6px', border: `1px solid ${border}`, borderRadius: '4px', background: 'white' }}><ChevronLeft size={16} color={textLight} /></button>
           <button style={{ padding: '4px 10px', borderRadius: '4px', background: primary, color: 'white', border: 'none', fontSize: '13px' }}>1</button>
           <button style={{ padding: '4px 10px', borderRadius: '4px', background: 'transparent', color: text, border: 'none', fontSize: '13px' }}>2</button>
           <button style={{ padding: '4px 10px', borderRadius: '4px', background: 'transparent', color: text, border: 'none', fontSize: '13px' }}>3</button>
           <button style={{ padding: '6px', border: `1px solid ${border}`, borderRadius: '4px', background: 'white' }}><ChevronRight size={16} color={textLight} /></button>
        </div>
      </div>

    </div>
  );
};

