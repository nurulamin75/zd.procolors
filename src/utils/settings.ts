// Settings storage and management utility

export interface AppSettings {
  // Shade scale configuration
  defaultShadeScale: number[];
  
  // Naming convention for generated shades
  namingConvention: 'kebab-capital' | 'dot-lowercase' | 'abbreviated' | 'custom';
  customNamingPattern?: string; // Pattern with {group} and {shade} placeholders
  
  // Color matching settings
  colorMatchingThreshold: number; // DeltaE threshold for color matching
  defaultLinkPreference: 'variables' | 'styles' | null;
  
  // Export preferences
  defaultExportFormat: 'json' | 'css' | 'tailwind' | 'figma' | null;
  
  // UI preferences
  autoExpandGroups: boolean;
  
  // Data management
  lastClearedAt: string | null;
}

const DEFAULT_SETTINGS: AppSettings = {
  defaultShadeScale: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950],
  namingConvention: 'kebab-capital',
  customNamingPattern: '{group}-{shade}',
  colorMatchingThreshold: 5.0, // DeltaE threshold
  defaultLinkPreference: null,
  defaultExportFormat: null,
  autoExpandGroups: false,
  lastClearedAt: null,
};

const SETTINGS_KEY = 'procolors-settings';

// Check if localStorage is available and working
const isLocalStorageAvailable = (): boolean => {
  try {
    if (typeof localStorage === 'undefined') {
      return false;
    }
    const test = '__localStorage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
};

// Cache for plugin settings to avoid repeated requests
let pluginSettingsCache: AppSettings | null = null;
let settingsRequested = false;

export const getSettings = (): AppSettings => {
  // Try localStorage first
  if (isLocalStorageAvailable()) {
    try {
      const stored = localStorage.getItem(SETTINGS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return { ...DEFAULT_SETTINGS, ...parsed };
      }
    } catch (e) {
      console.error('Failed to load settings from localStorage:', e);
    }
  }
  
  // If we have cached plugin settings, use them
  if (pluginSettingsCache) {
    return pluginSettingsCache;
  }
  
  // Request settings from plugin if not already requested
  if (!settingsRequested && typeof parent !== 'undefined' && parent.postMessage) {
    settingsRequested = true;
    parent.postMessage({
      pluginMessage: {
        type: 'get-settings'
      }
    }, '*');
  }
  
  // Fallback to default settings
  return DEFAULT_SETTINGS;
};

// Function to update settings cache from plugin response
export const updateSettingsCache = (settings: AppSettings | null): void => {
  if (settings) {
    pluginSettingsCache = { ...DEFAULT_SETTINGS, ...settings };
  } else {
    pluginSettingsCache = DEFAULT_SETTINGS;
  }
};

export const saveSettings = (settings: Partial<AppSettings> | AppSettings): void => {
  // Prepare the settings object
  let updated: AppSettings;
  if (settings.defaultShadeScale && 
      'namingConvention' in settings &&
      typeof settings.colorMatchingThreshold === 'number' &&
      'defaultLinkPreference' in settings &&
      'defaultExportFormat' in settings &&
      typeof settings.autoExpandGroups === 'boolean' &&
      'lastClearedAt' in settings) {
    // It's a complete settings object
    updated = settings as AppSettings;
  } else {
    // It's a partial settings object, merge with current
    const current = getSettings();
    updated = { ...current, ...settings };
  }
  
  // Try localStorage first
  if (isLocalStorageAvailable()) {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
      console.log('Settings saved successfully to localStorage:', updated);
      return;
    } catch (e) {
      console.warn('Failed to save to localStorage, trying plugin storage:', e);
    }
  }
  
  // Fallback: Save via plugin using postMessage
  try {
    if (typeof parent !== 'undefined' && parent.postMessage) {
      parent.postMessage({
        pluginMessage: {
          type: 'save-settings',
          settings: updated
        }
      }, '*');
      // Update cache immediately
      pluginSettingsCache = updated;
      console.log('Settings saved via plugin storage:', updated);
    } else {
      throw new Error('No storage method available');
    }
  } catch (e) {
    console.error('Failed to save settings via plugin:', e);
    throw new Error('Failed to save settings: No storage method is available');
  }
};

export const resetSettings = (): void => {
  // Try localStorage first
  if (isLocalStorageAvailable()) {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(DEFAULT_SETTINGS));
      return;
    } catch (e) {
      console.warn('Failed to reset localStorage, trying plugin storage:', e);
    }
  }
  
  // Fallback: Save via plugin
  try {
    if (typeof parent !== 'undefined' && parent.postMessage) {
      parent.postMessage({
        pluginMessage: {
          type: 'save-settings',
          settings: DEFAULT_SETTINGS
        }
      }, '*');
    }
  } catch (e) {
    console.error('Failed to reset settings:', e);
  }
};

export const clearAllData = (): void => {
  // Try localStorage first
  if (isLocalStorageAvailable()) {
    try {
      // Clear all ProColors related data
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('procolors-') || key.startsWith('color-harmony-'))) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      // Reset settings
      resetSettings();
      
      // Update last cleared timestamp
      saveSettings({ lastClearedAt: new Date().toISOString() });
      return;
    } catch (e) {
      console.warn('Failed to clear localStorage, trying plugin storage:', e);
    }
  }
  
  // Fallback: Clear via plugin
  try {
    if (typeof parent !== 'undefined' && parent.postMessage) {
      parent.postMessage({
        pluginMessage: {
          type: 'clear-settings'
        }
      }, '*');
      resetSettings();
    }
  } catch (e) {
    console.error('Failed to clear data:', e);
  }
};

