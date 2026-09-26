import { useEffect, useMemo, useRef, useState } from 'react';
import { productosService } from '../../services/productos.service';
import ProductPreview from './ProductPreview';
import { cls, IconClose, IconUpload, Plate, SwitchTrack } from './ui';

const MAX_DESC = 160;
const MAX_IMG_MB = 5;

function initialState(producto, nextOrden) {
  return {
    titulo: producto?.titulo ?? '',
    categoria: producto?.categoria ?? '',
    descripcion: producto?.descripcion ?? '',
    imagen: producto?.imagen ?? '',
    acabados: producto?.acabados ?? [],
    destacado: producto?.destacado ?? false,
    activo: producto?.activo ?? true,
    orden: producto?.orden ?? nextOrden ?? 0,
  };
}

function fileNameFromUrl(url) {
  try {
    return decodeURIComponent(new URL(url, window.location.href).pathname.split('/').pop() || '');
  } catch {
    return '';
  }
}

/**
 * Formulario de producto dentro del panel lateral (maestro-detalle).
 * Escritorio: panel a la derecha de la lista. Móvil: pantalla completa con barra inferior fija.
 */
export default function ProductoForm({
  producto,
  categorias,
  acabadosUsados,
  nextOrden,
  onClose,
  onSaved,
  onDirtyChange,
}) {
  const isEdit = Boolean(producto?.id);
  const initial = useMemo(() => initialState(producto, nextOrden), [producto, nextOrden]);

  const [form, setForm] = useState(initial);

  // Publicado/Destacado pueden cambiarse desde la lista con el panel abierto: sincronizarlos sin tocar el resto del formulario
  useEffect(() => {
    if (!producto) return;
    setForm((f) => ({ ...f, activo: producto.activo ?? f.activo, destacado: producto.destacado ?? f.destacado }));
  }, [producto?.activo, producto?.destacado]);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(initial.imagen);
  const [imgError, setImgError] = useState('');
  const [dragging, setDragging] = useState(false);
  const [nuevoAc, setNuevoAc] = useState('');
  const [touched, setTouched] = useState({ titulo: false, categoria: false });
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fileRef = useRef(null);
  const tituloRef = useRef(null);
  const categoriaRef = useRef(null);
  const headingRef = useRef(null);

  // Foco al abrir: título del panel (anuncia el contexto)
  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  // Liberar la URL temporal de la vista previa
  useEffect(() => {
    if (!file) return;
    return () => URL.revokeObjectURL(preview);
  }, [file, preview]);

  const dirty =
    Boolean(file) ||
    nuevoAc.trim() !== '' ||
    JSON.stringify({ ...form, orden: Number(form.orden) || 0 }) !==
      JSON.stringify({ ...initial, orden: Number(initial.orden) || 0 });

  useEffect(() => {
    onDirtyChange?.(dirty);
  }, [dirty, onDirtyChange]);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  // ---------- Imagen ----------
  function acceptFile(selected) {
    if (!selected) return;
    if (!selected.type.startsWith('image/')) {
      setImgError('El archivo debe ser una imagen (JPG, PNG o WebP).');
      return;
    }
    if (selected.size > MAX_IMG_MB * 1024 * 1024) {
      setImgError(`La imagen pesa más de ${MAX_IMG_MB} MB. Elige una más liviana.`);
      return;
    }
    setImgError('');
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  }

  function removeImage() {
    setFile(null);
    setPreview('');
    update('imagen', '');
    setImgError('');
    if (fileRef.current) fileRef.current.value = '';
  }

  function onDrop(e) {
    e.preventDefault();
    setDragging(false);
    acceptFile(e.dataTransfer.files?.[0]);
  }

  // ---------- Categoría ----------
  const catQuery = form.categoria.trim();
  const catExact = categorias.includes(catQuery);
  const catMatches =
    catExact || !catQuery
      ? categorias
      : categorias.filter((c) => c.toLowerCase().includes(catQuery.toLowerCase()));
  const catIsNew = Boolean(catQuery) && !catExact && catMatches.length === 0;
  let catHint;
  if (catExact) catHint = 'Elige una de las categorías que ya usas.';
  else if (!catQuery) catHint = categorias.length ? 'Escribe o elige una categoría.' : 'Escribe una categoría.';
  else if (catMatches.length) catHint = 'Coincidencias con lo que escribiste:';
  else catHint = `Se creará la categoría nueva “${catQuery}”.`;

  // ---------- Acabados ----------
  function addAcabados(values) {
    const clean = values.map((v) => v.trim()).filter(Boolean);
    if (!clean.length) return;
    setForm((f) => {
      const next = [...f.acabados];
      for (const v of clean) {
        if (!next.some((a) => a.toLowerCase() === v.toLowerCase())) next.push(v);
      }
      return { ...f, acabados: next };
    });
  }

  function removeAcabado(value) {
    update(
      'acabados',
      form.acabados.filter((a) => a !== value)
    );
  }

  function onNuevoAcChange(e) {
    const value = e.target.value;
    if (value.includes(',')) {
      const parts = value.split(',');
      const rest = parts.pop();
      addAcabados(parts);
      setNuevoAc(rest.trimStart());
    } else {
      setNuevoAc(value);
    }
  }

  function onNuevoAcKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      addAcabados([nuevoAc]);
      setNuevoAc('');
    } else if (e.key === 'Backspace' && !nuevoAc && form.acabados.length) {
      removeAcabado(form.acabados[form.acabados.length - 1]);
    }
  }

  const acQuery = nuevoAc.trim().toLowerCase();
  const acSugeridos = acabadosUsados
    .filter((a) => !form.acabados.some((x) => x.toLowerCase() === a.toLowerCase()))
    .filter((a) => !acQuery || a.toLowerCase().includes(acQuery))
    .slice(0, 12);

  // ---------- Validación ----------
  const tituloError = !form.titulo.trim() ? 'Escribe un nombre para el producto.' : '';
  const categoriaError = !catQuery ? 'Escribe o elige una categoría.' : '';
  const showTituloError = Boolean(tituloError) && (touched.titulo || submitted);
  const showCategoriaError = Boolean(categoriaError) && (touched.categoria || submitted);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitted(true);
    setError('');
    if (tituloError) {
      tituloRef.current?.focus();
      return;
    }
    if (categoriaError) {
      categoriaRef.current?.focus();
      return;
    }

    setSaving(true);
    try {
      let imagen = form.imagen || null;
      if (file) imagen = await productosService.uploadImagen(file);

      const acabados = [...form.acabados];
      const pendiente = nuevoAc.trim();
      if (pendiente && !acabados.some((a) => a.toLowerCase() === pendiente.toLowerCase())) acabados.push(pendiente);

      const payload = {
        titulo: form.titulo.trim(),
        categoria: catQuery,
        descripcion: form.descripcion.trim(),
        imagen,
        acabados,
        destacado: form.destacado,
        activo: form.activo,
        orden: Number(form.orden) || 0,
      };

      const saved = isEdit
        ? await productosService.updateProducto(producto.id, payload)
        : await productosService.createProducto(payload);

      // Limpieza best-effort de la foto anterior si se reemplazó o quitó
      if (isEdit && producto.imagen && producto.imagen !== saved.imagen) {
        productosService.deleteImagen(producto.imagen).catch(() => {});
      }

      onSaved(saved, isEdit);
    } catch (err) {
      setError(err?.message || 'No se pudo guardar el producto. Inténtalo de nuevo.');
      setSaving(false);
    }
  }

  const saveLabel = saving ? 'Guardando…' : form.activo ? 'Guardar y publicar' : 'Guardar como oculto';
  const heading = isEdit ? 'Editar producto' : 'Nuevo producto';
  const fileName = file?.name || (preview ? fileNameFromUrl(preview) : '');

  return (
    <>
      {/* Cabecera del panel */}
      <header className="shrink-0 h-[60px] lg:h-[72px] px-2 lg:px-8 flex items-center gap-1 lg:gap-4 border-b ui-border">
        <button
          type="button"
          onClick={onClose}
          disabled={saving}
          aria-label={isEdit ? 'Cerrar sin guardar' : 'Cerrar y volver a productos'}
          className={`${cls.iconBtn} ui-text-primary lg:order-last lg:ml-auto`}
        >
          <IconClose />
        </button>
        <h2
          id="panel-title"
          ref={headingRef}
          tabIndex={-1}
          className="min-w-0 truncate font-sans [font-stretch:108%] text-xl lg:text-2xl font-extrabold tracking-[-0.02em] ui-text-primary focus:outline-none"
        >
          {heading}
          {isEdit && <span className="sr-only">: {producto.titulo}</span>}
        </h2>
      </header>

      {/* Contenido desplazable */}
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
        <form
          id="producto-form"
          noValidate
          onSubmit={handleSubmit}
          className="px-5 pt-6 pb-10 grid gap-10 items-start lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-12 lg:px-8 lg:pt-8"
        >
          <div className="flex flex-col gap-8 lg:gap-9 min-w-0">
            {/* Foto */}
            <div>
              <p id="foto-label" className={cls.label.replace('mb-2', 'mb-2.5')}>
                Foto del producto
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
                  <Plate
                    src={preview}
                    alt={`Foto cargada: ${form.titulo.trim() || 'producto'}`}
                    className="h-[240px] lg:h-[300px]"
                    padding="p-5 lg:p-7"
                    radius="rounded-2xl"
                  />
                  <div className="mt-2.5 grid grid-cols-2 lg:flex lg:items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      className={`${cls.secondary} h-12 lg:h-11 px-4 text-[15px]`}
                    >
                      Cambiar foto
                    </button>
                    <button
                      type="button"
                      onClick={removeImage}
                      className={`inline-flex items-center justify-center h-12 lg:h-11 px-4 rounded-xl text-[15px] font-semibold cursor-pointer hover:bg-[var(--bg-elevated)] ${cls.danger}`}
                    >
                      Quitar foto
                    </button>
                    {fileName && (
                      <span className="hidden lg:block ml-auto min-w-0 truncate text-sm ui-text-secondary">{fileName}</span>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    aria-labelledby="foto-label foto-cta"
                    aria-describedby="foto-hint"
                    onClick={() => fileRef.current?.click()}
                    onDragEnter={(e) => {
                      e.preventDefault();
                      setDragging(true);
                    }}
                    onDragOver={(e) => e.preventDefault()}
                    onDragLeave={() => setDragging(false)}
                    onDrop={onDrop}
                    className={`w-full h-[200px] lg:h-[300px] rounded-2xl border-2 [&>*]:pointer-events-none border-dashed flex flex-col items-center justify-center gap-2.5 px-6 text-center ui-text-primary cursor-pointer transition-colors ${
                      dragging
                        ? 'border-[var(--action)] bg-[var(--bg-elevated)]'
                        : 'border-[var(--border-input)] ui-surface-bg hover:bg-[var(--bg-elevated)]'
                    }`}
                  >
                    <IconUpload />
                    <span id="foto-cta" className="text-[17px] lg:text-lg font-bold">
                      <span className="lg:hidden">Tomar foto o elegir de la galería</span>
                      <span className="hidden lg:inline">Arrastra una foto aquí</span>
                    </span>
                    <span className="text-sm lg:text-[15px] ui-text-secondary">
                      <span className="lg:hidden">JPG, PNG o WebP</span>
                      <span className="hidden lg:inline">o haz clic para elegirla. JPG, PNG o WebP.</span>
                    </span>
                  </button>
                  <p id="foto-hint" className={`mt-2 ${cls.hint}`}>
                    Se ve mejor una foto del producto sobre fondo blanco. Máximo {MAX_IMG_MB} MB.
                  </p>
                </>
              )}
              {imgError && (
                <p role="alert" className={`mt-2 ${cls.errorText}`}>
                  {imgError}
                </p>
              )}
            </div>

            {/* Nombre */}
            <div>
              <label htmlFor="f-titulo" className={cls.label}>
                Nombre
              </label>
              <input
                ref={tituloRef}
                id="f-titulo"
                type="text"
                autoComplete="off"
                value={form.titulo}
                onChange={(e) => update('titulo', e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, titulo: true }))}
                aria-invalid={showTituloError}
                aria-describedby={showTituloError ? 'f-titulo-err' : undefined}
                className={`${cls.input} h-[52px] px-4 ${
                  showTituloError ? 'border-2 border-[#b91c1c]! dark:border-[#f87171]!' : ''
                }`}
              />
              {showTituloError && (
                <p id="f-titulo-err" className={`mt-2 ${cls.errorText}`}>
                  {tituloError}
                </p>
              )}
            </div>

            {/* Categoría */}
            <div>
              <label htmlFor="f-categoria" className={cls.label}>
                Categoría
              </label>
              <input
                ref={categoriaRef}
                id="f-categoria"
                type="text"
                autoComplete="off"
                value={form.categoria}
                onChange={(e) => update('categoria', e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, categoria: true }))}
                aria-invalid={showCategoriaError}
                aria-describedby={showCategoriaError ? 'f-categoria-err' : 'f-categoria-hint'}
                className={`${cls.input} h-[52px] px-4 ${
                  showCategoriaError ? 'border-2 border-[#b91c1c]! dark:border-[#f87171]!' : ''
                }`}
              />
              {showCategoriaError ? (
                <p id="f-categoria-err" className={`mt-2.5 mb-2 ${cls.errorText}`}>
                  {categoriaError}
                </p>
              ) : (
                <p
                  id="f-categoria-hint"
                  aria-live="polite"
                  className={`mt-2.5 mb-2 text-sm ${catIsNew ? 'font-semibold ui-text-primary' : 'ui-text-secondary'}`}
                >
                  {catHint}
                </p>
              )}
              {catMatches.length > 0 && (
                <div role="group" aria-label="Categorías existentes" className="flex flex-wrap gap-2">
                  {catMatches.map((c) => {
                    const on = c === catQuery;
                    return (
                      <button
                        key={c}
                        type="button"
                        aria-pressed={on}
                        onClick={() => update('categoria', c)}
                        className={`h-11 px-4 rounded-full text-sm lg:text-[15px] font-semibold cursor-pointer transition-colors ${
                          on ? cls.inkOn : 'ui-elevated-bg ui-text-primary hover:bg-[var(--border-main)]'
                        }`}
                      >
                        {c}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Descripción */}
            <div>
              <label htmlFor="f-desc" className={cls.label}>
                Descripción corta
              </label>
              <textarea
                id="f-desc"
                rows={3}
                maxLength={MAX_DESC}
                value={form.descripcion}
                onChange={(e) => update('descripcion', e.target.value.slice(0, MAX_DESC))}
                aria-describedby="f-desc-count"
                className={`${cls.input} px-4 py-3.5 leading-normal resize-y`}
              />
              <p id="f-desc-count" className="mt-1.5 text-sm ui-text-secondary text-right">
                {form.descripcion.length} / {MAX_DESC}
                <span className="sr-only"> caracteres</span>
              </p>
            </div>

            {/* Acabados */}
            <div>
              <p id="acabados-label" className="mb-1 text-[15px] font-bold ui-text-primary">
                Acabados
              </p>
              <p id="acabados-hint" className={`mb-3 ${cls.hint}`}>
                Gramajes, encuadernación o terminaciones. Se muestran en la tarjeta.
              </p>
              {form.acabados.length > 0 && (
                <ul aria-label="Acabados elegidos" className="flex flex-wrap gap-2 mb-3">
                  {form.acabados.map((a) => (
                    <li key={a} className={`inline-flex items-center h-11 pl-3.5 rounded-[10px] ${cls.inkOn}`}>
                      <span className="font-mono text-[13px]">{a}</span>
                      <button
                        type="button"
                        aria-label={`Quitar ${a}`}
                        onClick={() => removeAcabado(a)}
                        className="inline-flex items-center justify-center w-11 h-11 cursor-pointer rounded-[10px] hover:opacity-70"
                      >
                        <IconClose size={16} strokeWidth={2.2} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <div className="flex gap-2">
                <input
                  id="f-acabado"
                  type="text"
                  autoComplete="off"
                  aria-labelledby="acabados-label"
                  aria-describedby="acabados-hint acabados-teclas"
                  placeholder="Escribe otro acabado"
                  value={nuevoAc}
                  onChange={onNuevoAcChange}
                  onKeyDown={onNuevoAcKeyDown}
                  className={`${cls.input} flex-1 min-w-0 h-12 px-4`}
                />
                <button
                  type="button"
                  onClick={() => {
                    addAcabados([nuevoAc]);
                    setNuevoAc('');
                  }}
                  className={`${cls.secondary} h-12 px-4 lg:px-[18px] text-[15px] font-bold!`}
                >
                  Añadir
                </button>
              </div>
              <p id="acabados-teclas" className="sr-only">
                Pulsa Enter o escribe una coma para añadirlo.
              </p>
              {acSugeridos.length > 0 && (
                <>
                  <p className={`mt-3.5 mb-2 ${cls.hint}`}>Usados en otros productos</p>
                  <div role="group" aria-label="Acabados usados en otros productos" className="flex flex-wrap gap-2">
                    {acSugeridos.map((a) => (
                      <button
                        key={a}
                        type="button"
                        onClick={() => addAcabados([a])}
                        aria-label={`Añadir ${a}`}
                        className="h-11 px-3.5 rounded-[10px] ui-elevated-bg ui-text-primary font-mono text-[13px] cursor-pointer hover:bg-[var(--border-main)] transition-colors"
                      >
                        {a}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Switches */}
            <div className="border-t ui-border">
              <SwitchRow
                id="sw-pub"
                title="Publicar en el catálogo"
                description="Si lo apagas, el producto queda guardado pero oculto."
                checked={form.activo}
                tone="green"
                onToggle={() => update('activo', !form.activo)}
              />
              <SwitchRow
                id="sw-dest"
                title="Destacar en la página de inicio"
                description="Aparece en la sección Productos destacados."
                checked={form.destacado}
                tone="ink"
                onToggle={() => update('destacado', !form.destacado)}
              />
            </div>

            {/* Orden */}
            <div>
              <label htmlFor="f-orden" className={cls.label}>
                Orden
              </label>
              <input
                id="f-orden"
                type="number"
                inputMode="numeric"
                min={0}
                value={form.orden}
                onChange={(e) => update('orden', e.target.value)}
                aria-describedby="f-orden-hint"
                className={`${cls.input} h-12 w-32 px-4`}
              />
              <p id="f-orden-hint" className={`mt-2 ${cls.hint}`}>
                Los números más bajos aparecen primero en el catálogo.
              </p>
            </div>
          </div>

          {/* Vista previa en vivo */}
          <div className="lg:sticky lg:top-8 border-t ui-border pt-8 lg:border-t-0 lg:pt-0">
            <ProductPreview
              titulo={form.titulo}
              categoria={form.categoria}
              descripcion={form.descripcion}
              imagen={preview}
              acabados={form.acabados}
              activo={form.activo}
              destacado={form.destacado}
            />
          </div>
        </form>
      </div>

      {/* Barra de acciones (fija abajo en móvil y en el panel) */}
      <footer className="shrink-0 px-5 lg:px-8 py-4 border-t ui-border ui-surface-bg shadow-[0_-4px_12px_rgba(15,17,21,0.06)] lg:shadow-none">
        {error && (
          <p role="alert" className={`mb-3 ${cls.errorText}`}>
            {error}
          </p>
        )}
        <div className="flex items-center gap-3 lg:justify-end lg:gap-6">
          <button
            type="submit"
            form="producto-form"
            disabled={saving}
            aria-busy={saving}
            className={`${cls.primary} flex-1 lg:flex-none h-[52px] lg:h-14 px-7 text-base`}
          >
            {saveLabel}
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className={`${cls.textLink} hidden lg:inline-flex lg:order-first h-14 text-base`}
          >
            Cancelar
          </button>
        </div>
      </footer>
    </>
  );
}

function SwitchRow({ id, title, description, checked, tone, onToggle }) {
  return (
    <div className="flex items-center justify-between gap-4 lg:gap-6 py-3.5 lg:py-4 border-b ui-border">
      <div>
        <p id={id} className="text-base font-bold ui-text-primary">
          {title}
        </p>
        <p id={`${id}-desc`} className={`mt-1 ${cls.hint}`}>
          {description}
        </p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={id}
        aria-describedby={`${id}-desc`}
        onClick={onToggle}
        className="shrink-0 inline-flex items-center justify-center w-[60px] h-11 cursor-pointer rounded-full"
      >
        <SwitchTrack checked={checked} tone={tone} size="lg" />
      </button>
    </div>
  );
}
