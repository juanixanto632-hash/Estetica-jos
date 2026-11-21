import React from 'react';
import { Check } from 'lucide-react';

export interface StepItem {
  id: number;
  label: string;
  subtitle?: string;
}

export interface StepperProps {
  steps: StepItem[];
  currentStep: number;
  onStepClick?: (stepId: number) => void;
  className?: string;
}

export const Stepper: React.FC<StepperProps> = ({
  steps,
  currentStep,
  onStepClick,
  className = '',
}) => {
  const halfColPercent = 100 / (2 * steps.length);

  return (
    <div
      className={`jos-stepper ${className}`}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        width: '100%',
        padding: '0.4rem 0',
        position: 'relative',
        boxSizing: 'border-box',
      }}
    >
      {/* Pista de fondo para la línea de progreso */}
      <div
        style={{
          position: 'absolute',
          top: '20px',
          left: `${halfColPercent}%`,
          right: `${halfColPercent}%`,
          height: '2px',
          background: 'var(--border-subtle)',
          zIndex: 1,
        }}
      >
        {/* Barra de progreso completada */}
        <div
          style={{
            height: '100%',
            width: `${Math.min(100, Math.max(0, ((currentStep - 1) / (steps.length - 1)) * 100))}%`,
            background: 'var(--jos-700)',
            transition: 'width var(--transition-normal)',
          }}
        />
      </div>

      {/* Columnas de cada paso (distribución equitativa 100% / N) */}
      {steps.map((step) => {
        const isCompleted = step.id < currentStep;
        const isActive = step.id === currentStep;
        const isClickable = onStepClick && (isCompleted || isActive);

        return (
          <div
            key={step.id}
            onClick={() => isClickable && onStepClick(step.id)}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.35rem',
              cursor: isClickable ? 'pointer' : 'default',
              zIndex: 2,
              position: 'relative',
              minWidth: 0,
              padding: '0 2px',
            }}
          >
            {/* Círculo del número / check */}
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.82rem',
                transition: 'all var(--transition-normal)',
                background: isCompleted
                  ? 'var(--jos-700)'
                  : isActive
                  ? 'var(--jos-500)'
                  : 'var(--bg-card)',
                color: isCompleted || isActive ? '#ffffff' : 'var(--text-muted)',
                border: isActive
                  ? '2px solid var(--jos-pink-400)'
                  : isCompleted
                  ? '2px solid var(--jos-700)'
                  : '1.5px solid var(--border-subtle)',
                boxShadow: isActive ? 'var(--shadow-floating)' : 'none',
              }}
            >
              {isCompleted ? <Check size={16} strokeWidth={2.5} /> : step.id}
            </div>

            {/* Etiqueta del paso */}
            <div style={{ textAlign: 'center', width: '100%' }}>
              <span
                style={{
                  fontSize: 'clamp(0.68rem, 2.2vw, 0.78rem)',
                  fontWeight: isActive ? 700 : isCompleted ? 600 : 500,
                  color: isActive ? 'var(--jos-700)' : 'var(--text-muted)',
                  display: 'block',
                  textAlign: 'center',
                  lineHeight: 1.15,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {step.label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
