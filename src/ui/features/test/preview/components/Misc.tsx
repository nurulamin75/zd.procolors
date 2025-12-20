import React from 'react';
import { ColorToken } from '../../../../../utils/tokens';
import { ChevronDown, HelpCircle, Layout } from 'lucide-react';

interface PreviewComponentProps {
  palettes: Record<string, ColorToken[]>;
}

const getColor = (palettes: Record<string, ColorToken[]>, name: string, shade: number = 500) => {
  const palette = palettes[name];
  if (!palette) return '#ccc';
  const token = palette.find(t => t.shade === shade);
  return token ? token.value : '#ccc';
};

export const PreviewMisc: React.FC<PreviewComponentProps> = ({ palettes }) => {
  const primary = getColor(palettes, 'primary', 500);
  const border = getColor(palettes, 'neutral', 200);
  const text = getColor(palettes, 'neutral', 900);
  const textLight = getColor(palettes, 'neutral', 500);
  const neutralBg = getColor(palettes, 'neutral', 50);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Progress Bar */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '12px', color: text }}>
          <span>Loading...</span>
          <span>60%</span>
        </div>
        <div style={{ width: '100%', height: '8px', backgroundColor: neutralBg, borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{ width: '60%', height: '100%', backgroundColor: primary, borderRadius: '4px' }}></div>
        </div>
      </div>

      {/* Accordion */}
      <div style={{ border: `1px solid ${border}`, borderRadius: '8px' }}>
        <div style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
          <span style={{ fontWeight: 500, color: text }}>What is ProColors?</span>
          <ChevronDown size={16} color={textLight} />
        </div>
        <div style={{ padding: '12px 16px', borderTop: `1px solid ${border}`, fontSize: '13px', color: textLight, lineHeight: 1.5 }}>
          ProColors is a comprehensive color system generator for modern design workflows.
        </div>
      </div>

      {/* Tooltip */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
         <span style={{ fontSize: '13px', color: textLight }}>Hover for info</span>
         <div style={{ position: 'relative', display: 'inline-flex' }}>
            <HelpCircle size={16} color={textLight} style={{ cursor: 'pointer' }} />
            <div style={{ 
              position: 'absolute', 
              bottom: '100%', 
              left: '50%', 
              transform: 'translateX(-50%)', 
              marginBottom: '8px',
              backgroundColor: '#1f2937',
              color: 'white',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '11px',
              whiteSpace: 'nowrap'
             }}>
               Helper Text
               <div style={{ position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)', borderWidth: '4px', borderStyle: 'solid', borderColor: '#1f2937 transparent transparent transparent' }}></div>
             </div>
         </div>
      </div>

      {/* Skeleton */}
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
         <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: neutralBg }}></div>
         <div style={{ flex: 1 }}>
            <div style={{ height: '12px', width: '80%', backgroundColor: neutralBg, borderRadius: '4px', marginBottom: '6px' }}></div>
            <div style={{ height: '10px', width: '50%', backgroundColor: neutralBg, borderRadius: '4px' }}></div>
         </div>
      </div>

      {/* Empty State */}
      <div style={{ textAlign: 'center', padding: '24px', border: `1px dashed ${border}`, borderRadius: '8px' }}>
         <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: neutralBg, margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Layout size={24} color={textLight} />
         </div>
         <div style={{ fontWeight: 600, color: text, marginBottom: '4px' }}>No items found</div>
         <div style={{ fontSize: '13px', color: textLight }}>Get started by creating a new item.</div>
         <button style={{ marginTop: '12px', padding: '8px 16px', borderRadius: '6px', backgroundColor: primary, color: 'white', border: 'none', fontSize: '13px', cursor: 'pointer' }}>Create Item</button>
      </div>

    </div>
  );
};

