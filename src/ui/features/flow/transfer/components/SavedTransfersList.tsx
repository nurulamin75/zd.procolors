import React from 'react';
import { FileBox, Trash2, Eye, Download, Calendar } from 'lucide-react';
import { TransferData } from '../utils/transferStorage';

interface SavedTransfersListProps {
  transfers: TransferData[];
  onPreview: (transfer: TransferData) => void;
  onDelete: (id: string) => void;
  onDownload: (transfer: TransferData) => void;
}

export const SavedTransfersList: React.FC<SavedTransfersListProps> = ({ transfers, onPreview, onDelete, onDownload }) => {
  if (!transfers || transfers.length === 0) return null;

  const formatDate = (dateStr: string) => {
      try {
          return new Date(dateStr).toLocaleDateString();
      } catch (e) {
          return 'Unknown Date';
      }
  };

  return (
    <div style={{ marginTop: '32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 className="section-title" style={{ margin: 0 }}>Saved Transfers</h3>
        <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>{transfers.length} items</span>
      </div>

      <div style={{ display: 'grid', gap: '16px' }}>
        {transfers.map(transfer => {
            // Defensive rendering
            if (!transfer || !transfer.metadata) return null;

            return (
                <div key={transfer.id || Math.random()} className="card" style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                        <div style={{ 
                            width: '40px', height: '40px', 
                            borderRadius: '10px', 
                            backgroundColor: '#f1f5f9', 
                            color: '#64748b',
                            display: 'flex', alignItems: 'center', justifyContent: 'center' 
                        }}>
                            <FileBox size={20} />
                        </div>
                        <div>
                            <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--color-text-primary)' }}>
                                {transfer.metadata.name || 'Untitled Transfer'}
                            </div>
                            <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <Calendar size={10} /> {formatDate(transfer.metadata.createdAt)}
                                </span>
                                <span>•</span>
                                <span>{transfer.metadata.variableCount || 0} Vars</span>
                                <span>•</span>
                                <span>{transfer.metadata.styleCount || 0} Styles</span>
                            </div>
                            <div style={{ fontSize: '10px', color: 'var(--color-text-tertiary)', marginTop: '2px' }}>
                                Source: {transfer.metadata.fileName || 'Unknown'}
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                            className="btn-icon" 
                            onClick={() => onPreview(transfer)}
                            title="Preview & Import"
                        >
                            <Eye size={16} />
                        </button>
                        <button 
                            className="btn-icon" 
                            onClick={() => onDownload(transfer)}
                            title="Download JSON"
                        >
                            <Download size={16} />
                        </button>
                        <button 
                            className="btn-icon" 
                            onClick={() => onDelete(transfer.id)}
                            title="Delete"
                            style={{ color: '#ef4444' }}
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                </div>
            );
        })}
      </div>
    </div>
  );
};
