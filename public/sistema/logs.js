// logs.js

let modalAbierto = false;
let intervalId = null;
let skip = 0;
let limit = 20;
let cargando = false;
let todosCargados = false;
let ultimaFechaLog = null;

document.addEventListener("DOMContentLoaded", () => {
  const logsBtn = document.getElementById("logsBtn");
  const logsModal = document.getElementById("logsModal");
  const cerrarBtn = document.getElementById("closeModalLogs");

  logsBtn.addEventListener("click", () => {
    logsModal.classList.remove("hidden");
    modalAbierto = true;
    skip = 0;
    limit = 20;
    todosCargados = false;
    const tbody = document.getElementById("eventosConsola");
    tbody.innerHTML = "";
    cargarLogsSistema();

    if (!intervalId) {
      intervalId = setInterval(() => {
        if (modalAbierto) {
          verificarNuevosLogs();
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

  // Infinite scroll
  const logsBody = document.getElementById("logsContainer");

  logsBody.addEventListener("scroll", () => {
    if (
      logsBody.scrollTop + logsBody.clientHeight >=
        logsBody.scrollHeight - 10 &&
      !cargando &&
      !todosCargados
    ) {
      limit = 10;
      cargarLogsSistema();
    }
  });

  document.getElementById("updateLogs").addEventListener("click", () => {
    if (!cargando) {
      skip = 0;
      limit = 20;
      todosCargados = false;
      const tbody = document.getElementById("eventosConsola");
      tbody.innerHTML = "";
      cargarLogsSistema(true);
      document.getElementById("updateLogs").style.display = "none";
      nuevosLogsDisponibles = false;
    }
  });
});

async function cargarLogsSistema(recargaTotal = false) {
  cargando = true;

  try {
    const response = await fetch(
      `/api/sistema/logs?skip=${skip}&limit=${limit}`
    );
    if (!response.ok) throw new Error("Error al obtener los logs");

    const data = await response.json();

    const tbody = document.getElementById("eventosConsola");

    if (recargaTotal && data.logs.length > 0) {
      ultimaFechaLog = new Date(data.logs[0].createdAt).getTime();
    }

    if (!data.logs || data.logs.length === 0) {
      if (skip === 0) {
        const fila = document.createElement("tr");
        fila.innerHTML = `<td colspan="2">No hay logs disponibles</td>`;
        tbody.appendChild(fila);
      }
      todosCargados = true;
      return;
    }

    data.logs.forEach((log) => {
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

    if (recargaTotal) {
      cantidadLogsActual = data.logs.length;
    }

    skip += data.logs.length;
  } catch (err) {
    console.error("Error cargando logs:", err);
  } finally {
    cargando = false;
  }
}

let cantidadLogsActual = 0;
let nuevosLogsDisponibles = false;

async function verificarNuevosLogs() {
  try {
    const response = await fetch(`/api/sistema/logs?skip=0&limit=1`);
    if (!response.ok) throw new Error("Error al verificar logs");

    const data = await response.json();
    const logMasReciente = data.logs?.[0];

    if (logMasReciente) {
      const nuevaFecha = new Date(logMasReciente.createdAt).getTime();

      if (!ultimaFechaLog || nuevaFecha > ultimaFechaLog) {
        nuevosLogsDisponibles = true;
        document.getElementById("updateLogs").style.display = "block";
      }
    }
  } catch (err) {
    console.error("Error verificando nuevos logs:", err);
  }
}
