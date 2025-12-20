// Brands storage and management utility

export interface Brand {
  id: string;
  name: string;
  primaryColor: string;
}

const BRANDS_KEY = 'procolors-brands';
const ACTIVE_BRAND_KEY = 'procolors-active-brand-id';

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

// Cache for plugin brands to avoid repeated requests
let pluginBrandsCache: Brand[] | null = null;
let brandsRequested = false;

// Default brand
const DEFAULT_BRAND: Brand = {
  id: 'default',
  name: 'Default Brand',
  primaryColor: '#3b82f6'
};

// Load brands from storage
export const getBrands = (): Brand[] => {
  // Try localStorage first
  if (isLocalStorageAvailable()) {
    try {
      const stored = localStorage.getItem(BRANDS_KEY);
      if (stored) {
        const brands = JSON.parse(stored);
        if (Array.isArray(brands) && brands.length > 0) {
          return brands;
        }
      }
    } catch (error) {
      console.error('Error loading brands from localStorage:', error);
    }
  }

  // If localStorage not available or empty, request from plugin
  if (!brandsRequested) {
    brandsRequested = true;
    parent.postMessage({ pluginMessage: { type: 'get-brands' } }, '*');
  }

  // Return cache if available, otherwise default
  if (pluginBrandsCache && pluginBrandsCache.length > 0) {
    return pluginBrandsCache;
  }

  return [DEFAULT_BRAND];
};

// Save brands to storage
export const saveBrands = async (brands: Brand[]): Promise<void> => {
  // Try localStorage first
  if (isLocalStorageAvailable()) {
    try {
      localStorage.setItem(BRANDS_KEY, JSON.stringify(brands));
      // Also update cache
      pluginBrandsCache = brands;
      return;
    } catch (error) {
      console.error('Error saving brands to localStorage:', error);
    }
  }

  // Fallback to plugin storage
  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      console.warn('Brands save timeout');
      resolve();
    }, 1000);

    parent.postMessage({ 
      pluginMessage: { 
        type: 'save-brands', 
        brands 
      } 
    }, '*');

    // Store resolver for when plugin responds
    (window as any).__brandsSaveResolve = () => {
      clearTimeout(timeout);
      resolve();
    };
  });
};

// Get active brand ID
export const getActiveBrandId = (): string => {
  // Try localStorage first
  if (isLocalStorageAvailable()) {
    try {
      const stored = localStorage.getItem(ACTIVE_BRAND_KEY);
      if (stored) {
        return stored;
      }
    } catch (error) {
      console.error('Error loading active brand ID from localStorage:', error);
    }
  }

  // Request from plugin
  parent.postMessage({ pluginMessage: { type: 'get-active-brand-id' } }, '*');

  return 'default';
};

// Save active brand ID
export const saveActiveBrandId = async (brandId: string): Promise<void> => {
  // Try localStorage first
  if (isLocalStorageAvailable()) {
    try {
      localStorage.setItem(ACTIVE_BRAND_KEY, brandId);
      return;
    } catch (error) {
      console.error('Error saving active brand ID to localStorage:', error);
    }
  }

  // Fallback to plugin storage (fire and forget)
  parent.postMessage({ 
    pluginMessage: { 
      type: 'save-active-brand-id', 
      brandId 
    } 
  }, '*');
};

// Update brands cache when loaded from plugin
export const updateBrandsCache = (brands: Brand[]): void => {
  pluginBrandsCache = brands;
  if (isLocalStorageAvailable()) {
    try {
      localStorage.setItem(BRANDS_KEY, JSON.stringify(brands));
    } catch (error) {
      console.error('Error updating brands cache:', error);
    }
  }
};

