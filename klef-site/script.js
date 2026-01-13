// Referencias para búsqueda (se obtienen cuando el DOM está listo)
let searchOverlay = null;
let searchInput = null;

// ============================================
// BÚSQUEDA (ESTILO APPLE)
// ============================================
function openSearch() {
  if (!searchOverlay || !searchInput) return;
  searchOverlay.classList.add("active");
  document.body.style.overflow = "hidden";
  if (typeof removeDynamicStyle === "function") removeDynamicStyle();

  setTimeout(() => {
    searchInput.focus();
  }, 400);
}

function closeSearch() {
  if (!searchOverlay || !searchInput) return;
  searchOverlay.classList.remove("active");
  document.body.style.overflow = "";
  searchInput.value = "";
}

// Cerrar con ESC (manejo seguro: no leer propiedades de elementos que puedan ser null)
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    if (searchOverlay && searchOverlay.classList.contains("active")) {
      closeSearch();
    } else {
      if (typeof closeMenu === "function") closeMenu();
      if (typeof removeDynamicStyle === "function") removeDynamicStyle();
    }
  }
});

// Cerrar al hacer clic en el overlay (se añade después de obtener la referencia)

// Función para cargar componentes dinámicamente
async function loadComponent(url, placeholderId) {
  try {
    const response = await fetch(url);
    const html = await response.text();
    const placeholder = document.getElementById(placeholderId);
    if (placeholder) {
      placeholder.innerHTML = html;
    }
  } catch (error) {
    console.error(`Error loading component from ${url}:`, error);
  }
}

// Inicializar referencias y listeners ligeros cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", () => {
  // buscar elementos que el script global necesita
  searchOverlay = document.getElementById("searchOverlay");
  searchInput = document.getElementById("searchInput");

  if (searchOverlay) {
    searchOverlay.addEventListener("click", (e) => {
      if (e.target === searchOverlay) closeSearch();
    });
  }

  // Cargar componentes (mega menu y dynamic island) en placeholders
  (async () => {
    await loadComponent("components/mega-menu/mega-menu.html", "mega-menu-placeholder");
    // Intentar inicializar el componente si la función está disponible
    if (typeof initMegaMenu === "function") {
      try { initMegaMenu(); } catch (e) { console.warn('initMegaMenu error:', e); }
    }

    await loadComponent(
      "components/dynamic-island/dynamic-island.html",
      "dynamic-island-placeholder"
    );
    if (typeof initDynamicIsland === "function") {
      try { initDynamicIsland(); } catch (e) { console.warn('initDynamicIsland error:', e); }
    }
  })();
});
