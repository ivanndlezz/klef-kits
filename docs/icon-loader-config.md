# Configuración del Sistema de Iconos SVG

## Introducción

Este documento describe la configuración preferencial para el uso de iconos SVG en el proyecto. El objetivo es garantizar la eficiencia y la consistencia en la carga y uso de iconos en todo el sitio.

## Sistema Preferencial: `iconLoader.js`

### Descripción

`iconLoader.js` es el sistema principal y preferido para gestionar iconos SVG en el proyecto. Este enfoque carga todos los iconos desde un archivo centralizado (`symbols-svg.html`) y los inserta en el DOM como símbolos reutilizables.

### Ventajas

- **Eficiencia**: Carga todos los iconos en una sola solicitud HTTP.
- **Reutilización**: Los iconos se pueden reutilizar en múltiples lugares sin duplicar código.
- **Rendimiento**: Mejora el rendimiento de la página al reducir la cantidad de solicitudes.
- **Simplicidad**: Facilita el uso de iconos con elementos `<svg>` y `<use>`.

## Configuración

### Archivo de Iconos

El archivo principal de iconos es `symbols-svg.html`, ubicado en `/assets/icons/symbols-svg.html`. Este archivo contiene todos los símbolos SVG que se utilizarán en el sitio.

### Uso en HTML

Para utilizar un icono, sigue este formato:

```html
<svg>
  <use href="#icon-name"></use>
</svg>
```

Donde `icon-name` es el ID del símbolo en el archivo `symbols-svg.html`.

### Indexación de Iconos

Los nombres de los iconos (`icon-name`) se pueden indexar y gestionar utilizando archivos JSON en la carpeta `/data/svg-kits/`. Estos archivos JSON contienen metadatos sobre los iconos, como sus nombres y categorías.

### Ejemplo de Uso

```html
<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Ejemplo de Iconos</title>
    <script src="shared/utilities/icon-loader/iconloader.js"></script>
  </head>
  <body>
    <h1>Iconos SVG</h1>
    <svg>
      <use href="#icon-globe"></use>
    </svg>
    <svg>
      <use href="#icon-code"></use>
    </svg>
  </body>
</html>
```

## Conclusión

`iconLoader.js` es el sistema preferencial para gestionar iconos SVG en el proyecto. Su uso garantiza eficiencia, reutilización y un mejor rendimiento en la carga de iconos. Asegúrate de seguir estas pautas para mantener la consistencia en todo el sitio.
