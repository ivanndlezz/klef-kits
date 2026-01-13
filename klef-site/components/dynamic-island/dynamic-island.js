// Clase DynamicIsland para arquitectura modular y configurable
class DynamicIsland {
  static presets = {
    html_preset_1: {
      getHtmlStructure(data) {
        return `<div class="island-content">
            <button class="island-btn secondary" data-action="menu">
                <span class="icon">${data.menu.icon}</span>
                <span>${data.menu.name}</span>
            </button>
            <div class="center-content" data-action="search">
                <span class="search-icon">${data.search.icon}</span>
                <span>${data.search.name}</span>
            </div>
            <button class="island-btn accent" data-action="cart">
                <span class="icon">${data.cart.icon}</span>
                <span>${data.cart.name}</span>
            </button>
        </div>`;
      },
      data: {
        menu: {
          icon: '<div class="ham-menu"> <i class="menu-line"></i> <i class="menu-line"></i> <i class="menu-line"></i> </div>',
          name: "Menú",
          function: () => {
            if (window.innerWidth <= 768) {
              toggleMenu();
            } else {
              const firstMenuBtn = document.querySelector("a[data-mega]");
              if (firstMenuBtn) firstMenuBtn.click();
            }
          },
        },
        search: {
          icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" style="--wh:20px; width: var(--wh); height: var(--wh);"><use href="#icon-search"></use></svg>',
          name: "Buscar",
          function: openSearch,
        },
        cart: {
          icon: "🛒",
          name: "Carrito",
          function: openCart,
        },
      },
    },
    html_preset_2: {
      getHtmlStructure(data) {
        return `<div class="island-content">
            <button class="island-btn primary" data-action="settings">
                <span class="icon">${data.settings.icon}</span>
                <span>${data.settings.name}</span>
            </button>
            <div class="center-content" data-action="help">
                <span class="icon">${data.help.icon}</span>
                <span>${data.help.name}</span>
            </div>
            <button class="island-btn secondary" data-action="profile">
                <span class="icon">${data.profile.icon}</span>
                <span>${data.profile.name}</span>
            </button>
        </div>`;
      },
      data: {
        settings: {
          icon: '<div class="ham-menu"> <i class="menu-line"></i> <i class="menu-line"></i> <i class="menu-line"></i> </div>',
          name: "Ajustes",
          function: () => {
            console.log("Abrir ajustes");
          },
        },
        help: {
          icon: "❓",
          name: "Ayuda",
          function: () => {
            console.log("Abrir ayuda");
          },
        },
        profile: {
          icon: "👤",
          name: "Perfil",
          function: () => {
            console.log("Abrir perfil");
          },
        },
      },
    },
  };

  constructor(initialConfig = {}) {
    this.config = initialConfig;
    this.container = null;
    this.island = null;
    this.islandContent = null;
    this.centerBtn = null;
    this.islandCloseBtn = null;
    this.contextBadge = null;
    this.lastScroll = 0;
    this.scrollTimeout = null;
    this.isFullscreen = false;

    this.init();
  }

  init() {
    // Intentar obtener referencias a los elementos existentes
    this.container = document.querySelector(".dynamic-island-container");
    this.island = document.querySelector(".dynamic-island");
    this.islandContent = document.querySelector(".island-content");
    this.centerBtn = document.querySelector(".center-content");
    this.islandCloseBtn = document.querySelector(".dynamic-island .close-btn");
    this.contextBadge = document.querySelector(".context-badge");

    // Si no existen los elementos necesarios, crear toda la estructura
    if (!this.container) {
      const placeholder = document.getElementById("dynamic-island-placeholder");
      const mount = placeholder || document.body;

      const containerDiv = document.createElement("div");
      containerDiv.className = "dynamic-island-container";
      containerDiv.innerHTML = `
        <div class="dynamic-island pill" role="region" aria-label="Dynamic Island">
          <button class="close-btn" aria-label="Cerrar">×</button>
          <div class="island-content">
            <div class="center-content" data-action="search">
              <span class="search-icon">🔍</span>
              <span>Buscar</span>
            </div>
          </div>
          <div class="context-badge" aria-hidden="true"></div>
        </div>
      `;

      mount.appendChild(containerDiv);

      // Reasignar todas las referencias
      this.container = document.querySelector(".dynamic-island-container");
      this.island = document.querySelector(".dynamic-island");
      this.islandContent = document.querySelector(".island-content");
      this.centerBtn = document.querySelector(".center-content");
      this.islandCloseBtn = document.querySelector(
        ".dynamic-island .close-btn"
      );
      this.contextBadge = document.querySelector(".context-badge");
    }

    // Configurar eventos
    this.setupScrollDetection();
    this.setupEventListeners();

    // Establecer estado inicial
    if (this.island) {
      this.island.setAttribute("data-status", "tool-set");
    }

    // Mapear contenido estático si existe
    if (
      this.islandContent &&
      this.islandContent.children &&
      this.islandContent.children.length > 0 &&
      !(this.config.htmlStructure && this.config.data)
    ) {
      try {
        const fallbackData =
          (DynamicIsland &&
            DynamicIsland.presets &&
            DynamicIsland.presets.html_preset_1 &&
            DynamicIsland.presets.html_preset_1.data) ||
          {};

        const keys = Object.keys(fallbackData);
        const candidates = Array.from(
          this.islandContent.querySelectorAll(
            "button, div, [role=button], .island-btn, .center-content"
          )
        );

        keys.forEach((key, idx) => {
          const candidate = candidates[idx];
          if (!candidate) return;
          if (!candidate.getAttribute("data-action")) {
            candidate.setAttribute("data-action", key);
          }
        });

        this.config = { data: fallbackData };
        this.attachEventListeners(fallbackData);
      } catch (err) {
        console.error("DynamicIsland: error auto-mapping static DOM", err);
      }

      return;
    }

    // Hydrate with initial config if provided
    if (this.config.htmlStructure && this.config.data) {
      this.hydrateIsland(this.config.htmlStructure, this.config.data);
    }
  }

  hydrateIsland(htmlStructure, data) {
    if (!this.islandContent) {
      console.error("DynamicIsland: islandContent not found");
      return;
    }

    // Renderizar solo el contenido interno (island-content)
    const renderedHTML = new Function(
      "data",
      "return `" + htmlStructure + "`;"
    )(data);

    // Reemplazar SOLO el contenido de island-content, sin espacios extras
    this.islandContent.outerHTML = renderedHTML.trim();

    // Reasignar referencias después de reemplazar el HTML
    this.islandContent = this.island.querySelector(".island-content");
    this.centerBtn = this.island.querySelector(".center-content");

    // Auto-mapear acciones
    try {
      if (data && typeof data === "object") {
        const keys = Object.keys(data);
        const candidates = Array.from(
          this.islandContent.querySelectorAll(
            "button, div, [role=button], .island-btn, .center-content"
          )
        );

        keys.forEach((key) => {
          const item = data[key];
          if (!item) return;
          const name = (item.name || "").toString().trim();
          const icon = (item.icon || "").toString();

          let found = this.islandContent.querySelector(
            `[data-action="${key}"]`
          );
          if (found) return;

          for (const el of candidates) {
            const text = (el.textContent || "").trim();
            if (name && text && text.indexOf(name) !== -1) {
              el.setAttribute("data-action", key);
              found = el;
              break;
            }
            if (icon && typeof icon === "string" && icon.length > 0) {
              if (el.innerHTML && el.innerHTML.indexOf(icon) !== -1) {
                el.setAttribute("data-action", key);
                found = el;
                break;
              }
            }
          }

          if (!found) {
            if (keys.length === 3 && candidates.length >= 3) {
              const idx = keys.indexOf(key);
              const candidate = candidates[idx];
              if (candidate) {
                candidate.setAttribute("data-action", key);
              }
            }
          }
        });
      }
    } catch (err) {
      console.error("DynamicIsland: error during auto-mapping actions", err);
    }

    // Adjuntar event listeners
    this.attachEventListeners(data);

    // Configurar eventos específicos
    if (this.centerBtn) {
      this.centerBtn.addEventListener("click", () => {
        if (this.island) {
          this.island.classList.add("haptic");
          setTimeout(() => this.island.classList.remove("haptic"), 200);
        }
      });
    }

    // Configurar escape key
    const escapeHandler = (e) => {
      if (e.key === "Escape" && this.isFullscreen && this.islandCloseBtn) {
        this.islandCloseBtn.click();
      }
    };

    // Remover handler anterior si existe
    if (this.escapeHandler) {
      document.removeEventListener("keydown", this.escapeHandler);
    }
    this.escapeHandler = escapeHandler;
    document.addEventListener("keydown", escapeHandler);
  }

  setDynamicIsland(content) {
    this.config = content;
    this.hydrateIsland(content.htmlStructure, content.data);
  }

  loadDefault() {
    const defaultStructure = `<div class="island-content">
        <div class="center-content" data-action="search">
          <span class="search-icon">🔍</span>
          <span>Buscar</span>
        </div>
      </div>`;
    const defaultData = {
      search: {
        icon: "",
        name: "Buscar",
        function: openSearch,
      },
    };
    this.hydrateIsland(defaultStructure, defaultData);
  }

  attachEventListeners(data) {
    if (!this.islandContent) return;

    const nodes = this.islandContent.querySelectorAll("[data-action]");
    nodes.forEach((el) => {
      const action = el.getAttribute("data-action");
      const handler = data && data[action] && data[action].function;

      if (!handler) {
        console.warn("DynamicIsland: no handler found for action:", action);
        return;
      }

      el.style.pointerEvents = el.style.pointerEvents || "auto";
      el.style.cursor = el.style.cursor || "pointer";

      if (el.dataset.diListenerAttached) return;
      el.dataset.diListenerAttached = "true";

      el.addEventListener("click", (e) => {
        try {
          e.stopPropagation();
          if (this.island) {
            this.island.classList.add("haptic");
            setTimeout(() => this.island.classList.remove("haptic"), 200);
          }
          handler();
          this.createRipple(el);
        } catch (err) {
          console.error(
            "DynamicIsland: error executing handler for",
            action,
            err
          );
        }
      });
    });
  }

  setupScrollDetection() {
    window.addEventListener("scroll", () => {
      if (!this.container || !this.island) return;

      const currentScroll = window.pageYOffset;

      clearTimeout(this.scrollTimeout);

      if (currentScroll > 200) {
        this.container.classList.add("visible");

        setTimeout(() => {
          if (!this.isFullscreen && this.island) {
            this.island.classList.remove("pill");
            this.island.classList.add("expanded");

            if (currentScroll > 300 && currentScroll < 600) {
              if (this.contextBadge) {
                this.contextBadge.classList.add("show");
                setTimeout(
                  () => this.contextBadge.classList.remove("show"),
                  2000
                );
              }
            }
          }
        }, 300);

        this.scrollTimeout = setTimeout(() => {
          if (!this.isFullscreen && this.island) {
            this.island.classList.remove("expanded");
            this.island.classList.add("pill");
          }
        }, 2000);
      } else {
        this.container.classList.remove("visible");
        if (this.island) {
          this.island.classList.remove("expanded");
          this.island.classList.add("pill");
        }
      }

      this.lastScroll = currentScroll;
    });
  }

  setupEventListeners() {
    // Close button
    if (this.islandCloseBtn) {
      this.islandCloseBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        if (this.island) {
          this.island.classList.add("haptic");
          setTimeout(() => this.island.classList.remove("haptic"), 200);
          this.island.classList.remove("fullscreen");
          this.island.classList.add("expanded");
        }
        document.body.style.overflow = "";
        this.isFullscreen = false;
      });
    }

    // Click outside to close fullscreen
    if (this.island) {
      this.island.addEventListener("click", (e) => {
        if (
          this.isFullscreen &&
          e.target === this.island &&
          this.islandCloseBtn
        ) {
          this.islandCloseBtn.click();
        }
      });
    }

    // Keyboard shortcuts
    const escapeHandler = (e) => {
      if (e.key === "Escape" && this.isFullscreen && this.islandCloseBtn) {
        this.islandCloseBtn.click();
      }
    };
    this.escapeHandler = escapeHandler;
    document.addEventListener("keydown", escapeHandler);
  }

  showToast(html, data = {}, type = "3s") {
    if (!this.island || !this.islandContent) return;

    this.container.classList.add("visible");
    this.island.setAttribute("data-status", "toast");

    // Agregar clase full-width si se especifica en data
    if (data.fullWidth) {
      this.island.classList.add("full-width");
    }

    this.previousHtml = this.islandContent.outerHTML;
    this.previousData = this.config.data;

    let toastStructure = `<div class="island-content"><div class="toast-content">${html}</div></div>`;
    const toastData = { ...data };

    if (type === "persistent") {
      toastStructure = `<div class="island-content"><div class="toast-content">${html}<button class="toast-close-btn" onclick="closeToast()">×</button></div></div>`;
    }

    if (data.actions && Array.isArray(data.actions)) {
      let actionsHtml = "";
      data.actions.forEach((action, index) => {
        actionsHtml += `<button class="toast-action-btn" data-action-index="${index}">${action.text}</button>`;
      });
      toastStructure = `<div class="island-content"><div class="toast-content">${html}${actionsHtml}</div></div>`;
      toastData.actions = data.actions;
    }

    this.hydrateIsland(toastStructure, toastData);

    if (data.actions) {
      const actionBtns =
        this.islandContent.querySelectorAll(".toast-action-btn");
      actionBtns.forEach((btn, index) => {
        btn.addEventListener("click", () => {
          if (data.actions[index] && data.actions[index].onClick) {
            data.actions[index].onClick();
          }
          this.restoreContent();
        });
      });
    }

    let duration = 3000;
    if (type === "1s") duration = 1000;
    if (type === "3s") duration = 3000;
    if (data.duration) duration = data.duration;

    if (type !== "persistent" && duration) {
      setTimeout(() => this.restoreContent(), duration);
    }
  }

  restoreContent() {
    if (!this.island) return;

    this.island.setAttribute("data-status", "tool-set");

    // Remover clase full-width al restaurar
    this.island.classList.remove("full-width");

    if (this.previousHtml && this.previousData) {
      this.islandContent.outerHTML = this.previousHtml;
      this.islandContent = this.island.querySelector(".island-content");
      this.config.data = this.previousData;
      this.attachEventListeners(this.previousData);
    } else if (this.config.htmlStructure && this.config.data) {
      this.hydrateIsland(this.config.htmlStructure, this.config.data);
    } else {
      this.loadDefault();
    }
  }

  createRipple(btn) {
    const ripple = document.createElement("div");
    ripple.style.cssText = `
      position: absolute;
      width: 100%;
      height: 100%;
      background: rgba(255,255,255,0.5);
      border-radius: inherit;
      pointer-events: none;
      animation: ripple 0.6s ease-out;
    `;
    btn.style.position = "relative";
    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  }
}

// CSS for ripple animation
const rippleStyle = document.createElement("style");
rippleStyle.textContent = `
  @keyframes ripple {
    from {
      transform: scale(0);
      opacity: 1;
    }
    to {
      transform: scale(2);
      opacity: 0;
    }
  }
`;
document.head.appendChild(rippleStyle);

// Exponer la clase y presets globalmente
window.DynamicIsland = DynamicIsland;
window.DynamicIslandPresets = DynamicIsland.presets;

// Instancia global
let dynamicIslandInstance;

// Funciones helper para acciones
function openSearch() {
  const searchOverlay = document.getElementById("searchOverlay");
  if (searchOverlay) {
    searchOverlay.classList.add("active");
    document.body.style.overflow = "hidden";
  } else {
    console.log("Abrir búsqueda");
  }
}

function toggleMenu() {
  const mainNav = document.getElementById("main-nav");
  if (mainNav) {
    mainNav.classList.toggle("active");
  } else {
    console.log("Toggle menú");
  }
}

function openCart() {
  console.log("Abrir carrito");
}

// Función de inicialización
function initDynamicIsland(initialConfig = {}) {
  dynamicIslandInstance = new DynamicIsland(initialConfig);
}

// Funciones públicas para API
function setDynamicIsland(content) {
  const htmlStructure = content.getHtmlStructure
    ? content.getHtmlStructure(content.data)
    : content.htmlStructure;
  const data = content.data || content;

  if (dynamicIslandInstance) {
    dynamicIslandInstance.setDynamicIsland({ htmlStructure, data });
    return;
  }

  initDynamicIsland({ htmlStructure, data });
  setTimeout(() => {
    if (dynamicIslandInstance) {
      dynamicIslandInstance.setDynamicIsland({ htmlStructure, data });
    }
  }, 150);
}

function hydrateIsland(htmlStructure, data) {
  if (dynamicIslandInstance) {
    dynamicIslandInstance.hydrateIsland(htmlStructure, data);
  }
}

function showToast(html, data = {}, type = "3s") {
  if (dynamicIslandInstance) {
    if (typeof data === "number" && typeof type === "undefined") {
      const duration = data;
      const message = html;
      dynamicIslandInstance.showToast(message, { duration }, "3s");
    } else {
      dynamicIslandInstance.showToast(html, data, type);
    }
  }
}

function listIslandActions() {
  if (!dynamicIslandInstance) return [];
  const content = dynamicIslandInstance.islandContent;
  if (!content) return [];
  return Array.from(content.querySelectorAll("[data-action]")).map((el) => ({
    action: el.getAttribute("data-action"),
    text: el.innerText,
    hasHandler: !!(
      dynamicIslandInstance.config &&
      dynamicIslandInstance.config.data &&
      dynamicIslandInstance.config.data[el.getAttribute("data-action")]
    ),
  }));
}

function triggerIslandAction(action) {
  if (!dynamicIslandInstance) return console.warn("no dynamicIslandInstance");
  const el = dynamicIslandInstance.islandContent.querySelector(
    `[data-action="${action}"]`
  );
  if (!el) return console.warn("action element not found", action);
  el.click();
}

function loadPreset(presetName) {
  console.log("loadPreset called with", presetName);
  const preset = DynamicIsland.presets[presetName];
  console.log("preset found:", preset);
  if (preset) {
    setDynamicIsland(preset);
    console.log("setDynamicIsland called");
  } else {
    console.error("Preset not found:", presetName);
  }
}

window.loadPreset = loadPreset;
window.closeToast = function () {
  if (dynamicIslandInstance) {
    dynamicIslandInstance.restoreContent();
  }
};

// Inicializar cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => initDynamicIsland(), 100);
});
