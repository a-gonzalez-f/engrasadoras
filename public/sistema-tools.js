const btnIngreso = document.getElementById("btnIngreso");
const sectionIngreso = document.getElementById("sectionIngreso");

// Alternar visibilidad de sectionIngreso
btnIngreso.addEventListener("click", (e) => {
  e.stopPropagation();
  const visible = modalIngreso.style.display === "flex";
  modalIngreso.style.display = visible ? "none" : "flex";
});

// Cerrar si se hace clic fuera del sectionIngreso
modalIngreso.addEventListener("click", (e) => {
  if (e.target === modalIngreso) {
    modalIngreso.style.display = "none";
  }
});

document.querySelector(".closeModal").addEventListener("click", () => {
  modalIngreso.style.display = "none";
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    modalIngreso.style.display = "none";
  }
});
