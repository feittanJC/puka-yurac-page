export const siteData = {
  name: "Puka & Yurac Impresiones",
  description: "Imprenta y taller gráfico en Breña, Lima. Agendas, cuadernos, talonarios, folletos y calendarios con prueba antes de imprimir y envíos a todo el Perú.",
  phone: "+51 999 778 751",
  phoneShort: "999 778 751",
  phoneHref: "tel:+51999778751",
  whatsappNumber: "51999778751",
  whatsappMessage: "Hola Puka & Yurac, quiero cotizar un trabajo de impresión.",
  address: "Jr. Orbegozo 645, Breña, Lima",
  /** Nombre oficial de la calle para que Google Maps ubique bien el pin ("Orbegozo" con z no existe en el mapa) */
  mapQuery: "Jirón General Orbegoso 645, Breña 15083, Lima, Perú",
  googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Jir%C3%B3n%20General%20Orbegoso%20645%2C%20Bre%C3%B1a%2015083%2C%20Lima%2C%20Per%C3%BA",
  hours: "Lunes a sábado, 8:30 a. m. – 7:00 p. m.",
  hoursShort: "Lun – Sáb · 8:30 a. m. – 7:00 p. m.",
  envios: "A todo el Perú",
  developer: "Josue Castillo",

  /** Índice "Qué imprimimos" del hero. `nombre` es el valor que se pasa a /productos?cat= */
  categorias: [
    { nombre: "Agendas corporativas", spec: "Tapa dura · Hot stamping" },
    { nombre: "Cuadernos personalizados", spec: "Doble ring · Tapa dura" },
    { nombre: "Facturas y talonarios", spec: "Autocopiativo · Numerado" },
    { nombre: "Folletos y afiches", spec: "Couché · Offset" },
    { nombre: "Calendarios", spec: "Sobremesa · Pared" },
    { nombre: "Agendas de cuero", spec: "Biocuero · Bajo relieve" },
  ],

  services: [
    { titulo: "Impresión offset", descripcion: "Para tirajes grandes con color parejo: folletos, catálogos, talonarios y papelería corporativa." },
    { titulo: "Impresión digital", descripcion: "Para tirajes cortos, pruebas de color y pedidos que necesitas pronto." },
    { titulo: "Encuadernación y empastado", descripcion: "Tapa dura, anillado doble ring, empastado y hot stamping, hechos a mano en el taller." },
    { titulo: "Diseño", descripcion: "Preparamos o ajustamos tus archivos para imprenta: medidas, sangrado y color." },
  ],

  process: [
    { titulo: "Escríbenos", descripcion: "Cuéntanos qué producto necesitas, cuántas unidades y para cuándo. Si ya tienes tu diseño, envíalo." },
    { titulo: "Cotizamos y enviamos prueba", descripcion: "Te enviamos el precio y una prueba digital para que la apruebes antes de imprimir." },
    { titulo: "Imprimimos", descripcion: "Imprimimos y damos los acabados en nuestro taller de Breña." },
    { titulo: "Entregamos o enviamos a provincias", descripcion: "Recoges tu pedido en el taller o lo enviamos a cualquier ciudad del Perú." },
  ],

  /** Solo clientes reales confirmados (sin logos). */
  clientes: [
    { nombre: "Konecranes", trabajo: "Cuadernos anillados corporativos" },
    { nombre: "Remar Soluciones", trabajo: "Catálogos y calendarios" },
  ],

  /** Textos provisionales: pendientes de validar con el cliente (no inventar plazos, mínimos ni bancos). */
  faqs: [
    { pregunta: "¿Cuánto demora un pedido?", respuesta: "Depende del producto y de la cantidad. Te confirmamos la fecha de entrega junto con la cotización." },
    { pregunta: "¿Cuál es la cantidad mínima?", respuesta: "Varía según el producto. Cuéntanos cuántas unidades necesitas y te decimos qué opción te conviene." },
    { pregunta: "¿Hacen envíos a provincias?", respuesta: "Sí, enviamos a todo el Perú. Coordinamos contigo la agencia de transporte al confirmar el pedido." },
    { pregunta: "¿Qué formas de pago aceptan?", respuesta: "Te indicamos las formas de pago disponibles al confirmar tu pedido." },
  ],
};

/** Link de WhatsApp con mensaje prellenado. */
export function whatsappUrl(text = siteData.whatsappMessage) {
  return `https://wa.me/${siteData.whatsappNumber}?text=${encodeURIComponent(text)}`;
}

/** Mensaje para cotizar un producto concreto. */
export function whatsappProductoUrl(titulo) {
  return whatsappUrl(`Hola Puka & Yurac, quiero cotizar este producto: ${titulo}.`);
}

/**
 * Datos de contacto derivados de una fila de la tabla `negocio` (panel admin → Datos del negocio).
 * Devuelve solo los campos de siteData que cambian; los vacíos se ignoran.
 */
export function negocioToSiteData(row) {
  if (!row) return {};
  const out = {};
  const phone = (row.phone ?? '').trim();
  if (phone) {
    out.phone = phone;
    out.phoneShort = phone.replace(/^\+51\s*/, '');
    out.phoneHref = `tel:${phone.replace(/[^\d+]/g, '')}`;
  }
  const wa = (row.whatsapp_number ?? '').replace(/\D/g, '');
  if (wa) out.whatsappNumber = wa;
  if (row.whatsapp_message?.trim()) out.whatsappMessage = row.whatsapp_message.trim();
  if (row.address?.trim()) out.address = row.address.trim();
  const mapQuery = row.map_query?.trim() || out.address;
  if (mapQuery) {
    out.mapQuery = mapQuery;
    out.googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`;
  }
  if (row.hours?.trim()) out.hours = row.hours.trim();
  if (row.hours_short?.trim()) out.hoursShort = row.hours_short.trim();
  if (row.envios?.trim()) out.envios = row.envios.trim();
  return out;
}

/** Aplica los datos del negocio sobre siteData (en el build y en el navegador). */
export function aplicarNegocio(row) {
  const cambios = negocioToSiteData(row);
  Object.assign(siteData, cambios);
  return cambios;
}
