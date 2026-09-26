# PRODUCT.md - Puka Yurac

## 🎯 Audience & Brand Mission
Puka Yurac es una imprenta y taller gráfico con más de 10 años de trayectoria en Lima, Perú. Atendemos a empresas, instituciones, colegios y emprendedores que buscan papelería corporativa, agendas en tapa dura, cuadernos personalizados, comprobantes de pago y merchandising impreso con máxima fidelidad de color y acabados táctiles.

## 🗣️ Tone & Voice
- **Directo, profesional y artesanal.**
- **Cero palabrería SaaS genérica** (*"Los mejores diseños para tu empresa"* es prohibido).
- **Frases con sustancia:** *"Impresión que representa la personalidad de tu marca."*

## 🚫 Anti-References & Unwanted Patterns
- **No plantillas genéricas de IA:** Sin esferas neón o luces tipo ciberseguridad (`bg-red-600/15 blur-[140px]`).
- **No tarjetas flotantes futuristas 3D.**
- **No fondos oscuros de dashboard SaaS (`#0d0f12`).**
- **No fuentes genéricas predeterminadas sin contraste.**
- **No tarjetas dentro de tarjetas ni texto gris sobre fondos de color sin contraste.**

## 📐 Primary Surface Mode
- **Persuade & Experience:** La landing page debe invitar a la acción (cotización rápida por WhatsApp) mientras evoca la experiencia táctil del papel, la encuadernación y el taller gráfico.

## 🧭 UX Brief (rediseño 2026)

### Objetivos (en orden)
1. **Contactar en 1 toque:** WhatsApp siempre visible (botón flotante + CTA en hero + en cada producto con mensaje prellenado con el nombre del producto). Teléfono, dirección con mapa, horario y envíos a provincias visibles sin buscar.
2. **Mostrar qué imprimimos:** categorías de productos visibles desde el hero; tarjetas con foto real grande, acabados/gramajes como badges táctiles y "Cotizar" directo. Catálogo completo en `/productos` con filtros.
3. **Generar confianza:** +10 años, clientes (logos), proceso en 4 pasos, muestras reales, FAQ (tiempos de entrega, cantidades mínimas, envíos, formas de pago).

### Público
- Encargados de compras / marketing de empresas e instituciones (desktop, horario laboral).
- Colegios y emprendedores (mobile, WhatsApp primero).

### Cotizador
Corto: producto → cantidad → fecha deseada → comentario → envía a WhatsApp con mensaje armado. Sin registro.

### Admin (usuario no técnico, 1 persona)
- Crear producto en < 1 minuto: arrastrar imagen, título, categoría (sugerida), acabados como chips.
- Vista previa de cómo se verá la tarjeta en la landing.
- Publicar/ocultar y marcar destacado con un clic; estados vacío/carga/error claros.
- Usable en mobile (subir fotos desde el celular del taller).

### Datos de contacto reales
- Teléfono / WhatsApp: +51 999 778 751
- Dirección: Jr. Orbegozo 645, Breña, Lima - Perú
- Horario: Lun - Sáb: 8:30 AM - 7:00 PM

### Decisiones de diseño (2026-09-26)
- Dirección elegida: **A "Catálogo editorial"** (claro, papel, foto protagonista, mucho aire) + de C: índice numerado de categorías en el hero, bloque rojo "Cómo trabajamos" (único momento de color fuerte), teléfono visible en el header.
- Clientes que se pueden mostrar: **Konecranes**, **Remar Soluciones**.
- FAQ: textos provisionales, el cliente los edita luego.
- Fotos reales disponibles en `public/assets`: anillado.jpg (Konecranes), calendario.jpg, cuaderno.jpg (tapa dura Puka & Yurac), folleto.jpg (Remar), background.png (collage). Recortes sobre fondo blanco.
