export interface TransferData {
  id: string;
  metadata: {
    name: string;
    createdAt: string;
    fileName: string;
    version: number;
    variableCount: number;
    styleCount: number;
  };
  variables: any[];
  styles: any[];
}

const STORAGE_KEY_PREFIX = 'procolors.transfer.';

export const saveTransfer = (data: Omit<TransferData, 'id' | 'metadata'> & { fileName: string; name?: string }): TransferData => {
  const timestamp = Date.now();
  const id = `${STORAGE_KEY_PREFIX}${timestamp}`;
  
  const transfer: TransferData = {
    id,
    metadata: {
      name: data.name || `Transfer — ${new Date(timestamp).toLocaleDateString()} ${new Date(timestamp).toLocaleTimeString()}`,
      createdAt: new Date(timestamp).toISOString(),
      fileName: data.fileName,
      version: 1.0,
      variableCount: Array.isArray(data.variables) ? data.variables.length : 0,
      styleCount: Array.isArray(data.styles) ? data.styles.length : 0
    },
    variables: Array.isArray(data.variables) ? data.variables : [],
    styles: Array.isArray(data.styles) ? data.styles : []
  };

  try {
    if (typeof localStorage !== 'undefined') {
        localStorage.setItem(id, JSON.stringify(transfer));
    }
  } catch (e) {
    console.error("Failed to save transfer to local storage", e);
    // We don't throw here to prevent crashing the UI, just log it.
    // In a real app, we'd notify the user.
  }

  return transfer;
};

export const getAllTransfers = (): TransferData[] => {
  const transfers: TransferData[] = [];
  try {
    if (typeof localStorage === 'undefined') return [];

    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(STORAGE_KEY_PREFIX)) {
        try {
            const item = localStorage.getItem(key);
            if (item) {
                const parsed = JSON.parse(item);
                // Validate minimal structure to prevent crashes
                if (parsed && parsed.id && parsed.metadata) {
                    // Ensure arrays exist
                    parsed.variables = Array.isArray(parsed.variables) ? parsed.variables : [];
                    parsed.styles = Array.isArray(parsed.styles) ? parsed.styles : [];
                    transfers.push(parsed);
                }
            }
        } catch (e) {
            console.warn(`Failed to parse transfer ${key}`, e);
        }
        }
    }
  } catch (e) {
      console.error("Failed to access localStorage", e);
      return [];
  }
  
  return transfers.sort((a, b) => {
      try {
          return new Date(b.metadata.createdAt).getTime() - new Date(a.metadata.createdAt).getTime();
      } catch (e) {
          return 0;
      }
  });
};

export const getTransfer = (id: string): TransferData | null => {
  try {
    if (typeof localStorage === 'undefined') return null;
    const item = localStorage.getItem(id);
    return item ? JSON.parse(item) : null;
  } catch (e) {
    return null;
  }
};

export const deleteTransfer = (id: string): void => {
  try {
      if (typeof localStorage !== 'undefined') {
          localStorage.removeItem(id);
      }
  } catch (e) {
      console.error("Failed to delete", e);
  }
};

export const importFromJson = (jsonString: string): TransferData | null => {
    try {
        const data = JSON.parse(jsonString);
        // Basic validation
        if (!data || typeof data !== 'object') {
             throw new Error("Invalid JSON");
        }
        
        // Save to storage with a new ID to avoid conflicts if it was exported from here
        return saveTransfer({
            fileName: data.metadata?.fileName || 'Imported File',
            name: data.metadata?.name ? `${data.metadata.name} (Imported)` : undefined,
            variables: Array.isArray(data.variables) ? data.variables : [],
            styles: Array.isArray(data.styles) ? data.styles : []
        });
    } catch (e) {
        console.error("Import failed", e);
        return null;
    }
}
