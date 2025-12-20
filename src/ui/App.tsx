import { useState, useMemo, useEffect } from "react";
import { Figma, X } from "lucide-react";
import { DropdownButton } from "./components/DropdownButton";
import { Sidebar } from "./components/Sidebar";

// Features
// Create
import { GeneratorPage } from "./features/create/shades/GeneratorPage";
import { ThemeGenerator } from "./features/create/themes/ThemeGenerator";
import { MultiBrand } from "./features/create/multiBrand/MultiBrand";
import { TokenManager } from "./features/create/tokens/TokenManager";

// Explore
import { ExplorePalettesModule } from "./features/explore/palettes/ExplorePalettesModule";
import { GradientModule } from "./features/explore/gradients";

// Flow
import { TransferPage } from "./features/flow/transfer/TransferPage";
import { AdvancedExport } from "./features/flow/export/AdvancedExport";
import { Replacer } from "./features/flow/replacer/Replacer";
import { ColorExtractor } from "./features/flow/extractor/ColorExtractor";

// Test
import { LivePreview } from "./features/test/preview";
import { ContrastPage } from "./features/test/contrast/ContrastPage";
import { ColorBlindness } from "./features/test/simulator/ColorBlindness";
import { HeatmapPage } from "./features/test/heatmap";

// Settings
import { SettingsPage } from "./features/settings/SettingsPage";

import { 
  isValidColor,
} from "../utils/color";
import { 
  getBrands, 
  saveBrands, 
  getActiveBrandId, 
  saveActiveBrandId,
  updateBrandsCache,
  Brand 
} from "../utils/brands";
import { 
    generateShades, 
    generateSemanticPalette, 
    ColorToken,
    SHADE_Scale
} from "../utils/tokens";
import { formatJSON, formatCSS, formatTailwind, downloadTokens } from "../utils/export";
import { getSettings, saveSettings } from "../utils/settings";

const App = () => {
  const [activeModule, setActiveModule] = useState('generator');
  
  const [brands, setBrands] = useState<Brand[]>(() => {
    try {
      return getBrands();
    } catch {
      return [{ id: 'default', name: 'Default Brand', primaryColor: '#3b82f6' }];
    }
  });
  const [activeBrandId, setActiveBrandId] = useState(() => {
    try {
      return getActiveBrandId();
    } catch {
      return 'default';
    }
  });
  
  // Load shade scale from settings
  const [shadeScale, setShadeScale] = useState<number[]>(() => {
    try {
      const settings = getSettings();
      return settings.defaultShadeScale || SHADE_Scale;
    } catch {
      return SHADE_Scale;
    }
  });
  
  const activeBrand = brands.find(b => b.id === activeBrandId) || brands[0];
  
  const [overrides, setOverrides] = useState<Record<string, string>>({});
  const [customColors, setCustomColors] = useState<Record<string, string>>({});
  
  // Modal states for variable creation
  const [showVariableTypeModal, setShowVariableTypeModal] = useState(false);
  const [showCollectionSelectModal, setShowCollectionSelectModal] = useState(false);
  const [showComponentSelectModal, setShowComponentSelectModal] = useState(false);
  const [collections, setCollections] = useState<{ id: string; name: string }[]>([]);
  const [isLoadingCollections, setIsLoadingCollections] = useState(false);
  const [selectedVariableType, setSelectedVariableType] = useState<'collection' | 'alias' | 'component' | null>(null);

  useEffect(() => {
      setOverrides({});
      setCustomColors({});
  }, [activeBrandId]);

  // Load brands from plugin storage on mount
  useEffect(() => {
    // Request brands from plugin on mount
    parent.postMessage({ pluginMessage: { type: 'get-brands' } }, '*');
    parent.postMessage({ pluginMessage: { type: 'get-active-brand-id' } }, '*');

    // Try to load from localStorage first (faster)
    try {
      const loadedBrands = getBrands();
      if (loadedBrands && loadedBrands.length > 0) {
        setBrands(loadedBrands);
      }
      const loadedActiveId = getActiveBrandId();
      if (loadedActiveId && loadedActiveId !== 'default') {
        setActiveBrandId(loadedActiveId);
      }
    } catch (error) {
      console.error('Error loading brands from localStorage:', error);
    }

    // Listen for brands-loaded message from plugin
    const handleMessage = (event: MessageEvent) => {
      if (event.data.pluginMessage?.type === 'brands-loaded') {
        const loadedBrands = event.data.pluginMessage.brands;
        if (loadedBrands && Array.isArray(loadedBrands) && loadedBrands.length > 0) {
          updateBrandsCache(loadedBrands);
          setBrands(loadedBrands);
        }
      }
      if (event.data.pluginMessage?.type === 'active-brand-id-loaded') {
        const loadedId = event.data.pluginMessage.brandId;
        if (loadedId) {
          setActiveBrandId(loadedId);
        }
      }
      if (event.data.pluginMessage?.type === 'brands-saved') {
        if ((window as any).__brandsSaveResolve) {
          (window as any).__brandsSaveResolve();
          (window as any).__brandsSaveResolve = null;
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Save brands when they change
  useEffect(() => {
    if (brands.length > 0) {
      saveBrands(brands).catch(error => {
        console.error('Error saving brands:', error);
      });
    }
  }, [brands]);

  // Save active brand ID when it changes
  useEffect(() => {
    if (activeBrandId) {
      saveActiveBrandId(activeBrandId).catch(error => {
        console.error('Error saving active brand ID:', error);
      });
    }
  }, [activeBrandId]);

  // Save shade scale to settings when it changes
  useEffect(() => {
    try {
      const settings = getSettings();
      // Only save if it's different from what's in settings to avoid loops
      if (JSON.stringify(settings.defaultShadeScale) !== JSON.stringify(shadeScale)) {
        saveSettings({ ...settings, defaultShadeScale: shadeScale });
      }
    } catch (error) {
      console.error('Error saving shade scale:', error);
    }
  }, [shadeScale]);

  // Listen for settings changes from other sources (like settings page)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'procolors-settings' && e.newValue) {
        try {
          const settings = JSON.parse(e.newValue);
          if (settings.defaultShadeScale) {
            // Only update if it's actually different to avoid unnecessary re-renders
            if (JSON.stringify(settings.defaultShadeScale) !== JSON.stringify(shadeScale)) {
              setShadeScale(settings.defaultShadeScale);
            }
          }
        } catch (error) {
          console.error('Error parsing settings:', error);
        }
      }
    };

    const handleSettingsChanged = (e: CustomEvent) => {
      const settings = e.detail;
      if (settings.defaultShadeScale) {
        // Only update if it's actually different to avoid unnecessary re-renders
        if (JSON.stringify(settings.defaultShadeScale) !== JSON.stringify(shadeScale)) {
          setShadeScale(settings.defaultShadeScale);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('settings-changed', handleSettingsChanged as EventListener);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('settings-changed', handleSettingsChanged as EventListener);
    };
  }, [shadeScale]);

  const semanticColors = useMemo(() => {
    const generated = isValidColor(activeBrand.primaryColor) ? generateSemanticPalette(activeBrand.primaryColor) : {};
    return { ...generated, ...overrides };
  }, [activeBrand.primaryColor, overrides]);

  const allPalettes = useMemo(() => {
    const palettes: Record<string, ColorToken[]> = {};
    Object.entries(semanticColors).forEach(([name, baseValue]) => {
      if (isValidColor(baseValue)) {
        palettes[name] = generateShades(baseValue, name, shadeScale);
      }
    });
    // Add custom colors with shades
    Object.entries(customColors).forEach(([name, baseValue]) => {
      if (isValidColor(baseValue)) {
        palettes[name] = generateShades(baseValue, name, shadeScale);
      }
    });
    return palettes;
  }, [semanticColors, customColors, shadeScale]);

  const handleColorChange = (name: string, val: string) => {
    if (name === 'primary') {
      setBrands(prev => prev.map(b => 
          b.id === activeBrandId ? { ...b, primaryColor: val } : b
      ));
    } else if (customColors[name]) {
      // Update custom color
      setCustomColors(prev => ({ ...prev, [name]: val }));
    } else {
      setOverrides(prev => ({ ...prev, [name]: val }));
    }
  };

  const handleAddCustomColor = (name: string, color: string) => {
    if (isValidColor(color) && name.trim()) {
      setCustomColors(prev => ({ ...prev, [name.trim()]: color }));
    }
  };

  const handleDeleteCustomColor = (name: string) => {
    setCustomColors(prev => {
      const newColors = { ...prev };
      delete newColors[name];
      return newColors;
    });
  };

  // Listen for collections response
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

  const handleVariableTypeSelect = (type: 'collection' | 'alias' | 'component') => {
    setSelectedVariableType(type);
    setShowVariableTypeModal(false);
    
    const settings = getSettings();
    
    if (type === 'collection') {
      // Directly create new collection
      parent.postMessage({ 
        pluginMessage: { 
          type: 'create-color-variables', 
          palettes: allPalettes, 
          action: 'create',
          variableType: 'collection',
          brandName: activeBrand?.name || 'Default Brand',
          namingConvention: settings.namingConvention,
          customNamingPattern: settings.customNamingPattern
        } 
      }, '*');
    } else if (type === 'alias') {
      // Show collection selector for alias
      setIsLoadingCollections(true);
      setShowCollectionSelectModal(true);
      parent.postMessage({ pluginMessage: { type: 'get-collections-for-theme' } }, '*');
    } else if (type === 'component') {
      // Show collection/alias selector for component
      setIsLoadingCollections(true);
      setShowComponentSelectModal(true);
      parent.postMessage({ pluginMessage: { type: 'get-collections-for-theme' } }, '*');
    }
  };

  const handleCollectionSelect = (collectionId: string) => {
    setShowCollectionSelectModal(false);
    if (selectedVariableType === 'alias') {
      const settings = getSettings();
      parent.postMessage({ 
        pluginMessage: { 
          type: 'create-color-variables', 
          palettes: allPalettes, 
          action: 'create',
          variableType: 'alias',
          collectionId: collectionId,
          brandName: activeBrand?.name || 'Default Brand',
          namingConvention: settings.namingConvention,
          customNamingPattern: settings.customNamingPattern
        } 
      }, '*');
    }
    setSelectedVariableType(null);
  };

  const handleComponentCollectionSelect = (collectionId: string) => {
    setShowComponentSelectModal(false);
    if (selectedVariableType === 'component') {
      const settings = getSettings();
      parent.postMessage({ 
        pluginMessage: { 
          type: 'create-color-variables', 
          palettes: allPalettes, 
          action: 'create',
          variableType: 'component',
          collectionId: collectionId,
          brandName: activeBrand?.name || 'Default Brand',
          namingConvention: settings.namingConvention,
          customNamingPattern: settings.customNamingPattern
        } 
      }, '*');
    }
    setSelectedVariableType(null);
  };

  const handleExport = (format: 'json' | 'css' | 'tailwind' | 'figma' | 'download' | 'copy-all' | 'figma-variables', action?: string, targetId?: string) => {
      if (format === 'figma') {
        parent.postMessage({ pluginMessage: { type: 'create-color-styles', palettes: allPalettes, action: action || 'create', targetId } }, '*');
      } else if (format === 'figma-variables') {
        if (action === 'create') {
          // Show modal with 3 options
          setShowVariableTypeModal(true);
        } else {
          parent.postMessage({ pluginMessage: { type: 'create-color-variables', palettes: allPalettes, action: action || 'create', targetId, brandName: activeBrand?.name || 'Default Brand' } }, '*');
        }
      } else if (format === 'download') {
          downloadTokens(allPalettes);
      } else {
        let content = '';
        if (format === 'json' || format === 'copy-all') content = formatJSON(allPalettes);
        if (format === 'css') content = formatCSS(allPalettes);
        if (format === 'tailwind') content = formatTailwind(allPalettes);
        
        const textArea = document.createElement("textarea");
        textArea.value = content;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }
  };

  const handleAddToCanvas = () => {
    parent.postMessage({ pluginMessage: { type: 'add-palette-to-canvas', palettes: allPalettes } }, '*');
  };

  const addBrand = async (name: string, color: string) => {
      const newBrand = { id: Date.now().toString(), name, primaryColor: color };
      const updatedBrands = [...brands, newBrand];
      setBrands(updatedBrands);
      setActiveBrandId(newBrand.id);
      // Save will be handled by useEffect
  };

  const deleteBrand = async (id: string) => {
      const newBrands = brands.filter(b => b.id !== id);
      setBrands(newBrands);
      if (activeBrandId === id) {
          const newActiveId = newBrands.length > 0 ? newBrands[0].id : 'default';
          setActiveBrandId(newActiveId);
      }
      // Save will be handled by useEffect
  };

  const renderContent = () => {
      switch (activeModule) {
          case 'generator':
              return (
                <GeneratorPage 
                  primaryColor={activeBrand.primaryColor}
                  semanticColors={semanticColors}
                  allPalettes={allPalettes}
                  onColorChange={handleColorChange}
                  onExport={handleExport}
                  shadeScale={shadeScale}
                  onUpdateScale={setShadeScale}
                  customColors={customColors}
                  onAddCustomColor={handleAddCustomColor}
                  onDeleteCustomColor={handleDeleteCustomColor}
                />
              );
          case 'palettes':
              return <ExplorePalettesModule />;
          case 'tokens':
              return <TokenManager baseTokens={allPalettes} onTokensChange={(tokens) => {
                // Update palettes when tokens change
                console.log('Tokens updated:', tokens);
              }} />;
          case 'themes':
              return <ThemeGenerator palettes={allPalettes} />;
          case 'transfer':
              return <TransferPage />;
          case 'gradients':
              return <GradientModule palettes={allPalettes} />;
          case 'preview':
              return <LivePreview palettes={allPalettes} />;
          case 'contrast':
              return <ContrastPage />;
          case 'blindness':
              return <ColorBlindness palettes={allPalettes} />;
          case 'heatmap':
              return <HeatmapPage palettes={allPalettes} />;
          case 'replacer':
              return <Replacer />;
          case 'extractor':
              return <ColorExtractor />;
          case 'brands':
              return <MultiBrand 
                  brands={brands} 
                  activeBrandId={activeBrandId} 
                  onSelectBrand={setActiveBrandId} 
                  onAddBrand={addBrand}
                  onDeleteBrand={deleteBrand}
              />;
          case 'export':
              return <AdvancedExport palettes={allPalettes} />;
          case 'settings':
              return <SettingsPage onSettingsChange={() => {
                // Reload shade scale when settings change
                const settings = getSettings();
                if (settings.defaultShadeScale) {
                  setShadeScale(settings.defaultShadeScale);
                }
              }} />;
          default:
              return <div>Module not found</div>;
      }
  };

  return (
    <div className="app-container">
      <Sidebar activeModule={activeModule} onChangeModule={setActiveModule} />
      
      <div className="main-content">
          {/* Simplified Header */}
          <div style={{ 
              padding: '12px 20px', 
              background: 'white', 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
            }}>
              <div>
                  <h1 style={{ fontSize: '18px', margin: 0 }}>
                      {activeModule === 'generator' ? 'Generate Shades' : activeModule.charAt(0).toUpperCase() + activeModule.slice(1)}
                  </h1>
                  {activeModule === 'palettes' && (
                    <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: '2px 0 0 0' }}>
                        Browse trending color palettes
                    </p>
                  )}
                  {activeModule === 'gradients' && (
                    <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: '4px 0 0 0' }}>
                        Generate gradients from your colors.
                    </p>
                  )}
                  {activeModule === 'transfer' && (
                    <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: '4px 0 0 0' }}>
                        Migrate design tokens between files.
                    </p>
                  )}
                  {activeModule === 'heatmap' && (
                    <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: '4px 0 0 0' }}>
                        Visualize contrast ratios and find accessibility issues.
                    </p>
                  )}
                  {activeModule === 'contrast' && (
                    <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: '4px 0 0 0' }}>
                        Check WCAG contrast compliance
                    </p>
                  )}
                  {activeModule === 'settings' && (
                    <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: '4px 0 0 0' }}>
                        Configure application preferences and settings
                    </p>
                  )}
              </div>
              
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                   <button
                      onClick={handleAddToCanvas}
                      className="btn btn-secondary"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '8px',
                        width: '36px',
                        height: '36px',
                        minWidth: '36px'
                      }}
                      title="Add palette to canvas"
                   >
                      <Figma size={18} />
                   </button>
                   <DropdownButton 
                      label="Style" 
                      variant="secondary"
                      targetType="styles"
                      options={[
                          { label: 'Create New Styles', action: 'create' },
                          { label: 'Update Existing Styles', action: 'update' }
                      ]}
                      onSelect={(action, targetId) => handleExport('figma', action as 'create' | 'update', targetId)}
                   />
                   <DropdownButton 
                      label="Variable" 
                      variant="primary"
                      targetType="variables"
                      options={[
                          { label: 'Create New Variables', action: 'create' },
                          { label: 'Update Existing Variables', action: 'update' }
                      ]}
                      onSelect={(action, targetId) => handleExport('figma-variables', action as 'create' | 'update', targetId)}
                   />
              </div>
          </div>

          <div className="content-scroll-area">
              {renderContent()}
          </div>
      </div>

      {/* Variable Type Selection Modal */}
      {showVariableTypeModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }} onClick={() => setShowVariableTypeModal(false)}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            minWidth: '400px',
            maxWidth: '500px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                Create New Variables
              </h3>
              <button
                onClick={() => setShowVariableTypeModal(false)}
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
            
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '20px' }}>
              Choose the type of variable collection to create:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button
                onClick={() => handleVariableTypeSelect('collection')}
                style={{
                  padding: '16px',
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
                <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '4px' }}>
                  1. New Variable Collection
                </div>
                <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                  Create a fresh new variable collection
                </div>
              </button>

              <button
                onClick={() => handleVariableTypeSelect('alias')}
                style={{
                  padding: '16px',
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
                <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '4px' }}>
                  2. New Alias Collection
                </div>
                <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                  Create an alias collection referencing an existing collection
                </div>
              </button>

              <button
                onClick={() => handleVariableTypeSelect('component')}
                style={{
                  padding: '16px',
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
                <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '4px' }}>
                  3. New Component Token Collection
                </div>
                <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                  Create component variables based on an existing collection or alias
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Collection Selection Modal for Alias */}
      {showCollectionSelectModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1001
        }} onClick={() => {
          setShowCollectionSelectModal(false);
          setSelectedVariableType(null);
        }}>
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
                Select Collection for Alias
              </h3>
              <button
                onClick={() => {
                  setShowCollectionSelectModal(false);
                  setSelectedVariableType(null);
                }}
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
              Choose which collection you want to create an alias for:
            </p>

            {isLoadingCollections ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                Loading collections...
              </div>
            ) : collections.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                No collections found. Please create a collection first.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '300px', overflowY: 'auto' }}>
                {collections.map((collection) => (
                  <button
                    key={collection.id}
                    onClick={() => handleCollectionSelect(collection.id)}
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
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Collection Selection Modal for Component */}
      {showComponentSelectModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1001
        }} onClick={() => {
          setShowComponentSelectModal(false);
          setSelectedVariableType(null);
        }}>
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
                Select Collection/Alias for Component
              </h3>
              <button
                onClick={() => {
                  setShowComponentSelectModal(false);
                  setSelectedVariableType(null);
                }}
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
              Choose which collection or alias you want to create component variables for:
            </p>

            {isLoadingCollections ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                Loading collections...
              </div>
            ) : collections.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                No collections found. Please create a collection first.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '300px', overflowY: 'auto' }}>
                {collections.map((collection) => (
                  <button
                    key={collection.id}
                    onClick={() => handleComponentCollectionSelect(collection.id)}
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
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
