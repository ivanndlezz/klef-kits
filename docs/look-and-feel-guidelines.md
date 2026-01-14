# Pautas de Look and Feel para Klef Agency

Este documento describe las pautas de diseño para mantener la coherencia visual y de experiencia de usuario en el sitio web de Klef Agency.

## 1. Identidad de Marca

### Logo

- **Diseño**: El logo de Klef Agency es minimalista, con un gradiente que combina tonos de azul (`#0066CC`) y morado (`#6E6EFF`).
- **Uso**: El logo debe aparecer en la esquina superior izquierda de la navegación principal y en la versión móvil.
- **Tamaño**: El logo debe tener un tamaño de 30x30 píxeles en la versión de escritorio y móvil.

### Tipografía

- **Fuente Principal**: `-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`.
- **Tamaños**:
  - Títulos principales: `48px` (escritorio), `32px` (móvil).
  - Subtítulos: `24px` (escritorio), `17px` (móvil).
  - Texto principal: `15px` (escritorio), `14px` (móvil).
- **Peso**:
  - Títulos: `600` (semi-negrita).
  - Texto principal: `400` (normal).

### Paleta de Colores

- **Primarios**:
  - Azul Klef: `#0066CC`.
  - Morado Klef: `#6E6EFF`.
- **Secundarios**:
  - Blanco: `#ffffff`.
  - Gris claro: `#f5f5f7`.
  - Negro: `#1d1d1f`.
  - Gris oscuro: `#86868b`.
- **Gradientes**: Se deben usar gradientes para elementos destacados, como el logo y las imágenes principales, para añadir profundidad y modernidad.

## 2. Diseño de Interfaz de Usuario (UI)

### Espaciado y Layout

- **Margen y Relleno**: Usar un sistema de espaciado consistente basado en múltiplos de `8px` (ejemplo: `8px`, `16px`, `24px`, `32px`).
- **Ancho Máximo**: El contenido principal debe tener un ancho máximo de `1200px` para garantizar legibilidad y enfoque.
- **Altura de Secciones**: Las secciones principales deben tener una altura mínima de `900px` en escritorio para asegurar un diseño equilibrado.

### Botones y Enlaces

- **Estilo de Botones**:
  - Botones primarios: Fondo negro (`#1d1d1f`), texto blanco, bordes redondeados (`20px`).
  - Botones secundarios: Fondo transparente, borde negro, texto negro.
- **Efectos de Hover**:
  - Cambio de opacidad o color de fondo al pasar el cursor.
  - Transiciones suaves (`0.2s` a `0.3s`).
- **Enlaces**:
  - Color principal: Negro (`#1d1d1f`).
  - Hover: Fondo gris claro (`rgba(0, 0, 0, 0.05)`).

### Imágenes

- **Estilo**: Las imágenes deben tener bordes redondeados (`16px`) y sombras suaves para destacar.
- **Efectos**: Efecto de escala al pasar el cursor (`transform: scale(1.05)`).
- **Tamaño**: Las imágenes deben ser responsivas y adaptarse al ancho de su contenedor.

### Iconos

- **Estilo**: Iconos minimalistas y modernos, con trazos delgados.
- **Tamaño**: `20px` para iconos en botones y menús, `16px` para iconos en listas.
- **Color**: Negro (`#1d1d1f`) o gris (`#86868b`) según el contexto.

## 3. Experiencia de Usuario (UX)

### Navegación

- **Menú Principal**: Debe ser claro y accesible, con categorías bien definidas como "Diseño y Media", "Tecnología" y "Marketing".
- **Mega Menú**: Usar mega menús para mostrar subcategorías y contenido destacado de manera organizada.
- **Barra de Búsqueda**: Incluir una barra de búsqueda visible para facilitar la navegación.

### Interactividad

- **Transiciones**: Usar transiciones suaves para cambios de estado (hover, clic, etc.).
- **Feedback Visual**: Proporcionar retroalimentación visual al usuario, como cambios de color o efectos de hover.
- **Animaciones**: Usar animaciones sutiles para mejorar la experiencia, como la animación de texto en el hero section.

### Responsividad

- **Diseño Adaptable**: Asegurar que el sitio se vea bien en todos los dispositivos, desde móviles hasta escritorio.
- **Menú Móvil**: Usar un menú desplegable en dispositivos móviles para ahorrar espacio y mejorar la usabilidad.
- **Imágenes Responsivas**: Las imágenes deben adaptarse al tamaño de la pantalla sin perder calidad.

## 4. Componentes Específicos

### Hero Section

- **Estructura**: Dividido en dos mitades: contenido a la izquierda e imágenes en mosaico a la derecha.
- **Texto Animado**: Usar animaciones de texto para destacar palabras clave como "diseño", "web", "logo", "marketing".
- **Barra de Búsqueda**: Incluir una barra de búsqueda destacada para facilitar la navegación.

### Sección de Proceso

- **Estructura**: Tres pasos claros y concisos para explicar el proceso de trabajo.
- **Diseño**: Usar números grandes y descripciones breves para cada paso.
- **Iconos**: Incluir iconos representativos para cada paso.

### Carrusel de Marcas

- **Estructura**: Carrusel horizontal con logos de clientes o proyectos.
- **Animación**: Efecto de desplazamiento infinito para mostrar todos los logos.
- **Estilo**: Logos centrados y con sombras suaves para destacar.

## 5. Ejemplo de Código

### Estilos CSS

```css
:root {
  --k-blue: #0066cc;
  --k-purple: #6e6eff;
  --k-white: #ffffff;
  --k-light-gray: #f5f5f7;
  --k-black: #1d1d1f;
  --k-gray: #86868b;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  background: var(--k-light-gray);
  color: var(--k-black);
}

.btn-primary {
  background: var(--k-black);
  color: var(--k-white);
  padding: 10px 20px;
  border-radius: 20px;
  transition: all 0.2s ease;
}

.btn-primary:hover {
  background: #000;
}
```

### Estructura HTML

```html
<nav class="navbar">
  <div class="logo">
    <img src="logo.png" alt="Logo de Klef Agency" width="30" height="30" />
    <span>Klef Agency</span>
  </div>
  <div class="menu-links">
    <a href="#">Inicio</a>
    <a href="#">Diseño y Media</a>
    <a href="#">Tecnología</a>
    <a href="#">Marketing</a>
  </div>
</nav>
```

## 6. Conclusión

Estas pautas aseguran que el diseño de Klef Agency sea coherente, profesional y atractivo. Al seguir estas directrices, se mantendrá una identidad visual fuerte y una experiencia de usuario óptima en todos los dispositivos y secciones del sitio.
