function showStatus(message, isError = false) {
  const status = document.getElementById("status");
  status.textContent = message;
  status.className = "status show" + (isError ? " error" : "");
  setTimeout(() => status.classList.remove("show"), 3000);
}

// PARSER
class MegaMenuParser {
  constructor(markdown) {
    this.markdown = markdown;
    this.result = {
      controllers: [],
      menus: {},
      tokens: {},
      navbar: { class: "navbar", id: null },
    };
  }

  parse() {
    const sections = this.markdown.split("---").map((s) => s.trim());
    sections.forEach((section) => {
      if (section.includes("## Navbar")) this.parseNavbar(section);
      if (section.includes("## Controllers")) this.parseControllers(section);
      if (section.match(/^## #\w+/m)) this.parseMegaMenu(section);
    });
    return this.result;
  }

  parseControllers(section) {
    const lines = section.split("\n").filter((l) => l.trim());
    let currentController = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line.startsWith("- ")) {
        const match = line.match(/- (.+?) → (.+?)(?:\s+@(\w+):(\w+))?$/);
        if (match) {
          currentController = {
            label: match[1].trim(),
            href: match[2].startsWith("#") ? null : match[2].trim(),
            mega: match[2].startsWith("#") ? match[2].replace("#", "") : null,
            align: match[3] === "align" ? match[4] : null,
            className: null,
            props: {},
          };
          this.result.controllers.push(currentController);

          // Check for properties on following lines
          let j = i + 1;
          while (j < lines.length) {
            const nextLine = lines[j].trim();
            if (!nextLine) {
              j++;
              continue;
            }
            if (nextLine.startsWith("- ") || nextLine.startsWith("##")) {
              break;
            }
            const propMatch = nextLine.match(/^([\w-]+):\s*(.+)$/);
            if (propMatch) {
              const propName = propMatch[1];
              const propValue = propMatch[2].trim();

              if (propName === "class") {
                currentController.className = propValue;
              } else {
                currentController.props[propName] = propValue;
              }

              j++;
              i = j - 1;
              continue;
            } else {
              break;
            }
          }
        }
      }
    }
  }

  parseNavbar(section) {
    const lines = section.split("\n").filter((l) => l.trim());
    lines.forEach((line) => {
      if (line.startsWith("##") || !line.trim()) return;
      if (line.startsWith("@")) {
        const match = line.match(/@(\w+)\s+(.+)/);
        if (match) {
          this.result.navbar[match[1]] = match[2].trim();
        }
      }
    });
  }

  parseMegaMenu(section) {
    const lines = section.split("\n");
    const menuMatch = lines[0].match(/##\s*#?([\w-]+)/);
    if (!menuMatch) return;

    const menuId = menuMatch[1]
      .replace("#", "")
      .replace(/^\w/, (c) => c.toUpperCase());
    const menu = { id: menuId, config: {}, sections: [] };
    let currentSection = null;
    let currentItem = null;

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      if (line.startsWith("@") && !line.startsWith("###")) {
        const m = line.match(/@([\w-]+)\s+(.+)/);
        if (m) menu.config[m[1]] = m[2].trim();
        continue;
      }

      if (line.startsWith("### ")) {
        if (currentSection) menu.sections.push(currentSection);
        currentSection = {
          title: line.replace("### ", "").trim(),
          config: {},
          items: [],
        };
        currentItem = null;
        continue;
      }

      if (line.startsWith("@") && currentSection) {
        const m = line.match(/@([\w-]+)\s+(.+)/);
        if (m) currentSection.config[m[1]] = m[2].trim();
        continue;
      }

      if (line.startsWith("- ") && currentSection) {
        const m = line.match(/- (.+?) → (.+?)(?:\s+(\.[\w-]+))?$/);
        if (m) {
          currentItem = {
            label: m[1].trim(),
            url: m[2].trim(),
            className: m[3] ? m[3].substring(1) : null,
            props: {},
          };
          currentSection.items.push(currentItem);

          let j = i + 1;
          while (j < lines.length) {
            const nextLine = lines[j].trim();
            if (!nextLine) {
              j++;
              continue;
            }
            if (
              nextLine.startsWith("- ") ||
              nextLine.startsWith("### ") ||
              nextLine.startsWith("@")
            ) {
              break;
            }
            const propMatch = nextLine.match(/^([\w-]+):\s*(.+)$/);
            if (propMatch) {
              currentItem.props[propMatch[1]] = propMatch[2].trim();
              j++;
              i = j - 1;
              continue;
            } else {
              break;
            }
          }
        }
      }
    }

    if (currentSection) menu.sections.push(currentSection);
    this.result.menus[menuId] = menu;
  }
}

// HYDRATOR
class TemplateHydrator {
  constructor(template, data) {
    this.template = template;
    this.data = data;
  }

  hydrate() {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = this.template;

    // 1. Bind navbar
    const navElement = wrapper.querySelector("nav");
    if (navElement && this.data.navbar) {
      if (this.data.navbar.class) navElement.className = this.data.navbar.class;
      if (this.data.navbar.id) navElement.id = this.data.navbar.id;
      navElement.removeAttribute("data-class");
      navElement.removeAttribute("data-id");
    }

    // 2. Process controllers
    this.processRepeat(wrapper, "controllers", this.data.controllers);

    // 3. Process mega menus
    this.processRepeatMenus(wrapper, this.data.menus);

    return wrapper.innerHTML;
  }

  processRepeat(container, key, items) {
    const elements = container.querySelectorAll('[data-repeat="' + key + '"]');
    elements.forEach((el) => {
      const parent = el.parentNode;
      const template = el.cloneNode(true);
      template.removeAttribute("data-repeat");

      items.forEach((item) => {
        const clone = template.cloneNode(true);
        this.bindData(clone, item);
        parent.insertBefore(clone, el);
      });

      el.remove();
    });
  }

  processRepeatMenus(container, menus) {
    const elements = container.querySelectorAll("[data-repeat-menus]");

    elements.forEach((menuTemplate) => {
      const parent = menuTemplate.parentNode;

      Object.values(menus).forEach((menu) => {
        menu.sections.forEach((sectionData) => {
          const menuClone = menuTemplate.cloneNode(true);
          menuClone.removeAttribute("data-repeat-menus");

          // Set menu ID
          if (menuClone.hasAttribute("data-id")) {
            menuClone.id = menu.id;
            menuClone.removeAttribute("data-id");
          }

          // Bind section title
          const titleEl = menuClone.querySelector("h3[data-text]");
          if (titleEl) {
            titleEl.textContent = sectionData.title;
            titleEl.removeAttribute("data-text");
          }

          // Process items
          const itemTemplate = menuClone.querySelector('[data-repeat="items"]');
          if (itemTemplate) {
            const itemParent = itemTemplate.parentNode;

            sectionData.items.forEach((itemData) => {
              const itemClone = itemTemplate.cloneNode(true);
              itemClone.removeAttribute("data-repeat");
              this.bindData(itemClone, itemData);
              itemParent.insertBefore(itemClone, itemTemplate);
            });

            itemTemplate.remove();
          }

          parent.insertBefore(menuClone, menuTemplate);
        });
      });

      menuTemplate.remove();
    });
  }

  bindData(element, data) {
    const get = (path) => this.getNestedValue(data, path);

    // data-text: mantener atributo, agregar contenido
    if (element.hasAttribute("data-text")) {
      const path = element.getAttribute("data-text");
      const value = get(path);

      if (value != null) {
        // Si el path es para un icono (contiene "icon"), usar innerHTML para SVG/HTML
        if (path.includes("icon") || value.toString().trim().startsWith("<")) {
          element.innerHTML = value;
        } else {
          element.textContent = value;
        }
      }
    }

    // data-href: mantener atributo, agregar href real
    if (element.hasAttribute("data-href")) {
      const value = get(element.getAttribute("data-href"));
      if (value != null) element.setAttribute("href", value);
    }

    // data-mega: reemplazar valor o remover si null
    if (element.hasAttribute("data-mega")) {
      const value = get(element.getAttribute("data-mega"));
      if (value != null) element.setAttribute("data-mega", "#" + value);
      else element.removeAttribute("data-mega");
    }

    // data-align: mantener o remover si null
    if (element.hasAttribute("data-align")) {
      const value = get(element.getAttribute("data-align"));
      if (value != null) element.setAttribute("data-align", value);
      else element.removeAttribute("data-align");
    }

    // data-class: mantener atributo, agregar clase real
    if (element.hasAttribute("data-class")) {
      const value = get(element.getAttribute("data-class"));
      if (value) element.classList.add(value);
    }

    // data-id: remover atributo, asignar id real
    if (element.hasAttribute("data-id")) {
      const value = get(element.getAttribute("data-id"));
      if (value != null) element.id = value;
      element.removeAttribute("data-id");
    }

    // data-name: asignar valor basado en label
    if (element.hasAttribute("data-name")) {
      const labelValue = get("label");
      if (labelValue) element.setAttribute("data-name", "#" + labelValue);
      else element.removeAttribute("data-name");
    }

    // data-color: mantener atributo, actualizar valor
    if (element.hasAttribute("data-color")) {
      const value = get(element.getAttribute("data-color"));
      if (value != null) element.setAttribute("data-color", value);
    }

    // data-if-megamenu: condicional de renderizado
    if (element.hasAttribute("data-if-megamenu")) {
      const value = get(element.getAttribute("data-if-megamenu"));
      if (!value) {
        element.remove();
        return;
      }
    }

    Array.from(element.children).forEach((child) => {
      this.bindData(child, data);
    });
  }

  getNestedValue(obj, path) {
    return path.split(".").reduce((current, key) => current?.[key], obj);
  }
}

// GENERATOR
function generate() {
  const markdown = document.getElementById("markdown").value;
  if (!markdown.trim()) {
    showStatus("Paste markdown first", true);
    return;
  }

  try {
    const parser = new MegaMenuParser(markdown);
    const data = parser.parse();
    document.getElementById("jsonOutput").textContent = JSON.stringify(
      data,
      null,
      2
    );
    showStatus("✓ Parsed successfully!");
  } catch (error) {
    showStatus("Error: " + error.message, true);
    console.error(error);
  }
}

function renderPreview() {
  const template = document.getElementById("htmlTemplate").value;
  const jsonText = document.getElementById("jsonOutput").textContent;
  const extraCSS = document.getElementById("extraCSS").value;
  const extraJS = document.getElementById("extraJS").value;

  if (!jsonText) {
    showStatus("Generate JSON first", true);
    return;
  }

  try {
    const data = JSON.parse(jsonText);
    const hydrator = new TemplateHydrator(template, data);
    const html = hydrator.hydrate();

    const fullHTML = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Preview</title>
<style>
${extraCSS}
</style>
</head>
<body>

${html}

<script>
${extraJS}
</script>
</body>
</html>`;

    const iframe = document.getElementById("preview");
    iframe.srcdoc = fullHTML;
    console.log("Hydrated HTML:", html);

    showStatus("✓ Preview rendered!");
  } catch (error) {
    showStatus("Error: " + error.message, true);
    console.error(error);
  }
}

function loadExample() {
  document.getElementById("markdown").value = `# SaaS Platform Menu

## Navbar
@id main-nav
@class navbar

## Controllers
- Dashboard → /dashboard
  icon: <svg width="16" height="16"><use href="#icon-modules"></use></svg>
  color: blue
  class: nav-primary
- Features → #features
  icon: <svg width="16" height="16"><use href="#icon-star-sparks"></use></svg>
  color: purple
- Resources → #resources
  icon: <svg width="16" height="16"><use href="#icon-book"></use></svg>
  color: green
- Pricing → /pricing
  icon: 💰
  color: orange
- Sign In → /signin @align:right
  icon: 👤
  class: btn-outline

---

## #features
@layout grid
@columns desktop:3

### Core Features
@display card-icon

- Team Collaboration → /features/teams
  icon: 👥
  color: purple
  desc: Work together seamlessly
  badge: Popular

- Analytics Dashboard → /features/analytics
  icon: 📊
  color: blue
  desc: Real-time insights
  badge: New

- API Integration → /features/api
  icon: <svg width="16" height="16"><use href="#icon-code"></use></svg>
  color: green
  desc: Connect your tools

### Security
@display card-icon

- SSO & SAML → /security/sso
  icon: 🔐
  color: red
  desc: Enterprise authentication

- Data Encryption → /security/encryption
  icon: 🛡️
  color: orange
  desc: End-to-end security

- Compliance → /security/compliance
  icon: ✅
  color: green
  desc: SOC 2, GDPR ready

---

## #resources
@layout grid
@columns desktop:2

### Learn
@display list-simple

- Documentation → /docs
  icon: <svg width="16" height="16"><use href="#icon-book"></use></svg>
  desc: Complete guides

- Video Tutorials → /tutorials
  icon: 🎥
  desc: Step-by-step videos

- API Reference → /api-docs
  icon: <svg width="16" height="16"><use href="#icon-code"></use></svg>
  desc: Developer docs

### Support
@display list-simple

- Help Center → /help
  icon: ❓
  desc: Find answers fast

- Community → /community
  icon: 💬
  desc: Join the discussion

- Contact Us → /contact
  icon: 📧
  desc: Get in touch`;
  showStatus("Example loaded");
}

document.getElementById("btnGenerate").addEventListener("click", generate);
document.getElementById("btnExample").addEventListener("click", loadExample);
document.getElementById("btnRender").addEventListener("click", renderPreview);
document
  .getElementById("btnExtras")
  .addEventListener("click", () => extrasSheet.open());

window.addEventListener("load", () => {
  loadExample();
  generate();
});

const extrasSheet = new AdaptiveSheet({
  sheetId: "sheet",
  backdropId: "backdrop",
  headerId: "header",
  closeBtnId: "closeBtn",
  contentId: "content",
  swipeThreshold: 100,
});

fetch("custom-css-js/custom-css.json")
  .then((response) => response.json())
  .then((data) => {
    const select = document.getElementById("presetSelector");
    data.presets.forEach((preset) => {
      const option = document.createElement("option");
      option.value = preset.name;
      option.textContent = preset.name;
      select.appendChild(option);
    });

    if (data.presets.length > 0) {
      const defaultPreset = data.presets[0];
      select.value = defaultPreset.name;
      document.getElementById("extraCSS").value = defaultPreset.css;
      document.getElementById("extraJS").value = defaultPreset.js;
      showStatus("Default preset loaded: " + defaultPreset.name);
    }
  })
  .catch((error) => console.error("Error loading presets:", error));

document.getElementById("loadPreset").addEventListener("click", () => {
  const select = document.getElementById("presetSelector");
  const selectedName = select.value;
  if (!selectedName) return;

  fetch("custom-css-js/custom-css.json")
    .then((response) => response.json())
    .then((data) => {
      const preset = data.presets.find((p) => p.name === selectedName);
      if (preset) {
        document.getElementById("extraCSS").value = preset.css;
        document.getElementById("extraJS").value = preset.js;
        showStatus("Preset loaded: " + preset.name);
      }
    })
    .catch((error) => console.error("Error loading preset:", error));
});
