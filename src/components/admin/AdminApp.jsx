import { useEffect, useState } from 'react';
import { authService } from '../../services/auth.service';
import AdminDashboard from './AdminDashboard';
import TrabajosAdmin from './TrabajosAdmin';
import CategoriasAdmin from './CategoriasAdmin';
import FaqsAdmin from './FaqsAdmin';
import NegocioForm from './NegocioForm';

const SECCIONES = [
  { id: 'productos', label: 'Productos', title: 'Productos', Component: AdminDashboard },
  { id: 'categorias', label: 'Categorías', title: 'Categorías', Component: CategoriasAdmin },
  { id: 'trabajos', label: 'Trabajos', title: 'Trabajos realizados', Component: TrabajosAdmin },
  { id: 'faqs', label: 'Preguntas frecuentes', title: 'Preguntas frecuentes', Component: FaqsAdmin },
  { id: 'negocio', label: 'Datos del negocio', title: 'Datos del negocio', Component: NegocioForm },
];

const fromHash = () => {
  const id = window.location.hash.replace('#', '');
  return SECCIONES.some((s) => s.id === id) ? id : 'productos';
};

/** Panel admin: verifica la sesión y muestra la sección elegida (se guarda en la URL: #trabajos, #faqs…). */
export default function AdminApp() {
  const [ready, setReady] = useState(false);
  const [seccion, setSeccion] = useState(fromHash);

  useEffect(() => {
    (async () => {
      const session = await authService.getSession();
      if (!session || !(await authService.isAdmin())) {
        window.location.href = '/admin/login';
        return;
      }
      setReady(true);
    })();
    const onHash = () => setSeccion(fromHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const actual = SECCIONES.find((s) => s.id === seccion) ?? SECCIONES[0];

  useEffect(() => {
    document.title = `${actual.title} | Panel Puka Yurac`;
  }, [actual]);

  if (!ready) {
    return (
      <p className="py-20 text-center text-[15px] ui-text-secondary" aria-live="polite">
        Verificando tu sesión…
      </p>
    );
  }

  const { Component } = actual;
  return (
    <div>
      <nav aria-label="Secciones del panel" className="-mx-4 sm:mx-0 mb-8 lg:mb-10 border-b ui-border">
        <ul className="flex gap-1 overflow-x-auto px-4 sm:px-0 [scrollbar-width:none]">
          {SECCIONES.map((s) => {
            const on = s.id === actual.id;
            return (
              <li key={s.id} className="shrink-0">
                <a
                  href={`#${s.id}`}
                  aria-current={on ? 'page' : undefined}
                  className={`relative inline-flex items-center h-12 px-3 sm:px-4 text-[15px] font-semibold whitespace-nowrap transition-colors ${
                    on
                      ? 'ui-text-primary after:absolute after:inset-x-3 sm:after:inset-x-4 after:bottom-0 after:h-0.5 after:rounded-full after:bg-[var(--action)]'
                      : 'ui-text-secondary hover:ui-text-primary'
                  }`}
                >
                  {s.label}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
      <Component key={actual.id} />
    </div>
  );
}
