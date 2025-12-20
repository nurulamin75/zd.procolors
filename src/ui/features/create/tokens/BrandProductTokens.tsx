import React, { useState } from 'react';
import { Lock, Unlock, Link2, Layers, Edit2, Trash2, Plus } from 'lucide-react';
import { ColorToken } from '../../../../utils/tokens';
import { SemanticToken } from '../../../../utils/semanticTokens';

interface BrandToken {
  name: string;
  value: string;
  locked: boolean;
}

interface ProductToken {
  name: string;
  aliasTo: string;
  brandToken: string;
}

interface BrandProductTokensProps {
  baseTokens: Record<string, ColorToken[]>;
  onTokensChange?: (brandTokens: BrandToken[], productTokens: ProductToken[]) => void;
}

export const BrandProductTokens: React.FC<BrandProductTokensProps> = ({
  baseTokens,
  onTokensChange
}) => {
  const [brandTokens, setBrandTokens] = useState<BrandToken[]>([]);
  const [productTokens, setProductTokens] = useState<ProductToken[]>([]);
  const [showWizard, setShowWizard] = useState(true);

  // Initialize brand tokens from base tokens
  React.useEffect(() => {
    const brand: BrandToken[] = [];
    Object.entries(baseTokens).forEach(([group, tokens]) => {
      if (group === 'primary' || group === 'secondary') {
        const token500 = tokens.find(t => t.shade === 500);
        if (token500) {
          brand.push({
            name: `color.brand.${group}`,
            value: token500.value,
            locked: false
          });
        }
      }
    });
    setBrandTokens(brand);
  }, [baseTokens]);

  const handleToggleLock = (tokenName: string) => {
    setBrandTokens(prev =>
      prev.map(t =>
        t.name === tokenName ? { ...t, locked: !t.locked } : t
      )
    );
  };

  const handleAddProductToken = () => {
    const newToken: ProductToken = {
      name: 'color.cta.primary',
      aliasTo: 'color.brand.primary',
      brandToken: 'color.brand.primary'
    };
    setProductTokens([...productTokens, newToken]);
    if (onTokensChange) {
      onTokensChange(brandTokens, [...productTokens, newToken]);
    }
  };

  const handleEditProductToken = (oldName: string, newToken: ProductToken) => {
    setProductTokens(prev =>
      prev.map(t => (t.name === oldName ? newToken : t))
    );
    if (onTokensChange) {
      onTokensChange(brandTokens, productTokens.map(t => (t.name === oldName ? newToken : t)));
    }
  };

  const handleDeleteProductToken = (tokenName: string) => {
    const updated = productTokens.filter(t => t.name !== tokenName);
    setProductTokens(updated);
    if (onTokensChange) {
      onTokensChange(brandTokens, updated);
    }
  };

  if (showWizard) {
    return (
      <div className="section-card" style={{ padding: '24px 24px 8px 24px', marginBottom: 0 }}>
        <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>
          Brand vs Product Token Setup
        </h3>
        <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '20px' }}>
          Separate brand tokens (raw, editable) from product tokens (aliases to brand)
        </p>

        <div style={{ marginBottom: '20px' }}>
          <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>
            Brand Tokens (Raw Colors)
          </h4>
          <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '12px' }}>
            These are your core brand colors. You can lock them to prevent accidental changes.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {brandTokens.map((token, idx) => (
              <div
                key={idx}
                style={{
                  padding: '12px',
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  backgroundColor: token.locked ? '#fef3c7' : 'white'
                }}
              >
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '6px',
                    backgroundColor: token.value,
                    border: '1px solid var(--color-border)'
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '13px' }}>{token.name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                    {token.value}
                  </div>
                </div>
                <button
                  onClick={() => handleToggleLock(token.name)}
                  className="btn-icon"
                  title={token.locked ? 'Unlock token' : 'Lock token'}
                >
                  {token.locked ? <Lock size={16} /> : <Unlock size={16} />}
                </button>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h4 style={{ fontSize: '14px', fontWeight: 600 }}>
              Product Tokens (Aliases)
            </h4>
            <button
              onClick={handleAddProductToken}
              className="btn btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}
            >
              <Plus size={14} />
              Add Product Token
            </button>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '12px' }}>
            Product tokens alias to brand tokens. They can be used for specific UI components.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {productTokens.map((token, idx) => (
              <div
                key={idx}
                style={{
                  padding: '12px',
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px',
                  backgroundColor: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}
              >
                <Link2 size={16} color="var(--color-text-secondary)" />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '13px' }}>{token.name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                    → {token.aliasTo}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button
                    onClick={() => {
                      const newName = prompt('Enter new token name:', token.name);
                      if (newName) {
                        handleEditProductToken(token.name, { ...token, name: newName });
                      }
                    }}
                    className="btn-icon"
                    title="Edit token"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => handleDeleteProductToken(token.name)}
                    className="btn-icon"
                    title="Delete token"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
            {productTokens.length === 0 && (
              <div style={{ textAlign: 'center', padding: '20px', color: 'var(--color-text-secondary)', fontSize: '12px' }}>
                No product tokens yet. Click "Add Product Token" to create one.
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '24px' }}>
          <button onClick={() => setShowWizard(false)} className="btn btn-primary">
            Continue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="section-card" style={{ padding: '24px 24px 8px 24px', marginBottom: 0 }}>
      <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>
        Brand & Product Tokens
      </h3>
      <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
        Manage your brand and product token layers
      </p>
    </div>
  );
};

