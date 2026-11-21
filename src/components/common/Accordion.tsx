import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export interface AccordionItem {
  id: string;
  title: string;
  content: React.ReactNode;
  icon?: React.ReactNode;
}

export interface AccordionProps {
  items: AccordionItem[];
  allowMultiple?: boolean;
  defaultOpenId?: string;
  className?: string;
}

export const Accordion: React.FC<AccordionProps> = ({
  items,
  allowMultiple = false,
  defaultOpenId,
  className = '',
}) => {
  const [openIds, setOpenIds] = useState<string[]>(defaultOpenId ? [defaultOpenId] : []);

  const toggleItem = (id: string) => {
    if (allowMultiple) {
      setOpenIds(prev => (prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]));
    } else {
      setOpenIds(prev => (prev.includes(id) ? [] : [id]));
    }
  };

  return (
    <div
      className={`jos-accordion ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.85rem',
        width: '100%',
      }}
    >
      {items.map((item) => {
        const isOpen = openIds.includes(item.id);
        return (
          <div
            key={item.id}
            style={{
              background: isOpen ? 'var(--bg-surface-elevated)' : 'var(--bg-surface)',
              backdropFilter: 'var(--glass-blur)',
              WebkitBackdropFilter: 'var(--glass-blur)',
              border: isOpen ? '1px solid var(--border-active)' : '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
              transition: 'all var(--transition-normal)',
              boxShadow: isOpen ? 'var(--shadow-card)' : 'var(--shadow-subtle)',
            }}
          >
            <button
              onClick={() => toggleItem(item.id)}
              aria-expanded={isOpen}
              style={{
                width: '100%',
                padding: '1.15rem 1.35rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                textAlign: 'left',
                gap: '1rem',
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {item.icon && <span style={{ color: 'var(--jos-500)', display: 'flex' }}>{item.icon}</span>}
                <span
                  style={{
                    fontWeight: 600,
                    fontSize: '1rem',
                    color: isOpen ? 'var(--jos-700)' : 'var(--text-main)',
                    letterSpacing: '-0.01em',
                  }}
                >
                  {item.title}
                </span>
              </div>
              <ChevronDown
                size={18}
                color="var(--jos-500)"
                style={{
                  transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform var(--transition-normal)',
                  flexShrink: 0,
                }}
              />
            </button>

            <div
              style={{
                display: 'grid',
                gridTemplateRows: isOpen ? '1fr' : '0fr',
                transition: 'grid-template-rows var(--transition-normal)',
              }}
            >
              <div style={{ overflow: 'hidden' }}>
                <div
                  style={{
                    padding: '0 1.35rem 1.25rem 1.35rem',
                    color: 'var(--text-muted)',
                    fontSize: '0.92rem',
                    lineHeight: 1.6,
                    borderTop: '1px solid var(--border-subtle)',
                    paddingTop: '0.85rem',
                  }}
                >
                  {item.content}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
