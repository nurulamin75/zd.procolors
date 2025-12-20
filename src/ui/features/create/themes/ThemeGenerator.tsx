import React, { useState, useEffect } from 'react';
import { ColorToken } from '../../../../utils/tokens';
import { X } from 'lucide-react';

interface ThemeGeneratorProps {
  palettes: Record<string, ColorToken[]>;
}

interface VariableCollection {
  id: string;
  name: string;
}

export const ThemeGenerator: React.FC<ThemeGeneratorProps> = ({ palettes }) => {
  const [activeTheme, setActiveTheme] = useState<'light' | 'dark' | 'dim' | 'amoled'>('light');
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [collections, setCollections] = useState<VariableCollection[]>([]);
  const [isLoadingCollections, setIsLoadingCollections] = useState(false);

  const getBgColor = () => {
    switch (activeTheme) {
      case 'light': return '#ffffff';
      case 'dark': return '#111827'; // gray-900
      case 'dim': return '#1f2937'; // gray-800
      case 'amoled': return '#000000';
      default: return '#ffffff';
    }
  };

  const getTextColor = () => {
    return activeTheme === 'light' ? '#111827' : '#f9fafb';
  };

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const data = event.data.pluginMessage || event.data;
      if (data && data.type === 'collections-response') {
        setCollections(data.collections || []);
        setIsLoadingCollections(false);
      }
    };
    
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleAddThemeToVariable = () => {
    if (!palettes || Object.keys(palettes).length === 0) {
      alert('No palettes available. Please generate colors first.');
      return;
    }
    
    // Fetch available collections
    setIsLoadingCollections(true);
    setShowCollectionModal(true);
    const parentWindow = (window as any).parent || parent;
    parentWindow.postMessage({ 
      pluginMessage: { 
        type: 'get-collections-for-theme' 
      } 
    }, '*');
  };

  const handleCollectionSelect = (collectionId: string) => {
    setShowCollectionModal(false);
    const parentWindow = (window as any).parent || parent;
    parentWindow.postMessage({ 
      pluginMessage: { 
        type: 'create-theme-variable', 
        theme: activeTheme,
        palettes: palettes,
        collectionId: collectionId
      } 
    }, '*');
  };

  return (
    <div className="animate-fade-in">
      <div className="section-card">
        <h2 className="section-title">Theme Generator</h2>
        <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '16px' }}>
          Preview your palette in different environments.
        </p>

        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
          {['light', 'dark', 'dim', 'amoled'].map((t) => (
            <button 
              key={t}
              className={`btn ${activeTheme === t ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTheme(t as any)}
              style={{ textTransform: 'capitalize' }}
            >
              {t}
            </button>
          ))}
        </div>

        <div style={{ 
          backgroundColor: getBgColor(), 
          color: getTextColor(),
          padding: '24px', 
          borderRadius: '12px',
          border: '1px solid var(--color-border)',
          transition: 'background-color 0.2s'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
            <div style={{ fontWeight: 700 }}>App Theme Preview</div>
            <div>9:41</div>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
             <div style={{ 
               width: '40px', height: '40px', borderRadius: '50%', 
               backgroundColor: palettes.neutral?.[2]?.value || '#e5e7eb' 
             }}></div>
             <div>
               <div style={{ height: '10px', width: '120px', backgroundColor: palettes.neutral?.[2]?.value || '#e5e7eb', borderRadius: '4px', marginBottom: '6px' }}></div>
               <div style={{ height: '8px', width: '80px', backgroundColor: palettes.neutral?.[2]?.value || '#e5e7eb', borderRadius: '4px' }}></div>
             </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button style={{ 
              flex: 1, padding: '10px', borderRadius: '8px', border: 'none',
              backgroundColor: palettes.primary?.[5]?.value || '#3b82f6',
              color: 'white', fontWeight: 500
            }}>
              Primary Action
            </button>
             <button style={{ 
              flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid currentColor',
              backgroundColor: 'transparent',
              color: palettes.primary?.[5]?.value || '#3b82f6',
              fontWeight: 500
            }}>
              Secondary
            </button>
          </div>
        </div>
        
        <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
          <button 
            className="btn btn-primary"
            onClick={handleAddThemeToVariable}
          >
            Add Theme to Variable
          </button>
        </div>
      </div>

      {/* Collection Selection Modal */}
      {showCollectionModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000
        }} onClick={() => setShowCollectionModal(false)}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            minWidth: '400px',
            maxWidth: '500px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>Select Collection</h3>
              <button
                onClick={() => setShowCollectionModal(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <X size={20} />
              </button>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '16px' }}>
              Select a variable collection to add the "{activeTheme}" theme as a new mode:
            </p>
            {isLoadingCollections ? (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                Loading collections...
              </div>
            ) : collections.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                No variable collections found. Please create a collection first.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '300px', overflowY: 'auto' }}>
                {collections.map((collection) => (
                  <button
                    key={collection.id}
                    onClick={() => handleCollectionSelect(collection.id)}
                    style={{
                      padding: '12px 16px',
                      textAlign: 'left',
                      background: 'transparent',
                      border: '1px solid var(--color-border)',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      color: 'var(--color-text-primary)',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--color-bg-hover)';
                      e.currentTarget.style.borderColor = 'var(--color-primary)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.borderColor = 'var(--color-border)';
                    }}
                  >
                    {collection.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

