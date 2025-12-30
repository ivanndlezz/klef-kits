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
    this.result = { controllers: [], menus: {}, tokens: {} };
  }

  parse() {
    const sections = this.markdown.split("---").map((s) => s.trim());
    sections.forEach((section) => {
      if (section.includes("## Controllers")) this.parseControllers(section);
      else if (section.match(/^## #\w+/)) this.parseMegaMenu(section);
    });
    return this.result;
  }

  parseControllers(section) {
    section
      .split("\n")
      .filter((l) => l.trim())
      .forEach((line) => {
        if (line.startsWith("- ")) {
          const match = line.match(/- (.+?) → (.+?)(?:\s+@(\w+):(\w+))?$/);
          if (match) {
            this.result.controllers.push({
              label: match[1].trim(),
              target: match[2].trim(),
              align: match[3] === "align" ? match[4] : null,
              isMegaMenu: match[2].startsWith("#"),
            });
          }
        }
      });
  }

  parseMegaMenu(section) {
    const lines = section.split("\n").filter((l) => l.trim());
    const menuMatch = lines[0].match(/## (#\w+)/);
    if (!menuMatch) return;

    const menuId = menuMatch[1];
    const menu = { id: menuId, config: {}, sections: [] };
    let currentSection = null;
    let currentItem = null;

    lines.forEach((line) => {
      if (line.startsWith("@") && !line.startsWith("###")) {
        const match = line.match(/@([\w-]+)\s+(.+)/);
        if (match) menu.config[match[1]] = match[2];
      } else if (line.startsWith("### ")) {
        if (currentSection) menu.sections.push(currentSection);
        currentSection = {
          title: line.replace("### ", "").trim(),
          config: {},
          items: [],
        };
        currentItem = null;
      } else if (line.startsWith("@") && currentSection) {
        const match = line.match(/@([\w-]+)\s+(.+)/);
        if (match) currentSection.config[match[1]] = match[2];
      } else if (line.startsWith("- ") && currentSection) {
        const match = line.match(/- (.+?) → (.+?)(?:\s+(\.[\w-]+))?$/);
        if (match) {
          currentItem = {
            label: match[1].trim(),
            url: match[2].trim(),
            className: match[3] ? match[3].substring(1) : null,
            props: {},
          };
          currentSection.items.push(currentItem);
        }
      } else if (line.match(/^\s+(\w+):\s*(.+)/) && currentItem) {
        const match = line.match(/^\s+(\w+):\s*(.+)/);
        if (match) currentItem.props[match[1]] = match[2].trim();
      }
    });

    if (currentSection) menu.sections.push(currentSection);
    this.result.menus[menuId] = menu;
  }
}

// HYDRATOR - Sistema de data-binding
class TemplateHydrator {
  constructor(template, data) {
    this.template = template;
    this.data = data;
  }

  hydrate() {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = this.template;

    // Procesar controladores (navbar)
    this.processRepeat(wrapper, "controllers", this.data.controllers);

    // Procesar mega menus
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

    elements.forEach((el) => {
      const parent = el.parentNode;

      Object.values(menus).forEach((menu) => {
        const clone = el.cloneNode(true);
        clone.removeAttribute("data-repeat-menus");

        // Set ID
        if (clone.hasAttribute("data-id")) {
          clone.id = menu.id;
          clone.removeAttribute("data-id");
        }

        // Process sections
        this.processRepeat(clone, "sections", menu.sections);

        // Process items in each section
        const sections = clone.querySelectorAll(".section");
        sections.forEach((section, idx) => {
          if (menu.sections[idx]) {
            this.processRepeat(section, "items", menu.sections[idx].items);
          }
        });

        parent.insertBefore(clone, el);
      });

      el.remove();
    });
  }

  bindData(element, data) {
    // data-text
    if (element.hasAttribute("data-text")) {
      const key = element.getAttribute("data-text");
      const value = this.getNestedValue(data, key);
      if (value) element.textContent = value;
    }

    // data-href
    if (element.hasAttribute("data-href")) {
      const key = element.getAttribute("data-href");
      const value = this.getNestedValue(data, key);
      if (value) element.setAttribute("href", value);
    }

    // data-menu
    if (element.hasAttribute("data-menu")) {
      const key = element.getAttribute("data-menu");
      const value = this.getNestedValue(data, key);
      if (value) element.setAttribute("data-menu", value);
    }

    // data-align
    if (element.hasAttribute("data-align")) {
      const key = element.getAttribute("data-align");
      const value = this.getNestedValue(data, key);
      if (value) element.setAttribute("data-align", value);
    }

    // data-class
    if (element.hasAttribute("data-class")) {
      const key = element.getAttribute("data-class");
      const value = this.getNestedValue(data, key);
      if (value) element.classList.add(value);
    }

    // data-color
    if (element.hasAttribute("data-color")) {
      const key = element.getAttribute("data-color");
      const value = this.getNestedValue(data, key);
      if (value) element.setAttribute("data-color", value);
    }

    // data-if-megamenu
    if (element.hasAttribute("data-if-megamenu")) {
      const key = element.getAttribute("data-if-megamenu");
      const value = this.getNestedValue(data, key);
      if (!value) element.remove();
    }

    // Recursively bind children
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
    showStatus("Parsed successfully!");
  } catch (error) {
    showStatus("Error: " + error.message, true);
    console.error(error);
  }
}

function renderPreview() {
  const template = document.getElementById("htmlTemplate").value;
  const jsonText = document.getElementById("jsonOutput").textContent;

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
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: system-ui, sans-serif; }

.navbar {
  display: flex;
  gap: 24px;
  padding: 16px 32px;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0,0,0,.08);
  position: sticky;
  top: 0;
}

.navbar button {
  background: none;
  border: none;
  color: #000;
  padding: 8px 12px;
  cursor: pointer;
  font-size: 16px;
}

.navbar button:hover { opacity: 0.6; }

[data-align="right"] { margin-left: auto; }

.mega-menu {
  display: none;
  position: absolute;
  left: 0;
  right: 0;
  background: #fff;
  box-shadow: 0 20px 60px rgba(0,0,0,.15);
  padding: 32px;
  z-index: 100;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
}

.mega-menu.active { display: grid; }

.section h3 {
  font-size: 12px;
  text-transform: uppercase;
  color: #888;
  margin-bottom: 12px;
  letter-spacing: .05em;
}

.card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 20px;
  margin-bottom: 12px;
  background: #f8f8f8;
  border-radius: 16px;
  text-decoration: none;
  color: #000;
  transition: all .2s;
}

.card:hover {
  background: #eee;
  transform: translateY(-2px);
}

.card .icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  font-size: 18px;
}

.card[data-color="purple"] .icon { background: #e8e3ff; }
.card[data-color="orange"] .icon { background: #ffe8e3; }
.card[data-color="green"] .icon { background: #d1fae5; }
.card[data-color="blue"] .icon { background: #dbeafe; }

.card strong { font-size: 16px; }
.card span:last-child { font-size: 14px; color: #666; }
</style>
</head>
<body>

${html}

<script>
const btns = document.querySelectorAll("[data-menu]");
const menus = document.querySelectorAll(".mega-menu");

btns.forEach(btn => {
  btn.addEventListener("mouseenter", () => {
    menus.forEach(m => m.classList.remove("active"));
    const target = document.querySelector(btn.dataset.menu);
    if (target) target.classList.add("active");
  });
});

const nav = document.querySelector(".navbar");
if (nav) {
  nav.addEventListener("mouseleave", () => {
    menus.forEach(m => m.classList.remove("active"));
  });
}
<\/script>
</body>

</html>`;

    const iframe = document.getElementById("preview");
    iframe.onload = function () {
      try {
        iframe.contentDocument.open();
        iframe.contentDocument.write(fullHTML);
        iframe.contentDocument.close();
      } catch (e) {
        console.error("Error writing to iframe:", e);
      }
    };
    // Trigger onload
    iframe.src = "about:blank";
    showStatus("Preview rendered!");
  } catch (error) {
    showStatus("Error: " + error.message, true);
    console.error(error);
  }
}

function loadExample() {
  document.getElementById("markdown").value = `# Mega Menu

## Controllers
- Home → /
- Products → #products
- Docs → /docs
- Login → /login @align:right

---

## #products
@layout grid
@columns desktop:2

### Featured
@display card-icon

- Team Workspace → /teams
icon: 👥
color: purple
desc: Manage your team

- Analytics → /analytics
icon: 📊
color: orange
desc: Track metrics

- Integrations → /integrations
icon: 🔌
color: green
desc: Connect tools`;
  showStatus("Example loaded");
}

document.getElementById("btnGenerate").addEventListener("click", generate);
document.getElementById("btnExample").addEventListener("click", loadExample);
document.getElementById("btnRender").addEventListener("click", renderPreview);

window.addEventListener("load", () => {
  loadExample();
  generate();
});
