import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { authService } from '../../services/auth.service';
import { productosService } from '../../services/productos.service';
import ConfirmDialog from './ConfirmDialog';
import ProductoForm from './ProductoForm';
import { siteData } from '../../data/siteData';
import { cls, IconEdit, IconSearch, IconTrash, Plate, SwitchTrack } from './ui';

const FILTROS = [
  { id: 'todos', label: 'Todos', test: () => true },
  { id: 'publicados', label: 'Publicados', test: (p) => p.activo },
  { id: 'ocultos', label: 'Ocultos', test: (p) => !p.activo },
  { id: 'destacados', label: 'Destacados', test: (p) => p.destacado },
];

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]):not([tabindex="-1"]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

const normalize = (s) =>
  (s ?? '')
    .toString()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();

const byOrden = (a, b) => (a.orden ?? 0) - (b.orden ?? 0);


export default function AdminDashboard() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [filtro, setFiltro] = useState('todos');
  const [panel, setPanel] = useState(null); // null = cerrado, { producto: null } = nuevo, { producto } = editar
  const [confirm, setConfirm] = useState(null); // { kind: 'delete', producto } | { kind: 'discard', proceed }
  const [deleting, setDeleting] = useState(false);
  const [notice, setNotice] = useState(null); // { tone: 'ok' | 'error', text }

  const dirtyRef = useRef(false);
  const triggerRef = useRef(null);
  const panelRef = useRef(null);
  const newBtnRef = useRef(null);

  // Auth guard: sin sesión de admin, volver al login
  useEffect(() => {
    (async () => {
      const session = await authService.getSession();
      if (!session || !(await authService.isAdmin())) {
        window.location.href = '/admin/login';
        return;
      }
      loadProductos();
    })();
  }, []);

  async function loadProductos() {
    setLoading(true);
    setError('');
    try {
      setProductos(await productosService.getAdminProductos());
    } catch (err) {
      setError(err?.message || 'No se pudieron cargar los productos');
    } finally {
      setLoading(false);
    }
  }

  // Aviso efímero para confirmaciones
  useEffect(() => {
    if (notice?.tone !== 'ok') return;
    const t = setTimeout(() => setNotice(null), 5000);
    return () => clearTimeout(t);
  }, [notice]);

  // ---------- Derivados ----------
  // Categorías canónicas del hero (enlazan a /productos?cat=) + las que ya existan en productos
  const categorias = useMemo(
    () =>
      [...new Set([...siteData.categorias.map((c) => c.nombre), ...productos.map((p) => p.categoria).filter(Boolean)])].sort(
        (a, b) => a.localeCompare(b, 'es')
      ),
    [productos]
  );

  const acabadosUsados = useMemo(() => {
    const freq = new Map();
    for (const p of productos) for (const a of p.acabados ?? []) freq.set(a, (freq.get(a) ?? 0) + 1);
    return [...freq.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'es')).map(([a]) => a);
  }, [productos]);

  const nextOrden = useMemo(() => productos.reduce((max, p) => Math.max(max, p.orden ?? 0), 0) + 1, [productos]);

  const nPub = productos.filter((p) => p.activo).length;
  const nDest = productos.filter((p) => p.destacado).length;
  const counts = {
    todos: productos.length,
    publicados: nPub,
    ocultos: productos.length - nPub,
    destacados: nDest,
  };

  const visibles = useMemo(() => {
    const f = FILTROS.find((x) => x.id === filtro) ?? FILTROS[0];
    const q = normalize(query.trim());
    return productos.filter(
      (p) => f.test(p) && (!q || normalize(`${p.titulo} ${p.categoria} ${p.descripcion}`).includes(q))
    );
  }, [productos, filtro, query]);

  let summary = `${productos.length} ${productos.length === 1 ? 'producto' : 'productos'} · ${nPub} ${
    nPub === 1 ? 'publicado' : 'publicados'
  } · ${nDest} ${nDest === 1 ? 'destacado' : 'destacados'} en inicio`;
  if (loading) summary = 'Cargando productos…';
  else if (error) summary = 'No se pudo cargar el catálogo';

  const estado = loading ? 'carga' : error ? 'error' : productos.length === 0 ? 'vacio' : 'lista';
  const panelOpen = Boolean(panel);
  const modal = panelOpen; // el formulario siempre se abre como modal
  const activeId = panel?.producto?.id ?? null;

  // ---------- Panel ----------
  const closePanelNow = useCallback(() => {
    setPanel(null);
    dirtyRef.current = false;
    const target = triggerRef.current;
    requestAnimationFrame(() => {
      if (target && document.contains(target)) target.focus();
      else newBtnRef.current?.focus();
    });
  }, []);

  function guardDirty(proceed) {
    if (panelOpen && dirtyRef.current) setConfirm({ kind: 'discard', proceed });
    else proceed();
  }

  function openPanel(producto, trigger) {
    guardDirty(() => {
      triggerRef.current = trigger ?? null;
      dirtyRef.current = false;
      setPanel({ producto });
    });
  }

  function requestClose() {
    guardDirty(closePanelNow);
  }

  const onDirtyChange = useCallback((d) => {
    dirtyRef.current = d;
  }, []);

  // Móvil: el panel es pantalla completa → bloquear el scroll del fondo
  useEffect(() => {
    if (!modal) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [modal]);

  function onPanelKeyDown(e) {
    if (e.key === 'Escape') {
      e.stopPropagation();
      requestClose();
      return;
    }
    // Foco atrapado en pantalla completa (móvil)
    if (e.key === 'Tab' && modal && panelRef.current) {
      const items = [...panelRef.current.querySelectorAll(FOCUSABLE)].filter((el) => el.offsetParent !== null);
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && (document.activeElement === first || !panelRef.current.contains(document.activeElement))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  function handleSaved(saved, wasEdit) {
    setProductos((list) => {
      const exists = list.some((p) => p.id === saved.id);
      const next = exists ? list.map((p) => (p.id === saved.id ? saved : p)) : [...list, saved];
      return next.sort(byOrden);
    });
    setNotice({ tone: 'ok', text: wasEdit ? `Cambios guardados en “${saved.titulo}”.` : `“${saved.titulo}” se creó.` });
    closePanelNow();
  }

  // ---------- Acciones en fila ----------
  async function toggleField(producto, field) {
    const value = !producto[field];
    setProductos((list) => list.map((p) => (p.id === producto.id ? { ...p, [field]: value } : p)));
    try {
      const saved = await productosService.updateProducto(producto.id, { [field]: value });
      setProductos((list) => list.map((p) => (p.id === saved.id ? saved : p)));
    } catch (err) {
      setProductos((list) => list.map((p) => (p.id === producto.id ? { ...p, [field]: producto[field] } : p)));
      setNotice({ tone: 'error', text: `No se pudo actualizar “${producto.titulo}”. ${err?.message ?? ''}`.trim() });
    }
  }

  async function confirmDelete() {
    const producto = confirm?.producto;
    if (!producto) return;
    setDeleting(true);
    try {
      await productosService.deleteProducto(producto.id);
      if (producto.imagen) productosService.deleteImagen(producto.imagen).catch(() => {});
      setProductos((list) => list.filter((p) => p.id !== producto.id));
      setConfirm(null);
      if (activeId === producto.id) {
        triggerRef.current = null;
        closePanelNow();
      }
      setNotice({ tone: 'ok', text: `“${producto.titulo}” se eliminó.` });
    } catch (err) {
      setConfirm(null);
      setNotice({ tone: 'error', text: `No se pudo eliminar “${producto.titulo}”. ${err?.message ?? ''}`.trim() });
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div>
      {/* ---------- Lista ---------- */}
      <div className="min-w-0 @container" inert={modal || undefined}>
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5 sm:gap-8">
          <div>
            <h1 className="font-sans [font-stretch:112%] text-[32px] sm:text-[40px] leading-[1.05] font-extrabold tracking-[-0.03em] ui-text-primary">
              Productos
            </h1>
            <p className="mt-2 text-[15px] ui-text-secondary">{summary}</p>
          </div>
          <button
            ref={newBtnRef}
            type="button"
            onClick={(e) => openPanel(null, e.currentTarget)}
            aria-expanded={panelOpen && !activeId}
            className={`${cls.primary} h-12 px-[22px] text-[15px] self-start sm:self-auto shrink-0`}
          >
            Nuevo producto
          </button>
        </div>

        {/* Avisos */}
        <div aria-live="polite">
          {notice && (
            <div
              className={`mt-6 flex items-center justify-between gap-4 rounded-xl px-4 py-2 text-[15px] ${
                notice.tone === 'ok'
                  ? 'bg-[#e6f4ee] text-[#065f46] dark:bg-emerald-500/15 dark:text-emerald-300'
                  : 'bg-[#fdecec] text-[#7f1d1d] dark:bg-red-500/15 dark:text-red-300'
              }`}
            >
              <p className="py-2 font-semibold">{notice.text}</p>
              <button
                type="button"
                onClick={() => setNotice(null)}
                className="shrink-0 h-11 px-3 rounded-lg font-semibold underline underline-offset-4 cursor-pointer"
              >
                Cerrar aviso
              </button>
            </div>
          )}
        </div>

        {/* Buscador + filtros */}
        {(estado === 'lista' || estado === 'carga') && (
          <div className="mt-8 flex flex-col @3xl:flex-row @3xl:items-center @3xl:justify-between gap-3 @3xl:gap-6">
            <div className="relative w-full @3xl:w-[360px]">
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 ui-text-tertiary">
                <IconSearch />
              </span>
              <input
                type="search"
                aria-label="Buscar producto"
                placeholder="Buscar por nombre"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                disabled={loading}
                className={`${cls.input} h-11 pl-11 pr-4 text-[15px]`}
              />
            </div>
            <div
              role="group"
              aria-label="Filtrar productos"
              className="flex gap-1 overflow-x-auto -m-1.5 p-1.5 @3xl:overflow-visible"
            >
              {FILTROS.map((f) => {
                const on = filtro === f.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    aria-pressed={on}
                    onClick={() => setFiltro(f.id)}
                    className={`shrink-0 h-11 px-3.5 rounded-full text-[15px] font-semibold cursor-pointer transition-colors ${
                      on ? cls.inkOn : 'ui-text-secondary hover:bg-[var(--bg-elevated)]'
                    }`}
                  >
                    {f.label} <span className="font-medium opacity-75">{loading ? '' : counts[f.id]}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <p className="sr-only" aria-live="polite">
          {estado === 'lista' ? `Mostrando ${visibles.length} de ${productos.length} productos` : ''}
        </p>

        {/* Contenedor de la lista */}
        <div className="mt-5 rounded-2xl ui-surface-bg overflow-hidden">
          {estado === 'error' && (
            <div
              role="alert"
              className="m-4 sm:m-6 p-5 sm:px-6 rounded-xl bg-[#fdecec] text-[#7f1d1d] dark:bg-red-500/15 dark:text-red-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6"
            >
              <p className="text-base leading-normal">
                <strong>No pudimos cargar los productos.</strong> Revisa tu conexión a internet e inténtalo de nuevo. Tus
                productos no se han perdido.
              </p>
              <button
                type="button"
                onClick={loadProductos}
                className="shrink-0 self-start sm:self-auto h-11 px-[18px] rounded-xl border border-current bg-white dark:bg-transparent text-[15px] font-bold cursor-pointer"
              >
                Reintentar
              </button>
            </div>
          )}

          {estado === 'vacio' && (
            <div className="px-6 pt-24 pb-28 sm:pt-[120px] sm:pb-32 flex flex-col items-center text-center">
              <h2 className="font-sans [font-stretch:110%] text-[28px] sm:text-[32px] leading-[1.1] font-extrabold tracking-[-0.02em] ui-text-primary">
                Aún no hay productos
              </h2>
              <p className="mt-3 mb-7 max-w-[460px] text-[17px] leading-[1.55] ui-text-secondary">
                Sube una foto, ponle un nombre y elige su categoría. Aparecerá en el catálogo apenas lo publiques.
              </p>
              <button
                type="button"
                onClick={(e) => openPanel(null, e.currentTarget)}
                className={`${cls.primary} h-[52px] px-6 text-base`}
              >
                Crear el primer producto
              </button>
            </div>
          )}

          {(estado === 'lista' || estado === 'carga') && (
            <div
              aria-hidden="true"
              className="hidden @2xl:grid grid-cols-[minmax(0,1fr)_150px_150px_92px] @5xl:grid-cols-[minmax(0,1fr)_200px_170px_170px_92px] gap-4 @5xl:gap-6 items-center px-6 h-12 text-[13px] font-bold ui-text-secondary border-b ui-border"
            >
              <span>Producto</span>
              <span className="hidden @5xl:block">Categoría</span>
              <span>Publicado</span>
              <span>Destacado</span>
              <span className="text-right">Acciones</span>
            </div>
          )}

          {estado === 'carga' && (
            <ul aria-busy="true" aria-label="Cargando productos" className="motion-safe:animate-pulse">
              {[220, 180, 240, 160, 210, 190, 230].map((w, i) => (
                <li
                  key={i}
                  className={`${ROW_GRID} ${i ? 'border-t ui-border' : ''}`}
                >
                  <div className="flex items-center gap-4">
                    <span className="w-16 h-16 rounded-[10px] ui-elevated-bg shrink-0" />
                    <div className="flex flex-col gap-2.5 min-w-0">
                      <span className="block h-3.5 rounded-md ui-elevated-bg max-w-full" style={{ width: w }} />
                      <span className="block h-3 rounded-md ui-elevated-bg opacity-70 max-w-full" style={{ width: w + 100 }} />
                    </div>
                  </div>
                  <span className="hidden @5xl:block w-[150px] h-3 rounded-md ui-elevated-bg opacity-70" />
                  <span className="hidden @2xl:block w-11 h-[26px] rounded-full ui-elevated-bg" />
                  <span className="hidden @2xl:block w-11 h-[26px] rounded-full ui-elevated-bg" />
                  <span className="hidden @2xl:block justify-self-end w-[88px] h-3 rounded-md ui-elevated-bg opacity-70" />
                </li>
              ))}
            </ul>
          )}

          {estado === 'lista' && visibles.length === 0 && (
            <div className="px-6 py-16 text-center">
              <p className="text-[17px] font-bold ui-text-primary">No hay productos que coincidan.</p>
              <p className="mt-1 text-[15px] ui-text-secondary">Prueba con otro nombre o cambia el filtro.</p>
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  setFiltro('todos');
                }}
                className={`${cls.secondary} mt-5 h-11 px-4 text-[15px]`}
              >
                Ver todos los productos
              </button>
            </div>
          )}

          {estado === 'lista' && visibles.length > 0 && (
            <ul aria-label="Productos del catálogo">
              {visibles.map((p, i) => (
                <ProductoRow
                  key={p.id}
                  producto={p}
                  first={i === 0}
                  active={p.id === activeId}
                  onToggle={toggleField}
                  onEdit={(e) => openPanel(p, e.currentTarget)}
                  onDelete={() => setConfirm({ kind: 'delete', producto: p })}
                />
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* ---------- Modal de crear / editar producto ---------- */}
      {panelOpen && (
        <div className="fixed inset-0 z-[60] flex items-stretch justify-center lg:items-center lg:p-8">
          <div className="modal-backdrop absolute inset-0 bg-[#0f1115]/55 backdrop-blur-[2px]" onClick={requestClose} aria-hidden="true" />
          <section
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="panel-title"
          onKeyDown={onPanelKeyDown}
          className="modal-panel relative flex h-full w-full flex-col overflow-hidden ui-surface-bg lg:h-[min(90dvh,920px)] lg:max-w-[1160px] lg:rounded-[20px] lg:shadow-[0_24px_64px_-12px_rgba(15,17,21,0.45)]"
        >
          <ProductoForm
            key={panel.producto?.id ?? 'nuevo'}
            producto={panel.producto ? productos.find((p) => p.id === panel.producto.id) ?? panel.producto : null}
            categorias={categorias}
            acabadosUsados={acabadosUsados}
            nextOrden={nextOrden}
            onClose={requestClose}
            onSaved={handleSaved}
            onDirtyChange={onDirtyChange}
          />
          </section>
        </div>
      )}

      <ConfirmDialog
        open={confirm?.kind === 'delete'}
        title={confirm?.kind === 'delete' ? `¿Eliminar “${confirm.producto.titulo}”?` : ''}
        message="Se quitará del catálogo y de la página de inicio. Esta acción no se puede deshacer."
        confirmLabel="Eliminar producto"
        busy={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setConfirm(null)}
      />
      <ConfirmDialog
        open={confirm?.kind === 'discard'}
        title="¿Descartar los cambios?"
        message="Tienes cambios sin guardar en este producto. Si continúas, se perderán."
        confirmLabel="Descartar cambios"
        cancelLabel="Seguir editando"
        onConfirm={() => {
          const proceed = confirm?.proceed;
          setConfirm(null);
          dirtyRef.current = false;
          proceed?.();
        }}
        onCancel={() => setConfirm(null)}
      />
    </div>
  );
}

// Fila: apilada en contenedor estrecho; grid sin categoría desde @2xl; grid completo desde @5xl
const ROW_GRID =
  'grid grid-cols-[minmax(0,1fr)] @2xl:grid-cols-[minmax(0,1fr)_150px_150px_92px] @5xl:grid-cols-[minmax(0,1fr)_200px_170px_170px_92px] gap-x-4 @5xl:gap-x-6 gap-y-2 items-center px-4 @2xl:px-6 py-3 min-h-[88px]';

function ProductoRow({ producto: p, first, active, onToggle, onEdit, onDelete }) {
  return (
    <li
      aria-current={active || undefined}
      className={`${ROW_GRID} transition-colors ${first ? '' : 'border-t ui-border'} ${
        active ? 'bg-[var(--bg-elevated)] shadow-[inset_3px_0_0_var(--action)]' : ''
      }`}
    >
      <div className="flex items-center gap-4 min-w-0">
        <Plate src={p.imagen} className="w-16 h-16 shrink-0">
          <span className="text-[11px] font-bold leading-tight text-center text-[#4a4d52]">Sin foto</span>
        </Plate>
        <div className="min-w-0">
          <p className={`text-base font-bold truncate ${p.activo ? 'ui-text-primary' : 'ui-text-secondary'}`}>{p.titulo}</p>
          <p className="mt-1 text-sm ui-text-secondary truncate">{p.descripcion || 'Sin descripción'}</p>
          <p className="mt-0.5 text-sm ui-text-tertiary truncate @5xl:hidden">{p.categoria}</p>
        </div>
      </div>

      <span className="hidden @5xl:block text-[15px] ui-text-secondary truncate">{p.categoria}</span>

      {/* En contenedor estrecho: switches + acciones en una fila bajo el producto */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-1 pl-20 @2xl:contents">
        <RowSwitch
          checked={p.activo}
          tone="green"
          label={p.activo ? 'Publicado' : 'Oculto'}
          ariaLabel={`Publicado: ${p.titulo}`}
          onClick={() => onToggle(p, 'activo')}
        />
        <RowSwitch
          checked={p.destacado}
          tone="ink"
          label={p.destacado ? 'Destacado' : 'No'}
          ariaLabel={`Destacado en inicio: ${p.titulo}`}
          onClick={() => onToggle(p, 'destacado')}
        />
        <div className="ml-auto @2xl:ml-0 flex justify-end gap-1">
          <button
            type="button"
            onClick={onEdit}
            aria-label={`Editar ${p.titulo}`}
            aria-expanded={active}
            className={`${cls.iconBtn} ui-text-primary`}
          >
            <IconEdit />
          </button>
          <button type="button" onClick={onDelete} aria-label={`Eliminar ${p.titulo}`} className={`${cls.iconBtn} ${cls.danger}`}>
            <IconTrash />
          </button>
        </div>
      </div>
    </li>
  );
}

function RowSwitch({ checked, tone, label, ariaLabel, onClick }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={onClick}
      className="justify-self-start inline-flex items-center gap-2.5 h-11 text-sm font-semibold ui-text-primary cursor-pointer"
    >
      <SwitchTrack checked={checked} tone={tone} />
      <span aria-hidden="true">{label}</span>
    </button>
  );
}
