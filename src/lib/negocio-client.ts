/**
 * En el navegador: trae los datos del negocio actuales y actualiza teléfono, WhatsApp,
 * dirección y horario sin esperar a un nuevo deploy.
 * Marcas en el HTML: data-neg="campo" (texto), data-neg-href="campo" (href),
 * data-neg-call (aria-label "Llamar al …"), data-neg-map (iframe del mapa).
 * Además corrige todos los enlaces tel: y wa.me.
 */
import { negocioService } from '../services/contenido.service';
import { aplicarNegocio, siteData, whatsappUrl } from '../data/siteData';

type Campos = Record<string, string>;

async function refrescar() {
  const row = await negocioService.get();
  if (!row) return;
  const antes = siteData.whatsappMessage;
  aplicarNegocio(row);
  const d = siteData as unknown as Campos;

  document.querySelectorAll<HTMLElement>('[data-neg]').forEach((el) => {
    const v = d[el.dataset.neg ?? ''];
    if (v) el.textContent = v;
  });
  document.querySelectorAll<HTMLAnchorElement>('[data-neg-href]').forEach((el) => {
    const v = d[el.dataset.negHref ?? ''];
    if (v) el.href = v;
  });
  document.querySelectorAll<HTMLElement>('[data-neg-call]').forEach((el) => {
    el.setAttribute('aria-label', `Llamar al ${siteData.phone}`);
  });
  document.querySelectorAll<HTMLIFrameElement>('iframe[data-neg-map]').forEach((el) => {
    const src = `https://www.google.com/maps?q=${encodeURIComponent(siteData.mapQuery)}&z=17&output=embed`;
    if (el.src !== src) el.src = src;
  });
  document.querySelectorAll<HTMLAnchorElement>('a[href^="tel:"]').forEach((a) => {
    a.href = siteData.phoneHref;
  });
  document.querySelectorAll<HTMLAnchorElement>('a[href^="https://wa.me/"]').forEach((a) => {
    const text = new URL(a.href).searchParams.get('text');
    a.href = whatsappUrl(text === null || text === antes ? siteData.whatsappMessage : text);
  });
}

refrescar().catch(() => {});
