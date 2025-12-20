import React, { useState, useEffect } from 'react';
import { CheckCircle2, X, Plus, Link2, Edit2, Trash2, AlertCircle } from 'lucide-react';
import { ColorToken } from '../../../../utils/tokens';
import { SemanticToken, suggestSemanticTokens, validateAlias } from '../../../../utils/semanticTokens';

interface SemanticTokensProps {
  baseTokens: Record<string, ColorToken[]>;
  onTokensChange?: (tokens: SemanticToken[]) => void;
}

export const SemanticTokens: React.FC<SemanticTokensProps> = ({
  baseTokens,
  onTokensChange
}) => {
  const [semanticTokens, setSemanticTokens] = useState<SemanticToken[]>([]);
  const [editingToken, setEditingToken] = useState<SemanticToken | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTokenName, setNewTokenName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'brand' | 'text' | 'bg' | 'border' | 'state'>('brand');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [selectedAlias, setSelectedAlias] = useState('');

  useEffect(() => {
    // Auto-suggest semantic tokens from base tokens
    const suggestions = suggestSemanticTokens(baseTokens);
    setSemanticTokens(suggestions);
    if (onTokensChange) {
      onTokensChange(suggestions);
    }
  }, [baseTokens]);

  const handleAddToken = () => {
    if (!newTokenName || !selectedAlias) return;

    const token: SemanticToken = {
      name: newTokenName,
      aliasTo: selectedAlias,
      category: selectedCategory,
      subcategory: selectedSubcategory || newTokenName.split('.').pop() || ''
    };

    const validation = validateAlias(token, baseTokens);
    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    setSemanticTokens([...semanticTokens, token]);
    if (onTokensChange) {
      onTokensChange([...semanticTokens, token]);
    }
    setShowAddModal(false);
    setNewTokenName('');
    setSelectedAlias('');
  };

  const handleEditToken = (token: SemanticToken) => {
    setEditingToken(token);
    setNewTokenName(token.name);
    setSelectedCategory(token.category);
    setSelectedSubcategory(token.subcategory);
    setSelectedAlias(token.aliasTo || '');
    setShowAddModal(true);
  };

  const handleUpdateToken = () => {
    if (!editingToken || !newTokenName || !selectedAlias) return;

    const updated = semanticTokens.map(t =>
      t.name === editingToken.name
        ? {
            ...t,
            name: newTokenName,
            aliasTo: selectedAlias,
            category: selectedCategory,
            subcategory: selectedSubcategory
          }
        : t
    );

    setSemanticTokens(updated);
    if (onTokensChange) {
      onTokensChange(updated);
    }
    setEditingToken(null);
    setShowAddModal(false);
    setNewTokenName('');
    setSelectedAlias('');
  };

  const handleDeleteToken = (tokenName: string) => {
    const updated = semanticTokens.filter(t => t.name !== tokenName);
    setSemanticTokens(updated);
    if (onTokensChange) {
      onTokensChange(updated);
    }
  };

  // Get available alias options from base tokens
  const getAliasOptions = (): string[] => {
    const options: string[] = [];
    Object.entries(baseTokens).forEach(([group, tokens]) => {
      tokens.forEach(token => {
        options.push(`Base Tokens/${group}/${token.shade}`);
      });
    });
    return options;
  };

  const aliasOptions = getAliasOptions();

  return (
    <div className="section-card" style={{ padding: '20px 20px 8px 20px', marginBottom: 0 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',}}>
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '4px' }}>
            Semantic Tokens
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
            Create semantic tokens that alias to base tokens
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => {
              setEditingToken(null);
              setNewTokenName('');
              setSelectedAlias('');
              setShowAddModal(true);
            }}
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Plus size={16} />
            Add Token
          </button>
          {semanticTokens.length > 0 && (
            <button
              onClick={() => {
                console.log('Create in Figma clicked');
                console.log('Semantic tokens:', semanticTokens);
                
                // Set up message listener first
                const handleMessage = (event: MessageEvent) => {
                  console.log('Received message:', event.data.pluginMessage?.type);
                  
                  if (event.data.pluginMessage?.type === 'collections-response') {
                    const collections = event.data.pluginMessage.collections || [];
                    console.log('Collections received:', collections);
                    
                    if (collections.length === 0) {
                      alert('Please create a variable collection first in Figma.');
                      window.removeEventListener('message', handleMessage);
                      return;
                    }
                    
                    // Use first collection
                    const collectionId = collections[0].id;
                    console.log('Using collection:', collectionId);
                    
                    // Send create request
                    (window as any).parent.postMessage({
                      pluginMessage: {
                        type: 'create-semantic-tokens',
                        semanticTokens: semanticTokens,
                        baseTokens: baseTokens,
                        collectionId: collectionId
                      }
                    }, '*');
                    
                    window.removeEventListener('message', handleMessage);
                  }
                };
                
                window.addEventListener('message', handleMessage);
                
                // Request collections
                console.log('Requesting collections...');
                (window as any).parent.postMessage({ 
                  pluginMessage: { type: 'get-collections-for-theme' } 
                }, '*');
              }}
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              Create in Figma
            </button>
          )}
        </div>
      </div>

      {/* Token List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px' }}>
        {semanticTokens.map((token, idx) => {
          const validation = validateAlias(token, baseTokens);
          return (
            <div
              key={idx}
              style={{
                padding: '12px',
                border: '1px solid var(--color-border)',
                borderRadius: '8px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: validation.valid ? 'white' : '#fef2f2'
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 600, fontSize: '14px' }}>{token.name}</span>
                  <span
                    style={{
                      fontSize: '11px',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      backgroundColor: `var(--color-bg-${token.category})`,
                      color: 'var(--color-text-primary)'
                    }}
                  >
                    {token.category}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                  <Link2 size={12} />
                  <span>{token.aliasTo}</span>
                  {!validation.valid && (
                    <span style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px', marginLeft: '8px' }}>
                      <AlertCircle size={12} />
                      Invalid alias
                    </span>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '4px' }}>
                <button
                  onClick={() => handleEditToken(token)}
                  className="btn-icon"
                  title="Edit token"
                >
                  <Edit2 size={14} />
                </button>
                <button
                  onClick={() => handleDeleteToken(token.name)}
                  className="btn-icon"
                  title="Delete token"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          );
        })}

        {semanticTokens.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-secondary)' }}>
            <p>No semantic tokens yet. Click "Add Token" to create one.</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
          onClick={() => setShowAddModal(false)}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: 'var(--radius-lg)',
              padding: '24px',
              width: '500px',
              maxWidth: '90vw',
              maxHeight: '90vh',
              overflow: 'auto',
              boxShadow: 'var(--shadow-md)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700 }}>
                {editingToken ? 'Edit Token' : 'Add Semantic Token'}
              </h3>
              <button onClick={() => setShowAddModal(false)} className="btn-icon">
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 500 }}>
                  Token Name (e.g., color.brand.primary)
                </label>
                <input
                  type="text"
                  value={newTokenName}
                  onChange={(e) => setNewTokenName(e.target.value)}
                  placeholder="color.brand.primary"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid var(--color-border)',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 500 }}>
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value as any)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid var(--color-border)',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                >
                  <option value="brand">Brand</option>
                  <option value="text">Text</option>
                  <option value="bg">Background</option>
                  <option value="border">Border</option>
                  <option value="state">State</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 500 }}>
                  Alias To (Base Token)
                </label>
                <select
                  value={selectedAlias}
                  onChange={(e) => setSelectedAlias(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid var(--color-border)',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                >
                  <option value="">Select base token...</option>
                  {aliasOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '8px' }}>
                <button onClick={() => setShowAddModal(false)} className="btn-secondary">
                  Cancel
                </button>
                <button
                  onClick={editingToken ? handleUpdateToken : handleAddToken}
                  className="btn btn-primary"
                  disabled={!newTokenName || !selectedAlias}
                >
                  {editingToken ? 'Update' : 'Add'} Token
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

