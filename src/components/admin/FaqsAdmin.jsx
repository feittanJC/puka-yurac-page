import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { faqsService } from '../../services/contenido.service';
import ConfirmDialog from './ConfirmDialog';
import { cls, FormModal, IconEdit, IconTrash, ModalFooter, ModalHeader, Notice, RowSwitch, SectionHeader, SwitchRow } from './ui';

const MAX_PREGUNTA = 140;
const MAX_RESPUESTA = 600;
const byOrden = (a, b) => (a.orden ?? 0) - (b.orden ?? 0) || a.id - b.id;

const IconUp = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 19V5M6 11l6-6 6 6" />
  </svg>
);
const IconDown = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 5v14M6 13l6 6 6-6" />
  </svg>
);

/** Preguntas frecuentes de la página de inicio: crear, editar, ordenar y publicar. */
export default function FaqsAdmin() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [panel, setPanel] = useState(null); // { faq: null | {...} }
  const [confirm, setConfirm] = useState(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(null);
  const dirtyRef = useRef(false);
  const triggerRef = useRef(null);

  async function load() {
    setLoading(true);
    setError('');
    try {
      setItems(await faqsService.getAdmin());
    } catch (err) {
      setError(err?.message || 'No se pudieron cargar las preguntas');
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

  const nextOrden = useMemo(() => items.reduce((m, f) => Math.max(m, f.orden ?? 0), 0) + 1, [items]);
  const nPub = items.filter((f) => f.activo).length;

  const closeNow = useCallback(() => {
    setPanel(null);
    dirtyRef.current = false;
    const target = triggerRef.current;
    requestAnimationFrame(() => target && document.contains(target) && target.focus());
  }, []);
  function open(faq, trigger) {
    triggerRef.current = trigger ?? null;
    dirtyRef.current = false;
    setPanel({ faq });
  }
  function requestClose() {
    if (dirtyRef.current) setConfirm({ kind: 'discard' });
    else closeNow();
  }

  function handleSaved(saved, wasEdit) {
    setItems((list) => {
      const exists = list.some((f) => f.id === saved.id);
      return (exists ? list.map((f) => (f.id === saved.id ? saved : f)) : [...list, saved]).sort(byOrden);
    });
    setNotice({ tone: 'ok', text: wasEdit ? 'Pregunta actualizada.' : 'Pregunta agregada.' });
    closeNow();
  }

  async function togglePublicada(f) {
    const value = !f.activo;
    setItems((list) => list.map((x) => (x.id === f.id ? { ...x, activo: value } : x)));
    try {
      await faqsService.update(f.id, { activo: value });
    } catch (err) {
      setItems((list) => list.map((x) => (x.id === f.id ? { ...x, activo: f.activo } : x)));
      setNotice({ tone: 'error', text: `No se pudo actualizar la pregunta. ${err?.message ?? ''}`.trim() });
    }
  }

  /** Mueve una pregunta arriba/abajo y renumera el orden (1, 2, 3…). */
  async function mover(index, dir) {
    const target = index + dir;
    if (target < 0 || target >= items.length) return;
    const prev = items;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    const renumerado = next.map((f, i) => ({ ...f, orden: i + 1 }));
    setItems(renumerado);
    const cambios = renumerado.filter((f) => prev.find((p) => p.id === f.id)?.orden !== f.orden);
    try {
      await Promise.all(cambios.map((f) => faqsService.update(f.id, { orden: f.orden })));
      requestAnimationFrame(() => document.getElementById(`faq-mover-${dir < 0 ? 'up' : 'down'}-${next[target].id}`)?.focus());
    } catch (err) {
      setItems(prev);
      setNotice({ tone: 'error', text: `No se pudo cambiar el orden. ${err?.message ?? ''}`.trim() });
    }
  }

  async function confirmDelete() {
    const f = confirm?.faq;
    if (!f) return;
    setBusy(true);
    try {
      await faqsService.remove(f.id);
      setItems((list) => list.filter((x) => x.id !== f.id));
      setNotice({ tone: 'ok', text: 'Pregunta eliminada.' });
    } catch (err) {
      setNotice({ tone: 'error', text: `No se pudo eliminar la pregunta. ${err?.message ?? ''}`.trim() });
    } finally {
      setConfirm(null);
      setBusy(false);
    }
  }

  let summary = `${items.length} ${items.length === 1 ? 'pregunta' : 'preguntas'} · ${nPub} ${nPub === 1 ? 'publicada' : 'publicadas'}`;
  if (loading) summary = 'Cargando preguntas…';
  else if (error) summary = 'No se pudieron cargar las preguntas';

  return (
    <div>
      <SectionHeader
        title="Preguntas frecuentes"
        summary={summary}
        action={
          <button type="button" onClick={(e) => open(null, e.currentTarget)} className={`${cls.primary} h-12 px-[22px] text-[15px] self-start sm:self-auto shrink-0`}>
            Nueva pregunta
          </button>
        }
      />
      <p className="mt-3 max-w-[640px] text-[15px] ui-text-secondary">
        Se muestran en la página de inicio en este orden. Si no hay ninguna publicada, se ven los textos provisionales.
      </p>

      <div aria-live="polite" className="mt-6 empty:mt-0">
        <Notice notice={notice} onClose={() => setNotice(null)} />
      </div>

      <div className="mt-6 rounded-2xl ui-surface-bg overflow-hidden">
        {error && (
          <div role="alert" className="m-4 sm:m-6 p-5 rounded-xl bg-[#fdecec] text-[#7f1d1d] dark:bg-red-500/15 dark:text-red-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <p>
              <strong>No pudimos cargar las preguntas.</strong> Si es la primera vez, revisa que la migración 002 se haya
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
            <p className="text-[17px] font-bold">Aún no hay preguntas.</p>
            <button type="button" onClick={(e) => open(null, e.currentTarget)} className={`${cls.primary} mt-5 h-[52px] px-6 text-base`}>
              Agregar la primera pregunta
            </button>
          </div>
        )}
        {!loading && items.length > 0 && (
          <ol aria-label="Preguntas frecuentes en orden">
            {items.map((f, i) => (
              <li
                key={f.id}
                className={`grid grid-cols-[auto_minmax(0,1fr)] md:grid-cols-[auto_minmax(0,1fr)_150px_92px] gap-x-4 gap-y-2 items-center px-3 md:px-6 py-3 min-h-[88px] ${
                  i ? 'border-t ui-border' : ''
                }`}
              >
                <div className="flex flex-col">
                  <button
                    id={`faq-mover-up-${f.id}`}
                    type="button"
                    onClick={() => mover(i, -1)}
                    disabled={i === 0}
                    aria-label={`Subir: ${f.pregunta}`}
                    className={`${cls.iconBtn} ui-text-primary disabled:opacity-30 disabled:cursor-default`}
                  >
                    <IconUp />
                  </button>
                  <button
                    id={`faq-mover-down-${f.id}`}
                    type="button"
                    onClick={() => mover(i, 1)}
                    disabled={i === items.length - 1}
                    aria-label={`Bajar: ${f.pregunta}`}
                    className={`${cls.iconBtn} ui-text-primary disabled:opacity-30 disabled:cursor-default`}
                  >
                    <IconDown />
                  </button>
                </div>
                <div className="min-w-0">
                  <p className={`text-base font-bold ${f.activo ? 'ui-text-primary' : 'ui-text-secondary'}`}>{f.pregunta}</p>
                  <p className="mt-1 text-sm ui-text-secondary line-clamp-2">{f.respuesta}</p>
                </div>
                <div className="col-start-2 md:col-start-auto flex items-center gap-x-5 md:contents">
                  <RowSwitch
                    checked={f.activo}
                    tone="green"
                    label={f.activo ? 'Publicada' : 'Oculta'}
                    ariaLabel={`Publicada: ${f.pregunta}`}
                    onClick={() => togglePublicada(f)}
                  />
                  <div className="ml-auto md:ml-0 flex justify-end gap-1">
                    <button type="button" onClick={(e) => open(f, e.currentTarget)} aria-label={`Editar: ${f.pregunta}`} className={`${cls.iconBtn} ui-text-primary`}>
                      <IconEdit />
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirm({ kind: 'delete', faq: f })}
                      aria-label={`Eliminar: ${f.pregunta}`}
                      className={`${cls.iconBtn} ${cls.danger}`}
                    >
                      <IconTrash />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>

      <FormModal open={Boolean(panel)} labelledBy="faq-form-title" onClose={requestClose} size="md">
        {panel && (
          <FaqForm
            key={panel.faq?.id ?? 'nueva'}
            faq={panel.faq}
            nextOrden={nextOrden}
            onClose={requestClose}
            onSaved={handleSaved}
            onDirtyChange={(d) => (dirtyRef.current = d)}
          />
        )}
      </FormModal>

      <ConfirmDialog
        open={confirm?.kind === 'delete'}
        title="¿Eliminar esta pregunta?"
        message={confirm?.faq ? `“${confirm.faq.pregunta}” se quitará de la página. Esta acción no se puede deshacer.` : ''}
        confirmLabel="Eliminar pregunta"
        busy={busy}
        onConfirm={confirmDelete}
        onCancel={() => setConfirm(null)}
      />
      <ConfirmDialog
        open={confirm?.kind === 'discard'}
        title="¿Descartar los cambios?"
        message="Tienes cambios sin guardar en esta pregunta. Si continúas, se perderán."
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

function FaqForm({ faq, nextOrden, onClose, onSaved, onDirtyChange }) {
  const isEdit = Boolean(faq?.id);
  const initial = useMemo(
    () => ({ pregunta: faq?.pregunta ?? '', respuesta: faq?.respuesta ?? '', activo: faq?.activo ?? true }),
    [faq]
  );
  const [form, setForm] = useState(initial);
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const preguntaRef = useRef(null);
  const respuestaRef = useRef(null);

  const dirty = JSON.stringify(form) !== JSON.stringify(initial);
  useEffect(() => {
    onDirtyChange?.(dirty);
  }, [dirty, onDirtyChange]);

  const update = (field, value) => setForm((f) => ({ ...f, [field]: value }));
  const preguntaError = !form.pregunta.trim() ? 'Escribe la pregunta.' : '';
  const respuestaError = !form.respuesta.trim() ? 'Escribe la respuesta.' : '';

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitted(true);
    setError('');
    if (preguntaError) return preguntaRef.current?.focus();
    if (respuestaError) return respuestaRef.current?.focus();
    setSaving(true);
    try {
      const payload = { pregunta: form.pregunta.trim(), respuesta: form.respuesta.trim(), activo: form.activo };
      const saved = isEdit ? await faqsService.update(faq.id, payload) : await faqsService.create({ ...payload, orden: nextOrden });
      onSaved(saved, isEdit);
    } catch (err) {
      setError(err?.message || 'No se pudo guardar la pregunta.');
      setSaving(false);
    }
  }

  const errCls = 'border-2 border-[#b91c1c]! dark:border-[#f87171]!';
  return (
    <>
      <ModalHeader id="faq-form-title" title={isEdit ? 'Editar pregunta' : 'Nueva pregunta'} onClose={onClose} disabled={saving} />
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
        <form id="faq-form" noValidate onSubmit={handleSubmit} className="px-5 pt-6 pb-10 lg:px-8 lg:pt-8 flex flex-col gap-8">
          <div>
            <label htmlFor="fq-pregunta" className={cls.label}>
              Pregunta
            </label>
            <input
              ref={preguntaRef}
              id="fq-pregunta"
              type="text"
              autoComplete="off"
              maxLength={MAX_PREGUNTA}
              placeholder="Ej.: ¿Hacen envíos a provincias?"
              value={form.pregunta}
              onChange={(e) => update('pregunta', e.target.value)}
              aria-invalid={submitted && Boolean(preguntaError)}
              aria-describedby={submitted && preguntaError ? 'fq-pregunta-err' : undefined}
              className={`${cls.input} h-[52px] px-4 ${submitted && preguntaError ? errCls : ''}`}
            />
            {submitted && preguntaError && (
              <p id="fq-pregunta-err" className={`mt-2 ${cls.errorText}`}>
                {preguntaError}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="fq-respuesta" className={cls.label}>
              Respuesta
            </label>
            <textarea
              ref={respuestaRef}
              id="fq-respuesta"
              rows={6}
              maxLength={MAX_RESPUESTA}
              value={form.respuesta}
              onChange={(e) => update('respuesta', e.target.value.slice(0, MAX_RESPUESTA))}
              aria-invalid={submitted && Boolean(respuestaError)}
              aria-describedby={`fq-respuesta-count${submitted && respuestaError ? ' fq-respuesta-err' : ''}`}
              className={`${cls.input} px-4 py-3.5 leading-normal resize-y ${submitted && respuestaError ? errCls : ''}`}
            />
            <div className="mt-1.5 flex justify-between gap-4">
              <p id="fq-respuesta-err" className={cls.errorText}>
                {submitted ? respuestaError : ''}
              </p>
              <p id="fq-respuesta-count" className="text-sm ui-text-secondary shrink-0">
                {form.respuesta.length} / {MAX_RESPUESTA}
                <span className="sr-only"> caracteres</span>
              </p>
            </div>
          </div>
          <div className="border-t ui-border">
            <SwitchRow
              id="fq-sw-pub"
              title="Publicar en la página"
              description="Si la apagas, queda guardada pero no se muestra."
              checked={form.activo}
              tone="green"
              onToggle={() => update('activo', !form.activo)}
            />
          </div>
        </form>
      </div>
      <ModalFooter formId="faq-form" saving={saving} saveLabel="Guardar pregunta" error={error} onCancel={onClose} />
    </>
  );
}
