import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { productosService } from '../../services/productos.service';
import { trabajosService } from '../../services/contenido.service';
import ConfirmDialog from './ConfirmDialog';
import TrabajoForm from './TrabajoForm';
import { cls, FormModal, IconEdit, IconTrash, Notice, Plate, RowSwitch, SectionHeader } from './ui';

const byOrden = (a, b) => (a.orden ?? 0) - (b.orden ?? 0) || a.id - b.id;

/** Lista de trabajos realizados (galería de la página de inicio). */
export default function TrabajosAdmin() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [panel, setPanel] = useState(null); // { trabajo: null | {...} }
  const [confirm, setConfirm] = useState(null); // { kind: 'delete', trabajo } | { kind: 'discard' }
  const [deleting, setDeleting] = useState(false);
  const [notice, setNotice] = useState(null);
  const dirtyRef = useRef(false);
  const triggerRef = useRef(null);

  async function load() {
    setLoading(true);
    setError('');
    try {
      setItems(await trabajosService.getAdmin());
    } catch (err) {
      setError(err?.message || 'No se pudieron cargar los trabajos');
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (notice?.tone !== 'ok') return;
    const t = setTimeout(() => setNotice(null), 5000);
    return () => clearTimeout(t);
  }, [notice]);

  const categorias = useMemo(
    () => [...new Set(items.map((t) => t.categoria).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'es')),
    [items]
  );
  const nextOrden = useMemo(() => items.reduce((m, t) => Math.max(m, t.orden ?? 0), 0) + 1, [items]);
  const nPub = items.filter((t) => t.activo).length;

  const closeNow = useCallback(() => {
    setPanel(null);
    dirtyRef.current = false;
    const target = triggerRef.current;
    requestAnimationFrame(() => target && document.contains(target) && target.focus());
  }, []);

  function open(trabajo, trigger) {
    triggerRef.current = trigger ?? null;
    dirtyRef.current = false;
    setPanel({ trabajo });
  }
  function requestClose() {
    if (dirtyRef.current) setConfirm({ kind: 'discard' });
    else closeNow();
  }
  const onDirtyChange = useCallback((d) => {
    dirtyRef.current = d;
  }, []);

  function handleSaved(saved, wasEdit) {
    setItems((list) => {
      const exists = list.some((t) => t.id === saved.id);
      return (exists ? list.map((t) => (t.id === saved.id ? saved : t)) : [...list, saved]).sort(byOrden);
    });
    setNotice({ tone: 'ok', text: wasEdit ? `Cambios guardados en “${saved.titulo}”.` : `“${saved.titulo}” se creó.` });
    closeNow();
  }

  async function toggle(t, field) {
    const value = !t[field];
    setItems((list) => list.map((x) => (x.id === t.id ? { ...x, [field]: value } : x)));
    try {
      const saved = await trabajosService.update(t.id, { [field]: value });
      setItems((list) => list.map((x) => (x.id === saved.id ? saved : x)));
    } catch (err) {
      setItems((list) => list.map((x) => (x.id === t.id ? { ...x, [field]: t[field] } : x)));
      setNotice({ tone: 'error', text: `No se pudo actualizar “${t.titulo}”. ${err?.message ?? ''}`.trim() });
    }
  }

  async function confirmDelete() {
    const t = confirm?.trabajo;
    if (!t) return;
    setDeleting(true);
    try {
      await trabajosService.remove(t.id);
      if (t.imagen) productosService.deleteImagen(t.imagen).catch(() => {});
      setItems((list) => list.filter((x) => x.id !== t.id));
      setNotice({ tone: 'ok', text: `“${t.titulo}” se eliminó.` });
    } catch (err) {
      setNotice({ tone: 'error', text: `No se pudo eliminar “${t.titulo}”. ${err?.message ?? ''}`.trim() });
    } finally {
      setConfirm(null);
      setDeleting(false);
    }
  }

  let summary = `${items.length} ${items.length === 1 ? 'trabajo' : 'trabajos'} · ${nPub} ${nPub === 1 ? 'publicado' : 'publicados'}`;
  if (loading) summary = 'Cargando trabajos…';
  else if (error) summary = 'No se pudieron cargar los trabajos';

  return (
    <div>
      <SectionHeader
        title="Trabajos realizados"
        summary={summary}
        action={
          <button
            type="button"
            onClick={(e) => open(null, e.currentTarget)}
            className={`${cls.primary} h-12 px-[22px] text-[15px] self-start sm:self-auto shrink-0`}
          >
            Nuevo trabajo
          </button>
        }
      />
      <p className="mt-3 max-w-[640px] text-[15px] ui-text-secondary">
        Aparecen en la galería “Trabajos que salieron del taller” de la página de inicio. Si no hay ninguno publicado, la
        sección no se muestra.
      </p>

      <div aria-live="polite" className="mt-6 empty:mt-0">
        <Notice notice={notice} onClose={() => setNotice(null)} />
      </div>

      <div className="mt-6 rounded-2xl ui-surface-bg overflow-hidden">
        {error && (
          <div role="alert" className="m-4 sm:m-6 p-5 rounded-xl bg-[#fdecec] text-[#7f1d1d] dark:bg-red-500/15 dark:text-red-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <p>
              <strong>No pudimos cargar los trabajos.</strong> Si es la primera vez, revisa que la migración 002 se haya
              ejecutado en Supabase.
            </p>
            <button type="button" onClick={load} className={`${cls.secondary} h-11 px-4 text-[15px] shrink-0`}>
              Reintentar
            </button>
          </div>
        )}

        {loading && <p className="px-6 py-16 text-center ui-text-secondary">Cargando…</p>}

        {!loading && !error && items.length === 0 && (
          <div className="px-6 py-20 flex flex-col items-center text-center">
            <h2 className="font-sans [font-stretch:110%] text-[28px] leading-[1.1] font-extrabold tracking-[-0.02em]">
              Aún no hay trabajos
            </h2>
            <p className="mt-3 mb-7 max-w-[460px] text-[17px] leading-[1.55] ui-text-secondary">
              Sube la foto de un pedido terminado, ponle un título y, si quieres, el nombre del cliente.
            </p>
            <button type="button" onClick={(e) => open(null, e.currentTarget)} className={`${cls.primary} h-[52px] px-6 text-base`}>
              Agregar el primer trabajo
            </button>
          </div>
        )}

        {!loading && items.length > 0 && (
          <ul aria-label="Trabajos realizados">
            {items.map((t, i) => (
              <li
                key={t.id}
                className={`grid grid-cols-[minmax(0,1fr)] md:grid-cols-[minmax(0,1fr)_150px_150px_92px] gap-x-4 gap-y-2 items-center px-4 md:px-6 py-3 min-h-[88px] ${
                  i ? 'border-t ui-border' : ''
                }`}
              >
                <div className="flex items-center gap-4 min-w-0">
                  <Plate src={t.imagen} className="w-16 h-16 shrink-0">
                    <span className="text-[11px] font-bold leading-tight text-center text-[#4a4d52]">Sin foto</span>
                  </Plate>
                  <div className="min-w-0">
                    <p className={`text-base font-bold truncate ${t.activo ? 'ui-text-primary' : 'ui-text-secondary'}`}>{t.titulo}</p>
                    <p className="mt-1 text-sm ui-text-secondary truncate">
                      {[t.cliente, t.categoria].filter(Boolean).join(' · ') || 'Sin cliente ni categoría'}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-x-5 pl-20 md:contents">
                  <RowSwitch
                    checked={t.activo}
                    tone="green"
                    label={t.activo ? 'Publicado' : 'Oculto'}
                    ariaLabel={`Publicado: ${t.titulo}`}
                    onClick={() => toggle(t, 'activo')}
                  />
                  <RowSwitch
                    checked={t.destacado}
                    tone="ink"
                    label={t.destacado ? 'Primero' : 'Normal'}
                    ariaLabel={`Mostrar primero: ${t.titulo}`}
                    onClick={() => toggle(t, 'destacado')}
                  />
                  <div className="ml-auto md:ml-0 flex justify-end gap-1">
                    <button type="button" onClick={(e) => open(t, e.currentTarget)} aria-label={`Editar ${t.titulo}`} className={`${cls.iconBtn} ui-text-primary`}>
                      <IconEdit />
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirm({ kind: 'delete', trabajo: t })}
                      aria-label={`Eliminar ${t.titulo}`}
                      className={`${cls.iconBtn} ${cls.danger}`}
                    >
                      <IconTrash />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <FormModal open={Boolean(panel)} labelledBy="trabajo-title" onClose={requestClose}>
        {panel && (
          <TrabajoForm
            key={panel.trabajo?.id ?? 'nuevo'}
            trabajo={panel.trabajo}
            categorias={categorias}
            nextOrden={nextOrden}
            onClose={requestClose}
            onSaved={handleSaved}
            onDirtyChange={onDirtyChange}
          />
        )}
      </FormModal>

      <ConfirmDialog
        open={confirm?.kind === 'delete'}
        title={confirm?.kind === 'delete' ? `¿Eliminar “${confirm.trabajo.titulo}”?` : ''}
        message="Se quitará de la galería de la página de inicio. Esta acción no se puede deshacer."
        confirmLabel="Eliminar trabajo"
        busy={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setConfirm(null)}
      />
      <ConfirmDialog
        open={confirm?.kind === 'discard'}
        title="¿Descartar los cambios?"
        message="Tienes cambios sin guardar en este trabajo. Si continúas, se perderán."
        confirmLabel="Descartar cambios"
        cancelLabel="Seguir editando"
        onConfirm={() => {
          setConfirm(null);
          closeNow();
        }}
        onCancel={() => setConfirm(null)}
      />
    </div>
  );
}
