import React, { useState, useEffect } from 'react';
import { History, Camera, GitCompare, RotateCcw, X } from 'lucide-react';
import { ColorToken } from '../../../../utils/tokens';
import { SemanticToken } from '../../../../utils/semanticTokens';
import { TokenSnapshot, compareSnapshots, formatDiff, TokenDiff } from '../../../../utils/tokenVersioning';

interface TokenVersioningProps {
  baseTokens: Record<string, ColorToken[]>;
  semanticTokens?: SemanticToken[];
}

export const TokenVersioning: React.FC<TokenVersioningProps> = ({
  baseTokens,
  semanticTokens
}) => {
  const [snapshots, setSnapshots] = useState<TokenSnapshot[]>([]);
  const [selectedSnapshot, setSelectedSnapshot] = useState<TokenSnapshot | null>(null);
  const [compareSnapshot, setCompareSnapshot] = useState<TokenSnapshot | null>(null);
  const [diff, setDiff] = useState<TokenDiff | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadSnapshots();
  }, []);

  const loadSnapshots = async () => {
    setIsLoading(true);
    parent.postMessage({ pluginMessage: { type: 'get-token-snapshots' } }, '*');
    
    const handleMessage = (event: MessageEvent) => {
      if (event.data.pluginMessage?.type === 'token-snapshots-loaded') {
        setSnapshots(event.data.pluginMessage.snapshots || []);
        setIsLoading(false);
        window.removeEventListener('message', handleMessage);
      }
    };
    window.addEventListener('message', handleMessage);
  };

  const handleCreateSnapshot = () => {
    const name = prompt('Enter snapshot name:', `Snapshot ${new Date().toLocaleString()}`);
    if (!name) return;

    const description = prompt('Enter description (optional):', '');

    parent.postMessage(
      {
        pluginMessage: {
          type: 'create-token-snapshot',
          tokens: baseTokens,
          semanticTokens: semanticTokens || [],
          name,
          description: description || undefined
        }
      },
      '*'
    );

    const handleMessage = (event: MessageEvent) => {
      if (event.data.pluginMessage?.type === 'token-snapshot-created') {
        setSnapshots(prev => [...prev, event.data.pluginMessage.snapshot]);
        window.removeEventListener('message', handleMessage);
      }
    };
    window.addEventListener('message', handleMessage);
  };

  const handleCompare = (snapshot1: TokenSnapshot, snapshot2: TokenSnapshot) => {
    const comparison = compareSnapshots(snapshot1, snapshot2);
    setDiff(comparison);
    setSelectedSnapshot(snapshot1);
    setCompareSnapshot(snapshot2);
  };

  const handleRollback = (snapshot: TokenSnapshot) => {
    if (confirm(`Rollback to snapshot "${snapshot.name}"? This will restore all tokens to this state.`)) {
      // Restore tokens from snapshot
      console.log('Rolling back to:', snapshot);
      // This would need to be implemented to actually restore tokens in Figma
      alert('Rollback functionality requires implementation in Figma API');
    }
  };

  return (
    <div className="section-card" style={{ padding: '24px 24px 8px 24px', marginBottom: 0 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '4px' }}>
            Token Versioning
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
            Create snapshots, compare versions, and rollback changes
          </p>
        </div>
        <button
          onClick={handleCreateSnapshot}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Camera size={16} />
          Create Snapshot
        </button>
      </div>

      {/* Snapshots List */}
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-secondary)' }}>
          Loading snapshots...
        </div>
      ) : snapshots.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-secondary)' }}>
          <History size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
          <p>No snapshots yet. Create one to start tracking changes.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '400px', overflowY: 'auto' }}>
          {snapshots.map((snapshot, idx) => (
            <div
              key={snapshot.id}
              style={{
                padding: '16px',
                border: '1px solid var(--color-border)',
                borderRadius: '8px',
                backgroundColor: selectedSnapshot?.id === snapshot.id ? 'var(--color-bg-hover)' : 'white'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '4px' }}>
                    {snapshot.name}
                  </div>
                  {snapshot.description && (
                    <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                      {snapshot.description}
                    </div>
                  )}
                  <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>
                    {new Date(snapshot.timestamp).toLocaleString()}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {idx > 0 && (
                    <button
                      onClick={() => handleCompare(snapshot, snapshots[idx - 1])}
                      className="btn-icon"
                      title="Compare with previous"
                    >
                      <GitCompare size={14} />
                    </button>
                  )}
                  <button
                    onClick={() => handleRollback(snapshot)}
                    className="btn-icon"
                    title="Rollback to this snapshot"
                  >
                    <RotateCcw size={14} />
                  </button>
                </div>
              </div>
              {snapshot.metadata && (
                <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '8px' }}>
                  {snapshot.metadata.tokenCount} base tokens, {snapshot.metadata.semanticCount} semantic tokens
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Diff View */}
      {diff && selectedSnapshot && compareSnapshot && (
        <div style={{ marginTop: '24px', padding: '16px', border: '1px solid var(--color-border)', borderRadius: '8px', backgroundColor: 'var(--color-bg-hover)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h4 style={{ fontSize: '14px', fontWeight: 600 }}>
              Comparison: {selectedSnapshot.name} vs {compareSnapshot.name}
            </h4>
            <button onClick={() => setDiff(null)} className="btn-icon">
              <X size={16} />
            </button>
          </div>
          <div style={{ fontSize: '12px', fontFamily: 'monospace', whiteSpace: 'pre-wrap', backgroundColor: 'white', padding: '12px', borderRadius: '6px', maxHeight: '300px', overflowY: 'auto' }}>
            {formatDiff(diff)}
          </div>
        </div>
      )}
    </div>
  );
};

