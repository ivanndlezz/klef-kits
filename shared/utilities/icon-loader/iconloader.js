// /utilities/icon-loader.js
(function () {
  if (document.getElementById("svg-symbols")) return;

  fetch("/assets/icons/symbols.svg")
    .then((res) => res.text())
    .then((svg) => {
      const div = document.createElement("div");
      div.style.display = "none";
      div.innerHTML = svg;
      div.id = "svg-symbols";
      document.body.prepend(div);
    })
    .catch((err) => console.error("Icon symbols load error", err));
})();
