import React, { useState, useEffect, useRef } from 'react';
import { 
  Settings, Palette, Download, Database, Trash2, RotateCcw, 
  Info, Check, X, Plus, Save, Link2, SlidersHorizontal, Star
} from 'lucide-react';
import { 
  getSettings, 
  saveSettings, 
  resetSettings, 
  clearAllData, 
  AppSettings,
  updateSettingsCache
} from '../../../utils/settings';
import { SHADE_Scale } from '../../../utils/tokens';

interface SettingsPageProps {
  onSettingsChange?: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ onSettingsChange }) => {
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      return getSettings();
    } catch (error) {
      console.error('Error loading settings:', error);
      return {
        defaultShadeScale: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950],
        namingConvention: 'kebab-capital',
        customNamingPattern: '{group}-{shade}',
        colorMatchingThreshold: 5.0,
        defaultLinkPreference: null,
        defaultExportFormat: null,
        autoExpandGroups: false,
        lastClearedAt: null,
      };
    }
  });
  const [hasChanges, setHasChanges] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const savePromiseResolveRef = useRef<((success: boolean) => void) | null>(null);
  const [activeTab, setActiveTab] = useState<'general' | 'preference'>('general');

  useEffect(() => {
    try {
      const current = getSettings();
      setSettings(current);
    } catch (error) {
      console.error('Error loading settings in useEffect:', error);
    }

    // Listen for settings responses from plugin
    const handleMessage = (event: MessageEvent) => {
      if (event.data.pluginMessage) {
        const msg = event.data.pluginMessage;
        
        if (msg.type === 'settings-loaded') {
          if (msg.settings) {
            updateSettingsCache(msg.settings);
            setSettings({ ...getSettings(), ...msg.settings });
          }
        } else         if (msg.type === 'settings-saved') {
          if (msg.success) {
            console.log('Settings confirmed saved by plugin');
            if (savePromiseResolveRef.current) {
              savePromiseResolveRef.current(true);
              savePromiseResolveRef.current = null;
            }
          } else {
            console.error('Plugin failed to save settings:', msg.error);
            if (savePromiseResolveRef.current) {
              savePromiseResolveRef.current(false);
              savePromiseResolveRef.current = null;
            }
          }
        }
      }
    };

    window.addEventListener('message', handleMessage);
    
    // Request settings from plugin on mount
    if (typeof parent !== 'undefined' && parent.postMessage) {
      parent.postMessage({
        pluginMessage: {
          type: 'get-settings'
        }
      }, '*');
    }

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  const updateSetting = <K extends keyof AppSettings>(
    key: K, 
    value: AppSettings[K]
  ) => {
    setSettings(prev => {
      const updated = { ...prev, [key]: value };
      // Check if there are actual changes compared to saved settings
      try {
        const current = getSettings();
        const hasActualChanges = JSON.stringify(updated) !== JSON.stringify(current);
        setHasChanges(hasActualChanges);
      } catch (e) {
        // If we can't compare, assume there are changes
        setHasChanges(true);
      }
      return updated;
    });
    setSaveStatus('idle');
  };

  const handleSave = async () => {
    try {
      console.log('handleSave called with settings:', settings);
      setSaveStatus('saving');
      
      // Validate settings before saving
      if (!settings) {
        console.error('Settings object is null or undefined');
        setSaveStatus('idle');
        alert('Settings are invalid. Please refresh the page.');
        return;
      }
      
      if (!settings.defaultShadeScale || settings.defaultShadeScale.length === 0) {
        console.error('Invalid shade scale:', settings.defaultShadeScale);
        setSaveStatus('idle');
        alert('Shade scale is invalid. Please add at least one shade value.');
        return;
      }
      
      // Save settings
      console.log('Calling saveSettings with:', settings);
      
      // Check if we're using plugin storage (localStorage not available)
      let usingPluginStorage = false;
      try {
        if (typeof localStorage === 'undefined') {
          usingPluginStorage = true;
        } else {
          // Test if localStorage actually works
          const test = '__test__';
          localStorage.setItem(test, test);
          localStorage.removeItem(test);
        }
      } catch (e) {
        usingPluginStorage = true;
      }
      
      if (usingPluginStorage) {
        // Wait for plugin confirmation
        const savePromise = new Promise<boolean>((resolve) => {
          savePromiseResolveRef.current = resolve;
        });
        
        // Set timeout in case plugin doesn't respond
        const timeout = setTimeout(() => {
          if (savePromiseResolveRef.current) {
            console.warn('Plugin did not respond within timeout, assuming success');
            savePromiseResolveRef.current(true); // Assume success after timeout
            savePromiseResolveRef.current = null;
          }
        }, 1000); // Reduced timeout to 1 second
        
        try {
          saveSettings(settings);
          const success = await savePromise;
          clearTimeout(timeout);
          
          if (!success) {
            throw new Error('Plugin failed to save settings');
          }
        } catch (error) {
          clearTimeout(timeout);
          savePromiseResolveRef.current = null;
          throw error;
        }
      } else {
        saveSettings(settings);
      }
      
      console.log('saveSettings completed');
      
      // Small delay to ensure write completes (only for localStorage)
      if (!usingPluginStorage) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      // Verify the save worked (best effort, don't block on failure)
      try {
        const saved = getSettings();
        console.log('Saved settings:', saved);
        console.log('Expected settings:', settings);
        
        // Check if key settings were saved correctly
        const shadeScaleMatch = JSON.stringify(saved.defaultShadeScale) === JSON.stringify(settings.defaultShadeScale);
        const thresholdMatch = Math.abs(saved.colorMatchingThreshold - settings.colorMatchingThreshold) < 0.01;
        const preferenceMatch = saved.defaultLinkPreference === settings.defaultLinkPreference;
        
        console.log('Verification results:', {
          shadeScaleMatch,
          thresholdMatch,
          preferenceMatch
        });
        
        if (!shadeScaleMatch || !thresholdMatch || !preferenceMatch) {
          console.warn('Settings verification failed, but save was attempted');
          // Don't block - settings might still be saved, just not immediately readable
        } else {
          console.log('Settings verified successfully!');
        }
      } catch (verifyError) {
        console.warn('Could not verify settings, but save was attempted:', verifyError);
      }
      
      // Always mark as saved and update UI
      setHasChanges(false);
      
      // Trigger settings change callback
      if (onSettingsChange) {
        console.log('Calling onSettingsChange callback');
        onSettingsChange();
      }
      
      // Also dispatch a custom event for other components to listen to
      window.dispatchEvent(new CustomEvent('settings-changed', { detail: settings }));
      console.log('Settings changed event dispatched');
      
      setSaveStatus('saved');
      setTimeout(() => {
        setSaveStatus('idle');
        console.log('Save status reset to idle');
      }, 2000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setSaveStatus('idle');
      alert('Failed to save settings: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const handleReset = () => {
    resetSettings();
    setSettings(getSettings());
    setHasChanges(false);
    setShowResetConfirm(false);
  };

  const handleClearAll = () => {
    clearAllData();
    setSettings(getSettings());
    setShowClearConfirm(false);
  };

  const addShadeValue = () => {
    if (!settings?.defaultShadeScale || settings.defaultShadeScale.length === 0) return;
    const newValue = Math.max(...settings.defaultShadeScale) + 50;
    updateSetting('defaultShadeScale', [...settings.defaultShadeScale, newValue].sort((a, b) => a - b));
  };

  const removeShadeValue = (value: number) => {
    if (!settings?.defaultShadeScale || settings.defaultShadeScale.length <= 3) return; // Keep at least 3 values
    updateSetting('defaultShadeScale', settings.defaultShadeScale.filter(v => v !== value));
  };

  const updateShadeValue = (oldValue: number, newValue: number) => {
    if (!settings?.defaultShadeScale || isNaN(newValue) || newValue < 0 || newValue > 1000) return;
    const updated = settings.defaultShadeScale.map(v => v === oldValue ? newValue : v);
    updateSetting('defaultShadeScale', updated.sort((a, b) => a - b));
  };

  // Safety check
  if (!settings) {
    return (
      <div className="animate-fade-in">
        <div className="section-card">
          <h2 className="section-title">Settings</h2>
          <p>Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ 
      maxWidth: '1200px', 
      margin: '0 auto',
      padding: '0 4px',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px'
    }}>
      {/* Tab Navigation */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        marginBottom: '4px'
      }}>
        <div style={{ 
          display: 'flex', 
          gap: '4px' 
        }}>
          <button
            onClick={() => setActiveTab('general')}
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
              background: activeTab === 'general' ? 'white' : 'transparent',
              color: activeTab === 'general' ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
              boxShadow: activeTab === 'general' ? 'var(--shadow-sm)' : 'none'
            }}
          >
            <SlidersHorizontal size={14} />
            General
          </button>
          <button
            onClick={() => setActiveTab('preference')}
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
              background: activeTab === 'preference' ? 'white' : 'transparent',
              color: activeTab === 'preference' ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
              boxShadow: activeTab === 'preference' ? 'var(--shadow-sm)' : 'none'
            }}
          >
            <Star size={14} />
            Preference
          </button>
        </div>
        {hasChanges && (
          <button 
            className="btn btn-primary"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('Save button clicked, settings:', settings);
              handleSave();
            }}
            disabled={saveStatus === 'saving'}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              cursor: saveStatus === 'saving' ? 'not-allowed' : 'pointer',
              padding: '10px 20px',
              fontSize: '14px',
              fontWeight: 500
            }}
          >
            {saveStatus === 'saving' ? (
              <>Saving...</>
            ) : saveStatus === 'saved' ? (
              <>
                <Check size={16} />
                Saved
              </>
            ) : (
              <>
                <Save size={16} />
                Save Changes
              </>
            )}
          </button>
        )}
      </div>

      {/* General Tab Content */}
      {activeTab === 'general' && (
        <>

          {/* Shade Scale Configuration */}
          <div style={{
            marginBottom: '2px'
          }}>
            <div style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '12px',
              border: '1px solid var(--color-border-light)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <Palette size={18} color="#3b82f6" strokeWidth={2} />
                <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                  Shade Scale
                </h3>
              </div>
              <p style={{ 
                fontSize: '13px', 
                color: 'var(--color-text-secondary)', 
                lineHeight: '1.5',
                marginBottom: '8px'
              }}>
                Configure the default shade scale used when generating color palettes. Values range from 0-1000.
              </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
              {settings?.defaultShadeScale?.map((value, index) => (
                <div 
                  key={index}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '4px 10px',
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 500
                  }}
                >
                  <input
                    type="number"
                    value={value}
                    onChange={(e) => updateShadeValue(value, parseInt(e.target.value) || 0)}
                    style={{
                      width: '50px',
                      border: 'none',
                      background: 'transparent',
                      fontSize: '12px',
                      fontWeight: 500,
                      textAlign: 'center',
                      outline: 'none',
                      padding: 0
                    }}
                    min="0"
                    max="1000"
                  />
                  {settings?.defaultShadeScale && settings.defaultShadeScale.length > 3 && (
                    <button
                      onClick={() => removeShadeValue(value)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '0',
                        display: 'flex',
                        alignItems: 'center',
                        color: '#ef4444',
                        opacity: 0.7,
                        transition: 'opacity 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                      onMouseLeave={(e) => e.currentTarget.style.opacity = '0.7'}
                      title="Remove"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={addShadeValue}
                className="btn btn-secondary"
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '6px',
                  padding: '4px 10px',
                  fontSize: '12px',
                  height: 'auto'
                }}
              >
                <Plus size={12} />
                Add Value
              </button>
            </div>
            
              <button
                onClick={() => updateSetting('defaultShadeScale', [...SHADE_Scale])}
                className="btn btn-secondary"
                style={{ fontSize: '12px', padding: '6px 12px', height: 'auto' }}
              >
                Reset to Default
              </button>
            </div>
          </div>

          {/* Naming Convention Configuration */}
          <div style={{
            marginBottom: '2px'
          }}>
            <div style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '12px',
              border: '1px solid var(--color-border-light)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <Settings size={18} color="#3b82f6" strokeWidth={2} />
                <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                  Naming Convention
                </h3>
              </div>
              <p style={{ 
                fontSize: '13px', 
                color: 'var(--color-text-secondary)', 
                lineHeight: '1.5',
                marginBottom: '16px'
              }}>
                Choose the naming format for generated color shades.
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px',
                    border: `2px solid ${settings.namingConvention === 'kebab-capital' ? '#3b82f6' : '#e2e8f0'}`,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    backgroundColor: settings.namingConvention === 'kebab-capital' ? '#eff6ff' : 'transparent',
                    transition: 'all 0.2s'
                  }}
                  onClick={() => updateSetting('namingConvention', 'kebab-capital')}
                >
                  <input
                    type="radio"
                    name="namingConvention"
                    value="kebab-capital"
                    checked={settings.namingConvention === 'kebab-capital'}
                    onChange={() => updateSetting('namingConvention', 'kebab-capital')}
                    style={{ cursor: 'pointer' }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-text-primary)', marginBottom: '4px' }}>
                      Kebab Case (Capital)
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontFamily: 'monospace' }}>
                      Primary-100
                    </div>
                  </div>
                </label>

                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px',
                    border: `2px solid ${settings.namingConvention === 'dot-lowercase' ? '#3b82f6' : '#e2e8f0'}`,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    backgroundColor: settings.namingConvention === 'dot-lowercase' ? '#eff6ff' : 'transparent',
                    transition: 'all 0.2s'
                  }}
                  onClick={() => updateSetting('namingConvention', 'dot-lowercase')}
                >
                  <input
                    type="radio"
                    name="namingConvention"
                    value="dot-lowercase"
                    checked={settings.namingConvention === 'dot-lowercase'}
                    onChange={() => updateSetting('namingConvention', 'dot-lowercase')}
                    style={{ cursor: 'pointer' }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-text-primary)', marginBottom: '4px' }}>
                      Dot Notation (Lowercase)
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontFamily: 'monospace' }}>
                      primary.lightest
                    </div>
                  </div>
                </label>

                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px',
                    border: `2px solid ${settings.namingConvention === 'abbreviated' ? '#3b82f6' : '#e2e8f0'}`,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    backgroundColor: settings.namingConvention === 'abbreviated' ? '#eff6ff' : 'transparent',
                    transition: 'all 0.2s'
                  }}
                  onClick={() => updateSetting('namingConvention', 'abbreviated')}
                >
                  <input
                    type="radio"
                    name="namingConvention"
                    value="abbreviated"
                    checked={settings.namingConvention === 'abbreviated'}
                    onChange={() => updateSetting('namingConvention', 'abbreviated')}
                    style={{ cursor: 'pointer' }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-text-primary)', marginBottom: '4px' }}>
                      Abbreviated
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontFamily: 'monospace' }}>
                      p1 / 100
                    </div>
                  </div>
                </label>

                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px',
                    border: `2px solid ${settings.namingConvention === 'custom' ? '#3b82f6' : '#e2e8f0'}`,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    backgroundColor: settings.namingConvention === 'custom' ? '#eff6ff' : 'transparent',
                    transition: 'all 0.2s'
                  }}
                  onClick={() => {
                    updateSetting('namingConvention', 'custom');
                    if (!settings.customNamingPattern) {
                      updateSetting('customNamingPattern', '{group}-{shade}');
                    }
                  }}
                >
                  <input
                    type="radio"
                    name="namingConvention"
                    value="custom"
                    checked={settings.namingConvention === 'custom'}
                    onChange={() => {
                      updateSetting('namingConvention', 'custom');
                      if (!settings.customNamingPattern) {
                        updateSetting('customNamingPattern', '{group}-{shade}');
                      }
                    }}
                    style={{ cursor: 'pointer' }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-text-primary)', marginBottom: '4px' }}>
                      Custom
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                      Define your own naming pattern
                    </div>
                  </div>
                </label>
              </div>

              {/* Custom Pattern Input */}
              {settings.namingConvention === 'custom' && (
                <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--color-border-light)' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '8px', color: 'var(--color-text-primary)' }}>
                    Custom Pattern
                  </label>
                  <div style={{ marginBottom: '8px' }}>
                    <input
                      type="text"
                      value={settings.customNamingPattern || '{group}-{shade}'}
                      onChange={(e) => updateSetting('customNamingPattern', e.target.value)}
                      placeholder="{group}-{shade}"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid var(--color-border)',
                        borderRadius: '6px',
                        fontSize: '13px',
                        fontFamily: 'monospace',
                        outline: 'none',
                        transition: 'border-color 0.2s'
                      }}
                      onFocus={(e) => e.currentTarget.style.borderColor = '#3b82f6'}
                      onBlur={(e) => e.currentTarget.style.borderColor = 'var(--color-border)'}
                    />
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '12px' }}>
                    Use <code style={{ backgroundColor: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', fontSize: '11px' }}>{'{group}'}</code> for the color group name and <code style={{ backgroundColor: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', fontSize: '11px' }}>{'{shade}'}</code> for the shade number.
                  </div>
                  
                  {/* Preview */}
                  <div style={{ 
                    padding: '12px', 
                    backgroundColor: '#f8fafc', 
                    borderRadius: '6px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <div style={{ fontSize: '12px', fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: '6px' }}>
                      Preview:
                    </div>
                    <div style={{ fontSize: '13px', fontFamily: 'monospace', color: 'var(--color-text-primary)' }}>
                      {(() => {
                        const pattern = settings.customNamingPattern || '{group}-{shade}';
                        const preview = pattern
                          .replace(/{group}/g, 'primary')
                          .replace(/{shade}/g, '100');
                        return preview || 'Enter a pattern to see preview';
                      })()}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Color Matching Settings */}
          <div style={{
            marginBottom: '2px'
          }}>
            <div style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '12px',
              // boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.03)',
              border: '1px solid var(--color-border-light)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <Settings size={18} color="#3b82f6" strokeWidth={2} />
                <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                  Color Matching
                </h3>
              </div>
              <p style={{ 
                fontSize: '13px', 
                color: 'var(--color-text-secondary)', 
                lineHeight: '1.5',
                marginBottom: '16px'
              }}>
                Configure how colors are matched when linking to variables or styles.
              </p>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px', color: 'var(--color-text-primary)' }}>
                Matching Threshold (DeltaE)
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <input
                  type="range"
                  min="1"
                  max="20"
                  step="0.5"
                  value={settings.colorMatchingThreshold}
                  onChange={(e) => updateSetting('colorMatchingThreshold', parseFloat(e.target.value))}
                  style={{ flex: 1, height: '6px' }}
                />
                <span style={{ 
                  minWidth: '50px', 
                  textAlign: 'right',
                  fontSize: '13px',
                  fontWeight: 600,
                  fontFamily: 'monospace',
                  color: 'var(--color-text-primary)'
                }}>
                  {settings.colorMatchingThreshold.toFixed(1)}
                </span>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '4px', marginBottom: 0 }}>
                Lower values = stricter matching. Recommended: 3.0-7.0
              </p>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px', color: 'var(--color-text-primary)' }}>
                Default Link Preference
              </label>
              <select
                value={settings.defaultLinkPreference || ''}
                onChange={(e) => updateSetting('defaultLinkPreference', e.target.value === '' ? null : e.target.value as 'variables' | 'styles')}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--color-border)',
                  fontSize: '13px',
                  backgroundColor: 'white',
                  color: 'var(--color-text-primary)'
                }}
              >
                <option value="">No preference</option>
                <option value="variables">Variables</option>
                <option value="styles">Styles</option>
              </select>
              <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '4px', marginBottom: 0 }}>
                Pre-select Variables or Styles when linking colors
              </p>
            </div>
            </div>
          </div>
        </>
      )}

      {/* Preference Tab Content */}
      {activeTab === 'preference' && (
        <>
          {/* Export Preferences */}
          <div style={{
            marginBottom: '2px'
          }}>
            <div style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '12px',
              // boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.03)',
              border: '1px solid var(--color-border-light)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <Download size={18} color="#3b82f6" strokeWidth={2} />
                <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                  Export Preferences
                </h3>
              </div>
              <p style={{ 
                fontSize: '13px', 
                color: 'var(--color-text-secondary)', 
                lineHeight: '1.5',
                marginBottom: '16px'
              }}>
                Set default export formats for quick access.
              </p>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px', color: 'var(--color-text-primary)' }}>
                Default Export Format
              </label>
              <select
                value={settings.defaultExportFormat || ''}
                onChange={(e) => updateSetting('defaultExportFormat', e.target.value === '' ? null : e.target.value as any)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--color-border)',
                  fontSize: '13px',
                  backgroundColor: 'white',
                  color: 'var(--color-text-primary)'
                }}
              >
                <option value="">No default</option>
                <option value="json">JSON</option>
                <option value="css">CSS Variables</option>
                <option value="tailwind">Tailwind Config</option>
                <option value="figma">Figma Styles</option>
              </select>
              <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '4px', marginBottom: 0 }}>
                Set a default format for quick exports
              </p>
            </div>
            </div>
          </div>

          {/* Data Management */}
          <div style={{
            marginBottom: '2px'
          }}>
            <div style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '12px',
              // boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.03)',
              border: '1px solid var(--color-border-light)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <Database size={18} color="#3b82f6" strokeWidth={2} />
                <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                  Data Management
                </h3>
              </div>
              <p style={{ 
                fontSize: '13px', 
                color: 'var(--color-text-secondary)', 
                lineHeight: '1.5',
                marginBottom: '16px'
              }}>
                Manage stored data and clear application cache.
              </p>
            <button
              onClick={() => setShowClearConfirm(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '10px 16px',
                fontSize: '13px',
                fontWeight: 500,
                color: '#dc2626',
                backgroundColor: 'transparent',
                border: '1.5px solid #fca5a5',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                width: '100%'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#fef2f2';
                e.currentTarget.style.borderColor = '#f87171';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.borderColor = '#fca5a5';
              }}
            >
              <Trash2 size={16} />
              Clear All Data
            </button>
              <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '8px', marginBottom: 0 }}>
                Remove all stored data including saved transfers, preferences, and cache
              </p>
            </div>
          </div>

          {/* Reset & About */}
          <div style={{
            marginBottom: '2px'
          }}>
            <div style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '12px',
              // boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.03)',
              border: '1px solid var(--color-border-light)',
              marginBottom: '16px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <RotateCcw size={18} color="#3b82f6" strokeWidth={2} />
                <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                  Reset All Settings
                </h3>
              </div>
              <p style={{ 
                fontSize: '13px', 
                color: 'var(--color-text-secondary)', 
                lineHeight: '1.5',
                marginBottom: '16px'
              }}>
                Restore all settings to their default values.
              </p>
              <button
                onClick={() => setShowResetConfirm(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '10px 16px',
                  fontSize: '13px',
                  fontWeight: 500,
                  color: '#dc2626',
                  backgroundColor: 'transparent',
                  border: '1.5px solid #fca5a5',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  width: '100%'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#fef2f2';
                  e.currentTarget.style.borderColor = '#f87171';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.borderColor = '#fca5a5';
                }}
              >
                <RotateCcw size={16} />
                Reset All Settings
              </button>
            </div>

            <div style={{
              padding: '20px',
              backgroundColor: '#f8fafc',
              borderRadius: '12px',
              border: '1px solid var(--color-border-light)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px'
            }}>
              <Info size={18} color="#3b82f6" style={{ flexShrink: 0, marginTop: '2px' }} strokeWidth={2} />
              <div>
                <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '6px', color: 'var(--color-text-primary)' }}>
                  ProColors
                </div>
                <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: '1.5' }}>
                  A powerful color management tool for Figma. Generate harmonious color systems, 
                  test accessibility, and manage design tokens with ease.
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="card animate-fade-in" style={{
            width: '400px',
            padding: '24px',
            backgroundColor: 'white',
            borderRadius: '16px'
          }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '18px', fontWeight: 600 }}>
              Reset All Settings?
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '24px' }}>
              This will restore all settings to their default values. This action cannot be undone.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                className="btn btn-secondary"
                onClick={() => setShowResetConfirm(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleReset}
                style={{ backgroundColor: '#ef4444', borderColor: '#ef4444' }}
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear Data Confirmation Modal */}
      {showClearConfirm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="card animate-fade-in" style={{
            width: '400px',
            padding: '24px',
            backgroundColor: 'white',
            borderRadius: '16px'
          }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '18px', fontWeight: 600 }}>
              Clear All Data?
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '24px' }}>
              This will permanently delete all stored data including saved transfers, preferences, and cache. 
              This action cannot be undone.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                className="btn btn-secondary"
                onClick={() => setShowClearConfirm(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleClearAll}
                style={{ backgroundColor: '#ef4444', borderColor: '#ef4444' }}
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

