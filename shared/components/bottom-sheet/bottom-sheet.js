/* ==========================================
   ADAPTIVE SHEET CLASS
   Componente reutilizable y escalable
   ========================================== */

class AdaptiveSheet {
  constructor(config = {}) {
    // Configuración
    this.sheetId = config.sheetId || "sheet";
    this.backdropId = config.backdropId || "backdrop";
    this.headerId = config.headerId || "header";
    this.closeBtnId = config.closeBtnId || "closeBtn";
    this.contentId = config.contentId || "content";

    // Umbrales personalizables
    this.swipeThreshold = config.swipeThreshold || 100;
    this.dragThreshold = config.dragThreshold || 5;

    // Callbacks opcionales
    this.onOpen = config.onOpen || null;
    this.onClose = config.onClose || null;
    this.onStateChange = config.onStateChange || null;

    // Elementos DOM
    this.sheet = document.getElementById(this.sheetId);
    this.backdrop = document.getElementById(this.backdropId);
    this.header = document.getElementById(this.headerId);
    this.closeBtn = document.getElementById(this.closeBtnId);
    this.content = document.getElementById(this.contentId);

    // Estado
    this.state = "CLOSED";
    this.isDragging = false;
    this.startY = 0;
    this.currentY = 0;
    this.startX = 0;
    this.currentX = 0;

    // Validación
    if (!this.sheet || !this.backdrop || !this.header) {
      console.error("AdaptiveSheet: Elementos requeridos no encontrados");
      return;
    }

    this.init();
  }

  init() {
    // Touch events (mobile)
    this.header.addEventListener(
      "touchstart",
      this.handleTouchStart.bind(this),
      { passive: true }
    );
    this.header.addEventListener("touchmove", this.handleTouchMove.bind(this), {
      passive: false,
    });
    this.header.addEventListener("touchend", this.handleTouchEnd.bind(this), {
      passive: true,
    });

    // Mouse events (desktop - opcional para drag)
    this.header.addEventListener("mousedown", this.handleMouseDown.bind(this));
    document.addEventListener("mousemove", this.handleMouseMove.bind(this));
    document.addEventListener("mouseup", this.handleMouseEnd.bind(this));

    // Close events
    this.backdrop.addEventListener("click", () => this.close());
    if (this.closeBtn) {
      this.closeBtn.addEventListener("click", () => this.close());
    }

    // Keyboard
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.state !== "CLOSED") {
        this.close();
      }
    });

    // Resize
    window.addEventListener("resize", () => {
      if (this.state !== "CLOSED") {
        this.adjustForViewport();
      }
    });

    //console.log("✅ AdaptiveSheet initialized");
  }

  // ==========================================
  // UTILITIES
  // ==========================================
  isMobile() {
    return window.innerWidth < 768;
  }

  adjustForViewport() {
    // Reset transforms si cambiamos de mobile a desktop
    if (!this.isMobile()) {
      this.sheet.style.transform = "";
    }
  }

  // ==========================================
  // STATE MANAGEMENT
  // ==========================================
  open() {
    this.backdrop.classList.add("visible");
    this.sheet.classList.add("open");
    this.state = "NORMAL";
    document.body.classList.add("sheet-open");

    if (this.onOpen) this.onOpen();

    //console.log("📱 Sheet opened");
  }

  close() {
    this.backdrop.classList.remove("visible");
    this.sheet.classList.remove("open", "full");
    this.state = "CLOSED";
    document.body.classList.remove("sheet-open");

    // Reset inline styles
    this.sheet.style.transform = "";

    if (this.onClose) this.onClose();

    //console.log("❌ Sheet closed");
  }

  setState(state) {
    if (state === "FULL") {
      this.sheet.classList.add("full");
      this.state = "FULL";
      //console.log("⬆️ Sheet expanded to FULL");
    } else if (state === "NORMAL") {
      this.sheet.classList.remove("full");
      this.state = "NORMAL";
      //console.log("⬇️ Sheet reduced to NORMAL");
    }

    if (this.onStateChange) this.onStateChange(state);
  }

  toggleFull() {
    if (this.state === "FULL") {
      this.setState("NORMAL");
    } else if (this.state === "NORMAL") {
      this.setState("FULL");
    }
  }

  // ==========================================
  // CONTENT MANAGEMENT
  // ==========================================
  setContent(html) {
    if (this.content) {
      this.content.innerHTML = html;
    }
  }

  setTitle(title) {
    const titleEl = this.sheet.querySelector(".sheet-title");
    if (titleEl) {
      titleEl.textContent = title;
    }
  }

  // ==========================================
  // TOUCH HANDLERS (MOBILE)
  // ==========================================
  handleTouchStart(e) {
    if (!this.isMobile()) return;

    this.isDragging = true;
    this.startY = e.touches[0].clientY;
    this.currentY = this.startY;

    // Detectar si el contenido está en el top para permitir drag
    if (this.content) {
      const isAtTop = this.content.scrollTop <= 0;
      if (!isAtTop && this.state === "NORMAL") {
        this.isDragging = false;
      }
    }
  }

  handleTouchMove(e) {
    if (!this.isDragging || !this.isMobile()) return;

    this.currentY = e.touches[0].clientY;
    const deltaY = this.currentY - this.startY;

    // Prevenir scroll del body
    if (Math.abs(deltaY) > this.dragThreshold) {
      e.preventDefault();
    }

    // Solo permitir drag hacia abajo en NORMAL o cualquier dirección en FULL
    if (this.state === "NORMAL" && deltaY > 0) {
      // Drag down to close
      const resistance = 1 - (deltaY / window.innerHeight) * 0.5;
      this.sheet.style.transform = `translateY(${deltaY * resistance}px)`;
    } else if (this.state === "NORMAL" && deltaY < 0) {
      // Drag up to expand
      const resistance = Math.abs(deltaY) / 200;
      this.sheet.style.transform = `translateY(${deltaY * resistance}px)`;
    } else if (this.state === "FULL" && deltaY > 0) {
      // Drag down to reduce
      const resistance = deltaY / 200;
      this.sheet.style.transform = `translateY(${deltaY * resistance}px)`;
    }
  }

  handleTouchEnd(e) {
    if (!this.isDragging || !this.isMobile()) return;

    const deltaY = this.currentY - this.startY;
    this.isDragging = false;

    // Reset transform with transition
    this.sheet.style.transform = "";

    // Determinar acción basada en el swipe
    if (this.state === "NORMAL") {
      if (deltaY > this.swipeThreshold) {
        // Swipe down: close
        this.close();
      } else if (deltaY < -this.swipeThreshold) {
        // Swipe up: expand
        this.setState("FULL");
      }
    } else if (this.state === "FULL") {
      if (deltaY > this.swipeThreshold) {
        // Swipe down: reduce to normal
        this.setState("NORMAL");
      }
    }
  }

  // ==========================================
  // MOUSE HANDLERS (DESKTOP - OPCIONAL)
  // ==========================================
  handleMouseDown(e) {
    if (this.isMobile()) return;
    // Opcional: agregar drag horizontal en desktop
  }

  handleMouseMove(e) {
    if (!this.isDragging || this.isMobile()) return;
  }

  handleMouseEnd(e) {
    if (!this.isDragging || this.isMobile()) return;
  }

  // ==========================================
  // PUBLIC API
  // ==========================================
  isOpen() {
    return this.state !== "CLOSED";
  }

  getState() {
    return this.state;
  }

  destroy() {
    // Cleanup event listeners
    //console.log("🗑️ AdaptiveSheet destroyed");
  }
}

/* ==========================================
    EXPOSICIÓN GLOBAL
    ========================================== */

window.AdaptiveSheet = AdaptiveSheet;

/* ==========================================
    INICIALIZACIÓN
    ========================================== */

// Crear instancia con configuración personalizada
const sheet = new AdaptiveSheet({
  sheetId: "sheet",
  backdropId: "backdrop",
  headerId: "header",
  closeBtnId: "closeBtn",
  contentId: "content",
  swipeThreshold: 100,
  //onOpen: () => console.log("🎉 Sheet abierto"),
  //onClose: () => console.log("👋 Sheet cerrado"),
  //onStateChange: (state) => console.log(`🔄 Estado cambiado a: ${state}`),
});

// Exponer globalmente para uso en consola/debugging
window.sheet = sheet;

//console.log("🚀 Demo listo - Prueba: sheet.open(), sheet.close(), sheet.toggleFull()");
