import React, { useState } from 'react';

export interface Brand {
  id: string;
  name: string;
  primaryColor: string;
}

interface MultiBrandProps {
  brands: Brand[];
  activeBrandId: string;
  onSelectBrand: (id: string) => void;
  onAddBrand: (name: string, color: string) => void;
  onDeleteBrand: (id: string) => void;
}

export const MultiBrand: React.FC<MultiBrandProps> = ({ 
    brands, activeBrandId, onSelectBrand, onAddBrand, onDeleteBrand 
}) => {
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState('#3b82f6');

  const handleAdd = () => {
    if (newName) {
        onAddBrand(newName, newColor);
        setNewName('');
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="section-card">
         <h2 className="section-title">Create Shades for Multiple Brand</h2>
         <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '24px' }}>
             Manage multiple color palettes for different projects or sub-brands.
         </p>

         <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
             {brands.map(brand => (
                 <div 
                    key={brand.id} 
                    onClick={() => onSelectBrand(brand.id)}
                    style={{ 
                        padding: '12px', 
                        borderRadius: '8px', 
                        border: activeBrandId === brand.id ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                        backgroundColor: activeBrandId === brand.id ? '#eff6ff' : 'white',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}
                 >
                     <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                         <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: brand.primaryColor }}></div>
                         <span style={{ fontWeight: 500 }}>{brand.name}</span>
                     </div>
                     
                     {brands.length > 1 && (
                         <button 
                            style={{ border: 'none', background: 'transparent', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
                            onClick={(e) => { e.stopPropagation(); onDeleteBrand(brand.id); }}
                         >
                             ✕
                         </button>
                     )}
                 </div>
             ))}
         </div>

         <div style={{ paddingTop: '16px', borderTop: '1px solid var(--color-border)' }}>
             <div style={{ fontSize: '12px', fontWeight: 600, marginBottom: '8px' }}>Create New Brand</div>
             <div style={{ display: 'flex', gap: '8px' }}>
                 <input 
                    type="text" 
                    placeholder="Brand Name"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    style={{ flex: 1 }}
                 />
                 <input 
                    type="color" 
                    value={newColor}
                    onChange={(e) => setNewColor(e.target.value)}
                    style={{ width: '40px', padding: 0, height: '38px' }}
                 />
                 <button className="btn btn-primary" onClick={handleAdd}>Add</button>
             </div>
         </div>
      </div>
    </div>
  );
};

