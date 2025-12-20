import React, { useState } from 'react';
import { X, ArrowRight, CheckCircle2, AlertCircle, Layers, Palette } from 'lucide-react';
import { TransferData } from '../utils/transferStorage';

interface PreviewModalProps {
  transfer: TransferData;
  onClose: () => void;
  onImport: (transfer: TransferData) => void;
  isImporting: boolean;
}

export const PreviewModal: React.FC<PreviewModalProps> = ({ transfer, onClose, onImport, isImporting }) => {
  const [mode, setMode] = useState<'all' | 'new'>('all');

  return (
    <div style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
    }}>
        <div className="card animate-fade-in" style={{ 
            width: '600px', 
            maxHeight: '80vh', 
            display: 'flex', 
            flexDirection: 'column',
            padding: 0,
            overflow: 'hidden'
        }}>
            {/* Header */}
            <div style={{ padding: '20px', borderBottom: '1px solid var(--color-border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h3 style={{ margin: 0, fontSize: '18px' }}>Import Transfer</h3>
                    <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                        {transfer.metadata.name} • {new Date(transfer.metadata.createdAt).toLocaleDateString()}
                    </p>
                </div>
                <button className="btn-icon" onClick={onClose}><X size={20} /></button>
            </div>

            {/* Content */}
            <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                    <div style={{ padding: '16px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#64748b' }}>
                            <Layers size={16} />
                            <span style={{ fontSize: '12px', fontWeight: 600 }}>Variables</span>
                        </div>
                        <div style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a' }}>
                            {transfer.variables.length}
                        </div>
                    </div>
                     <div style={{ padding: '16px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#64748b' }}>
                            <Palette size={16} />
                            <span style={{ fontSize: '12px', fontWeight: 600 }}>Styles</span>
                        </div>
                        <div style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a' }}>
                            {transfer.styles.length}
                        </div>
                    </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                     <h4 style={{ fontSize: '14px', marginBottom: '12px' }}>Preview Items</h4>
                     <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid var(--color-border)', borderRadius: '8px' }}>
                         {transfer.variables.slice(0, 50).map((v: any, i: number) => (
                             <div key={i} style={{ 
                                 padding: '8px 12px', 
                                 borderBottom: '1px solid var(--color-border-light)', 
                                 fontSize: '12px',
                                 display: 'flex',
                                 justifyContent: 'space-between'
                             }}>
                                 <span style={{ fontFamily: 'monospace' }}>{v.name}</span>
                                 <span style={{ color: 'var(--color-text-tertiary)' }}>{v.collection}</span>
                             </div>
                         ))}
                         {transfer.variables.length > 50 && (
                             <div style={{ padding: '8px 12px', fontSize: '12px', color: 'var(--color-text-secondary)', textAlign: 'center' }}>
                                 + {transfer.variables.length - 50} more variables
                             </div>
                         )}
                     </div>
                </div>

                <div style={{ padding: '12px', backgroundColor: '#eff6ff', borderRadius: '8px', border: '1px solid #dbeafe', display: 'flex', gap: '12px' }}>
                    <AlertCircle size={16} color="#3b82f6" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div style={{ fontSize: '12px', color: '#1e3a8a' }}>
                        Importing will update existing variables with the same name and create new ones if they don't exist.
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div style={{ padding: '20px', borderTop: '1px solid var(--color-border-light)', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button className="btn btn-secondary" onClick={onClose} disabled={isImporting}>
                    Cancel
                </button>
                <button 
                    className="btn btn-primary" 
                    onClick={() => onImport(transfer)}
                    disabled={isImporting}
                >
                    {isImporting ? 'Importing...' : 'Import All'}
                </button>
            </div>
        </div>
    </div>
  );
};

