const megaBtns = document.querySelectorAll("[data-name]");
const navbar = document.getElementById("main-nav");

let dynamicStyle = null;

megaBtns.forEach((btn) => {
  btn.addEventListener("mouseenter", (e) => {
    const value = e.currentTarget.dataset.name;
    navbar.setAttribute("data-mega", value);

    if (dynamicStyle) {
      dynamicStyle.remove();
    }

    dynamicStyle = document.createElement("style");
    dynamicStyle.setAttribute("data-origin", "mega-menu-runtime");

    dynamicStyle.textContent = `
      [data-mega*="${value}"]:hover + .mega-menus-container ${value},
      [data-mega*="${value}"] + .mega-menus-container ${value}:hover {
        display: flex;
        flex-direction: column;
      }
    `;

    // lo insertamos en el documento
    document.head.appendChild(dynamicStyle);
  });
});
