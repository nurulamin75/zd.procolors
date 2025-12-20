import React, { useState, useEffect } from 'react';
import { Package, Download, FileJson } from 'lucide-react';

interface ExportCardProps {
  onExportRequest: (selectedCollectionIds: string[], selectedStyleGroups: string[]) => void;
  onImportFile: (data: any) => void;
  isExporting: boolean;
}

interface ExportOptions {
  collections: { id: string; name: string }[];
  styleGroups: string[];
}

export const ExportCard: React.FC<ExportCardProps> = ({ onExportRequest, onImportFile, isExporting }) => {
  const [showSelection, setShowSelection] = useState(false);
  const [options, setOptions] = useState<ExportOptions>({ collections: [], styleGroups: [] });
  const [selectedCollectionIds, setSelectedCollectionIds] = useState<string[]>([]);
  const [selectedStyleGroups, setSelectedStyleGroups] = useState<string[]>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);

  useEffect(() => {
    // Fetch available collections and style groups
    setIsLoadingOptions(true);
    parent.postMessage({ pluginMessage: { type: 'get-export-options' } }, '*');
    
    const handleMessage = (event: MessageEvent) => {
      const msg = event.data.pluginMessage;
      if (msg?.type === 'export-options-response') {
        setOptions({
          collections: msg.collections || [],
          styleGroups: msg.styleGroups || []
        });
        // Select all by default
        setSelectedCollectionIds(msg.collections?.map((c: any) => c.id) || []);
        setSelectedStyleGroups(msg.styleGroups || []);
        setIsLoadingOptions(false);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleExportClick = () => {
    if (showSelection) {
      // Export with selected options
      onExportRequest(selectedCollectionIds, selectedStyleGroups);
    } else {
      // Show selection UI
      setShowSelection(true);
    }
  };

  const toggleCollection = (id: string) => {
    setSelectedCollectionIds(prev => 
      prev.includes(id) 
        ? prev.filter(cId => cId !== id)
        : [...prev, id]
    );
  };

  const toggleStyleGroup = (group: string) => {
    setSelectedStyleGroups(prev => 
      prev.includes(group)
        ? prev.filter(g => g !== group)
        : [...prev, group]
    );
  };
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const content = event.target?.result as string;
            const data = JSON.parse(content);
            
            // Validate the structure
            if (!data || typeof data !== 'object') {
                throw new Error("Invalid JSON structure");
            }
            
            // Check if it has variables or styles
            if (!data.variables && !data.styles) {
                throw new Error("JSON file must contain 'variables' or 'styles'");
            }
            
            onImportFile(data);
        } catch (error: any) {
            parent.postMessage({ 
                pluginMessage: { 
                    type: 'notify', 
                    message: `Import failed: ${error.message || 'Invalid JSON file'}` 
                } 
            }, '*');
        }
    };
    reader.onerror = () => {
        parent.postMessage({ 
            pluginMessage: { 
                type: 'notify', 
                message: 'Failed to read file' 
            } 
        }, '*');
    };
    reader.readAsText(file);
    // Reset input
    e.target.value = '';
  };

  return (
    <div className="card" style={{ padding: '24px', backgroundColor: 'white', borderRadius: '12px' }}>
      <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
        <div style={{ 
            width: '48px', height: '48px', 
            borderRadius: '12px', 
            backgroundColor: '#eff6ff', 
            color: '#3b82f6',
            display: 'flex', alignItems: 'center', justifyContent: 'center' 
        }}>
            <Package size={24} />
        </div>
        <div style={{ flex: 1 }}>
            <h3 className="card-title">Transfer Tokens Between Files</h3>
            <p className="card-description">
                Export all Variables and Styles from this file as a JSON file. 
                Then import the JSON file into another Figma file to transfer your tokens.
            </p>
            
            {showSelection && (
              <div style={{ 
                marginTop: '20px', 
                padding: '16px', 
                backgroundColor: 'var(--color-bg-hover)', 
                borderRadius: '8px',
                border: '1px solid var(--color-border)'
              }}>
                {(options.collections.length > 0 || options.styleGroups.length > 0) ? (
                  <>
                    {options.collections.length > 0 && (
                      <div style={{ marginBottom: '16px' }}>
                        <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '8px', display: 'block' }}>
                          Variable Collections
                        </label>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          {options.collections.map(col => (
                            <label key={col.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px' }}>
                              <input
                                type="checkbox"
                                checked={selectedCollectionIds.includes(col.id)}
                                onChange={() => toggleCollection(col.id)}
                                style={{ cursor: 'pointer' }}
                              />
                              <span>{col.name}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {options.styleGroups.length > 0 && (
                      <div>
                        <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '8px', display: 'block' }}>
                          Style Groups
                        </label>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          {options.styleGroups.map(group => (
                            <label key={group} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px' }}>
                              <input
                                type="checkbox"
                                checked={selectedStyleGroups.includes(group)}
                                onChange={() => toggleStyleGroup(group)}
                                style={{ cursor: 'pointer' }}
                              />
                              <span>{group}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>
                    {isLoadingOptions ? 'Loading options...' : 'No collections or style groups found in this file.'}
                  </div>
                )}
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px', marginTop: '20px', flexWrap: 'wrap' }}>
                <button 
                    className="btn btn-primary" 
                    onClick={handleExportClick}
                    disabled={isExporting || isLoadingOptions}
                >
                    {isExporting ? 'Exporting...' : showSelection ? (
                      <><Download size={16} style={{ marginRight: '8px' }} /> Export Selected</>
                    ) : (
                      <><Download size={16} style={{ marginRight: '8px' }} /> Export to JSON</>
                    )}
                </button>
                
                {showSelection && (
                  <button
                    className="btn btn-secondary"
                    onClick={() => setShowSelection(false)}
                  >
                    Cancel
                  </button>
                )}
                
                <label className="btn btn-secondary" style={{ cursor: 'pointer' }}>
                    <FileJson size={16} style={{ marginRight: '8px' }} /> 
                    Import from JSON
                    <input 
                        type="file" 
                        accept=".json" 
                        onChange={handleFileUpload} 
                        style={{ display: 'none' }} 
                    />
                </label>
            </div>
        </div>
      </div>
    </div>
  );
};

