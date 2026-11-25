# DESIGN.md - Puka Yurac Design System

## 🎨 Visual Identity & Aesthetic World
- **Estilo:** Editorial & Artesanal Impreso (Impeccable + Anti-AI Template Standard).
- **Inspiración:** Catálogos de imprenta de alta gama, revistas de diseño gráfico, muestras táctiles de papel, pan de oro y encuadernación.

## 🔴 Palette & Color Rules
Dirección editorial clara (rediseño 2026). Tokens en `src/styles/global.css`.
- **Base (tema por defecto, claro):** fondo papel `--bg-page #f8f8f6`, superficies `--bg-surface #ffffff`, tinta `--text-primary #0f1115`, texto secundario `#4a4d52`, terciario `#5f6268`. Bordes `--border-main #dcdce0`, solo cuando separan.
- **Plano de foto:** `--bg-plate #efede6` (en oscuro `#e9e6de`, sigue claro). Las fotos van sobre `.photo-plate` con `mix-blend-mode: multiply`.
- **Acción / marca:** rojo Puka Yurac `--action #dc2626`, hover `--action-hover #b91c1c`, para CTA, enlaces activos, números del índice y foco (outline 2px, offset 3px). Bloque de acento `--accent-block #e60000`. Jamás como luces desenfocadas o aros brillantes tipo SaaS.
- **Otros:** WhatsApp `--whatsapp #047857`, footer `--footer-bg #09090b`, borde de inputs `--border-input #8a8d93`.
- **Modo oscuro (opcional):** se activa con el toggle o `prefers-color-scheme`. Base carbón `--bg-page #0f1115`, superficie `#16181d`, texto `#f0f1f5`, bordes `#2b2e36`, acento de texto `#ef4444`. Nunca negro puro ni azul neón.

## 🔤 Typography
- **Titulares:** `Archivo` (700–800, ancho 112% vía `font-stretch`, tracking ajustado). Grotesca de origen editorial/impreso.
- **Cuerpo de texto:** `Manrope` (400–600) con contraste nítido.
- **Datos técnicos / etiquetas:** `JetBrains Mono` (gramajes, acabados, badges).
- **Prohibido:** Texto gris sobre fondo rojo/coloreado o fuentes del sistema sin personalidad.

## 🖼️ Imagery & Layout Strategy
- **Fotografía Real del Taller:** Encuadernación manual, guillotinas de corte, muestras de papel couché, folletos, agendas empastadas.
- **Composición Editorial:** Grillas asimétricas sobrias, bloques con aire visual, tarjetas físicas con badges táctiles de gramajes y acabados.

## ⚡ Interaction & Motion
- Transiciones limpias de hover (`translate-y-0.5`, cambio de color de borde a `#dc2626`).
- Sin animaciones tipo "bounce" o elastic que restan seriedad al taller gráfico.

## 🧭 Dirección 2026 (feedback del cliente)
- **Íconos con moderación:** solo donde aportan significado (WhatsApp, cerrar, menú, subir imagen, estados). Nada de íconos decorativos junto a cada título, botón, badge o dato. Botones con texto solo; la flecha "→" únicamente en el CTA principal.
- **Menos "anticuado":** evitar lo que envejece la UI actual — etiquetas mono en MAYÚSCULAS por todos lados, chips "✓" con borde, badges con borde en cada bloque, tarjetas con borde + sombra + lift en todo, header glass, exceso de bordes.
- **Hacia:** fotografía grande como protagonista, más aire, jerarquía por tamaño y peso (no por cajas), botones en tipo oración ("Cotizar ahora"), mono solo para datos técnicos puntuales (gramajes), superficies planas y bordes solo cuando separan.
