// app.js

// menu
function toggleMenu() {
  document.getElementById("menu").classList.toggle("show-menu");
}

document.addEventListener("click", function (e) {
  const menu = document.getElementById("menu");
  const menuBtn = e.target.closest("button");
  if (!menu.contains(e.target) && !menuBtn) {
    menu.classList.remove("show-menu");
  }
});
