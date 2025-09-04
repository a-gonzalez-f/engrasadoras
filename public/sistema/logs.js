// logs.js

let modalAbierto = false;
let intervalId = null;

document.addEventListener("DOMContentLoaded", () => {
  const logsBtn = document.getElementById("logsBtn");
  const logsModal = document.getElementById("logsModal");
  const cerrarBtn = document.getElementById("closeModalLogs");
  logsBtn.addEventListener("click", () => {
    logsModal.classList.remove("hidden");
    modalAbierto = true;
    cargarLogsSistema();

    if (!intervalId) {
      intervalId = setInterval(() => {
        if (modalAbierto) {
          cargarLogsSistema();
        } else {
          clearInterval(intervalId);
          intervalId = null;
        }
      }, 5000);
    }
  });

  cerrarBtn.addEventListener("click", () => {
    logsModal.classList.add("hidden");
    modalAbierto = false;

    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  });
});

async function cargarLogsSistema() {
  try {
    const response = await fetch("/api/sistema/logs");
    if (!response.ok) throw new Error("Error al obtener los logs");

    const data = await response.json();

    const tbody = document.getElementById("eventosConsola");
    tbody.innerHTML = "";

    if (!data.logs || data.logs.length === 0) {
      const fila = document.createElement("tr");
      fila.innerHTML = `
          <td colspan="2">No hay logs disponibles</td>
        `;
      tbody.appendChild(fila);
      return;
    }

    data.logs.reverse().forEach((log) => {
      const fila = document.createElement("tr");

      const fecha = new Date(log.createdAt).toLocaleString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });

      fila.innerHTML = `
          <td>${fecha}</td>
          <td>${log.message}</td>
        `;

      tbody.appendChild(fila);
    });
  } catch (err) {
    console.error("Error cargando logs:", err);
  }
}
