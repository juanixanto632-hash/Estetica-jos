import { useState, useEffect, useCallback } from 'react';
import { SERVICES_DATA, Service, ServiceCategory } from '../data/mockData';
import { fetchCatalogFromAppsScript } from '../config/appsScript';

const STORAGE_CATALOG_KEY = 'jos_synced_catalog';
const STORAGE_SYNC_TIME_KEY = 'jos_catalog_sync_timestamp';

// Mapeo seguro de área a categoría
function normalizeCategory(area?: string): ServiceCategory {
  if (!area) return 'facial';
  const lower = area.toLowerCase().trim();
  if (lower.includes('corp') || lower.includes('masaj') || lower.includes('drenaje')) return 'corporal';
  if (lower.includes('nutri') || lower.includes('diet') || lower.includes('aliment')) return 'nutricion';
  return 'facial';
}

// Imagen por defecto según categoría para nuevos servicios en Sheets
function getDefaultImage(category: ServiceCategory): string {
  switch (category) {
    case 'corporal':
      return 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=600&q=80';
    case 'nutricion':
      return 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=600&q=80';
    case 'facial':
    default:
      return 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=600&q=80';
  }
}

export function useCatalog() {
  const [services, setServices] = useState<Service[]>(() => {
    // 1. Intentar cargar desde el caché guardado de Google Sheets
    try {
      const cached = localStorage.getItem(STORAGE_CATALOG_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {}
    return SERVICES_DATA;
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLiveSync, setIsLiveSync] = useState<boolean>(() => {
    return !!localStorage.getItem(STORAGE_SYNC_TIME_KEY);
  });
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(() => {
    const ts = localStorage.getItem(STORAGE_SYNC_TIME_KEY);
    return ts ? new Date(parseInt(ts, 10)).toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' }) : null;
  });

  const syncWithGoogleSheets = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetchCatalogFromAppsScript();

      if (res.success && Array.isArray(res.tratamientos) && res.tratamientos.length > 0) {
        // Mapear y combinar con los servicios base
        const sheetItems = res.tratamientos;

        const updatedServices: Service[] = SERVICES_DATA.map((base) => {
          // Buscar coincidencia en Sheets
          const match = sheetItems.find(
            (item: any) =>
              item.tratamiento?.toLowerCase().trim() === base.name.toLowerCase().trim() ||
              base.name.toLowerCase().includes(item.tratamiento?.toLowerCase().trim())
          );

          if (match) {
            return {
              ...base,
              price: typeof match.precio === 'number' && match.precio > 0 ? match.precio : base.price,
              category: normalizeCategory(match.area),
              defaultProfessional: match.profesional || base.defaultProfessional,
            };
          }
          return base;
        });

        // Verificar si hay nuevos servicios en Sheets que no están en mockData
        sheetItems.forEach((item: any, idx: number) => {
          const exists = updatedServices.some(
            (s) =>
              s.name.toLowerCase().trim() === item.tratamiento?.toLowerCase().trim() ||
              s.name.toLowerCase().includes(item.tratamiento?.toLowerCase().trim())
          );

          if (!exists && item.tratamiento) {
            const cat = normalizeCategory(item.area);
            updatedServices.push({
              id: `sheet-${idx}-${Date.now().toString().slice(-4)}`,
              name: item.tratamiento.trim(),
              category: cat,
              price: typeof item.precio === 'number' && item.precio > 0 ? item.precio : 25,
              durationMinutes: 60,
              badge: 'Nuevo en Catálogo',
              shortDescription: `Tratamiento ${cat} disponible en nuestra sede de Mérida (${item.modalidad || 'Por sesión'}).`,
              fullDescription: `Protocolo ${item.tratamiento} realizado por nuestro equipo especializado. Sede Centro Comercial Naranjo, Mérida.`,
              image: getDefaultImage(cat),
              defaultProfessional: item.profesional || 'Joslin Serrano',
            });
          }
        });

        setServices(updatedServices);
        setIsLiveSync(true);
        const now = Date.now();
        localStorage.setItem(STORAGE_CATALOG_KEY, JSON.stringify(updatedServices));
        localStorage.setItem(STORAGE_SYNC_TIME_KEY, now.toString());
        setLastSyncTime(new Date(now).toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' }));
      }
    } catch (err) {
      console.warn('[useCatalog] No se pudo sincronizar con Google Sheets, usando caché local.', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Sincronizar automáticamente al iniciar
    syncWithGoogleSheets();
  }, [syncWithGoogleSheets]);

  return {
    services,
    isLoading,
    isLiveSync,
    lastSyncTime,
    refreshCatalog: syncWithGoogleSheets,
  };
}
