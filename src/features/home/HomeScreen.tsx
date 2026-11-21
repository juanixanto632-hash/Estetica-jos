import React, { useState, useEffect } from 'react';
import { Sparkles, Calendar, ArrowRight, Heart, Star, MapPin, Clock, ChevronRight, MessageCircle, Check } from 'lucide-react';
import { Button, Card, SocialLinks, ImageWithFallback } from '../../components/common';
import { Service } from '../../data/mockData';
import { useCatalog } from '../../hooks/useCatalog';
import { getOfficialBcvRate, formatBs, BcvRateInfo } from '../../utils/bcvService';

interface HomeScreenProps {
  onNavigate: (sectionId: string) => void;
  onAddToCart: (service: Service) => void;
  cartItemIds?: string[];
  onSelectTreatment?: (service: Service) => void;
  theme: 'light' | 'dark';
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onNavigate,
  onAddToCart,
  cartItemIds = [],
  onSelectTreatment,
  theme,
}) => {
  const { services } = useCatalog();
  const [bcvInfo, setBcvInfo] = useState<BcvRateInfo | null>(null);

  useEffect(() => {
    getOfficialBcvRate().then(setBcvInfo).catch(console.warn);
  }, []);

  const featuredServices = services.slice(0, 3);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem', width: '100%' }}>
      {/* 1. HERO SECTION MÁS LIMPIO Y VISUAL */}
      <section
        style={{
          position: 'relative',
          padding: 'clamp(2rem, 5vw, 3.5rem) clamp(1.25rem, 4vw, 2.5rem)',
          borderRadius: 'var(--radius-xl)',
          background: 'var(--bg-surface-elevated)',
          backdropFilter: 'var(--glass-blur)',
          WebkitBackdropFilter: 'var(--glass-blur)',
          border: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-floating)',
          overflow: 'hidden',
        }}
      >
        {/* Glows de fondo decorativos */}
        <div
          style={{
            position: 'absolute',
            top: '-60px',
            right: '-60px',
            width: '280px',
            height: '280px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, var(--jos-pink-400) 0%, transparent 70%)',
            opacity: theme === 'dark' ? 0.15 : 0.4,
            filter: 'blur(50px)',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-60px',
            left: '-60px',
            width: '280px',
            height: '280px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, var(--jos-500) 0%, transparent 70%)',
            opacity: theme === 'dark' ? 0.15 : 0.35,
            filter: 'blur(50px)',
            pointerEvents: 'none',
          }}
        />

        <div
          style={{
            position: 'relative',
            zIndex: 2,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))',
            alignItems: 'center',
            gap: '2.5rem',
          }}
        >
          {/* Lado Izquierdo: Textos y Botones */}
          <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
            {/* Título Principal */}
            <h1
              style={{
                fontSize: 'clamp(2.1rem, 4.5vw, 3.25rem)',
                color: 'var(--jos-700)',
                fontWeight: 800,
                lineHeight: 1.15,
                letterSpacing: '-0.03em',
                margin: 0,
              }}
            >
              Medicina Estética & <span style={{ color: 'var(--jos-500)', fontStyle: 'italic' }}>Armonía Facial</span>
            </h1>

            {/* Subtítulo minimalista */}
            <p
              style={{
                fontSize: 'clamp(0.95rem, 1.8vw, 1.08rem)',
                color: 'var(--text-muted)',
                lineHeight: 1.55,
                margin: 0,
              }}
            >
              Dale bienestar a tu cuerpo, mente y alma.
            </p>

            {/* Botones de Acción (Máximo 2 botones: Primario + WhatsApp Directo, ancho completo en móvil) */}
            <div
              className="hero-buttons-container"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.9rem',
                flexWrap: 'wrap',
                marginTop: '0.5rem',
                width: '100%',
              }}
            >
              <Button
                variant="primary"
                size="lg"
                icon={<Calendar size={18} />}
                onClick={() => onNavigate('citas')}
                className="hero-cta-btn"
                style={{
                  boxShadow: '0 8px 24px rgba(129, 99, 139, 0.35)',
                  minHeight: '48px',
                }}
              >
                Agendar Cita
              </Button>

              <a
                href="https://wa.me/+584147518902?text=Hola%20Est%C3%A9tica%20Jos,%20quisiera%20solicitar%20informaci%C3%B3n%20sobre%20sus%20tratamientos."
                target="_blank"
                rel="noopener noreferrer"
                className="hero-whatsapp-link"
                style={{ textDecoration: 'none' }}
              >
                <Button
                  variant="outline"
                  size="lg"
                  icon={<MessageCircle size={18} color="#22c55e" />}
                  className="hero-whatsapp-btn"
                  style={{ minHeight: '48px', width: '100%' }}
                >
                  WhatsApp Directo
                </Button>
              </a>
            </div>
          </div>

          {/* Lado Derecho: Contenedor Visual Sutil (Listo para foto de cabina o tratamiento) */}
          <div
            style={{
              position: 'relative',
              borderRadius: 'var(--radius-xl)',
              overflow: 'hidden',
              height: '240px',
              border: '2px solid rgba(255, 255, 255, 0.6)',
              boxShadow: '0 12px 30px rgba(129, 99, 139, 0.16)',
              background: 'linear-gradient(135deg, rgba(218, 201, 223, 0.4) 0%, rgba(247, 191, 216, 0.35) 100%)',
            }}
          >
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80"
              alt="Cabina y Tratamiento Estética Jos"
              fallbackType="treatment"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            {/* Pill flotante en esquina */}
            <div
              style={{
                position: 'absolute',
                bottom: '0.75rem',
                left: '0.75rem',
                right: '0.75rem',
                background: 'rgba(255, 255, 255, 0.92)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                borderRadius: 'var(--radius-md)',
                padding: '0.5rem 0.85rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                color: '#2b1832',
                boxShadow: '0 4px 14px rgba(0,0,0,0.1)',
              }}
            >
              <div>
                <span style={{ fontSize: '0.72rem', color: '#7b6285', fontWeight: 600, display: 'block' }}>Sede Oficial</span>
                <strong style={{ fontSize: '0.84rem', color: 'var(--jos-700)' }}>CC Naranjo · Piso 2, Mérida</strong>
              </div>
              <Sparkles size={16} color="var(--jos-500)" />
            </div>
          </div>
        </div>
      </section>

      {/* 2. PILARES & LAYOUT CORREGIDO (2 TARJETAS EN FILA + BANNER HORIZONTAL DEBAJO) */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Fila 1: Las 2 tarjetas de servicios principales (grid-cols-1 md:grid-cols-2) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
          {/* Tarjeta 1: Faciales */}
          <div
            onClick={() => onNavigate('catalogo')}
            className="glass-panel"
            style={{
              padding: '1.75rem',
              borderRadius: 'var(--radius-lg)',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '1.25rem',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.borderColor = 'var(--jos-500)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = 'var(--border-subtle)';
            }}
          >
            <div>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--badge-bg)',
                  color: 'var(--jos-700)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1rem',
                }}
              >
                <Sparkles size={22} />
              </div>
              <h3 style={{ fontSize: '1.2rem', color: 'var(--jos-700)', marginBottom: '0.4rem' }}>
                Tratamientos Faciales
              </h3>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
                Limpieza Facial, Dermaplaning, Pinglow, PDRN de Salmón, Exosomas y Armonización.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--jos-700)', fontSize: '0.84rem', fontWeight: 700 }}>
              <span>Explorar catálogo</span>
              <ChevronRight size={15} />
            </div>
          </div>

          {/* Tarjeta 2: Corporales */}
          <div
            onClick={() => onNavigate('catalogo')}
            className="glass-panel"
            style={{
              padding: '1.75rem',
              borderRadius: 'var(--radius-lg)',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '1.25rem',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.borderColor = 'var(--jos-500)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = 'var(--border-subtle)';
            }}
          >
            <div>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--badge-bg)',
                  color: 'var(--jos-700)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1rem',
                }}
              >
                <Heart size={22} />
              </div>
              <h3 style={{ fontSize: '1.2rem', color: 'var(--jos-700)', marginBottom: '0.4rem' }}>
                Bienestar Corporal
              </h3>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
                Veloterapia, Drenaje Linfático, Masaje Relajante, Detox Iónico y Planes Reductores.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--jos-700)', fontSize: '0.84rem', fontWeight: 700 }}>
              <span>Explorar corporales</span>
              <ChevronRight size={15} />
            </div>
          </div>
        </div>

        {/* Fila 2: Banner Horizontal de Ancho Completo (Ubicación CC Naranjo) */}
        <div
          onClick={() => onNavigate('contacto')}
          className="glass-panel"
          style={{
            padding: '1.5rem 1.75rem',
            borderRadius: 'var(--radius-lg)',
            cursor: 'pointer',
            transition: 'all var(--transition-fast)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1.5rem',
            flexWrap: 'wrap',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-3px)';
            e.currentTarget.style.borderColor = 'var(--jos-500)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.borderColor = 'var(--border-subtle)';
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--badge-bg)',
                color: 'var(--jos-700)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <MapPin size={24} />
            </div>

            <div>
              <h3 style={{ fontSize: '1.25rem', color: 'var(--jos-700)', margin: '0 0 0.2rem' }}>
                Sede CC Naranjo · Piso 2, Local 22
              </h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.4 }}>
                Urb. La Mata, Mérida. Estacionamiento privado con vigilancia y cabinas climatizadas de máxima privacidad.
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            size="md"
            icon={<ChevronRight size={16} />}
            iconPosition="right"
            onClick={(e) => {
              e.stopPropagation();
              onNavigate('contacto');
            }}
          >
            Ver mapa de llegada
          </Button>
        </div>
      </section>

      {/* 3. TRATAMIENTOS PRINCIPALES (TARJETAS SIN "LEER MÁS" Y CON UN SOLO BOTÓN CLARO) */}
      <section>
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            marginBottom: '1.5rem',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                color: 'var(--jos-500)',
                fontSize: '0.82rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                marginBottom: '0.3rem',
              }}
            >
              <Star size={15} /> Más Solicitados
            </div>
            <h2 style={{ fontSize: '1.8rem', margin: 0, color: 'var(--jos-700)' }}>
              Tratamientos Principales
            </h2>
          </div>

          <Button
            variant="outline"
            size="sm"
            icon={<ArrowRight size={16} />}
            iconPosition="right"
            onClick={() => onNavigate('catalogo')}
          >
            Ver catálogo completo
          </Button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {featuredServices.map((service) => {
            const isAdded = cartItemIds.includes(service.id);

            return (
              <Card
                key={service.id}
                enableTilt={true}
                badge={
                  <span
                    style={{
                      background: 'var(--jos-700)',
                      color: '#ffffff',
                      padding: '0.25rem 0.75rem',
                      borderRadius: 'var(--radius-pill)',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                    }}
                  >
                    {service.badge || (service.category === 'facial' ? 'Facial' : service.category === 'corporal' ? 'Corporal' : 'Nutrición')}
                  </span>
                }
                header={
                  <div
                    onClick={() => onSelectTreatment && onSelectTreatment(service)}
                    style={{
                      borderRadius: 'var(--radius-md)',
                      overflow: 'hidden',
                      height: '185px',
                      position: 'relative',
                      cursor: 'pointer',
                    }}
                  >
                    <ImageWithFallback
                      src={service.image}
                      alt={service.name}
                      fallbackType="treatment"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        bottom: '0.65rem',
                        left: '0.65rem',
                        background: 'rgba(0, 0, 0, 0.65)',
                        backdropFilter: 'blur(6px)',
                        color: '#ffffff',
                        padding: '0.25rem 0.65rem',
                        borderRadius: 'var(--radius-pill)',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                      }}
                    >
                      <Clock size={13} /> {service.durationMinutes} min
                    </div>
                  </div>
                }
                footer={
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: '0.75rem' }}>
                    <div>
                      <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'block' }}>Inversión</span>
                      <strong style={{ fontSize: '1.35rem', color: 'var(--jos-700)' }}>${service.price} USD</strong>
                      {bcvInfo && (
                        <span style={{ fontSize: '0.74rem', color: 'var(--text-light)', display: 'block', marginTop: '0.1rem' }}>
                          ≈ {formatBs(service.price, bcvInfo.rate)}
                        </span>
                      )}
                    </div>

                    {/* Botón único principal simplificado */}
                    <Button
                      variant={isAdded ? 'secondary' : 'primary'}
                      size="sm"
                      icon={isAdded ? <Check size={16} color="#22c55e" /> : <Sparkles size={16} />}
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddToCart(service);
                      }}
                      style={{ minHeight: '44px' }}
                    >
                      {isAdded ? 'Agregado ✓' : '+ Agregar a mi cita'}
                    </Button>
                  </div>
                }
              >
                {/* Contenido de la tarjeta: Título y descripción fija sin acordeón para altura uniforme */}
                <div
                  onClick={() => onSelectTreatment && onSelectTreatment(service)}
                  style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', cursor: 'pointer' }}
                >
                  <h3 style={{ fontSize: '1.2rem', color: 'var(--jos-700)', margin: 0, lineHeight: 1.3 }}>
                    {service.name}
                  </h3>

                  <p
                    style={{
                      fontSize: '0.86rem',
                      color: 'var(--text-muted)',
                      lineHeight: 1.5,
                      margin: 0,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {service.shortDescription}
                  </p>

                  <span style={{ fontSize: '0.78rem', color: 'var(--jos-500)', fontWeight: 600, marginTop: '0.2rem' }}>
                    Toca para ver detalles y beneficios →
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* 5. REDES SOCIALES CON FONDOS CLAROS ESTILO VECTOR */}
      <section
        className="glass-panel"
        style={{
          padding: '2.25rem 1.5rem',
          borderRadius: 'var(--radius-xl)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: '1rem',
          background: 'linear-gradient(135deg, var(--bg-surface-elevated) 0%, var(--bg-card) 100%)',
        }}
      >
        <span style={{ fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--jos-500)' }}>
          Comunidad & Resultados en Vivo
        </span>
        <h3 style={{ fontSize: '1.5rem', color: 'var(--jos-700)', margin: 0 }}>
          Descubre el antes y después en nuestras redes
        </h3>
        <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', maxWidth: '520px', margin: 0, lineHeight: 1.5 }}>
          Consejos dermatológicos, protocolos en cabina y testimonios de pacientes en Mérida.
        </p>
        <div style={{ marginTop: '0.5rem' }}>
          <SocialLinks variant="footer" />
        </div>
      </section>
    </div>
  );
};
