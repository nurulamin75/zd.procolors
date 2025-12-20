import React, { useState, useEffect } from 'react';
import { ScanEye, RefreshCw, X, Variable, CheckSquare, Square } from 'lucide-react';
import chroma from 'chroma-js';

interface ScannedColor {
  color: string;
  count: number;
  locations: string[];
}

interface ColorExtractorProps {}

export const ColorExtractor: React.FC<ColorExtractorProps> = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedColors, setScannedColors] = useState<ScannedColor[]>([]);
  const [selectedColors, setSelectedColors] = useState<Set<string>>(new Set());
  const [selectedScope, setSelectedScope] = useState<'selection' | 'page' | 'file'>('selection');
  const [isCreating, setIsCreating] = useState(false);
  const [collections, setCollections] = useState<{ id: string; name: string }[]>([]);
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [isLoadingCollections, setIsLoadingCollections] = useState(false);
  const [variableNamePrefix, setVariableNamePrefix] = useState('Extracted');

  useEffect(() => {
    // Load collections on mount
    loadCollections();
  }, []);

  const loadCollections = async () => {
    setIsLoadingCollections(true);
    
    // Set up listener BEFORE sending message
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    
    const handleMessage = (event: MessageEvent) => {
      console.log('Message received in loadCollections:', event.data.pluginMessage?.type);
      if (event.data.pluginMessage?.type === 'target-options-response' && event.data.pluginMessage.targetType === 'variables') {
        const options = event.data.pluginMessage.options || [];
        console.log('Raw options from plugin:', options);
        
        // Convert from {label, value} to {name, id} format
        const collectionsList = options.map((opt: any) => ({
          id: opt.value || opt.id,
          name: opt.label || opt.name
        }));
        
        console.log('Converted collections:', collectionsList);
        setCollections(collectionsList);
        setIsLoadingCollections(false);
        
        if (timeoutId) clearTimeout(timeoutId);
        window.removeEventListener('message', handleMessage);
      }
    };

    window.addEventListener('message', handleMessage);
    
    // Set timeout to stop loading if no response
    timeoutId = setTimeout(() => {
      console.warn('Collections loading timeout');
      setIsLoadingCollections(false);
      window.removeEventListener('message', handleMessage);
    }, 5000);
    
    try {
      console.log('Requesting collections...');
      (window as any).parent.postMessage({ pluginMessage: { type: 'get-target-options', targetType: 'variables' } }, '*');
    } catch (err) {
      console.error('Error loading collections:', err);
      setIsLoadingCollections(false);
      if (timeoutId) clearTimeout(timeoutId);
      window.removeEventListener('message', handleMessage);
    }
  };

  const handleScan = async () => {
    setIsScanning(true);
    setScannedColors([]);
    setSelectedColors(new Set());
    
    // Set up listener BEFORE sending message to avoid race condition
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    
    const handleMessage = (event: MessageEvent) => {
      console.log('Received message:', event.data.pluginMessage?.type);
      if (event.data.pluginMessage?.type === 'scan-colors-result') {
        const colors = event.data.pluginMessage.colors || [];
        const error = event.data.pluginMessage.error;
        
        console.log('Scan result:', { colorsCount: colors.length, error });
        
        // Clean up
        if (timeoutId) clearTimeout(timeoutId);
        setIsScanning(false);
        window.removeEventListener('message', handleMessage);
        
        if (error) {
          console.error('Error scanning colors:', error);
          alert(`Error scanning colors: ${error}`);
          return;
        }
        
        if (colors.length === 0) {
          const scopeText = selectedScope === 'selection' ? 'selection' : selectedScope === 'page' ? 'current page' : 'file';
          alert(`No colors found in ${scopeText}. Make sure you have elements with colors.`);
          return;
        }
        
        // Process and deduplicate colors
        const colorMap = new Map<string, ScannedColor>();
        colors.forEach((item: { color: string; count: number; locations: string[] }) => {
          const existing = colorMap.get(item.color);
          if (existing) {
            existing.count += item.count;
            existing.locations = [...new Set([...existing.locations, ...item.locations])];
          } else {
            colorMap.set(item.color, {
              color: item.color,
              count: item.count,
              locations: item.locations
            });
          }
        });
        
        const uniqueColors = Array.from(colorMap.values());
        // Sort by usage count (most used first)
        uniqueColors.sort((a, b) => b.count - a.count);
        
        setScannedColors(uniqueColors);
      }
    };

    // Add listener first
    window.addEventListener('message', handleMessage);
    
    // Set a timeout to clean up listener if no response (safety measure)
    timeoutId = setTimeout(() => {
      setIsScanning(false);
      window.removeEventListener('message', handleMessage);
      console.warn('Scan timeout - no response from plugin');
      alert('Scan timed out. Please try again.');
    }, 30000); // 30 second timeout
    
    // Then send the message
    console.log('Sending scan-colors message:', { scope: selectedScope, threshold: 10 });
    (window as any).parent.postMessage(
      {
        pluginMessage: {
          type: 'scan-colors',
          scope: selectedScope,
          threshold: 10
        }
      },
      '*'
    );
  };

  const toggleColorSelection = (color: string) => {
    setSelectedColors(prev => {
      const newSet = new Set(prev);
      if (newSet.has(color)) {
        newSet.delete(color);
      } else {
        newSet.add(color);
      }
      return newSet;
    });
  };

  const selectAll = () => {
    setSelectedColors(new Set(scannedColors.map(c => c.color)));
  };

  const deselectAll = () => {
    setSelectedColors(new Set());
  };

  const handleCreateVariables = async (collectionId?: string) => {
    if (selectedColors.size === 0) {
      alert('Please select at least one color to create variables.');
      return;
    }

    // If collectionId is not explicitly passed, show modal to let user choose
    // This happens when the "Create Variables" button is clicked (no argument)
    if (collectionId === undefined) {
      console.log('No collectionId provided, showing modal');
      // Reload collections before showing modal to get latest list
      loadCollections();
      setShowCollectionModal(true);
      return;
    }

    // If we get here, collectionId was explicitly passed (could be null for new collection)
    // Use null to explicitly mean "create new collection"
    const shouldCreateNew = collectionId === null || collectionId === '';
    console.log('Final collection ID for variable creation:', collectionId);
    console.log('Should create new collection:', shouldCreateNew);

    setIsCreating(true);

    // Prepare colors for variable creation
    const colorsToCreate = Array.from(selectedColors).map((color, index) => {
      try {
        // Ensure color is in hex format
        let hexColor = color;
        if (!hexColor.startsWith('#')) {
          hexColor = '#' + hexColor;
        }
        
        // Generate a name for the variable based on color properties
        const c = chroma(hexColor);
        const hue = c.get('hsl.h') || 0;
        const lightness = c.get('hsl.l');

        // Categorize by hue
        let category = 'neutral';
        if (hue >= 0 && hue < 30) category = 'red';
        else if (hue >= 30 && hue < 60) category = 'yellow';
        else if (hue >= 60 && hue < 150) category = 'green';
        else if (hue >= 150 && hue < 240) category = 'blue';
        else if (hue >= 240 && hue < 300) category = 'purple';
        else if (hue >= 300 && hue < 360) category = 'pink';

        // Determine shade based on lightness
        let shade = 500;
        if (lightness > 0.9) shade = 50;
        else if (lightness > 0.8) shade = 100;
        else if (lightness > 0.7) shade = 200;
        else if (lightness > 0.6) shade = 300;
        else if (lightness > 0.5) shade = 400;
        else if (lightness > 0.4) shade = 600;
        else if (lightness > 0.3) shade = 700;
        else if (lightness > 0.2) shade = 800;
        else if (lightness > 0.1) shade = 900;
        else shade = 950;

        return {
          color: hexColor.toUpperCase(),
          name: `${variableNamePrefix}/${category}/${shade}`,
          category,
          shade
        };
      } catch (err) {
        console.error(`Error processing color ${color}:`, err);
        // Return a fallback
        return {
          color: color.startsWith('#') ? color.toUpperCase() : '#' + color.toUpperCase(),
          name: `${variableNamePrefix}/color/${index + 1}`,
          category: 'color',
          shade: 500
        };
      }
    });
    
    console.log('Prepared colors to create:', colorsToCreate);

    // Set up listener BEFORE sending message
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    
    const handleMessage = (event: MessageEvent) => {
      console.log('=== MESSAGE RECEIVED IN UI ===');
      console.log('Message type:', event.data.pluginMessage?.type);
      console.log('Full message:', event.data);
      
      // Log all plugin messages for debugging
      if (event.data?.pluginMessage) {
        console.log('Plugin message detected:', event.data.pluginMessage);
      }
      
      if (event.data.pluginMessage?.type === 'create-variables-from-colors-result') {
        console.log('=== VARIABLE CREATION RESULT RECEIVED ===');
        const { success, count, error } = event.data.pluginMessage;
        
        // Clean up
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }
        setIsCreating(false);
        window.removeEventListener('message', handleMessage, false);
        
        console.log('Variable creation result:', { success, count, error });
        
        if (success) {
          alert(`Successfully created ${count} color variables!`);
          // Clear selections
          setSelectedColors(new Set());
        } else {
          alert(`Error creating variables: ${error || 'Unknown error'}`);
        }
      }
    };

    // Add listener first - use capture phase to catch all messages
    window.addEventListener('message', handleMessage, false);
    
    // Set timeout as safety measure
    timeoutId = setTimeout(() => {
      console.warn('=== TIMEOUT: No response received ===');
      console.warn('This means the plugin did not respond within 30 seconds.');
      console.warn('Please check the Figma console (Plugins > Development > Open Console) for errors.');
      setIsCreating(false);
      window.removeEventListener('message', handleMessage, false);
      alert('Variable creation timed out after 30 seconds.\n\nPlease:\n1. Open Figma console (Plugins > Development > Open Console)\n2. Check for any error messages\n3. Try again');
    }, 30000); // 30 second timeout

    // Send to plugin to create variables
    console.log('Sending create-variables-from-colors message:', { 
      colorsCount: colorsToCreate.length, 
      collectionId: shouldCreateNew ? null : collectionId,
      createNewCollection: shouldCreateNew
    });
    
    // Use window.parent to ensure we have the correct reference
    const messagePayload = {
      pluginMessage: {
        type: 'create-variables-from-colors',
        colors: colorsToCreate,
        collectionId: shouldCreateNew ? null : collectionId,
        createNewCollection: shouldCreateNew
      }
    };
    
    console.log('Message payload:', {
      colorsCount: colorsToCreate.length,
      collectionId: shouldCreateNew ? null : collectionId,
      createNewCollection: shouldCreateNew
    });
    
    console.log('Message payload size:', JSON.stringify(messagePayload).length, 'bytes');
    
    try {
      // In Figma plugins, use window.parent
      const parentWindow = (window as any).parent;
      if (!parentWindow) {
        throw new Error('Parent window is undefined. Make sure you are running in a Figma plugin context.');
      }
      
      // Validate payload before sending
      if (colorsToCreate.length === 0) {
        throw new Error('No colors to create');
      }
      
      // Check payload size (Figma has message size limits)
      const payloadString = JSON.stringify(messagePayload);
      console.log('Payload size:', payloadString.length, 'bytes');
      if (payloadString.length > 1000000) { // 1MB limit
        throw new Error(`Message payload too large: ${payloadString.length} bytes. Try selecting fewer colors.`);
      }
      
      console.log('Sending message with', colorsToCreate.length, 'colors');
      console.log('Creating in collection:', shouldCreateNew ? 'NEW' : collectionId);
      parentWindow.postMessage(messagePayload, '*');
      console.log('Message sent successfully');
    } catch (err: any) {
      console.error('=== ERROR SENDING MESSAGE ===');
      console.error('Error:', err);
      console.error('Error message:', err.message);
      console.error('Error stack:', err.stack);
      console.error('Parent available:', typeof parent !== 'undefined');
      console.error('Window parent available:', typeof (window as any).parent !== 'undefined');
      
      setIsCreating(false);
      window.removeEventListener('message', handleMessage);
      if (timeoutId) clearTimeout(timeoutId);
      
      const errorMsg = err.message || 'Unknown error';
      alert(`Error sending message to plugin: ${errorMsg}\n\nPlease check the browser console for details.`);
      return;
    }
  };

  const handleCollectionSelect = (collectionId: string) => {
    console.log('handleCollectionSelect called with collectionId:', collectionId);
    console.log('Type of collectionId:', typeof collectionId);
    
    // Close modal first
    setShowCollectionModal(false);
    
    // Empty string means create new collection, so pass null
    // Otherwise use the provided collectionId
    const finalCollectionId = collectionId === '' ? null : collectionId;
    console.log('Final collectionId to use:', finalCollectionId);
    
    // Call handleCreateVariables with the final collection ID
    // null = create new collection
    // string = use existing collection
    // Use setTimeout to ensure modal closes first
    setTimeout(() => {
      handleCreateVariables(finalCollectionId as any);
    }, 50);
  };

  const getSuggestedName = (color: string): string => {
    const c = chroma(color);
    const hue = c.get('hsl.h') || 0;
    const lightness = c.get('hsl.l');

    let category = 'neutral';
    if (hue >= 0 && hue < 30) category = 'red';
    else if (hue >= 30 && hue < 60) category = 'yellow';
    else if (hue >= 60 && hue < 150) category = 'green';
    else if (hue >= 150 && hue < 240) category = 'blue';
    else if (hue >= 240 && hue < 300) category = 'purple';
    else if (hue >= 300 && hue < 360) category = 'pink';

    let shade = 500;
    if (lightness > 0.9) shade = 50;
    else if (lightness > 0.8) shade = 100;
    else if (lightness > 0.7) shade = 200;
    else if (lightness > 0.6) shade = 300;
    else if (lightness > 0.5) shade = 400;
    else if (lightness > 0.4) shade = 600;
    else if (lightness > 0.3) shade = 700;
    else if (lightness > 0.2) shade = 800;
    else if (lightness > 0.1) shade = 900;
    else shade = 950;

    return `${variableNamePrefix}/${category}/${shade}`;
  };

  return (
    <div className="section-card" style={{ padding: '24px' }}>
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '4px' }}>
          Color Migrator
        </h3>
        <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
          Scan your file for existing colors and migrate them to variables
        </p>
      </div>

      {/* Scan Controls */}
      <div style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 500 }}>
            Scan Scope
          </label>
          <select
            value={selectedScope}
            onChange={(e) => setSelectedScope(e.target.value as any)}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid var(--color-border)',
              borderRadius: '6px',
              fontSize: '14px'
            }}
          >
            <option value="selection">Selection</option>
            <option value="page">Current Page</option>
            <option value="file">Entire File</option>
          </select>
        </div>

        <button
          onClick={handleScan}
          disabled={isScanning}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
        >
          {isScanning ? (
            <>
              <RefreshCw size={16} className="spinning" />
              Scanning...
            </>
          ) : (
            <>
              <ScanEye size={16} />
              Scan Colors
            </>
          )}
        </button>
      </div>

      {/* Results */}
      {scannedColors.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h4 style={{ fontSize: '14px', fontWeight: 600 }}>
              Found {scannedColors.length} unique colors
            </h4>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={selectAll}
                className="btn btn-secondary"
                style={{ fontSize: '12px', padding: '4px 8px' }}
              >
                Select All
              </button>
              <button
                onClick={deselectAll}
                className="btn btn-secondary"
                style={{ fontSize: '12px', padding: '4px 8px' }}
              >
                Deselect All
              </button>
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 500 }}>
              Variable Name Prefix
            </label>
            <input
              type="text"
              value={variableNamePrefix}
              onChange={(e) => setVariableNamePrefix(e.target.value)}
              placeholder="Extracted"
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid var(--color-border)',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            />
            <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
              Variables will be named as: {variableNamePrefix}/category/shade
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '400px', overflowY: 'auto' }}>
            {scannedColors.map((item, idx) => {
              const isSelected = selectedColors.has(item.color);
              const suggestedName = getSuggestedName(item.color);
              
              return (
                <div
                  key={idx}
                  style={{
                    padding: '12px',
                    border: `2px solid ${isSelected ? '#3b82f6' : 'var(--color-border)'}`,
                    borderRadius: '8px',
                    backgroundColor: isSelected ? '#eff6ff' : 'white',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onClick={() => toggleColorSelection(item.color)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {isSelected ? (
                        <CheckSquare size={20} style={{ color: '#3b82f6' }} />
                      ) : (
                        <Square size={20} style={{ color: 'var(--color-text-secondary)' }} />
                      )}
                      <div
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '6px',
                          backgroundColor: item.color,
                          border: '1px solid var(--color-border)',
                          flexShrink: 0
                        }}
                      />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: '13px', marginBottom: '2px' }}>
                        {item.color.toUpperCase()}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                        Used {item.count} time{item.count !== 1 ? 's' : ''}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>
                        Variable: {suggestedName}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
            <button
              onClick={() => handleCreateVariables()}
              disabled={selectedColors.size === 0 || isCreating}
              className="btn btn-primary"
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: '8px',
                flex: 1
              }}
            >
              {isCreating ? (
                <>
                  <RefreshCw size={16} className="spinning" />
                  Creating...
                </>
              ) : (
                <>
                  <Variable size={16} />
                  Create Variables ({selectedColors.size})
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {scannedColors.length === 0 && !isScanning && (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-secondary)' }}>
          <ScanEye size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
          <p>Click "Scan Colors" to find colors in your file</p>
        </div>
      )}

      {/* Collection Selection Modal */}
      {showCollectionModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1001
        }} onClick={() => setShowCollectionModal(false)}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            minWidth: '400px',
            maxWidth: '500px',
            maxHeight: '500px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                Select Collection
              </h3>
              <button
                onClick={() => setShowCollectionModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  color: 'var(--color-text-secondary)'
                }}
              >
                <X size={20} />
              </button>
            </div>
            
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '16px' }}>
              Choose a collection to add variables to, or create a new one:
            </p>

            {isLoadingCollections ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                Loading collections...
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '300px', overflowY: 'auto', marginBottom: '16px' }}>
                <button
                  onClick={() => {
                    console.log('Create New Collection button clicked');
                    handleCollectionSelect('');
                  }}
                style={{
                  padding: '12px 16px',
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px',
                  background: 'white',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#3b82f6';
                  e.currentTarget.style.backgroundColor = '#eff6ff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-border)';
                  e.currentTarget.style.backgroundColor = 'white';
                }}
              >
                <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-text-primary)' }}>
                  Create New Collection
                </div>
              </button>
              {collections.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: '13px' }}>
                  No existing collections found
                </div>
              ) : (
                collections.map((collection) => (
                  <button
                    key={collection.id}
                    onClick={() => {
                      console.log('Collection selected:', collection.name, collection.id);
                      handleCollectionSelect(collection.id);
                    }}
                    style={{
                      padding: '12px 16px',
                      border: '1px solid var(--color-border)',
                      borderRadius: '8px',
                      background: 'white',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#3b82f6';
                      e.currentTarget.style.backgroundColor = '#eff6ff';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--color-border)';
                      e.currentTarget.style.backgroundColor = 'white';
                    }}
                  >
                    <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-text-primary)' }}>
                      {collection.name}
                    </div>
                  </button>
                ))
              )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

