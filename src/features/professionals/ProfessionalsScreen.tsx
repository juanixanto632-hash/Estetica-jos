import React from 'react';
import { Award, Calendar, HeartHandshake, Instagram, Sparkles } from 'lucide-react';
import { Button, Card, ImageWithFallback } from '../../components/common';
import { PROFESSIONALS_DATA, Professional } from '../../data/mockData';

interface ProfessionalsScreenProps {
  onSelectProfessional: (pro: Professional) => void;
}

export const ProfessionalsScreen: React.FC<ProfessionalsScreenProps> = ({ onSelectProfessional }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', width: '100%' }}>
      {/* Encabezado simplificado */}
      <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto' }}>
        <h1 style={{ fontSize: 'clamp(1.5rem, 5.5vw, 2.2rem)', marginBottom: '0.4rem', color: 'var(--jos-700)' }}>
          TEAM de Estética Jos
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', lineHeight: 1.5, margin: 0 }}>
          Conoce a nuestros profesionales
        </p>
      </div>

      {/* Grid de Profesionales */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '1.75rem' }}>
        {PROFESSIONALS_DATA.map((pro) => {
          const initials = pro.name
            .split(' ')
            .map((n) => n[0])
            .slice(0, 2)
            .join('');

          return (
            <Card
              key={pro.id}
              enableTilt={true}
              header={
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '1rem', paddingTop: '1rem' }}>
                  <div style={{ position: 'relative' }}>
                    <ImageWithFallback
                      src={pro.image}
                      alt={pro.name}
                      fallbackType="avatar"
                      initials={initials}
                      style={{
                        width: '120px',
                        height: '120px',
                        borderRadius: '50%',
                        border: '3px solid var(--jos-500)',
                        boxShadow: 'var(--shadow-floating)',
                      }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        bottom: '0',
                        right: '0',
                        background: 'var(--jos-700)',
                        color: '#ffffff',
                        borderRadius: '50%',
                        padding: '0.4rem',
                        display: 'flex',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                      }}
                    >
                      <Award size={16} />
                    </div>
                  </div>

                  <div>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '0.2rem', color: 'var(--jos-700)' }}>
                      {pro.name}
                    </h3>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-light)', fontWeight: 600, display: 'block' }}>
                      {pro.role}
                    </span>
                    {pro.instagram && (
                      <a
                        href={pro.instagramUrl || `https://www.instagram.com/${pro.instagram.replace('@', '')}/`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          fontSize: '0.82rem',
                          color: 'var(--jos-700)',
                          background: 'rgba(129, 99, 139, 0.1)',
                          padding: '0.25rem 0.65rem',
                          borderRadius: 'var(--radius-pill)',
                          textDecoration: 'none',
                          fontWeight: 600,
                          marginTop: '0.45rem',
                          transition: 'all var(--transition-fast)',
                        }}
                      >
                        <Instagram size={13} />
                        {pro.instagram}
                      </a>
                    )}
                  </div>
                </div>
              }
              footer={
                <Button
                  variant="primary"
                  size="md"
                  style={{ width: '100%' }}
                  icon={<Calendar size={16} />}
                  onClick={() => onSelectProfessional(pro)}
                >
                  Agendar con {pro.name.split(' ')[0]}
                </Button>
              }
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', textAlign: 'center' }}>
                <div
                  style={{
                    padding: '0.4rem 0.8rem',
                    background: 'var(--bg-card)',
                    borderRadius: 'var(--radius-pill)',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    color: 'var(--jos-700)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.35rem',
                  }}
                >
                  <Sparkles size={13} /> {pro.specialty}
                </div>

                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.55, margin: 0 }}>
                  {pro.bio}
                </p>

                {/* Años de trayectoria solo para Joslin Serrano */}
                {pro.name.includes('Joslin') && (
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-light)', fontWeight: 600 }}>
                    Exp: {pro.experienceYears}+ años de trayectoria
                  </span>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Compromiso del equipo */}
      <div
        className="glass-panel"
        style={{
          padding: '2rem',
          borderRadius: 'var(--radius-lg)',
          display: 'flex',
          alignItems: 'center',
          gap: '1.25rem',
          maxWidth: '800px',
          margin: '0 auto',
        }}
      >
        <div
          style={{
            width: '54px',
            height: '54px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-card)',
            color: 'var(--jos-500)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <HeartHandshake size={28} />
        </div>
        <div>
          <h4 style={{ fontSize: '1.08rem', marginBottom: '0.3rem', color: 'var(--jos-700)' }}>
            Valoración Previa Sin Compromiso
          </h4>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
            Cada paciente es único. Antes de cualquier protocolo inyectable, cosmiátrico o reconstructivo, nuestro equipo realiza un diagnóstico cutáneo presencial en nuestra sede del CC Naranjo, Mérida.
          </p>
        </div>
      </div>
    </div>
  );
};
