import { useEffect, useMemo, useRef, useState } from 'react';
import { productosService } from '../../services/productos.service';
import { trabajosService } from '../../services/contenido.service';
import { cls, IconUpload, ModalFooter, ModalHeader, Plate, SwitchRow } from './ui';

const MAX_DESC = 160;
const MAX_IMG_MB = 5;
const FORM_ID = 'trabajo-form';

function initialState(t, nextOrden) {
  return {
    titulo: t?.titulo ?? '',
    cliente: t?.cliente ?? '',
    categoria: t?.categoria ?? '',
    descripcion: t?.descripcion ?? '',
    spec: t?.spec ?? '',
    imagen: t?.imagen ?? '',
    activo: t?.activo ?? true,
    destacado: t?.destacado ?? false,
    orden: t?.orden ?? nextOrden ?? 0,
  };
}

/** Crear / editar un trabajo realizado (foto, título, cliente, categoría, detalle técnico). */
export default function TrabajoForm({ trabajo, categorias, nextOrden, onClose, onSaved, onDirtyChange }) {
  const isEdit = Boolean(trabajo?.id);
  const initial = useMemo(() => initialState(trabajo, nextOrden), [trabajo, nextOrden]);
  const [form, setForm] = useState(initial);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(initial.imagen);
  const [imgError, setImgError] = useState('');
  const [dragging, setDragging] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef(null);
  const tituloRef = useRef(null);

  useEffect(() => {
    if (!file) return;
    return () => URL.revokeObjectURL(preview);
  }, [file, preview]);

  const dirty =
    Boolean(file) ||
    JSON.stringify({ ...form, orden: Number(form.orden) || 0 }) !==
      JSON.stringify({ ...initial, orden: Number(initial.orden) || 0 });
  useEffect(() => {
    onDirtyChange?.(dirty);
  }, [dirty, onDirtyChange]);

  const update = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  function acceptFile(selected) {
    if (!selected) return;
    if (!selected.type.startsWith('image/')) return setImgError('El archivo debe ser una imagen (JPG, PNG o WebP).');
    if (selected.size > MAX_IMG_MB * 1024 * 1024)
      return setImgError(`La imagen pesa más de ${MAX_IMG_MB} MB. Elige una más liviana.`);
    setImgError('');
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  }

  function removeImage() {
    setFile(null);
    setPreview('');
    update('imagen', '');
    if (fileRef.current) fileRef.current.value = '';
  }

  const tituloError = !form.titulo.trim() ? 'Escribe un título para el trabajo.' : '';
  const showTituloError = Boolean(tituloError) && submitted;

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitted(true);
    setError('');
    if (tituloError) {
      tituloRef.current?.focus();
      return;
    }
    setSaving(true);
    try {
      let imagen = form.imagen || null;
      if (file) imagen = await productosService.uploadImagen(file, 'trabajos');
      const payload = {
        titulo: form.titulo.trim(),
        cliente: form.cliente.trim() || null,
        categoria: form.categoria.trim() || null,
        descripcion: form.descripcion.trim() || null,
        spec: form.spec.trim() || null,
        imagen,
        activo: form.activo,
        destacado: form.destacado,
        orden: Number(form.orden) || 0,
      };
      const saved = isEdit ? await trabajosService.update(trabajo.id, payload) : await trabajosService.create(payload);
      if (isEdit && trabajo.imagen && trabajo.imagen !== saved.imagen) {
        productosService.deleteImagen(trabajo.imagen).catch(() => {});
      }
      onSaved(saved, isEdit);
    } catch (err) {
      setError(err?.message || 'No se pudo guardar el trabajo. Inténtalo de nuevo.');
      setSaving(false);
    }
  }

  const catQuery = form.categoria.trim();

  return (
    <>
      <ModalHeader
        id="trabajo-title"
        title={isEdit ? 'Editar trabajo' : 'Nuevo trabajo'}
        srDetail={isEdit ? trabajo.titulo : ''}
        onClose={onClose}
        disabled={saving}
      />
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
        <form
          id={FORM_ID}
          noValidate
          onSubmit={handleSubmit}
          className="px-5 pt-6 pb-10 grid gap-10 items-start lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-12 lg:px-8 lg:pt-8"
        >
          <div className="flex flex-col gap-8 min-w-0">
            {/* Foto */}
            <div>
              <p id="tr-foto-label" className={cls.label}>
                Foto del trabajo
              </p>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="sr-only"
                tabIndex={-1}
                aria-hidden="true"
                onChange={(e) => acceptFile(e.target.files?.[0])}
              />
              {preview ? (
                <>
                  <Plate src={preview} alt="Foto cargada" className="h-[220px] lg:h-[280px]" padding="p-5 lg:p-7" radius="rounded-2xl" />
                  <div className="mt-2.5 grid grid-cols-2 lg:flex gap-2">
                    <button type="button" onClick={() => fileRef.current?.click()} className={`${cls.secondary} h-12 lg:h-11 px-4 text-[15px]`}>
                      Cambiar foto
                    </button>
                    <button
                      type="button"
                      onClick={removeImage}
                      className={`inline-flex items-center justify-center h-12 lg:h-11 px-4 rounded-xl text-[15px] font-semibold cursor-pointer hover:bg-[var(--bg-elevated)] ${cls.danger}`}
                    >
                      Quitar foto
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    aria-labelledby="tr-foto-label tr-foto-cta"
                    aria-describedby="tr-foto-hint"
                    onClick={() => fileRef.current?.click()}
                    onDragEnter={(e) => {
                      e.preventDefault();
                      setDragging(true);
                    }}
                    onDragOver={(e) => e.preventDefault()}
                    onDragLeave={() => setDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDragging(false);
                      acceptFile(e.dataTransfer.files?.[0]);
                    }}
                    className={`w-full h-[180px] lg:h-[240px] rounded-2xl border-2 border-dashed [&>*]:pointer-events-none flex flex-col items-center justify-center gap-2.5 px-6 text-center ui-text-primary cursor-pointer transition-colors ${
                      dragging ? 'border-[var(--action)] bg-[var(--bg-elevated)]' : 'border-[var(--border-input)] ui-surface-bg hover:bg-[var(--bg-elevated)]'
                    }`}
                  >
                    <IconUpload />
                    <span id="tr-foto-cta" className="text-[17px] font-bold">
                      <span className="lg:hidden">Tomar foto o elegir de la galería</span>
                      <span className="hidden lg:inline">Arrastra una foto o haz clic para elegirla</span>
                    </span>
                  </button>
                  <p id="tr-foto-hint" className={`mt-2 ${cls.hint}`}>
                    Foto real del trabajo terminado. JPG, PNG o WebP, máximo {MAX_IMG_MB} MB.
                  </p>
                </>
              )}
              {imgError && (
                <p role="alert" className={`mt-2 ${cls.errorText}`}>
                  {imgError}
                </p>
              )}
            </div>

            {/* Título */}
            <div>
              <label htmlFor="tr-titulo" className={cls.label}>
                Título
              </label>
              <input
                ref={tituloRef}
                id="tr-titulo"
                type="text"
                autoComplete="off"
                maxLength={90}
                placeholder="Ej.: Cuadernos anillados corporativos"
                value={form.titulo}
                onChange={(e) => update('titulo', e.target.value)}
                aria-invalid={showTituloError}
                aria-describedby={showTituloError ? 'tr-titulo-err' : undefined}
                className={`${cls.input} h-[52px] px-4 ${showTituloError ? 'border-2 border-[#b91c1c]! dark:border-[#f87171]!' : ''}`}
              />
              {showTituloError && (
                <p id="tr-titulo-err" className={`mt-2 ${cls.errorText}`}>
                  {tituloError}
                </p>
              )}
            </div>

            <div className="grid gap-8 sm:grid-cols-2 sm:gap-6">
              <div>
                <label htmlFor="tr-cliente" className={cls.label}>
                  Cliente <span className="font-normal ui-text-secondary">(opcional)</span>
                </label>
                <input
                  id="tr-cliente"
                  type="text"
                  autoComplete="off"
                  maxLength={80}
                  value={form.cliente}
                  onChange={(e) => update('cliente', e.target.value)}
                  className={`${cls.input} h-12 px-4`}
                />
              </div>
              <div>
                <label htmlFor="tr-categoria" className={cls.label}>
                  Categoría <span className="font-normal ui-text-secondary">(opcional)</span>
                </label>
                <input
                  id="tr-categoria"
                  type="text"
                  autoComplete="off"
                  maxLength={60}
                  list="tr-categorias"
                  value={form.categoria}
                  onChange={(e) => update('categoria', e.target.value)}
                  aria-describedby="tr-categoria-hint"
                  className={`${cls.input} h-12 px-4`}
                />
                <datalist id="tr-categorias">
                  {categorias.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
                <p id="tr-categoria-hint" className={`mt-2 ${cls.hint}`}>
                  Sirve para filtrar la galería.
                </p>
              </div>
            </div>
            {categorias.length > 0 && (
              <div role="group" aria-label="Categorías usadas" className="-mt-5 flex flex-wrap gap-2">
                {categorias.map((c) => (
                  <button
                    key={c}
                    type="button"
                    aria-pressed={c === catQuery}
                    onClick={() => update('categoria', c)}
                    className={`h-11 px-4 rounded-full text-sm font-semibold cursor-pointer transition-colors ${
                      c === catQuery ? cls.inkOn : 'ui-elevated-bg ui-text-primary hover:bg-[var(--border-main)]'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            )}

            <div>
              <label htmlFor="tr-desc" className={cls.label}>
                Descripción corta <span className="font-normal ui-text-secondary">(opcional)</span>
              </label>
              <textarea
                id="tr-desc"
                rows={3}
                maxLength={MAX_DESC}
                value={form.descripcion}
                onChange={(e) => update('descripcion', e.target.value.slice(0, MAX_DESC))}
                aria-describedby="tr-desc-count"
                className={`${cls.input} px-4 py-3.5 leading-normal resize-y`}
              />
              <p id="tr-desc-count" className="mt-1.5 text-sm ui-text-secondary text-right">
                {form.descripcion.length} / {MAX_DESC}
                <span className="sr-only"> caracteres</span>
              </p>
            </div>

            <div>
              <label htmlFor="tr-spec" className={cls.label}>
                Detalle técnico <span className="font-normal ui-text-secondary">(opcional)</span>
              </label>
              <input
                id="tr-spec"
                type="text"
                autoComplete="off"
                maxLength={80}
                placeholder="Ej.: 500 u. · Couché 150 g · Doble ring"
                value={form.spec}
                onChange={(e) => update('spec', e.target.value)}
                className={`${cls.input} h-12 px-4 font-mono text-[15px]`}
              />
            </div>

            <div className="border-t ui-border">
              <SwitchRow
                id="tr-sw-pub"
                title="Publicar en la página"
                description="Si lo apagas, queda guardado pero no se muestra."
                checked={form.activo}
                tone="green"
                onToggle={() => update('activo', !form.activo)}
              />
              <SwitchRow
                id="tr-sw-dest"
                title="Mostrar primero"
                description="Los destacados aparecen al inicio de la galería."
                checked={form.destacado}
                tone="ink"
                onToggle={() => update('destacado', !form.destacado)}
              />
            </div>

            <div>
              <label htmlFor="tr-orden" className={cls.label}>
                Orden
              </label>
              <input
                id="tr-orden"
                type="number"
                inputMode="numeric"
                min={0}
                value={form.orden}
                onChange={(e) => update('orden', e.target.value)}
                aria-describedby="tr-orden-hint"
                className={`${cls.input} h-12 w-32 px-4`}
              />
              <p id="tr-orden-hint" className={`mt-2 ${cls.hint}`}>
                Los números más bajos aparecen primero.
              </p>
            </div>
          </div>

          {/* Vista previa como en la página */}
          <div className="lg:sticky lg:top-8 border-t ui-border pt-8 lg:border-t-0 lg:pt-0">
            <p className="mb-3 text-sm font-semibold ui-text-secondary">Así se verá en la página</p>
            {preview ? (
              <Plate src={preview} alt="" className="h-[280px]" padding="p-6" radius="rounded-[20px]" />
            ) : (
              <div className="photo-plate photo-plate--empty h-[280px] rounded-[20px]! p-6!">
                <span className="font-sans text-[26px] leading-[1.05] font-extrabold tracking-[-0.03em] text-[#3a3c40] [font-stretch:112%]">
                  {form.titulo.trim() || 'Título del trabajo'}
                </span>
              </div>
            )}
            {form.cliente.trim() && <p className="mt-4 mb-1 text-sm font-semibold ui-text-tertiary">{form.cliente.trim()}</p>}
            <p className={`${form.cliente.trim() ? '' : 'mt-4'} text-[22px] leading-[1.2] font-bold [font-stretch:106%] ui-text-primary`}>
              {form.titulo.trim() || 'Título del trabajo'}
            </p>
            {form.descripcion.trim() && <p className="mt-2 text-base leading-[1.55] ui-text-secondary">{form.descripcion.trim()}</p>}
            {form.spec.trim() && <p className="mt-2.5 font-mono text-[13px] ui-text-secondary">{form.spec.trim()}</p>}
            {!form.activo && <p className="mt-4 text-sm font-semibold ui-text-secondary">Oculto: no se mostrará hasta que lo publiques.</p>}
          </div>
        </form>
      </div>
      <ModalFooter
        formId={FORM_ID}
        saving={saving}
        saveLabel={form.activo ? 'Guardar y publicar' : 'Guardar como oculto'}
        error={error}
        onCancel={onClose}
      />
    </>
  );
}
