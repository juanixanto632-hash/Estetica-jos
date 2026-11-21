import { useState, useEffect } from 'react';
import {
  Menu,
  ShoppingBag,
  Sparkles,
  Calendar,
  CalendarCheck,
  CheckCircle2,
  UserCheck,
  Home,
  Gift,
} from 'lucide-react';
import { Cart, CartItem, SocialLinks, TreatmentDetailModal, PwaInstallBanner, OfflineIndicator } from './components/common';
import { Sidebar, BottomNav, StickyAppointmentBar } from './components/layout';
import { HomeScreen } from './features/home/HomeScreen';
import { CatalogScreen } from './features/catalog/CatalogScreen';
import { ProfessionalsScreen } from './features/professionals/ProfessionalsScreen';
import { FaqScreen } from './features/faq/FaqScreen';
import { ContactScreen } from './features/contact/ContactScreen';
import { RegisterScreen } from './features/auth/RegisterScreen';
import { AppointmentBookingScreen, AppointmentRecord } from './features/appointments/AppointmentBookingScreen';
import { MyAppointmentsScreen } from './features/appointments/MyAppointmentsScreen';
import { GiftCardScreen } from './features/giftcard/GiftCardScreen';
import { Service, Professional } from './data/mockData';

export default function App() {
  // Estado de Tema (Persistente)
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('jos_theme');
    return (saved as 'light' | 'dark') || 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('jos_theme', theme);
    document.cookie = `jos_theme=${theme}; path=/; max-age=31536000; SameSite=Lax; Secure`;
  }, [theme]);

  const toggleTheme = (isDark: boolean) => {
    setTheme(isDark ? 'dark' : 'light');
  };

  // Estado de Navegación de Pantallas
  const [activeScreen, setActiveScreen] = useState<string>('inicio');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Estado del Modal de Detalles de Tratamiento
  const [selectedDetailService, setSelectedDetailService] = useState<Service | null>(null);

  // Estados para precargar selección en el Stepper de Citas
  const [preselectedServiceId, setPreselectedServiceId] = useState<string | undefined>(undefined);
  const [preselectedProId, setPreselectedProId] = useState<string | undefined>(undefined);

  // Estado del Carrito interactivo (inicia completamente vacío)
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const handleAddToCart = (service: Service) => {
    if (!cartItems.some((i) => i.id === service.id)) {
      setCartItems((prev) => [
        ...prev,
        {
          id: service.id,
          name: service.name,
          price: service.price,
          durationMinutes: service.durationMinutes,
          category: service.category,
        },
      ]);
    } else {
      // Si ya está agregado, permitir togglear o remover
      setCartItems((prev) => prev.filter((i) => i.id !== service.id));
    }
    setPreselectedServiceId(service.id);
  };

  const handleRemoveFromCart = (id: string) => {
    setCartItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleSelectProfessional = (pro: Professional) => {
    setPreselectedProId(pro.id);
    setActiveScreen('citas');
  };

  const handleCheckoutFromCart = () => {
    if (cartItems.length > 0) {
      setPreselectedServiceId(cartItems[0].id);
    }
    setIsCartOpen(false);
    setActiveScreen('citas');
  };

  const handleAppointmentCreated = (_appointment: AppointmentRecord) => {
    setCartItems([]);
  };

  // Scroll al inicio al cambiar de pantalla
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeScreen]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Franja superior fija para iOS Safe Area al hacer scroll */}
      <div
        className="ios-safe-area-top-fill fixed top-0 left-0 right-0 z-50 pointer-events-none bg-white/90 dark:bg-[#1a1625]/90 backdrop-blur-md"
        aria-hidden="true"
        style={{ height: 'env(safe-area-inset-top, 0px)' }}
      />

      {/* Sidebar translúcido */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        activeId={activeScreen}
        onSelect={(id) => {
          if (id === 'carrito') {
            setIsCartOpen(true);
          } else {
            setActiveScreen(id);
          }
        }}
        cartCount={cartItems.length}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Drawer del Carrito */}
      <Cart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onRemoveItem={handleRemoveFromCart}
        onCheckout={handleCheckoutFromCart}
        onExploreCatalog={() => setActiveScreen('catalogo')}
      />

      {/* Modal / Bottom Sheet de Detalles de Tratamiento */}
      <TreatmentDetailModal
        service={selectedDetailService}
        isOpen={selectedDetailService !== null}
        onClose={() => setSelectedDetailService(null)}
        onAddToCart={handleAddToCart}
        isAdded={selectedDetailService ? cartItems.some((i) => i.id === selectedDetailService.id) : false}
        onGoToBooking={() => setActiveScreen('citas')}
      />



      {/* Indicador de Conexión Offline / Online */}
      <OfflineIndicator />

      {/* Barra de Navegación Superior Limpia - Estilo macOS Espacial con Notch Safe-Area */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          paddingTop: 'calc(env(safe-area-inset-top, 0px) + 0.5rem)',
          paddingBottom: '0.5rem',
          paddingLeft: '1.25rem',
          paddingRight: '1.25rem',
          minHeight: 'calc(env(safe-area-inset-top, 0px) + 58px)',
          display: 'flex',
          alignItems: 'center',
          background: 'var(--bg-surface)',
          backdropFilter: 'var(--glass-blur)',
          WebkitBackdropFilter: 'var(--glass-blur)',
          borderBottom: '1px solid var(--border-subtle)',
          boxSizing: 'border-box',
        }}
      >
        {/* VISTA MÓVIL (md:hidden): Cuadrícula simétrica 3 columnas (Menú izquierda | Logo centrado | Carrito derecha) */}
        <div
          className="mobile-only"
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto 1fr',
            alignItems: 'center',
            width: '100%',
            minHeight: '44px',
          }}
        >
          {/* Botón Menú Hamburguesa (Columna izquierda) */}
          <button
            onClick={() => setIsSidebarOpen(true)}
            aria-label="Abrir menú de opciones"
            className="hamburger-btn"
            style={{
              justifySelf: 'start',
              width: '38px',
              height: '38px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--jos-700)',
              transition: 'all var(--transition-fast)',
            }}
          >
            <Menu size={20} />
          </button>

          {/* Logo centrado en móvil (Columna central matemática con contraste mejorado) */}
          <div
            onClick={() => setActiveScreen('inicio')}
            style={{
              justifySelf: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <img
              src={theme === 'dark' ? '/branding/logos/logo-horizontal-gris.png' : '/branding/logos/logo-horizontal-rosa.png'}
              alt="Estética Jos"
              style={{
                height: '40px',
                width: 'auto',
                objectFit: 'contain',
                display: 'block',
                filter: theme === 'light' ? 'brightness(0.75) contrast(1.25)' : 'none',
                transition: 'filter var(--transition-fast)',
              }}
            />
          </div>

          {/* Carrito en móvil (Columna derecha) */}
          <button
            onClick={() => setIsCartOpen(true)}
            aria-label="Ver carrito de servicios"
            style={{
              justifySelf: 'end',
              height: '38px',
              padding: '0 0.85rem',
              borderRadius: 'var(--radius-pill)',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--jos-700)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              fontWeight: 700,
              fontSize: '0.86rem',
              transition: 'all var(--transition-fast)',
            }}
          >
            <ShoppingBag size={18} />
            <span style={{ color: 'var(--text-main)' }}>{cartItems.length}</span>
          </button>
        </div>

        {/* VISTA ESCRITORIO (md:flex): Logo izquierda | Dock al centro | CTA Agendar y Carrito derecha */}
        <div
          className="desktop-only"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
          }}
        >
          {/* Logo izquierda (Aumentado a 42px con contraste nítido) */}
          <div
            onClick={() => setActiveScreen('inicio')}
            style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
          >
            <img
              src={theme === 'dark' ? '/branding/logos/logo-horizontal-gris.png' : '/branding/logos/logo-horizontal-rosa.png'}
              alt="Estética Jos"
              style={{
                height: '42px',
                width: 'auto',
                objectFit: 'contain',
                display: 'block',
                filter: theme === 'light' ? 'brightness(0.75) contrast(1.25)' : 'none',
                transition: 'filter var(--transition-fast)',
              }}
            />
          </div>

          {/* Centro: Dock flotante minimalista */}
          <nav
            className="desktop-dock"
            style={{
              display: 'flex',
              alignItems: 'center',
              background: 'var(--bg-card)',
              padding: '0.25rem',
              borderRadius: 'var(--radius-pill)',
              border: '1px solid var(--border-subtle)',
              boxShadow: 'var(--shadow-subtle)',
              gap: '0.25rem',
            }}
          >
            {[
              { id: 'inicio', label: 'Inicio', icon: <Home size={15} /> },
              { id: 'catalogo', label: 'Catálogo', icon: <Sparkles size={15} /> },
              { id: 'profesionales', label: 'Especialistas', icon: <UserCheck size={15} /> },
              { id: 'citas', label: 'Citas', icon: <Calendar size={15} /> },
              { id: 'miscitas', label: 'Mis Citas', icon: <CalendarCheck size={15} /> },
              { id: 'giftcard', label: 'Gift Card', icon: <Gift size={15} /> },
            ].map((item) => {
              const isActive = activeScreen === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveScreen(item.id)}
                  style={{
                    padding: '0.42rem 0.95rem',
                    borderRadius: 'var(--radius-pill)',
                    fontSize: '0.84rem',
                    fontWeight: isActive ? 700 : 500,
                    background: isActive ? 'var(--jos-700)' : 'transparent',
                    color: isActive ? '#ffffff' : 'var(--text-main)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  <span style={{ color: isActive ? '#ffffff' : 'var(--jos-500)', display: 'flex' }}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Derecha: Botón Agendar + Carrito */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <button
              onClick={() => setActiveScreen('citas')}
              className="header-cta-btn"
              style={{
                height: '36px',
                padding: '0 1.1rem',
                borderRadius: 'var(--radius-pill)',
                background: 'linear-gradient(135deg, var(--jos-700) 0%, var(--jos-500) 100%)',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.84rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                boxShadow: '0 4px 14px rgba(129, 99, 139, 0.25)',
                transition: 'all var(--transition-fast)',
              }}
            >
              <Calendar size={15} />
              <span>Agendar</span>
            </button>

            <button
              onClick={() => setIsCartOpen(true)}
              aria-label="Ver carrito de servicios"
              style={{
                height: '36px',
                padding: '0 0.85rem',
                borderRadius: 'var(--radius-pill)',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--jos-700)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                fontWeight: 700,
                fontSize: '0.86rem',
                transition: 'all var(--transition-fast)',
              }}
            >
              <ShoppingBag size={17} />
              <span style={{ color: 'var(--text-main)' }}>{cartItems.length}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Contenido Principal según pantalla activa */}
      <main style={{ flex: 1, maxWidth: '1140px', margin: '0 auto', padding: '2rem 1.5rem', width: '100%' }}>
        <PwaInstallBanner />

        {activeScreen === 'inicio' && (
          <HomeScreen
            onNavigate={(id) => setActiveScreen(id)}
            onAddToCart={handleAddToCart}
            cartItemIds={cartItems.map((i) => i.id)}
            onSelectTreatment={(s) => setSelectedDetailService(s)}
            theme={theme}
          />
        )}

        {activeScreen === 'catalogo' && (
          <CatalogScreen
            onAddToCart={handleAddToCart}
            cartItemIds={cartItems.map((i) => i.id)}
            onSelectTreatment={(s) => setSelectedDetailService(s)}
          />
        )}

        {activeScreen === 'profesionales' && (
          <ProfessionalsScreen
            onSelectProfessional={handleSelectProfessional}
          />
        )}

        {activeScreen === 'citas' && (
          <AppointmentBookingScreen
            initialServiceId={preselectedServiceId}
            initialProfessionalId={preselectedProId}
            cartServiceIds={cartItems.map((i) => i.id)}
            onAppointmentCreated={handleAppointmentCreated}
            onNavigateHome={() => setActiveScreen('inicio')}
            onNavigateToMyAppointments={() => setActiveScreen('miscitas')}
          />
        )}

        {activeScreen === 'miscitas' && (
          <MyAppointmentsScreen
            onNavigateToBooking={() => setActiveScreen('citas')}
            onNavigateHome={() => setActiveScreen('inicio')}
          />
        )}

        {activeScreen === 'faqs' && <FaqScreen />}

        {activeScreen === 'contacto' && <ContactScreen />}

        {activeScreen === 'registro' && (
          <RegisterScreen onNavigate={(screen) => setActiveScreen(screen)} />
        )}

        {activeScreen === 'giftcard' && (
          <GiftCardScreen
            onNavigateHome={() => setActiveScreen('inicio')}
            onGoToBooking={() => setActiveScreen('citas')}
          />
        )}
      </main>

      {/* Barra Flotante Inferior de Resumen de Cita (Sticky Bar - solo fuera de Citas, Gift Card y Mis Citas para no superponerse) */}
      {activeScreen !== 'citas' && activeScreen !== 'giftcard' && activeScreen !== 'miscitas' && (
        <StickyAppointmentBar
          items={cartItems}
          onOpenBooking={() => setActiveScreen('citas')}
        />
      )}

      {/* Barra de Navegación Inferior Fija para Móviles (Bottom Navigation Bar) */}
      <BottomNav
        activeScreen={activeScreen}
        onSelectScreen={(screen) => setActiveScreen(screen)}
        cartCount={cartItems.length}
      />

      {/* Footer Espacial con Redes Sociales Oficiales */}
      <footer
        style={{
          borderTop: '1px solid var(--border-subtle)',
          padding: '3rem 1.5rem 2rem',
          background: 'var(--bg-surface)',
          backdropFilter: 'var(--glass-blur)',
          WebkitBackdropFilter: 'var(--glass-blur)',
          marginTop: 'auto',
        }}
      >
        <div
          style={{
            maxWidth: '1000px',
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '2rem',
            alignItems: 'center',
            textAlign: 'center',
          }}
        >
          {/* Logo y Ubicación */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.65rem' }}>
            <img
              src="/branding/logos/logo-circular.png"
              alt="Estética Jos"
              style={{ width: '48px', height: '48px', borderRadius: '50%', boxShadow: 'var(--shadow-subtle)' }}
            />
            <div>
              <strong style={{ fontSize: '1.2rem', color: 'var(--jos-700)', display: 'block' }}>
                Estética Jos
              </strong>
              <span style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                Centro Comercial Naranjo, Piso 2, Local 22 · Urb. La Mata, Mérida, Venezuela
              </span>
            </div>
          </div>

          {/* Redes Sociales Oficiales */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.65rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--jos-500)' }}>
              Síguenos en Redes Sociales
            </span>
            <SocialLinks variant="footer" />
          </div>

          {/* Enlaces de Navegación del Footer en Cuadrícula Limpia */}
          <div
            className="footer-nav-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, minmax(120px, 1fr))',
              gap: '0.65rem 1.25rem',
              maxWidth: '380px',
              width: '100%',
              margin: '0 auto',
              textAlign: 'center',
            }}
          >
            <button onClick={() => setActiveScreen('inicio')} style={{ padding: '0.35rem 0.5rem', color: 'var(--text-muted)', fontSize: '0.86rem', fontWeight: 600 }}>Inicio</button>
            <button onClick={() => setActiveScreen('catalogo')} style={{ padding: '0.35rem 0.5rem', color: 'var(--text-muted)', fontSize: '0.86rem', fontWeight: 600 }}>Catálogo</button>
            <button onClick={() => setActiveScreen('profesionales')} style={{ padding: '0.35rem 0.5rem', color: 'var(--text-muted)', fontSize: '0.86rem', fontWeight: 600 }}>Especialistas</button>
            <button onClick={() => setActiveScreen('citas')} style={{ padding: '0.35rem 0.5rem', color: 'var(--text-muted)', fontSize: '0.86rem', fontWeight: 600 }}>Agendar Cita</button>
            <button onClick={() => setActiveScreen('registro')} style={{ padding: '0.35rem 0.5rem', color: 'var(--text-muted)', fontSize: '0.86rem', fontWeight: 600 }}>Registro</button>
            <button onClick={() => setActiveScreen('faqs')} style={{ padding: '0.35rem 0.5rem', color: 'var(--text-muted)', fontSize: '0.86rem', fontWeight: 600 }}>Preguntas</button>
            <button onClick={() => setActiveScreen('contacto')} style={{ padding: '0.35rem 0.5rem', color: 'var(--text-muted)', fontSize: '0.86rem', fontWeight: 600, gridColumn: 'span 2' }}>Ubicación & Contacto</button>
          </div>

          {/* WhatsApp Directo */}
          <div
            style={{
              padding: '0.65rem 1.25rem',
              borderRadius: 'var(--radius-pill)',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.84rem',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              flexWrap: 'wrap',
              maxWidth: '100%',
            }}
          >
            <span style={{ color: 'var(--text-muted)' }}>Atención directa por WhatsApp:</span>
            <a
              href="https://wa.me/+584147518902"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--jos-700)', fontWeight: 700, whiteSpace: 'nowrap' }}
            >
              +58 414-7518902
            </a>
          </div>

          {/* Garantías de Marca */}
          <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.78rem', color: 'var(--text-light)', flexWrap: 'wrap', justifyContent: 'center' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <CheckCircle2 size={14} color="#22c55e" /> Confirmación Directa por WhatsApp
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <CheckCircle2 size={14} color="#22c55e" /> Atención Exclusiva en Mérida
            </span>
          </div>

          <div style={{ fontSize: '0.8rem', color: 'var(--text-light)', borderTop: '1px solid var(--border-subtle)', width: '100%', paddingTop: '1.25rem' }}>
            © 2026 Estética Jos. Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}
