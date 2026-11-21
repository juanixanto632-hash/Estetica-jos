import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export interface ReadMoreProps {
  text: string;
  maxChars?: number;
  className?: string;
}

export const ReadMore: React.FC<ReadMoreProps> = ({
  text,
  maxChars = 120,
  className = '',
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (text.length <= maxChars) {
    return <p className={className} style={{ margin: 0, color: 'var(--text-muted)' }}>{text}</p>;
  }

  const displayText = isExpanded ? text : `${text.slice(0, maxChars)}...`;

  return (
    <div className={`jos-read-more ${className}`} style={{ display: 'inline' }}>
      <span style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>
        {displayText}
      </span>{' '}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          color: 'var(--jos-700)',
          fontWeight: 600,
          fontSize: '0.86rem',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.2rem',
          textDecoration: 'underline',
          textUnderlineOffset: '3px',
          cursor: 'pointer',
        }}
      >
        <span>{isExpanded ? 'Leer menos' : 'Leer más'}</span>
        <ChevronDown
          size={14}
          style={{
            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform var(--transition-fast)',
          }}
        />
      </button>
    </div>
  );
};
