# Arquitectura del Dynamic Island

## Visión General

El Dynamic Island es un componente de interfaz de usuario modular y configurable que se inspira en el Dynamic Island de iOS, diseñado para proporcionar una experiencia interactiva y adaptable en aplicaciones web. Esta arquitectura permite la creación de interfaces dinámicas que responden al contexto del usuario, manteniendo la simplicidad y reutilización del código.

## Principios de Arquitectura

### 1. **Modularidad**

- **Clase Principal**: `DynamicIsland` encapsula toda la lógica del componente.
- **Separación de Responsabilidades**: HTML, CSS y JS están claramente separados.
- **Configurabilidad**: El contenido se define mediante datos JSON y templates HTML.

### 2. **Flexibilidad**

- **Templates Dinámicos**: Uso de template literals para renderizado de HTML.
- **Presets Predefinidos**: Configuraciones comunes disponibles como presets estáticos.
- **API Pública**: Métodos para modificar el contenido en tiempo real.

### 3. **Reutilización**

- **Instancia Global**: Una sola instancia maneja el componente.
- **Eventos Automáticos**: Los listeners se adjuntan dinámicamente basados en atributos `data-action`.
- **Herencia de Estilos**: CSS base con variantes para diferentes estados.

### 4. **Responsive y Accesible**

- **Detección de Contexto**: Responde al scroll, tamaño de pantalla y interacciones del usuario.
- **Estados Visuales**: Transiciones suaves entre estados (pill, expanded, fullscreen).
- **Feedback Háptico**: Animaciones que simulan feedback táctil.

## Estructura del Código

### Clase DynamicIsland

```javascript
class DynamicIsland {
    static presets = {
        html_preset_1: { htmlStructure: '...', data: {...} },
        html_preset_2: { htmlStructure: '...', data: {...} }
    };

    constructor(initialConfig = {});
    hydrateIsland(htmlStructure, data);
    setDynamicIsland(content);
    showToast(message, duration);
    // ... métodos privados
}
```

### API Pública

- `setDynamicIsland(content)`: Establece nueva configuración
- `hydrateIsland(htmlStructure, data)`: Renderiza con template y datos
- `showToast(message, duration)`: Muestra notificación temporal

## Estados y Comportamiento

### Estados Visuales

1. **Pill (Inicial)**

   - Forma compacta ovalada
   - Solo íconos, sin texto
   - Aparece después de scroll > 200px

2. **Expanded**

   - Forma alargada
   - Muestra íconos y texto
   - Estado activo durante interacción

3. **Fullscreen**
   - Ocupa toda la pantalla
   - Más opciones disponibles
   - Se activa con click en expanded

### Comportamiento por Defecto

- **Inicialización**: Solo botón de búsqueda
- **Scroll Detection**: Aparece y expande automáticamente
- **Auto-collapse**: Vuelve a pill después de inactividad
- **Context Badge**: Indicador temporal de "Nuevo" contenido

## Configuración Dinámica

### Estructura de Datos

```javascript
const config = {
  htmlStructure: `
        <button data-action="menu">${data.menu.icon} ${data.menu.name}</button>
        <div class="center-content" data-action="search">
            ${data.search.icon} ${data.search.name}
        </div>
    `,
  data: {
    menu: { icon: "⚙️", name: "Menú", function: toggleMenu },
    search: { icon: "🔍", name: "Buscar", function: openSearch },
  },
};
```

### Presets Disponibles

1. **html_preset_1**: Menú, búsqueda, carrito
2. **html_preset_2**: Ajustes, ayuda, perfil

### Uso de Presets

```javascript
// Cargar preset predefinido
setDynamicIsland(DynamicIslandPresets.html_preset_1);

// Configuración personalizada
setDynamicIsland({
    htmlStructure: '...',
    data: {...}
});
```

## Interacciones y Eventos

### Eventos Automáticos

- **data-action**: Atributo que define la acción del botón
- **Click Handler**: Ejecuta la función definida en `data[action].function`
- **Haptic Feedback**: Animación de escala en cada interacción

### Eventos Especiales

- **Scroll**: Controla visibilidad y expansión
- **Resize**: Adapta comportamiento móvil/desktop
- **Keyboard**: Escape para cerrar fullscreen

## Renderizado Dinámico

### Template Engine

- **Template Literals**: Usa `${data.key}` para interpolación
- **Función Segura**: `new Function()` para evaluación controlada
- **Contexto Aislado**: Variables accesibles solo dentro del template

### Ejemplo de Template

```javascript
const htmlStructure = `
    <button data-action="action1">${data.action1.icon}</button>
    <div class="content">${data.content.text}</div>
`;

const data = {
  action1: { icon: "🔥", function: () => console.log("Action!") },
  content: { text: "Contenido dinámico" },
};
```

## Funcionalidades Avanzadas

### Toast Notifications

```javascript
showToast("Mensaje de notificación", 3000);
```

- Reemplaza temporalmente el contenido
- Auto-restaura después de duración
- Animación de fade-in

### Ripple Effect

- Efecto visual de onda en botones
- CSS animations con keyframes
- Automático en todas las interacciones

### Dark Mode Support

- CSS variables para colores
- Detección automática de `prefers-color-scheme`
- Transiciones suaves

## Integración y Uso

### Inicialización

```html
<!-- En index.html -->
<script src="components/dynamic-island/dynamic-island.js"></script>
<script>
  document.addEventListener("DOMContentLoaded", () => {
    setTimeout(() => {
      setDynamicIsland(DynamicIslandPresets.html_preset_1);
    }, 200);
  });
</script>
```

### Personalización

```javascript
// Cambiar contenido dinámicamente
setDynamicIsland({
  htmlStructure: '<div class="custom">${data.custom.message}</div>',
  data: { custom: { message: "Hola Mundo" } },
});
```

## Ventajas de la Arquitectura

1. **Mantenibilidad**: Código organizado y modular
2. **Escalabilidad**: Fácil agregar nuevos presets y funcionalidades
3. **Performance**: Renderizado eficiente con templates
4. **UX Coherente**: Estados y transiciones consistentes
5. **Developer Experience**: API simple y documentación clara

## Consideraciones Técnicas

- **Browser Support**: ES6+ features (template literals, classes)
- **Performance**: Templates compilados en runtime
- **Security**: Evaluación controlada de templates
- **Accessibility**: Soporte para navegación por teclado
- **Mobile First**: Optimizado para touch interactions

## Futuras Extensiones

- **Animaciones Avanzadas**: GSAP integration
- **Context Awareness**: Integración con geolocalización, hora, etc.
- **Multi-instance**: Múltiples islands en una página
- **Persistence**: Guardar estado en localStorage
- **Analytics**: Tracking de interacciones

Esta arquitectura proporciona una base sólida para el desarrollo de interfaces dinámicas y adaptativas, manteniendo la simplicidad y potencia necesarias para experiencias de usuario modernas.
