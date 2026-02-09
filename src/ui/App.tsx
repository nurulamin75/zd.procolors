import { useState, useMemo, useEffect, useRef } from "react";
import { Figma, X, Download, ChevronDown, Frame, Image, Info, MessageSquarePlus, History, Bot, Palette, Eye, Building2, Settings, SwatchBook, Sparkles, Layers, Gauge, Blend, Compass, FolderUp, SplitSquareHorizontal, BookOpen, Pipette, CheckCircle2, ScanEye, Thermometer } from "lucide-react";
import { DropdownButton } from "./components/DropdownButton";
import { Sidebar } from "./components/Sidebar";

// Create
import { AIPaletteModule } from "./features/create/ai";
import { GeneratorPage } from "./features/create/shades/GeneratorPage";
import { ThemeGenerator } from "./features/create/themes/ThemeGenerator";
import { MultiBrand } from "./features/create/multiBrand/MultiBrand";
import { TokenManager } from "./features/create/tokens/TokenManager";
import { MeshGradientModule } from "./features/create/mesh/MeshGradientModule";
import { ColorOps } from "./features/create/colorOps/ColorOps";

// Explore
import { ExplorePalettesModule } from "./features/explore/palettes/ExplorePalettesModule";
import { BrandColorsModule } from "./features/explore/brands";
import { GradientModule } from "./features/explore/gradients";

// Flow
import { TransferPage } from "./features/flow/transfer/TransferPage";
import { AdvancedExport } from "./features/flow/export/AdvancedExport";
import { ColorExtractor } from "./features/flow/extractor/ColorExtractor";
import { DocumentationGenerator } from "./features/flow/documentation/DocumentationGenerator";

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

// Mesh Gradient Export Dropdown Component
const MeshExportDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExport = (exportType: 'frame' | 'image') => {
    window.dispatchEvent(new CustomEvent('mesh-gradient-export', { detail: { exportType } }));
    setIsOpen(false);
  };

  return (
    <div ref={menuRef} style={{ position: 'relative' }}>
      <button
        className="btn btn-primary"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '8px 12px',
          height: '33px',
          fontSize: '13px',
          fontWeight: 500
        }}
      >
        <Download size={16} />
        Export to Figma
        <ChevronDown size={14} style={{ marginLeft: '2px', opacity: 0.7 }} />
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          right: 0,
          marginTop: '4px',
          background: 'white',
          border: '1px solid var(--color-border)',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 50,
          minWidth: '200px',
          overflow: 'hidden'
        }}>
          <button
            onClick={() => handleExport('frame')}
            style={{
              width: '100%',
              padding: '10px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              fontSize: '13px',
              color: 'var(--color-text-primary)',
              textAlign: 'left',
              transition: 'background 0.15s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <Frame size={16} style={{ color: 'var(--color-text-secondary)' }} />
            Export as Editable Frame
          </button>
          <div style={{ height: '1px', background: 'var(--color-border)' }} />
          <button
            onClick={() => handleExport('image')}
            style={{
              width: '100%',
              padding: '10px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              fontSize: '13px',
              color: 'var(--color-text-primary)',
              textAlign: 'left',
              transition: 'background 0.15s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <Image size={16} style={{ color: 'var(--color-text-secondary)' }} />
            Export as Image
          </button>
        </div>
      )}
    </div>
  );
};

const App = () => {
  const [activeModule, setActiveModule] = useState('ai-generator');
  const [showAIHistory, setShowAIHistory] = useState(false);
  const [triggerNewChat, setTriggerNewChat] = useState(0); // Trigger for new chat

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
  const [deletedColors, setDeletedColors] = useState<Set<string>>(new Set());

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
    setDeletedColors(new Set());
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
    const merged = { ...generated, ...overrides };

    // Filter out deleted colors
    const filtered: Record<string, string> = {};
    Object.entries(merged).forEach(([name, value]) => {
      if (!deletedColors.has(name)) {
        filtered[name] = value;
      }
    });

    return filtered;
  }, [activeBrand.primaryColor, overrides, deletedColors]);

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
    // Delete from custom colors
    if (customColors[name]) {
      setCustomColors(prev => {
        const newColors = { ...prev };
        delete newColors[name];
        return newColors;
      });
    } else {
      // Mark semantic color as deleted
      setDeletedColors(prev => new Set(prev).add(name));
      // Also remove from overrides if it exists there
      setOverrides(prev => {
        const newOverrides = { ...prev };
        delete newOverrides[name];
        return newOverrides;
      });
    }
  };

  const handleRenameColor = (oldName: string, newName: string) => {
    const cleanNewName = newName.trim().toLowerCase();

    // Prevent renaming to existing names (check before filtering deleted colors)
    const generated = isValidColor(activeBrand.primaryColor) ? generateSemanticPalette(activeBrand.primaryColor) : {};
    const allExistingNames = { ...generated, ...overrides, ...customColors };

    if (allExistingNames[cleanNewName] && !deletedColors.has(cleanNewName)) {
      console.warn(`Color name "${cleanNewName}" already exists`);
      return;
    }

    if (!cleanNewName || cleanNewName === oldName) {
      return;
    }

    // Check if it's a custom color
    if (customColors[oldName]) {
      setCustomColors(prev => {
        const newColors = { ...prev };
        const colorValue = newColors[oldName];
        delete newColors[oldName];
        newColors[cleanNewName] = colorValue;
        return newColors;
      });
    } else {
      // It's a semantic color - mark old as deleted and add new to overrides
      const colorValue = overrides[oldName] || generated[oldName];

      // Mark old name as deleted
      setDeletedColors(prev => new Set(prev).add(oldName));

      // Add new name to overrides
      setOverrides(prev => {
        const newOverrides = { ...prev };
        delete newOverrides[oldName];
        newOverrides[cleanNewName] = colorValue;
        return newOverrides;
      });

      // Remove new name from deleted set if it was there
      setDeletedColors(prev => {
        const newSet = new Set(prev);
        newSet.delete(cleanNewName);
        return newSet;
      });
    }
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
      case 'ai-generator':
        return (
          <AIPaletteModule
            onColorChange={handleColorChange}
            onPaletteGenerated={(colors) => {
              // Update brands with generated colors
              Object.entries(colors).forEach(([name, color]) => {
                if (name === 'primary' && isValidColor(color)) {
                  setBrands(prev => prev.map(b =>
                    b.id === activeBrandId ? { ...b, primaryColor: color } : b
                  ));
                } else if (isValidColor(color)) {
                  handleColorChange(name, color);
                }
              });
            }}
            onNavigate={setActiveModule}
            showHistory={showAIHistory}
            triggerNewChat={triggerNewChat}
            onToggleHistory={() => setShowAIHistory(prev => !prev)}
          />
        );
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
            onRenameColor={handleRenameColor}
          />
        );
      case 'palettes':
        return <ExplorePalettesModule />;
      case 'brand-colors':
        return <BrandColorsModule />;
      case 'tokens':
        return <TokenManager baseTokens={allPalettes} onTokensChange={(tokens) => {
          // Update palettes when tokens change
          console.log('Tokens updated:', tokens);
        }} />;
      case 'themes':
        return <ThemeGenerator palettes={allPalettes} />;
      case 'color-ops':
        const colorOpsData = Object.entries(allPalettes).reduce((acc, [name, tokens]) => {
          acc[name] = tokens.map(token => ({ hex: token.value }));
          return acc;
        }, {} as Record<string, { hex: string }[]>);
        return <ColorOps palettes={colorOpsData} />;
      case 'transfer':
        return <TransferPage />;
      case 'gradients':
        return <GradientModule palettes={allPalettes} />;
      case 'mesh-gradient':
        return <MeshGradientModule palettes={allPalettes} />;
      case 'preview':
        return <LivePreview palettes={allPalettes} />;
      case 'contrast':
        return <ContrastPage />;
      case 'blindness':
        return <ColorBlindness palettes={allPalettes} />;
      case 'heatmap':
        return <HeatmapPage palettes={allPalettes} />;
      case 'extractor':
        return <ColorExtractor />;
      case 'documentation':
        const palettesForDoc = Object.entries(allPalettes).reduce((acc, [name, tokens]) => {
          acc[name] = tokens.reduce((shades, token) => {
            shades[token.shade] = token.value;
            return shades;
          }, {} as Record<number, string>);
          return acc;
        }, {} as Record<string, Record<number, string>>);
        return <DocumentationGenerator colors={semanticColors} palettes={palettesForDoc} brandName={activeBrand.name} />;
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {/* Module Icon */}
              <span style={{ color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center' }}>
                {activeModule === 'ai-generator' ? <Bot size={20} /> :
                  activeModule === 'generator' ? <SwatchBook size={20} /> :
                  activeModule === 'tokens' ? <Sparkles size={20} /> :
                  activeModule === 'themes' ? <Layers size={20} /> :
                  activeModule === 'mesh-gradient' ? <Gauge size={20} /> :
                  activeModule === 'color-ops' ? <Blend size={20} /> :
                  activeModule === 'brand-colors' ? <Building2 size={20} /> :
                  activeModule === 'palettes' ? <Palette size={20} /> :
                  activeModule === 'gradients' ? <Compass size={20} /> :
                  activeModule === 'transfer' ? <FolderUp size={20} /> :
                  activeModule === 'brands' ? <SplitSquareHorizontal size={20} /> :
                  activeModule === 'export' ? <Download size={20} /> :
                  activeModule === 'documentation' ? <BookOpen size={20} /> :
                  activeModule === 'extractor' ? <Pipette size={20} /> :
                  activeModule === 'preview' ? <Eye size={20} /> :
                  activeModule === 'contrast' ? <CheckCircle2 size={20} /> :
                  activeModule === 'blindness' ? <ScanEye size={20} /> :
                  activeModule === 'heatmap' ? <Thermometer size={20} /> :
                  activeModule === 'settings' ? <Settings size={20} /> :
                  <SwatchBook size={20} />}
              </span>
              <h1 style={{ fontSize: '18px', margin: 0 }}>
                {activeModule === 'ai-generator' ? 'Colzen AI' :
                  activeModule === 'generator' ? 'Generate Shades' :
                  activeModule === 'mesh-gradient' ? 'Create Mesh Gradient' :
                  activeModule === 'themes' ? 'Create Theme' :
                  activeModule === 'preview' ? 'Preview Palette' :
                  activeModule === 'export' ? 'Export Tokens' :
                  activeModule === 'brand-colors' ? 'Brand Colors' :
                  activeModule === 'palettes' ? 'Color Palettes' :
                  activeModule === 'color-ops' ? 'Color Ops' :
                    activeModule.charAt(0).toUpperCase() + activeModule.slice(1)}
              </h1>
              {activeModule === 'brand-colors' && (
                <div 
                  style={{ 
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'help'
                  }}
                  title="Explore color palettes from leading design systems and brands. Use these as inspiration or import them directly into your project."
                >
                  <Info size={16} color="var(--color-text-tertiary)" />
                </div>
              )}
              {activeModule === 'color-ops' && (
                <div 
                  className="info-tooltip-trigger"
                  style={{ 
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'help'
                  }}
                >
                  <Info size={16} color="var(--color-text-tertiary)" />
                  <div 
                    className="info-tooltip"
                    style={{
                      position: 'absolute',
                      top: '100%',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      marginTop: '8px',
                      backgroundColor: '#1f2937',
                      color: 'white',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      width: '200px',
                      whiteSpace: 'normal',
                      textAlign: 'center',
                      zIndex: 1000,
                      opacity: 0,
                      visibility: 'hidden',
                      transition: 'opacity 0.2s, visibility 0.2s',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                    }}
                  >
                    Advanced color operations: duotone, ramps, interpolation, and OKLAB mixing.
                    <div style={{ 
                      position: 'absolute', 
                      bottom: '100%', 
                      left: '50%', 
                      transform: 'translateX(-50%)', 
                      borderWidth: '6px', 
                      borderStyle: 'solid', 
                      borderColor: 'transparent transparent #1f2937 transparent' 
                    }} />
                  </div>
                </div>
              )}
            </div>
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
            {activeModule === 'ai-generator' ? (
              <>
                <button
                  onClick={() => setShowAIHistory(!showAIHistory)}
                  className="btn btn-secondary"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 12px',
                    background: showAIHistory ? '#6366f1' : undefined,
                    color: showAIHistory ? 'white' : undefined,
                    borderColor: showAIHistory ? '#6366f1' : undefined,
                  }}
                >
                  <History size={16} />
                  <span>History</span>
                </button>
                <button
                  onClick={() => {
                    setTriggerNewChat(prev => prev + 1);
                    setShowAIHistory(false);
                  }}
                  className="btn btn-primary"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 12px',
                  }}
                >
                  <MessageSquarePlus size={16} />
                  <span>New</span>
                </button>
              </>
            ) : activeModule === 'mesh-gradient' ? (
              <MeshExportDropdown />
            ) : activeModule === 'color-ops' ? (
              <button
                className="btn btn-primary"
                onClick={() => window.dispatchEvent(new CustomEvent('color-ops-export'))}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 12px',
                  height: '33px',
                  fontSize: '13px',
                  fontWeight: 500
                }}
              >
                <Download size={16} />
                Export to Figma
              </button>
            ) : activeModule === 'themes' ? (
              <button
                className="btn btn-primary"
                onClick={() => window.dispatchEvent(new CustomEvent('theme-add-to-variable'))}
              >
                Add Theme to Variable
              </button>
            ) : activeModule === 'preview' ? (
              <>
                <button
                  className="btn btn-secondary"
                  onClick={() => setActiveModule('palettes')}
                  style={{ fontSize: '13px', fontWeight: 500 }}
                >
                  Explore Palette
                </button>
                <button
                  className="btn btn-primary"
                  onClick={() => setActiveModule('generator')}
                  style={{ fontSize: '13px', fontWeight: 500 }}
                >
                  Create Palette
                </button>
              </>
            ) : (
              <>
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
              </>
            )}
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
