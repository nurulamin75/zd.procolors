import { ColorToken } from './tokens';
import { SemanticToken } from './semanticTokens';

export interface TokenSnapshot {
  id: string;
  timestamp: number;
  name: string;
  description?: string;
  baseTokens: Record<string, ColorToken[]>;
  semanticTokens?: SemanticToken[];
  metadata?: Record<string, any>;
}

export interface TokenDiff {
  added: string[];
  removed: string[];
  modified: {
    token: string;
    oldValue: string;
    newValue: string;
  }[];
}

// Create a snapshot of current tokens
export function createSnapshot(
  baseTokens: Record<string, ColorToken[]>,
  semanticTokens?: SemanticToken[],
  name?: string,
  description?: string
): TokenSnapshot {
  return {
    id: `snapshot-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: Date.now(),
    name: name || `Snapshot ${new Date().toLocaleString()}`,
    description,
    baseTokens: JSON.parse(JSON.stringify(baseTokens)), // Deep clone
    semanticTokens: semanticTokens ? JSON.parse(JSON.stringify(semanticTokens)) : undefined,
    metadata: {
      tokenCount: Object.values(baseTokens).reduce((sum, tokens) => sum + tokens.length, 0),
      semanticCount: semanticTokens?.length || 0
    }
  };
}

// Compare two snapshots and return diff
export function compareSnapshots(
  oldSnapshot: TokenSnapshot,
  newSnapshot: TokenSnapshot
): TokenDiff {
  const diff: TokenDiff = {
    added: [],
    removed: [],
    modified: []
  };
  
  // Compare base tokens
  const oldTokens = new Map<string, string>();
  const newTokens = new Map<string, string>();
  
  // Collect old tokens
  Object.entries(oldSnapshot.baseTokens).forEach(([group, tokens]) => {
    tokens.forEach(token => {
      const key = `${group}/${token.shade}`;
      oldTokens.set(key, token.value);
    });
  });
  
  // Collect new tokens
  Object.entries(newSnapshot.baseTokens).forEach(([group, tokens]) => {
    tokens.forEach(token => {
      const key = `${group}/${token.shade}`;
      newTokens.set(key, token.value);
    });
  });
  
  // Find added tokens
  newTokens.forEach((value, key) => {
    if (!oldTokens.has(key)) {
      diff.added.push(key);
    }
  });
  
  // Find removed tokens
  oldTokens.forEach((value, key) => {
    if (!newTokens.has(key)) {
      diff.removed.push(key);
    }
  });
  
  // Find modified tokens
  oldTokens.forEach((oldValue, key) => {
    const newValue = newTokens.get(key);
    if (newValue && newValue !== oldValue) {
      diff.modified.push({
        token: key,
        oldValue,
        newValue
      });
    }
  });
  
  return diff;
}

// Format diff for display
export function formatDiff(diff: TokenDiff): string {
  const lines: string[] = [];
  
  if (diff.added.length > 0) {
    lines.push(`Added (${diff.added.length}):`);
    diff.added.forEach(token => lines.push(`  + ${token}`));
  }
  
  if (diff.removed.length > 0) {
    lines.push(`Removed (${diff.removed.length}):`);
    diff.removed.forEach(token => lines.push(`  - ${token}`));
  }
  
  if (diff.modified.length > 0) {
    lines.push(`Modified (${diff.modified.length}):`);
    diff.modified.forEach(({ token, oldValue, newValue }) => {
      lines.push(`  ~ ${token}`);
      lines.push(`    ${oldValue} → ${newValue}`);
    });
  }
  
  if (lines.length === 0) {
    return 'No changes detected.';
  }
  
  return lines.join('\n');
}

// Storage interface for snapshots (to be implemented with Figma clientStorage)
export interface SnapshotStorage {
  save(snapshot: TokenSnapshot): Promise<void>;
  load(id: string): Promise<TokenSnapshot | null>;
  list(): Promise<TokenSnapshot[]>;
  delete(id: string): Promise<void>;
}

