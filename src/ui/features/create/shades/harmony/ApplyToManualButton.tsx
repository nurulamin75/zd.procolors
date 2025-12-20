import React from 'react';
import { ArrowRight } from 'lucide-react';

interface ApplyToManualButtonProps {
  onApply: () => void;
}

export const ApplyToManualButton: React.FC<ApplyToManualButtonProps> = ({ onApply }) => {
  return (
    <button
      onClick={onApply}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        background: 'var(--color-primary)',
        color: 'white',
        padding: '12px 16px',
        borderRadius: 'var(--radius-lg)',
        fontWeight: 500,
        border: 'none',
        cursor: 'pointer',
        boxShadow: 'var(--shadow-sm)',
        marginTop: '24px',
        fontSize: '14px'
      }}
      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-primary-hover)'}
      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--color-primary)'}
    >
      <span>Apply to Manual Generator</span>
      <ArrowRight size={16} />
    </button>
  );
};
