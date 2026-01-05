import React, { useRef } from 'react';
import { Upload } from 'lucide-react';

interface ImageUploaderProps {
    onImageSelect: (file: File) => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelect }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            onImageSelect(file);
        }
    };

    return (
        <div
            onClick={handleClick}
            style={{
                border: '1px dashed var(--color-border)',
                borderRadius: '8px',
                padding: '12px',
                textAlign: 'center',
                cursor: 'pointer',
                backgroundColor: '#f9fafb',
                transition: 'all 0.2s ease',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                marginTop: '12px'
            }}
            // Hover effect can be done with CSS or inline style monitoring, 
            // for now keeping it simple.
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--color-primary)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--color-border)'}
        >
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                style={{ display: 'none' }}
            />
            <Upload size={16} color="var(--color-text-tertiary)" />
            <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>
                Upload Image to Extract Mesh
            </span>
        </div>
    );
};
