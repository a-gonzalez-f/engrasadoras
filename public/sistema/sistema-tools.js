// sistema-tools.js

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

// Manejo de Panel de Estados del Sistema

const btnStatus = document.getElementById("closeStatus");
const estadosSistema = document.getElementById("estadosSistema");
const blurred = document.getElementById("blur");

let abierto = false;

btnStatus.addEventListener("click", () => {
  abierto = !abierto;

  estadosSistema.style.left = abierto ? "0" : "-15vw";
  btnStatus.style.transform = abierto ? "rotate(0deg)" : "rotate(180deg)";
  blurred.style.display = abierto ? "block" : "none";
});

document.addEventListener("click", function (event) {
  if (abierto) {
    if (!estadosSistema.contains(event.target) && event.target !== btnStatus) {
      abierto = false;
      estadosSistema.style.left = "-15vw";
      btnStatus.style.transform = "rotate(180deg)";
      blurred.style.display = "none";
    }
  }
});
