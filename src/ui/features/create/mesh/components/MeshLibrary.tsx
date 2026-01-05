import React from 'react';
import { Trash2, Plus } from 'lucide-react';
import { SavedMesh, getSavedMeshes, deleteMeshFromLibrary } from '../utils/storageUtils';
import { generateSVGGradient } from '../utils/meshUtils';

interface MeshLibraryProps {
    onSelect: (mesh: SavedMesh) => void;
    onSaveCurrent: (name: string) => void;
}

export const MeshLibrary: React.FC<MeshLibraryProps> = ({ onSelect, onSaveCurrent }) => {
    const [saved, setSaved] = React.useState<SavedMesh[]>([]);
    const [isSaving, setIsSaving] = React.useState(false);
    const [newName, setNewName] = React.useState('');

    React.useEffect(() => {
        setSaved(getSavedMeshes());
    }, []);

    const handleDelete = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        const updated = deleteMeshFromLibrary(id);
        setSaved(updated);
    };

    const handleSave = () => {
        if (!newName.trim()) return;
        onSaveCurrent(newName.trim());
        setNewName('');
        setIsSaving(false);
        setSaved(getSavedMeshes());
    };

    return (
        <div style={{ marginTop: '16px', borderTop: '1px solid var(--color-border)', paddingTop: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>MY LIBRARY</span>
                {!isSaving ? (
                    <button
                        onClick={() => setIsSaving(true)}
                        style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', fontSize: '11px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                        <Plus size={14} /> Save Current
                    </button>
                ) : (
                    <div style={{ display: 'flex', gap: '4px' }}>
                        <input
                            autoFocus
                            placeholder="Name..."
                            value={newName}
                            onChange={e => setNewName(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSave()}
                            style={{ fontSize: '11px', padding: '2px 6px', border: '1px solid var(--color-border)', borderRadius: '4px', width: '80px' }}
                        />
                        <button onClick={handleSave} style={{ border: 'none', background: 'var(--color-primary)', color: 'white', borderRadius: '4px', padding: '2px 8px', fontSize: '10px' }}>Ok</button>
                        <button onClick={() => setIsSaving(false)} style={{ border: 'none', background: 'transparent', color: 'var(--color-text-tertiary)', fontSize: '10px' }}>Cancel</button>
                    </div>
                )}
            </div>

            {saved.length === 0 ? (
                <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--color-text-tertiary)', fontSize: '11px', fontStyle: 'italic' }}>
                    No saved gradients yet.
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                    {saved.map(item => (
                        <div
                            key={item.id}
                            onClick={() => onSelect(item)}
                            style={{
                                cursor: 'pointer',
                                borderRadius: '8px',
                                border: '1px solid var(--color-border)',
                                overflow: 'hidden',
                                position: 'relative',
                                transition: 'transform 0.2s',
                                backgroundColor: '#fff'
                            }}
                            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            <div
                                style={{
                                    height: '60px',
                                    backgroundImage: generateSVGGradient(item.points, 100, 60, item.influence),
                                    backgroundSize: 'cover'
                                }}
                            />
                            <div style={{ padding: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '10px', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {item.name}
                                </span>
                                <button
                                    onClick={(e) => handleDelete(e, item.id)}
                                    style={{ background: 'none', border: 'none', color: 'var(--color-text-tertiary)', cursor: 'pointer', padding: '2px' }}
                                >
                                    <Trash2 size={12} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
