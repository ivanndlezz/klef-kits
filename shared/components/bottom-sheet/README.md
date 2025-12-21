# Adaptive Bottom Sheet Component

Un componente reutilizable que se adapta automáticamente entre Bottom Sheet en móvil y Side Panel en desktop.

## Características

- 📱 **Responsive**: Bottom Sheet en móvil (< 768px), Side Panel en desktop (≥ 768px)
- 👆 **Touch-friendly**: Soporte completo para gestos táctiles en móvil
- ⌨️ **Accesible**: Navegación por teclado (ESC para cerrar)
- 🎨 **Personalizable**: Variables CSS para colores, tamaños y animaciones
- 🔧 **Configurable**: API flexible con callbacks opcionales
- 🚀 **Sin dependencias**: Solo JavaScript vanilla

## Instalación

Incluye los archivos CSS y JS en tu página:

```html
<!-- CSS -->
<link
  rel="stylesheet"
  href="path/to/shared/components/bottom-sheet/bottom-sheet.css"
/>

<!-- JS -->
<script src="path/to/shared/components/bottom-sheet/bottom-sheet.js"></script>
```

## HTML Estructura

```html
<!-- Backdrop (fondo oscuro) -->
<div class="adaptive-backdrop" id="backdrop"></div>

<!-- Sheet principal -->
<div class="adaptive-sheet" id="sheet">
  <!-- Header con drag handle y título -->
  <div class="sheet-header" id="header">
    <div class="sheet-drag-handle"></div>
    <div class="sheet-title-bar">
      <h2 class="sheet-title">Título del Sheet</h2>
      <button class="sheet-close-btn" id="closeBtn">×</button>
    </div>
  </div>

  <!-- Contenido scrollable -->
  <div class="sheet-content" id="content">
    <!-- Tu contenido aquí -->
  </div>

  <!-- Footer opcional con acciones -->
  <div class="sheet-cta">
    <button onclick="sheet.close()">Cerrar</button>
  </div>
</div>
```

## JavaScript Inicialización

```javascript
// Configuración básica
const sheet = new AdaptiveSheet({
  sheetId: "sheet",
  backdropId: "backdrop",
  headerId: "header",
  closeBtnId: "closeBtn",
  contentId: "content",
});

// Con callbacks opcionales
const sheet = new AdaptiveSheet({
  sheetId: "sheet",
  backdropId: "backdrop",
  headerId: "header",
  closeBtnId: "closeBtn",
  contentId: "content",
  swipeThreshold: 100, // píxeles para activar swipe
  onOpen: () => console.log("Sheet abierto"),
  onClose: () => console.log("Sheet cerrado"),
  onStateChange: (state) => console.log(`Estado: ${state}`),
});
```

## API Pública

### Métodos

- `sheet.open()` - Abre el sheet
- `sheet.close()` - Cierra el sheet
- `sheet.toggleFull()` - Alterna entre normal y full
- `sheet.setState('NORMAL'|'FULL')` - Establece estado específico
- `sheet.setContent(html)` - Actualiza el contenido
- `sheet.setTitle(title)` - Cambia el título
- `sheet.isOpen()` - Retorna true si está abierto
- `sheet.getState()` - Retorna 'CLOSED', 'NORMAL' o 'FULL'
- `sheet.destroy()` - Limpia event listeners

### Estados

- `CLOSED` - Completamente cerrado
- `NORMAL` - Tamaño estándar (65vh móvil, 480px desktop)
- `FULL` - Tamaño expandido (95vh móvil, 640px desktop)

## Personalización CSS

El componente usa variables CSS que puedes sobrescribir:

```css
:root {
  --sheet-bg: var(--bg-primary);
  --sheet-border: var(--border-light);
  --sheet-shadow: var(--shadow-lg);
  --sheet-radius: var(--radius-xl);
  --sheet-handle-color: var(--gray-400);
  --backdrop-bg: rgba(0, 0, 0, 0.5);
  --transition-speed: var(--duration-slow);
}
```

## Eventos y Gestos

### Móvil (< 768px)

- **Drag down**: Cerrar (desde NORMAL) o reducir (desde FULL)
- **Drag up**: Expandir a FULL (desde NORMAL)
- **Tap backdrop**: Cerrar
- **Tap close button**: Cerrar
- **ESC key**: Cerrar

### Desktop (≥ 768px)

- **Click backdrop**: Cerrar
- **Click close button**: Cerrar
- **ESC key**: Cerrar

## Ejemplo Completo

```html
<!DOCTYPE html>
<html>
  <head>
    <link rel="stylesheet" href="path/to/design-system.css" />
    <link rel="stylesheet" href="path/to/bottom-sheet.css" />
  </head>
  <body>
    <button onclick="sheet.open()">Abrir Sheet</button>

    <div class="adaptive-backdrop" id="backdrop"></div>
    <div class="adaptive-sheet" id="sheet">
      <div class="sheet-header" id="header">
        <div class="sheet-drag-handle"></div>
        <div class="sheet-title-bar">
          <h2 class="sheet-title">Mi Sheet</h2>
          <button class="sheet-close-btn" id="closeBtn">×</button>
        </div>
      </div>
      <div class="sheet-content" id="content">
        <p>Contenido del sheet...</p>
      </div>
    </div>

    <script src="path/to/bottom-sheet.js"></script>
    <script>
      const sheet = new AdaptiveSheet();
    </script>
  </body>
</html>
```

## Notas de Desarrollo

- El componente requiere el design system CSS para las variables
- Los IDs deben ser únicos si hay múltiples sheets en la misma página
- El contenido se hace scrollable automáticamente
- Compatible con iOS Safari y Chrome Mobile
