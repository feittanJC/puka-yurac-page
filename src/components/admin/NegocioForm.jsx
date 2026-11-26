import { useEffect, useMemo, useState } from 'react';
import { negocioService } from '../../services/contenido.service';
import { siteData } from '../../data/siteData';
import { cls, Notice, SectionHeader } from './ui';

// Valores de respaldo (los mismos que usa el sitio si la tabla está vacía)
const DESDE_SITE = {
  phone: siteData.phone,
  whatsapp_number: siteData.whatsappNumber,
  whatsapp_message: siteData.whatsappMessage,
  address: siteData.address,
  map_query: siteData.mapQuery,
  hours: siteData.hours,
  hours_short: siteData.hoursShort,
  envios: siteData.envios,
};
const CAMPOS = Object.keys(DESDE_SITE);
const pick = (row) => Object.fromEntries(CAMPOS.map((k) => [k, row?.[k] ?? DESDE_SITE[k] ?? '']));

function validar(f) {
  const e = {};
  if (!/^\+?[\d\s-]{7,20}$/.test(f.phone.trim()) || f.phone.replace(/\D/g, '').length < 7)
    e.phone = 'Escribe el teléfono solo con números, espacios y el + del código de país. Ej.: +51 999 778 751';
  if (!/^\d{8,15}$/.test(f.whatsapp_number.trim()))
    e.whatsapp_number = 'Solo números, con código de país y sin espacios ni +. Ej.: 51999778751';
  if (!f.whatsapp_message.trim()) e.whatsapp_message = 'Escribe el mensaje con el que se abre WhatsApp.';
  if (!f.address.trim()) e.address = 'Escribe la dirección del taller.';
  if (!f.hours.trim()) e.hours = 'Escribe el horario de atención.';
  return e;
}

/** Teléfono, WhatsApp, dirección, horario y envíos que se muestran en todo el sitio. */
export default function NegocioForm() {
  const [initial, setInitial] = useState(null);
  const [form, setForm] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState(null);

  async function load() {
    setLoadError('');
    const row = await negocioService.get();
    if (row === null) setLoadError('No se pudieron leer los datos guardados. Se muestran los valores actuales del sitio.');
    const base = pick(row);
    setInitial(base);
    setForm(base);
  }
  useEffect(() => {
    load();
  }, []);

  const errores = useMemo(() => (form ? validar(form) : {}), [form]);
  const dirty = form && initial && JSON.stringify(form) !== JSON.stringify(initial);

  useEffect(() => {
    if (!dirty) return;
    const warn = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  if (!form) {
    return <p className="py-16 text-center ui-text-secondary">Cargando datos del negocio…</p>;
  }

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const waLink = `https://wa.me/${form.whatsapp_number.trim()}?text=${encodeURIComponent(form.whatsapp_message.trim())}`;

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitted(true);
    setNotice(null);
    const keys = Object.keys(errores);
    if (keys.length) {
      document.getElementById(`ng-${keys[0]}`)?.focus();
      return;
    }
    setSaving(true);
    try {
      const payload = Object.fromEntries(CAMPOS.map((k) => [k, form[k].trim()]));
      const saved = pick(await negocioService.save(payload));
      setInitial(saved);
      setForm(saved);
      setSubmitted(false);
      setLoadError('');
      setNotice({ tone: 'ok', text: 'Datos guardados. Se ven en la página al recargarla.' });
    } catch (err) {
      setNotice({ tone: 'error', text: `No se pudieron guardar los datos. ${err?.message ?? ''}`.trim() });
    } finally {
      setSaving(false);
    }
  }

  const field = (k, label, { hint, placeholder, mono, textarea, inputMode } = {}) => {
    const err = submitted ? errores[k] : '';
    const describedBy = [hint && `ng-${k}-hint`, err && `ng-${k}-err`].filter(Boolean).join(' ') || undefined;
    const common = {
      id: `ng-${k}`,
      value: form[k],
      onChange: (e) => update(k, e.target.value),
      placeholder,
      'aria-invalid': Boolean(err),
      'aria-describedby': describedBy,
      className: `${cls.input} px-4 ${textarea ? 'py-3.5 leading-normal resize-y' : 'h-12'} ${mono ? 'font-mono text-[15px]' : ''} ${
        err ? 'border-2 border-[#b91c1c]! dark:border-[#f87171]!' : ''
      }`,
    };
    return (
      <div>
        <label htmlFor={`ng-${k}`} className={cls.label}>
          {label}
        </label>
        {textarea ? <textarea rows={3} maxLength={300} {...common} /> : <input type="text" autoComplete="off" inputMode={inputMode} maxLength={160} {...common} />}
        {hint && (
          <p id={`ng-${k}-hint`} className={`mt-2 ${cls.hint}`}>
            {hint}
          </p>
        )}
        {err && (
          <p id={`ng-${k}-err`} className={`mt-2 ${cls.errorText}`}>
            {err}
          </p>
        )}
      </div>
    );
  };

  return (
    <div>
      <SectionHeader title="Datos del negocio" summary="Se muestran en el encabezado, el pie de página, Contacto y los botones de WhatsApp." />

      <div aria-live="polite" className="mt-6 empty:mt-0">
        <Notice notice={notice} onClose={() => setNotice(null)} />
      </div>
      {loadError && (
        <p role="status" className="mt-6 rounded-xl bg-[#fbeec0] px-4 py-3 text-[15px] font-semibold text-[#5c4400]">
          {loadError} Si es la primera vez, ejecuta la migración 002 en Supabase.
        </p>
      )}

      <form noValidate onSubmit={handleSubmit} className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-12 items-start">
        <div className="rounded-2xl ui-surface-bg p-5 sm:p-8 flex flex-col gap-8">
          <fieldset className="flex flex-col gap-6">
            <legend className="mb-5 font-sans [font-stretch:108%] text-xl font-extrabold tracking-[-0.02em]">Teléfono y WhatsApp</legend>
            {field('phone', 'Teléfono', { hint: 'Como quieres que se lea en la página. Ej.: +51 999 778 751', inputMode: 'tel' })}
            {field('whatsapp_number', 'Número de WhatsApp', {
              hint: 'Solo números, con código de país (51 para Perú), sin espacios ni +.',
              mono: true,
              inputMode: 'numeric',
            })}
            {field('whatsapp_message', 'Mensaje inicial de WhatsApp', {
              hint: 'Texto con el que se abre el chat desde los botones generales.',
              textarea: true,
            })}
          </fieldset>

          <fieldset className="flex flex-col gap-6 border-t ui-border pt-8">
            <legend className="float-left w-full mb-5 font-sans [font-stretch:108%] text-xl font-extrabold tracking-[-0.02em]">Ubicación y horario</legend>
            {field('address', 'Dirección')}
            {field('map_query', 'Búsqueda para el mapa', {
              hint: 'Cómo encuentra Google Maps tu local. Si lo dejas vacío se usa la dirección.',
            })}
            {field('hours', 'Horario', { placeholder: 'Lunes a sábado, 8:30 a. m. – 7:00 p. m.' })}
            {field('hours_short', 'Horario corto (pie de página)', { placeholder: 'Lun – Sáb · 8:30 a. m. – 7:00 p. m.' })}
            {field('envios', 'Envíos', { placeholder: 'A todo el Perú' })}
          </fieldset>

          <div className="flex flex-col-reverse sm:flex-row sm:items-center gap-3 sm:gap-6 border-t ui-border pt-6">
            <button
              type="button"
              disabled={!dirty || saving}
              onClick={() => {
                setForm(initial);
                setSubmitted(false);
              }}
              className={`${cls.textLink} h-12 justify-center disabled:opacity-50 disabled:cursor-default disabled:no-underline`}
            >
              Descartar cambios
            </button>
            <button type="submit" disabled={saving || !dirty} aria-busy={saving} className={`${cls.primary} h-[52px] px-7 text-base sm:ml-auto`}>
              {saving ? 'Guardando…' : dirty ? 'Guardar cambios' : 'Sin cambios'}
            </button>
          </div>
        </div>

        {/* Vista previa */}
        <aside aria-label="Vista previa" className="lg:sticky lg:top-24 rounded-2xl ui-elevated-bg p-6">
          <p className="text-sm font-semibold ui-text-secondary">Vista previa en Contacto</p>
          <p className="mt-3 font-sans text-[40px] leading-none font-extrabold tracking-[-0.035em] tabular-nums [font-stretch:112%] break-words">
            {form.phone.trim().replace(/^\+51\s*/, '') || '—'}
          </p>
          <dl className="mt-5 border-t ui-border text-[15px]">
            {[
              ['Dirección', form.address],
              ['Horario', form.hours],
              ['Envíos', form.envios],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 border-b ui-border py-3">
                <dt className="ui-text-secondary shrink-0">{k}</dt>
                <dd className={`text-right font-semibold ${v.trim() ? '' : 'ui-text-tertiary font-normal'}`}>{v.trim() || 'Sin indicar'}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-6 mb-2 text-sm font-semibold ui-text-secondary">Enlace de WhatsApp</p>
          <p className="font-mono text-[13px] break-all ui-text-secondary">{waLink}</p>
          {errores.whatsapp_number ? (
            <p className={`mt-3 ${cls.errorText}`}>Corrige el número para probar el enlace.</p>
          ) : (
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 flex h-12 items-center justify-center rounded-xl bg-[var(--whatsapp)] px-5 text-[15px] font-bold text-white hover:bg-[#065f46] transition-colors"
            >
              Probar enlace en WhatsApp
            </a>
          )}
        </aside>
      </form>
    </div>
  );
}
