import React, { useState, useEffect } from 'react';
import { ColorToken } from '../../../../utils/tokens';
import { X, Sun, Moon, Monitor, Smartphone, Check, AlertCircle, Bell, Search, Heart, Star, MessageCircle, Plus, Palette, Trash2 } from 'lucide-react';

interface ThemeGeneratorProps {
  palettes: Record<string, ColorToken[]>;
}

interface VariableCollection {
  id: string;
  name: string;
}

interface CustomTheme {
  id: string;
  name: string;
  bgColor: string;
  cardBgColor: string;
  textColor: string;
  secondaryTextColor: string;
  borderColor: string;
}

const DEFAULT_THEMES = [
  { id: 'light', label: 'Light', icon: Sun },
  { id: 'dark', label: 'Dark', icon: Moon },
  { id: 'dim', label: 'Dim', icon: Monitor },
  { id: 'amoled', label: 'AMOLED', icon: Smartphone },
];

export const ThemeGenerator: React.FC<ThemeGeneratorProps> = ({ palettes }) => {
  const [activeTheme, setActiveTheme] = useState<string>('light');
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [collections, setCollections] = useState<VariableCollection[]>([]);
  const [isLoadingCollections, setIsLoadingCollections] = useState(false);
  const [customThemes, setCustomThemes] = useState<CustomTheme[]>([]);
  const [showCustomThemeModal, setShowCustomThemeModal] = useState(false);
  const [newThemeName, setNewThemeName] = useState('');
  const [newThemeBgColor, setNewThemeBgColor] = useState('#1a1a2e');
  const [newThemeTextColor, setNewThemeTextColor] = useState('#eaeaea');

  const getCustomTheme = () => customThemes.find(t => t.id === activeTheme);

  const getBgColor = () => {
    const custom = getCustomTheme();
    if (custom) return custom.bgColor;
    switch (activeTheme) {
      case 'light': return '#ffffff';
      case 'dark': return '#111827';
      case 'dim': return '#1f2937';
      case 'amoled': return '#000000';
      default: return '#ffffff';
    }
  };

  const getCardBgColor = () => {
    const custom = getCustomTheme();
    if (custom) return custom.cardBgColor;
    switch (activeTheme) {
      case 'light': return '#f9fafb';
      case 'dark': return '#1f2937';
      case 'dim': return '#374151';
      case 'amoled': return '#111111';
      default: return '#f9fafb';
    }
  };

  const getTextColor = () => {
    const custom = getCustomTheme();
    if (custom) return custom.textColor;
    return activeTheme === 'light' ? '#111827' : '#f9fafb';
  };

  const getSecondaryTextColor = () => {
    const custom = getCustomTheme();
    if (custom) return custom.secondaryTextColor;
    return activeTheme === 'light' ? '#6b7280' : '#9ca3af';
  };

  const getBorderColor = () => {
    const custom = getCustomTheme();
    if (custom) return custom.borderColor;
    return activeTheme === 'light' ? '#e5e7eb' : '#374151';
  };

  const handleAddThemeToVariable = () => {
    if (!palettes || Object.keys(palettes).length === 0) {
      alert('No palettes available. Please generate colors first.');
      return;
    }
    
    setIsLoadingCollections(true);
    setShowCollectionModal(true);
    const parentWindow = (window as any).parent || parent;
    parentWindow.postMessage({ 
      pluginMessage: { 
        type: 'get-collections-for-theme' 
      } 
    }, '*');
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

  // Listen for event from header button
  useEffect(() => {
    const handleAddToVariable = () => {
      handleAddThemeToVariable();
    };
    window.addEventListener('theme-add-to-variable', handleAddToVariable);
    return () => window.removeEventListener('theme-add-to-variable', handleAddToVariable);
  }, [palettes]);

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

  const primaryColor = palettes.primary?.[5]?.value || '#3b82f6';
  const successColor = palettes.success?.[5]?.value || '#10b981';
  const errorColor = palettes.error?.[5]?.value || '#ef4444';
  const warningColor = palettes.warning?.[5]?.value || '#f59e0b';

  const handleAddCustomTheme = () => {
    if (!newThemeName.trim()) return;
    
    const id = `custom-${Date.now()}`;
    const newTheme: CustomTheme = {
      id,
      name: newThemeName.trim(),
      bgColor: newThemeBgColor,
      cardBgColor: adjustColor(newThemeBgColor, 10),
      textColor: newThemeTextColor,
      secondaryTextColor: adjustColor(newThemeTextColor, -30),
      borderColor: adjustColor(newThemeBgColor, 20),
    };
    
    setCustomThemes([...customThemes, newTheme]);
    setActiveTheme(id);
    setShowCustomThemeModal(false);
    setNewThemeName('');
    setNewThemeBgColor('#1a1a2e');
    setNewThemeTextColor('#eaeaea');
  };

  const handleDeleteCustomTheme = (themeId: string) => {
    setCustomThemes(customThemes.filter(t => t.id !== themeId));
    if (activeTheme === themeId) {
      setActiveTheme('light');
    }
  };

  // Helper to lighten/darken colors
  const adjustColor = (color: string, percent: number): string => {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.min(255, Math.max(0, (num >> 16) + amt));
    const G = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amt));
    const B = Math.min(255, Math.max(0, (num & 0x0000FF) + amt));
    return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Theme Button Group - Outside container */}
      <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
        <div style={{ 
          display: 'flex', 
          gap: '4px',
        }}>
          {/* Default Themes */}
          {DEFAULT_THEMES.map((theme) => (
            <button
              key={theme.id}
              onClick={() => setActiveTheme(theme.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 16px',
                borderRadius: '100px',
                fontSize: '13px',
                fontWeight: 500,
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s',
                background: activeTheme === theme.id ? 'white' : 'transparent',
                color: activeTheme === theme.id ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                boxShadow: activeTheme === theme.id ? 'var(--shadow-sm)' : 'none'
              }}
            >
              <theme.icon size={14} />
              {theme.label}
            </button>
          ))}
          
          {/* Custom Themes */}
          {customThemes.map((theme) => (
            <div key={theme.id} style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <button
                onClick={() => setActiveTheme(theme.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 16px',
                  paddingRight: '32px',
                  borderRadius: '100px',
                  fontSize: '13px',
                  fontWeight: 500,
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  background: activeTheme === theme.id ? 'white' : 'transparent',
                  color: activeTheme === theme.id ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                  boxShadow: activeTheme === theme.id ? 'var(--shadow-sm)' : 'none'
                }}
              >
                <div style={{ 
                  width: '14px', 
                  height: '14px', 
                  borderRadius: '50%', 
                  backgroundColor: theme.bgColor,
                  border: '1px solid var(--color-border)'
                }} />
                {theme.name}
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleDeleteCustomTheme(theme.id); }}
                style={{
                  position: 'absolute',
                  right: '8px',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  color: 'var(--color-text-tertiary)',
                  opacity: 0.6
                }}
                title="Delete theme"
              >
                <X size={12} />
              </button>
            </div>
          ))}
          
          {/* Add Custom Theme Button */}
          <button
            onClick={() => setShowCustomThemeModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 16px',
              borderRadius: '100px',
              fontSize: '13px',
              fontWeight: 500,
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s',
              background: 'transparent',
              color: 'var(--color-text-secondary)',
            }}
          >
            <Plus size={14} />
            Custom
          </button>
        </div>
      </div>

      <div>
        {/* App Theme Preview */}
        <div style={{ 
          backgroundColor: getBgColor(), 
          color: getTextColor(),
          padding: '20px', 
          borderRadius: '16px',
          transition: 'all 0.3s ease'
        }}>
          {/* Status Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', fontSize: '12px' }}>
            <div style={{ fontWeight: 600 }}>9:41</div>
            <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
              <div style={{ width: '16px', height: '10px', border: `1px solid ${getTextColor()}`, borderRadius: '2px', position: 'relative' }}>
                <div style={{ position: 'absolute', right: '-3px', top: '2px', width: '2px', height: '6px', backgroundColor: getTextColor(), borderRadius: '1px' }}></div>
                <div style={{ width: '60%', height: '100%', backgroundColor: successColor, borderRadius: '1px' }}></div>
              </div>
            </div>
          </div>

          {/* Header with Search */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ fontWeight: 700, fontSize: '18px' }}>App Theme Preview</div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <Search size={18} style={{ color: getSecondaryTextColor() }} />
              <Bell size={18} style={{ color: getSecondaryTextColor() }} />
            </div>
          </div>

          {/* User Profile Card */}
          {/* <div style={{ 
            backgroundColor: getCardBgColor(), 
            padding: '14px', 
            borderRadius: '10px', 
            marginBottom: '12px',
            border: `1px solid ${getBorderColor()}`
          }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <div style={{ 
                width: '44px', height: '44px', borderRadius: '50%', 
                background: `linear-gradient(135deg, ${primaryColor}, ${palettes.secondary?.[5]?.value || '#8b5cf6'})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 600
              }}>JD</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, marginBottom: '2px' }}>John Doe</div>
                <div style={{ fontSize: '12px', color: getSecondaryTextColor() }}>Premium Member</div>
              </div>
              <div style={{ 
                padding: '4px 10px', 
                backgroundColor: `${successColor}20`, 
                color: successColor, 
                borderRadius: '12px', 
                fontSize: '11px', 
                fontWeight: 600 
              }}>Active</div>
            </div>
          </div> */}

          {/* Stats Row */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            {[
              { label: 'Following', value: '1.2K', color: primaryColor },
              { label: 'Followers', value: '8.5K', color: palettes.secondary?.[5]?.value || '#8b5cf6' },
              { label: 'Likes', value: '24K', color: errorColor },
            ].map((stat, idx) => (
              <div key={idx} style={{ 
                flex: 1, 
                backgroundColor: getCardBgColor(), 
                padding: '20px', 
                borderRadius: '16px', 
                textAlign: 'center',
                border: `1px solid ${getBorderColor()}`
              }}>
                <div style={{ fontSize: '16px', fontWeight: 700, color: stat.color }}>{stat.value}</div>
                <div style={{ fontSize: '11px', color: getSecondaryTextColor() }}>{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Input Field */}
          {/* <div style={{ marginBottom: '12px' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              backgroundColor: getCardBgColor(),
              border: `1px solid ${getBorderColor()}`,
              borderRadius: '8px',
              padding: '10px 12px'
            }}>
              <Search size={16} style={{ color: getSecondaryTextColor() }} />
              <span style={{ color: getSecondaryTextColor(), fontSize: '13px' }}>Search anything...</span>
            </div>
          </div> */}

          {/* Buttons Row */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            <button style={{ 
              flex: 1, padding: '10px', borderRadius: '100px', border: 'none',
              backgroundColor: primaryColor,
              color: 'white', fontWeight: 500, fontSize: '13px'
            }}>
              Primary Action
            </button>
            <button style={{ 
              flex: 1, padding: '10px', borderRadius: '100px', 
              border: `1.5px solid ${primaryColor}`,
              backgroundColor: 'transparent',
              color: primaryColor,
              fontWeight: 500, fontSize: '13px'
            }}>
              Secondary
            </button>
          </div>

          {/* Alert Messages */}
          {/* <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              padding: '10px 12px', 
              backgroundColor: `${successColor}15`, 
              borderRadius: '8px',
              border: `1px solid ${successColor}30`
            }}>
              <Check size={16} style={{ color: successColor }} />
              <span style={{ fontSize: '12px', color: successColor }}>Success! Your changes have been saved.</span>
            </div>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              padding: '10px 12px', 
              backgroundColor: `${warningColor}15`, 
              borderRadius: '8px',
              border: `1px solid ${warningColor}30`
            }}>
              <AlertCircle size={16} style={{ color: warningColor }} />
              <span style={{ fontSize: '12px', color: warningColor }}>Warning: Please review your settings.</span>
            </div>
          </div> */}

          {/* Card with Actions */}
          <div style={{ 
            backgroundColor: getCardBgColor(), 
            borderRadius: '16px', 
            overflow: 'hidden',
            border: `1px solid ${getBorderColor()}`,
            marginBottom: '16px'
          }}>
            <div style={{ height: '80px', background: `linear-gradient(135deg, ${primaryColor}40, ${palettes.secondary?.[5]?.value || '#8b5cf6'}40)` }}></div>
            <div style={{ padding: '12px' }}>
              <div style={{ fontWeight: 600, marginBottom: '4px' }}>Featured Content</div>
              <div style={{ fontSize: '12px', color: getSecondaryTextColor(), marginBottom: '10px' }}>Discover amazing things with your palette colors.</div>
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: getSecondaryTextColor(), fontSize: '12px' }}>
                  <Heart size={14} style={{ color: errorColor }} /> 248
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: getSecondaryTextColor(), fontSize: '12px' }}>
                  <MessageCircle size={14} /> 52
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: getSecondaryTextColor(), fontSize: '12px' }}>
                  <Star size={14} style={{ color: warningColor }} /> 4.9
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Navigation */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-around', 
            paddingTop: '12px',
            borderTop: `1px solid ${getBorderColor()}`
          }}>
            {[
              { icon: Monitor, label: 'Home', active: true },
              { icon: Search, label: 'Search', active: false },
              { icon: Heart, label: 'Favorites', active: false },
              { icon: Bell, label: 'Alerts', active: false },
            ].map((item, idx) => (
              <div key={idx} style={{ textAlign: 'center' }}>
                <item.icon size={20} style={{ color: item.active ? primaryColor : getSecondaryTextColor() }} />
                <div style={{ fontSize: '10px', marginTop: '2px', color: item.active ? primaryColor : getSecondaryTextColor() }}>{item.label}</div>
              </div>
            ))}
          </div>
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

      {/* Custom Theme Modal */}
      {showCustomThemeModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000
        }} onClick={() => setShowCustomThemeModal(false)}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            minWidth: '400px',
            maxWidth: '500px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>Create Custom Theme</h3>
              <button
                onClick={() => setShowCustomThemeModal(false)}
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
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px' }}>
                  Theme Name
                </label>
                <input
                  type="text"
                  value={newThemeName}
                  onChange={(e) => setNewThemeName(e.target.value)}
                  placeholder="e.g., Midnight, Ocean, Forest..."
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px' }}>
                    Background Color
                  </label>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input
                      type="color"
                      value={newThemeBgColor}
                      onChange={(e) => setNewThemeBgColor(e.target.value)}
                      style={{ width: '40px', height: '40px', border: '1px solid var(--color-border)', borderRadius: '6px', cursor: 'pointer' }}
                    />
                    <input
                      type="text"
                      value={newThemeBgColor}
                      onChange={(e) => setNewThemeBgColor(e.target.value)}
                      style={{
                        flex: 1,
                        padding: '8px 10px',
                        border: '1px solid var(--color-border)',
                        borderRadius: '6px',
                        fontSize: '13px',
                        fontFamily: 'monospace'
                      }}
                    />
                  </div>
                </div>
                
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px' }}>
                    Text Color
                  </label>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input
                      type="color"
                      value={newThemeTextColor}
                      onChange={(e) => setNewThemeTextColor(e.target.value)}
                      style={{ width: '40px', height: '40px', border: '1px solid var(--color-border)', borderRadius: '6px', cursor: 'pointer' }}
                    />
                    <input
                      type="text"
                      value={newThemeTextColor}
                      onChange={(e) => setNewThemeTextColor(e.target.value)}
                      style={{
                        flex: 1,
                        padding: '8px 10px',
                        border: '1px solid var(--color-border)',
                        borderRadius: '6px',
                        fontSize: '13px',
                        fontFamily: 'monospace'
                      }}
                    />
                  </div>
                </div>
              </div>
              
              {/* Preview */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px' }}>
                  Preview
                </label>
                <div style={{
                  backgroundColor: newThemeBgColor,
                  color: newThemeTextColor,
                  padding: '16px',
                  borderRadius: '8px',
                  border: '1px solid var(--color-border)'
                }}>
                  <div style={{ fontWeight: 600, marginBottom: '4px' }}>Theme Preview</div>
                  <div style={{ fontSize: '13px', opacity: 0.8 }}>This is how your custom theme will look.</div>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                    <div style={{ 
                      padding: '6px 12px', 
                      backgroundColor: primaryColor, 
                      color: 'white', 
                      borderRadius: '6px', 
                      fontSize: '12px' 
                    }}>Button</div>
                    <div style={{ 
                      padding: '6px 12px', 
                      border: `1px solid ${newThemeTextColor}40`, 
                      borderRadius: '6px', 
                      fontSize: '12px' 
                    }}>Secondary</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '20px' }}>
              <button
                onClick={() => setShowCustomThemeModal(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCustomTheme}
                className="btn btn-primary"
                disabled={!newThemeName.trim()}
              >
                Create Theme
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
