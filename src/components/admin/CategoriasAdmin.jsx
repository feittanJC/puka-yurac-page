import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { categoriasService } from '../../services/contenido.service';
import ConfirmDialog from './ConfirmDialog';
import { cls, FormModal, IconEdit, IconTrash, ModalFooter, ModalHeader, Notice, RowSwitch, SectionHeader, SwitchRow } from './ui';

const byOrden = (a, b) => (a.orden ?? 0) - (b.orden ?? 0) || a.id - b.id;
const fmt = (n) => Number(n).toLocaleString('es-PE');

const Arrow = ({ d }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
);

/** Tipos de producto: índice "Qué imprimimos", tipos del cotizador y sugerencias de categoría en Productos. */
export default function CategoriasAdmin() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [panel, setPanel] = useState(null);
  const [confirm, setConfirm] = useState(null); // { kind: 'delete', cat, usados } | { kind: 'discard' }
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(null);
  const dirtyRef = useRef(false);
  const triggerRef = useRef(null);

  async function load() {
    setLoading(true);
    setError('');
    try {
      setItems(await categoriasService.getAdmin());
    } catch (err) {
      setError(err?.message || 'No se pudieron cargar las categorías');
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

  const nextOrden = useMemo(() => items.reduce((m, c) => Math.max(m, c.orden ?? 0), 0) + 1, [items]);
  const nPub = items.filter((c) => c.activo).length;

  const closeNow = useCallback(() => {
    setPanel(null);
    dirtyRef.current = false;
    const target = triggerRef.current;
    requestAnimationFrame(() => target && document.contains(target) && target.focus());
  }, []);
  const onDirtyChange = useCallback((d) => {
    dirtyRef.current = d;
  }, []);
  function open(cat, trigger) {
    triggerRef.current = trigger ?? null;
    dirtyRef.current = false;
    setPanel({ cat });
  }
  function requestClose() {
    if (dirtyRef.current) setConfirm({ kind: 'discard' });
    else closeNow();
  }

  function handleSaved(saved, wasEdit) {
    setItems((list) => {
      const exists = list.some((c) => c.id === saved.id);
      return (exists ? list.map((c) => (c.id === saved.id ? saved : c)) : [...list, saved]).sort(byOrden);
    });
    setNotice({ tone: 'ok', text: wasEdit ? `Cambios guardados en “${saved.nombre}”.` : `“${saved.nombre}” se creó.` });
    closeNow();
  }

  async function toggle(c, field) {
    const value = !c[field];
    setItems((list) => list.map((x) => (x.id === c.id ? { ...x, [field]: value } : x)));
    try {
      await categoriasService.update(c.id, { [field]: value });
    } catch (err) {
      setItems((list) => list.map((x) => (x.id === c.id ? { ...x, [field]: c[field] } : x)));
      setNotice({ tone: 'error', text: `No se pudo actualizar “${c.nombre}”. ${err?.message ?? ''}`.trim() });
    }
  }

  async function mover(index, dir) {
    const target = index + dir;
    if (target < 0 || target >= items.length) return;
    const prev = items;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    const renumerado = next.map((c, i) => ({ ...c, orden: i + 1 }));
    setItems(renumerado);
    const cambios = renumerado.filter((c) => prev.find((p) => p.id === c.id)?.orden !== c.orden);
    try {
      await Promise.all(cambios.map((c) => categoriasService.update(c.id, { orden: c.orden })));
      requestAnimationFrame(() => document.getElementById(`cat-mover-${dir < 0 ? 'up' : 'down'}-${next[target].id}`)?.focus());
    } catch (err) {
      setItems(prev);
      setNotice({ tone: 'error', text: `No se pudo cambiar el orden. ${err?.message ?? ''}`.trim() });
    }
  }

  async function pedirBorrado(cat) {
    let usados = null;
    try {
      usados = await categoriasService.contarProductos(cat.nombre);
    } catch {
      usados = null;
    }
    setConfirm({ kind: 'delete', cat, usados });
  }

  async function confirmDelete() {
    const c = confirm?.cat;
    if (!c) return;
    setBusy(true);
    try {
      await categoriasService.remove(c.id);
      setItems((list) => list.filter((x) => x.id !== c.id));
      setNotice({ tone: 'ok', text: `“${c.nombre}” se eliminó.` });
    } catch (err) {
      setNotice({ tone: 'error', text: `No se pudo eliminar “${c.nombre}”. ${err?.message ?? ''}`.trim() });
    } finally {
      setConfirm(null);
      setBusy(false);
    }
  }

  let summary = `${items.length} ${items.length === 1 ? 'categoría' : 'categorías'} · ${nPub} ${nPub === 1 ? 'publicada' : 'publicadas'}`;
  if (loading) summary = 'Cargando categorías…';
  else if (error) summary = 'No se pudieron cargar las categorías';

  let deleteMsg = 'Se quitará del índice “Qué imprimimos” y del cotizador. Esta acción no se puede deshacer.';
  if (confirm?.kind === 'delete') {
    if (confirm.usados > 0)
      deleteMsg = `${confirm.usados} ${confirm.usados === 1 ? 'producto usa' : 'productos usan'} esta categoría. Seguirán en el catálogo con su categoría actual, pero el enlace del inicio y el cotizador ya no la mostrarán. Si solo quieres esconderla, apaga “Publicada”. Esta acción no se puede deshacer.`;
    else if (confirm.usados === null)
      deleteMsg = 'No pudimos verificar si hay productos con esta categoría. ' + deleteMsg;
  }

  return (
    <div>
      <SectionHeader
        title="Categorías"
        summary={summary}
        action={
          <button type="button" onClick={(e) => open(null, e.currentTarget)} className={`${cls.primary} h-12 px-[22px] text-[15px] self-start sm:self-auto shrink-0`}>
            Nueva categoría
          </button>
        }
      />
      <p className="mt-3 max-w-[680px] text-[15px] ui-text-secondary">
        Son los tipos de producto del índice “Qué imprimimos” y del cotizador, con sus cantidades sugeridas. También se
        sugieren al crear productos. Si no hay ninguna publicada, el sitio usa las categorías originales.
      </p>

      <div aria-live="polite" className="mt-6 empty:mt-0">
        <Notice notice={notice} onClose={() => setNotice(null)} />
      </div>

      <div className="mt-6 rounded-2xl ui-surface-bg overflow-hidden">
        {error && (
          <div role="alert" className="m-4 sm:m-6 p-5 rounded-xl bg-[#fdecec] text-[#7f1d1d] dark:bg-red-500/15 dark:text-red-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <p>
              <strong>No pudimos cargar las categorías.</strong> Si es la primera vez, revisa que la migración 003 se haya
              ejecutado en Supabase.
            </p>
            <button type="button" onClick={load} className={`${cls.secondary} h-11 px-4 text-[15px] shrink-0`}>
              Reintentar
            </button>
          </div>
        )}
        {loading && <p className="px-6 py-16 text-center ui-text-secondary">Cargando…</p>}
        {!loading && !error && items.length === 0 && (
          <div className="px-6 py-20 text-center">
            <p className="text-[17px] font-bold">Aún no hay categorías.</p>
            <button type="button" onClick={(e) => open(null, e.currentTarget)} className={`${cls.primary} mt-5 h-[52px] px-6 text-base`}>
              Agregar la primera categoría
            </button>
          </div>
        )}
        {!loading && items.length > 0 && (
          <ol aria-label="Categorías en orden">
            {items.map((c, i) => (
              <li
                key={c.id}
                className={`grid grid-cols-[auto_minmax(0,1fr)] lg:grid-cols-[auto_minmax(0,1fr)_140px_170px_92px] gap-x-4 gap-y-1 items-center px-3 md:px-6 py-3 min-h-[88px] ${
                  i ? 'border-t ui-border' : ''
                }`}
              >
                <div className="flex flex-col">
                  <button
                    id={`cat-mover-up-${c.id}`}
                    type="button"
                    onClick={() => mover(i, -1)}
                    disabled={i === 0}
                    aria-label={`Subir: ${c.nombre}`}
                    className={`${cls.iconBtn} ui-text-primary disabled:opacity-30 disabled:cursor-default`}
                  >
                    <Arrow d="M12 19V5M6 11l6-6 6 6" />
                  </button>
                  <button
                    id={`cat-mover-down-${c.id}`}
                    type="button"
                    onClick={() => mover(i, 1)}
                    disabled={i === items.length - 1}
                    aria-label={`Bajar: ${c.nombre}`}
                    className={`${cls.iconBtn} ui-text-primary disabled:opacity-30 disabled:cursor-default`}
                  >
                    <Arrow d="M12 5v14M6 13l6 6 6-6" />
                  </button>
                </div>
                <div className="min-w-0">
                  <p className={`text-base font-bold ${c.activo ? 'ui-text-primary' : 'ui-text-secondary'}`}>{c.nombre}</p>
                  <p className="mt-1 text-sm ui-text-secondary">
                    {c.spec ? <span className="font-mono text-[13px]">{c.spec}</span> : 'Sin acabado típico'}
                    <span className="ui-text-tertiary"> · Cantidades: {(c.cantidades ?? []).map(fmt).join(', ')}</span>
                  </p>
                </div>
                <div className="col-start-2 lg:col-start-auto flex flex-wrap items-center gap-x-5 lg:contents">
                  <RowSwitch
                    checked={c.activo}
                    tone="green"
                    label={c.activo ? 'Publicada' : 'Oculta'}
                    ariaLabel={`Publicada: ${c.nombre}`}
                    onClick={() => toggle(c, 'activo')}
                  />
                  <RowSwitch
                    checked={c.mostrar_en_inicio}
                    tone="ink"
                    label={c.mostrar_en_inicio ? 'En el inicio' : 'Solo cotizador'}
                    ariaLabel={`Mostrar en “Qué imprimimos”: ${c.nombre}`}
                    onClick={() => toggle(c, 'mostrar_en_inicio')}
                  />
                  <div className="ml-auto lg:ml-0 flex justify-end gap-1">
                    <button type="button" onClick={(e) => open(c, e.currentTarget)} aria-label={`Editar ${c.nombre}`} className={`${cls.iconBtn} ui-text-primary`}>
                      <IconEdit />
                    </button>
                    <button type="button" onClick={() => pedirBorrado(c)} aria-label={`Eliminar ${c.nombre}`} className={`${cls.iconBtn} ${cls.danger}`}>
                      <IconTrash />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>

      <FormModal open={Boolean(panel)} labelledBy="cat-form-title" onClose={requestClose} size="md">
        {panel && (
          <CategoriaForm
            key={panel.cat?.id ?? 'nueva'}
            cat={panel.cat}
            nombresUsados={items.filter((x) => x.id !== panel.cat?.id).map((x) => x.nombre.toLowerCase())}
            nextOrden={nextOrden}
            onClose={requestClose}
            onSaved={handleSaved}
            onDirtyChange={onDirtyChange}
          />
        )}
      </FormModal>

      <ConfirmDialog
        open={confirm?.kind === 'delete'}
        title={confirm?.kind === 'delete' ? `¿Eliminar “${confirm.cat.nombre}”?` : ''}
        message={deleteMsg}
        confirmLabel="Eliminar categoría"
        busy={busy}
        onConfirm={confirmDelete}
        onCancel={() => setConfirm(null)}
      />
      <ConfirmDialog
        open={confirm?.kind === 'discard'}
        title="¿Descartar los cambios?"
        message="Tienes cambios sin guardar en esta categoría. Si continúas, se perderán."
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

function CategoriaForm({ cat, nombresUsados, nextOrden, onClose, onSaved, onDirtyChange }) {
  const isEdit = Boolean(cat?.id);
  const initial = useMemo(
    () => ({
      nombre: cat?.nombre ?? '',
      spec: cat?.spec ?? '',
      cantidades: (cat?.cantidades?.length === 3 ? cat.cantidades : [50, 100, 250]).map(String),
      activo: cat?.activo ?? true,
      mostrar_en_inicio: cat?.mostrar_en_inicio ?? true,
    }),
    [cat]
  );
  const [form, setForm] = useState(initial);
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const nombreRef = useRef(null);

  const dirty = JSON.stringify(form) !== JSON.stringify(initial);
  useEffect(() => {
    onDirtyChange?.(dirty);
  }, [dirty, onDirtyChange]);

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const nombre = form.nombre.trim();
  const nombreError = !nombre
    ? 'Escribe el nombre de la categoría.'
    : nombresUsados.includes(nombre.toLowerCase())
      ? 'Ya existe una categoría con ese nombre.'
      : '';
  const cantidades = form.cantidades.map((v) => Number(v));
  const cantError = cantidades.some((n) => !Number.isInteger(n) || n < 1)
    ? 'Las tres cantidades deben ser números enteros mayores que 0.'
    : '';
  const renombrada = isEdit && nombre && nombre !== cat.nombre;

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitted(true);
    setError('');
    if (nombreError) return nombreRef.current?.focus();
    if (cantError) return document.getElementById('ct-cant-0')?.focus();
    setSaving(true);
    try {
      const payload = {
        nombre,
        spec: form.spec.trim() || null,
        cantidades: [...cantidades].sort((a, b) => a - b),
        activo: form.activo,
        mostrar_en_inicio: form.mostrar_en_inicio,
      };
      const saved = isEdit ? await categoriasService.update(cat.id, payload) : await categoriasService.create({ ...payload, orden: nextOrden });
      onSaved(saved, isEdit);
    } catch (err) {
      setError(err?.message || 'No se pudo guardar la categoría.');
      setSaving(false);
    }
  }

  const errCls = 'border-2 border-[#b91c1c]! dark:border-[#f87171]!';
  return (
    <>
      <ModalHeader id="cat-form-title" title={isEdit ? 'Editar categoría' : 'Nueva categoría'} srDetail={isEdit ? cat.nombre : ''} onClose={onClose} disabled={saving} />
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
        <form id="cat-form" noValidate onSubmit={handleSubmit} className="px-5 pt-6 pb-10 lg:px-8 lg:pt-8 flex flex-col gap-8">
          <div>
            <label htmlFor="ct-nombre" className={cls.label}>
              Nombre
            </label>
            <input
              ref={nombreRef}
              id="ct-nombre"
              type="text"
              autoComplete="off"
              maxLength={60}
              placeholder="Ej.: Agendas corporativas"
              value={form.nombre}
              onChange={(e) => update('nombre', e.target.value)}
              aria-invalid={submitted && Boolean(nombreError)}
              aria-describedby={`ct-nombre-hint${submitted && nombreError ? ' ct-nombre-err' : ''}`}
              className={`${cls.input} h-[52px] px-4 ${submitted && nombreError ? errCls : ''}`}
            />
            {submitted && nombreError && (
              <p id="ct-nombre-err" className={`mt-2 ${cls.errorText}`}>
                {nombreError}
              </p>
            )}
            <p id="ct-nombre-hint" className={`mt-2 ${renombrada ? 'text-sm font-semibold ui-text-primary' : cls.hint}`}>
              {renombrada
                ? `Los productos con la categoría “${cat.nombre}” no se cambian solos: edítalos en Productos para que el enlace del inicio los encuentre.`
                : 'Usa el mismo nombre que pones como categoría en tus productos: el enlace del inicio filtra el catálogo por este nombre.'}
            </p>
          </div>

          <div>
            <label htmlFor="ct-spec" className={cls.label}>
              Acabado típico <span className="font-normal ui-text-secondary">(opcional)</span>
            </label>
            <input
              id="ct-spec"
              type="text"
              autoComplete="off"
              maxLength={60}
              placeholder="Ej.: Tapa dura · Hot stamping"
              value={form.spec}
              onChange={(e) => update('spec', e.target.value)}
              aria-describedby="ct-spec-hint"
              className={`${cls.input} h-12 px-4 font-mono text-[15px]`}
            />
            <p id="ct-spec-hint" className={`mt-2 ${cls.hint}`}>
              Texto pequeño bajo el nombre en “Qué imprimimos”.
            </p>
          </div>

          <fieldset aria-describedby={`ct-cant-hint${submitted && cantError ? ' ct-cant-err' : ''}`}>
            <legend className={cls.label}>Cantidades sugeridas en el cotizador</legend>
            <div className="grid grid-cols-3 gap-3 max-w-[420px]">
              {form.cantidades.map((v, i) => (
                <div key={i}>
                  <label htmlFor={`ct-cant-${i}`} className="sr-only">
                    Cantidad {i + 1}
                  </label>
                  <input
                    id={`ct-cant-${i}`}
                    type="number"
                    inputMode="numeric"
                    min={1}
                    step={1}
                    value={v}
                    onChange={(e) =>
                      update(
                        'cantidades',
                        form.cantidades.map((x, j) => (j === i ? e.target.value : x))
                      )
                    }
                    aria-invalid={submitted && Boolean(cantError)}
                    className={`${cls.input} h-12 px-4 tabular-nums ${submitted && cantError ? errCls : ''}`}
                  />
                </div>
              ))}
            </div>
            {submitted && cantError && (
              <p id="ct-cant-err" className={`mt-2 ${cls.errorText}`}>
                {cantError}
              </p>
            )}
            <p id="ct-cant-hint" className={`mt-2 ${cls.hint}`}>
              Aparecen como botones junto a la cantidad. La del medio queda elegida al abrir el cotizador.
            </p>
          </fieldset>

          <div className="border-t ui-border">
            <SwitchRow
              id="ct-sw-pub"
              title="Publicada"
              description="Si la apagas, no aparece ni en el inicio ni en el cotizador."
              checked={form.activo}
              tone="green"
              onToggle={() => update('activo', !form.activo)}
            />
            <SwitchRow
              id="ct-sw-inicio"
              title="Mostrar en “Qué imprimimos”"
              description="Si la apagas, solo aparece en el cotizador."
              checked={form.mostrar_en_inicio}
              tone="ink"
              onToggle={() => update('mostrar_en_inicio', !form.mostrar_en_inicio)}
            />
          </div>
        </form>
      </div>
      <ModalFooter formId="cat-form" saving={saving} saveLabel="Guardar categoría" error={error} onCancel={onClose} />
    </>
  );
}
