import React, { useState, useEffect } from 'react';
import { Sparkles, Search, Clock, Check, Plus, DollarSign } from 'lucide-react';
import { Button, Card, ImageWithFallback } from '../../components/common';
import { Service } from '../../data/mockData';
import { useCatalog } from '../../hooks/useCatalog';
import { getOfficialBcvRate, formatBs, BcvRateInfo } from '../../utils/bcvService';

interface CatalogScreenProps {
  onAddToCart: (service: Service) => void;
  cartItemIds: string[];
  onSelectTreatment?: (service: Service) => void;
}

export const CatalogScreen: React.FC<CatalogScreenProps> = ({
  onAddToCart,
  cartItemIds,
  onSelectTreatment,
}) => {
  const { services } = useCatalog();
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'facial' | 'corporal' | 'nutricion'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [bcvInfo, setBcvInfo] = useState<BcvRateInfo | null>(null);

  useEffect(() => {
    getOfficialBcvRate().then(setBcvInfo).catch(console.warn);
  }, []);

  const filteredServices = services.filter((service) => {
    const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory;
    const matchesSearch =
      service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.fullDescription.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', width: '100%' }}>
      {/* Encabezado del Catálogo */}
      <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.2rem 0.75rem',
            borderRadius: 'var(--radius-pill)',
            background: 'var(--badge-bg)',
            color: 'var(--badge-text)',
            fontSize: '0.8rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            marginBottom: '0.5rem',
          }}
        >
          <Sparkles size={14} /> Catálogo Oficial
        </div>
        <h1 style={{ fontSize: '2.2rem', marginBottom: '0.5rem', color: 'var(--jos-700)' }}>
          Tratamientos & Protocolos Clínicos
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.98rem', lineHeight: 1.6 }}>
          Tratamientos faciales, corporales y planes de nutrición en Mérida.
        </p>

        {/* Píldora limpia con la Tasa Oficial BCV */}
        {bcvInfo && (
          <div
            onClick={() => {
              getOfficialBcvRate(true).then(setBcvInfo).catch(console.warn);
            }}
            title="Haz clic para actualizar la tasa oficial BCV"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.45rem',
              marginTop: '0.85rem',
              padding: '0.45rem 1.15rem',
              borderRadius: 'var(--radius-pill)',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.82rem',
              color: 'var(--text-main)',
              boxShadow: 'var(--shadow-subtle)',
              cursor: 'pointer',
            }}
          >
            <DollarSign size={14} color="var(--jos-500)" />
            <span style={{ fontWeight: 600 }}>Tasa Oficial BCV:</span>
            <strong style={{ color: 'var(--jos-700)' }}>Bs. {bcvInfo.rate.toFixed(2)}</strong>
            {bcvInfo.bcvOfficialDate && (
              <span style={{ color: 'var(--text-light)', fontSize: '0.74rem' }}>
                ({bcvInfo.bcvOfficialDate})
              </span>
            )}
          </div>
        )}
      </div>

      {/* Barra de Filtros & Búsqueda */}
      <div
        className="glass-panel"
        style={{
          padding: '1.25rem',
          borderRadius: 'var(--radius-lg)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
        }}
      >
        {/* Pills de Categoría */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setSelectedCategory('all')}
            style={{
              padding: '0.55rem 1.15rem',
              borderRadius: 'var(--radius-pill)',
              fontSize: '0.88rem',
              fontWeight: 600,
              background: selectedCategory === 'all' ? 'var(--jos-700)' : 'var(--bg-card)',
              color: selectedCategory === 'all' ? '#ffffff' : 'var(--text-main)',
              transition: 'all var(--transition-fast)',
              border: '1px solid var(--border-subtle)',
              minHeight: '44px',
            }}
          >
            Todos ({services.length})
          </button>
          <button
            onClick={() => setSelectedCategory('facial')}
            style={{
              padding: '0.55rem 1.15rem',
              borderRadius: 'var(--radius-pill)',
              fontSize: '0.88rem',
              fontWeight: 600,
              background: selectedCategory === 'facial' ? 'var(--jos-700)' : 'var(--bg-card)',
              color: selectedCategory === 'facial' ? '#ffffff' : 'var(--text-main)',
              transition: 'all var(--transition-fast)',
              border: '1px solid var(--border-subtle)',
              minHeight: '44px',
            }}
          >
            Faciales ({services.filter((s) => s.category === 'facial').length})
          </button>
          <button
            onClick={() => setSelectedCategory('corporal')}
            style={{
              padding: '0.55rem 1.15rem',
              borderRadius: 'var(--radius-pill)',
              fontSize: '0.88rem',
              fontWeight: 600,
              background: selectedCategory === 'corporal' ? 'var(--jos-700)' : 'var(--bg-card)',
              color: selectedCategory === 'corporal' ? '#ffffff' : 'var(--text-main)',
              transition: 'all var(--transition-fast)',
              border: '1px solid var(--border-subtle)',
              minHeight: '44px',
            }}
          >
            Corporales ({services.filter((s) => s.category === 'corporal').length})
          </button>
          <button
            onClick={() => setSelectedCategory('nutricion')}
            style={{
              padding: '0.55rem 1.15rem',
              borderRadius: 'var(--radius-pill)',
              fontSize: '0.88rem',
              fontWeight: 600,
              background: selectedCategory === 'nutricion' ? 'var(--jos-700)' : 'var(--bg-card)',
              color: selectedCategory === 'nutricion' ? '#ffffff' : 'var(--text-main)',
              transition: 'all var(--transition-fast)',
              border: '1px solid var(--border-subtle)',
              minHeight: '44px',
            }}
          >
            Nutrición ({services.filter((s) => s.category === 'nutricion').length})
          </button>
        </div>

        {/* Input de Búsqueda */}
        <div style={{ position: 'relative', width: '100%', maxWidth: '320px' }}>
          <Search
            size={18}
            style={{
              position: 'absolute',
              left: '1rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-light)',
            }}
          />
          <input
            type="text"
            placeholder="Buscar por nombre o síntoma..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '0.65rem 1rem 0.65rem 2.6rem',
              borderRadius: 'var(--radius-pill)',
              border: '1px solid var(--border-subtle)',
              background: 'var(--bg-surface-elevated)',
              color: 'var(--text-main)',
              fontSize: '0.9rem',
              outline: 'none',
              minHeight: '44px',
            }}
          />
        </div>
      </div>

      {/* Grid de Tratamientos */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '1.5rem',
        }}
      >
        {filteredServices.map((service) => {
          const isAdded = cartItemIds.includes(service.id);

          return (
            <Card
              key={service.id}
              variant="glass"
              enableTilt={false}
              badge={
                service.badge ? (
                  <span
                    className="right-3 top-3 px-3 py-1 rounded-full text-xs"
                    style={{
                      background: 'var(--badge-bg)',
                      color: 'var(--badge-text)',
                      fontWeight: 700,
                      display: 'inline-block',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.12)',
                      letterSpacing: '0.02em',
                    }}
                  >
                    ⭐ {service.badge}
                  </span>
                ) : undefined
              }
              header={
                <div
                  onClick={() => onSelectTreatment && onSelectTreatment(service)}
                  style={{
                    position: 'relative',
                    height: '190px',
                    width: '100%',
                    cursor: 'pointer',
                    overflow: 'hidden',
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
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-light)', display: 'block' }}>Monto Cita</span>
                    <strong style={{ fontSize: '1.25rem', color: 'var(--jos-700)' }}>${service.price} USD</strong>
                    {bcvInfo && (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>
                        ≈ {formatBs(service.price, bcvInfo.rate)}
                      </span>
                    )}
                  </div>

                  {/* Botón único principal: + Agregar a mi cita (Agregado ✓) */}
                  <Button
                    variant={isAdded ? 'secondary' : 'primary'}
                    size="sm"
                    icon={isAdded ? <Check size={16} color="#22c55e" /> : <Plus size={16} />}
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
              <div
                onClick={() => onSelectTreatment && onSelectTreatment(service)}
                style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', cursor: 'pointer' }}
              >
                <h3 style={{ fontSize: '1.2rem', color: 'var(--text-main)', margin: 0, lineHeight: 1.3 }}>
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
    </div>
  );
};
