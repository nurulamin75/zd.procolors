import React from 'react';
import { ColorToken } from '../../../utils/tokens';
import { MoreHorizontal, Heart, Share2 } from 'lucide-react';

interface PreviewComponentProps {
  palettes: Record<string, ColorToken[]>;
}

const getColor = (palettes: Record<string, ColorToken[]>, name: string, shade: number = 500) => {
  const palette = palettes[name];
  if (!palette) return '#ccc';
  const token = palette.find(t => t.shade === shade);
  return token ? token.value : '#ccc';
};

export const PreviewCards: React.FC<PreviewComponentProps> = ({ palettes }) => {
  const primary = getColor(palettes, 'primary', 500);
  const neutralBg = getColor(palettes, 'neutral', 50);
  const border = getColor(palettes, 'neutral', 200);
  const text = getColor(palettes, 'neutral', 900);
  const textLight = getColor(palettes, 'neutral', 500);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      
      {/* Basic Card */}
      <div style={{ border: `1px solid ${border}`, borderRadius: '12px', padding: '20px', backgroundColor: 'white' }}>
        <div style={{ fontWeight: 600, marginBottom: '8px', color: text }}>Basic Card</div>
        <p style={{ fontSize: '14px', color: textLight, lineHeight: 1.5 }}>
          This is a simple card component used to display content in a contained way.
        </p>
      </div>

      {/* Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div style={{ border: `1px solid ${border}`, borderRadius: '12px', padding: '16px', backgroundColor: 'white' }}>
           <div style={{ fontSize: '12px', color: textLight, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Revenue</div>
           <div style={{ fontSize: '24px', fontWeight: 700, color: text, marginTop: '4px' }}>$45,231</div>
           <div style={{ fontSize: '12px', color: '#10b981', marginTop: '4px' }}>+20.1% from last month</div>
        </div>
        <div style={{ border: `1px solid ${border}`, borderRadius: '12px', padding: '16px', backgroundColor: 'white' }}>
           <div style={{ fontSize: '12px', color: textLight, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Active Users</div>
           <div style={{ fontSize: '24px', fontWeight: 700, color: text, marginTop: '4px' }}>2,450</div>
           <div style={{ fontSize: '12px', color: textLight, marginTop: '4px' }}>+12 new today</div>
        </div>
      </div>

      {/* Profile Card */}
      <div style={{ border: `1px solid ${border}`, borderRadius: '12px', padding: '16px', backgroundColor: 'white', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: neutralBg }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, color: text }}>Sarah Wilson</div>
          <div style={{ fontSize: '13px', color: textLight }}>Product Designer</div>
        </div>
        <button style={{ border: `1px solid ${border}`, borderRadius: '6px', padding: '6px 12px', background: 'white', fontSize: '12px', fontWeight: 500 }}>Follow</button>
      </div>

      {/* Card with Image */}
      <div style={{ border: `1px solid ${border}`, borderRadius: '12px', overflow: 'hidden', backgroundColor: 'white' }}>
        <div style={{ height: '120px', backgroundColor: neutralBg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: textLight }}>Image Placeholder</div>
        <div style={{ padding: '16px' }}>
           <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
             <div style={{ fontSize: '12px', color: primary, fontWeight: 600 }}>ARTICLE</div>
             <div style={{ display: 'flex', gap: '8px' }}>
                <Heart size={16} color={textLight} />
                <Share2 size={16} color={textLight} />
             </div>
           </div>
           <div style={{ fontWeight: 600, marginBottom: '4px', color: text }}>Designing for Accessibility</div>
           <p style={{ fontSize: '13px', color: textLight }}>Learn how to create inclusive experiences for all users.</p>
        </div>
      </div>

    </div>
  );
};

