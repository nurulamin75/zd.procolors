import React, { useRef, useState } from 'react';
import { Check } from 'lucide-react';

interface ImageExtractorProps {
  onColorSelect?: (name: string, color: string) => void;
  onApplyColors?: (colors: string[]) => void;
}

export const ImageExtractor: React.FC<ImageExtractorProps> = ({ onColorSelect, onApplyColors }) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [colors, setColors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      extractColors(url);
    }
  };

  const handleApplyToManual = () => {
    if (colors.length === 0 || !onApplyColors) return;
    onApplyColors(colors);
  };

  const extractColors = (imageUrl: string) => {
    const img = new Image();
    img.src = imageUrl;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      canvas.width = 100; // Scale down for performance
      canvas.height = 100;
      ctx.drawImage(img, 0, 0, 100, 100);
      
      // Simple random sampling for MVP
      // In prod, use K-means clustering
      const imageData = ctx.getImageData(0, 0, 100, 100).data;
      const extracted: string[] = [];
      
      for (let i = 0; i < 5; i++) {
        const offset = Math.floor(Math.random() * (imageData.length / 4)) * 4;
        const r = imageData[offset];
        const g = imageData[offset + 1];
        const b = imageData[offset + 2];
        // Convert to hex
        const hex = "#" + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
        extracted.push(hex);
      }
      setColors(extracted);
    };
  };

  return (
    <div className="animate-fade-in">
      <div className="section-card">
         <h2 className="section-title">Extract Colors from Image</h2>
         
         <div 
           style={{ 
             border: '2px dashed var(--color-border)', 
             borderRadius: '12px', 
             padding: '32px',
             textAlign: 'center',
             cursor: 'pointer',
             marginBottom: '16px',
             backgroundColor: 'var(--color-bg-secondary)'
           }}
           onClick={() => fileInputRef.current?.click()}
         >
           {previewUrl ? (
             <img src={previewUrl} alt="Preview" style={{ maxHeight: '200px', maxWidth: '100%', borderRadius: '8px' }} />
           ) : (
             <div style={{ color: 'var(--color-text-secondary)' }}>
               <div style={{ fontSize: '24px', marginBottom: '8px' }}>📷</div>
               Click to upload image
             </div>
           )}
         </div>
         
         <input 
           type="file" 
           ref={fileInputRef} 
           onChange={handleFileChange} 
           accept="image/*" 
           style={{ display: 'none' }} 
         />

         {colors.length > 0 && (
           <div>
             <div style={{ fontSize: '12px', fontWeight: 600, marginBottom: '8px' }}>Extracted Colors</div>
             <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
               {colors.map((c, i) => (
                 <div 
                   key={i} 
                   style={{ 
                     width: '40px', 
                     height: '40px', 
                     borderRadius: '8px', 
                     backgroundColor: c,
                     boxShadow: 'var(--shadow-sm)',
                     cursor: 'pointer',
                     border: '2px solid transparent',
                     transition: 'all 0.2s'
                   }}
                   title={c}
                   onClick={() => {
                     navigator.clipboard.writeText(c);
                   }}
                   onMouseEnter={(e) => {
                     e.currentTarget.style.borderColor = '#3b82f6';
                     e.currentTarget.style.transform = 'scale(1.1)';
                   }}
                   onMouseLeave={(e) => {
                     e.currentTarget.style.borderColor = 'transparent';
                     e.currentTarget.style.transform = 'scale(1)';
                   }}
                 ></div>
               ))}
             </div>
             
             {onApplyColors && (
               <button
                 onClick={handleApplyToManual}
                 className="btn btn-primary"
                 style={{
                   width: '100%',
                   display: 'flex',
                   alignItems: 'center',
                   justifyContent: 'center',
                   gap: '8px',
                   padding: '12px 16px',
                   fontSize: '14px',
                   fontWeight: 500
                 }}
               >
                 <Check size={16} />
                 Apply to Manual Input
               </button>
             )}
           </div>
         )}
      </div>
    </div>
  );
};
