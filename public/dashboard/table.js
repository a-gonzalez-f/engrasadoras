// table.js

import { returnDatos } from "./dashboard.js";

let registrosMostrados = 0;
let datosFiltrados = [];
const cantidadPorCarga = 10;

const cargarTodoBtn = document.querySelector("#cargarTodos");
const cargarMasBtn = document.querySelector("#cargarMas");
const actionsTable = document.querySelector("#actionsTable");

function renderTabla(data) {
  const tbody = document.getElementById("tablaEngrasadoras");
  const thead = document.getElementById("theadbuscador");
  tbody.innerHTML = "";

  if (data.length === 0) {
    thead.style.display = "none";
    tbody.innerHTML = `<tr><td colspan="11" style="text-align:center; color:grey;">No se encontraron resultados</td></tr>`;
    return;
  }

  thead.style.display = "table-header-group";

  data.forEach((e) => {
    const fila = document.createElement("tr");
    fila.classList.add(`${e.estado}`);
    fila.innerHTML = `
      <td>${e.id ? e.id : "Sin ID"}</td>
      <td>${e.nombre}</td>
      <td>${e.linea}</td>
      <td>${e.modelo}</td>
      <td>${new Date(e.date).toLocaleString("es-AR")}</td>
      <td>${e.set_tiempodosif ? e.set_tiempodosif : "-"}</td>
      <td>${e.set_ejes ? e.set_ejes : "-"}</td>
      <td>${e.sens_corriente ? e.sens_corriente : "-"}</td>
      <td>${e.sens_flujo ? booleanToIcon(e.sens_flujo) : "-"}</td>
      <td>${e.sens_power ? booleanToIcon(e.sens_power) : "-"}</td>
      <td>${e.cont_accionam ? e.cont_accionam : "-"}</td>
      <td>${e.estado ? formatearEstado(e.estado) : "-"}</td>
    `;
    tbody.appendChild(fila);
  });
}

function booleanToIcon(valor) {
  return valor
    ? `<span class="material-symbols-outlined" style="color:var(--color-pstv)">check_circle</span>`
    : `<span class="material-symbols-outlined" style="color:var(--color-error)">error</span>`;
}

function formatearEstado(estado) {
  switch (estado) {
    case "funcionando":
      return `<span class="material-symbols-outlined" style="color:var(--color-pstv)"> check_circle </span>`;
    case "alerta":
      return `<span class="material-symbols-outlined" style="color:var(--color-alerta)"> error </span>`;
    case "desconectada":
      return `<span class="material-symbols-outlined" style="color:var(--color-desconectada)"> wifi_off </span>`;
    case "fs":
      return `<span class="material-symbols-outlined" style="color:var(--color-error)"> block </span>`;
    case "pm":
      return `<span class="material-symbols-outlined" style="color:var(--color-pstv-alt)">pause_circle</span>`;
    default:
      return estado;
  }
}

export function filtrarTabla() {
  const datosEngrasadoras = returnDatos();

  const texto = document.getElementById("buscador").value.toLowerCase();
  const modelo = document.getElementById("selectModelo").value;
  const linea = document.getElementById("selectLinea").value;
  const id = document.getElementById("id").value;

  datosFiltrados = datosEngrasadoras.filter((item) => {
    const coincideNombre =
      texto === "" || item.nombre.toLowerCase().includes(texto);
    const coincideModelo =
      modelo === "todas" || item.modelo.toString() === modelo;
    const coincideLinea =
      linea === "todas" || item.linea.toLowerCase() === linea;
    const coincideID = id === "" || (item.id && item.id.toString() === id);

    return coincideNombre && coincideModelo && coincideLinea && coincideID;
  });

  registrosMostrados = 0;
  cargarMas();
}

function cargarMas() {
  const total = datosFiltrados.length;
  const hasta = Math.min(registrosMostrados + cantidadPorCarga, total);
  const datosParaMostrar = datosFiltrados.slice(0, hasta);

  renderTabla(datosParaMostrar);

  registrosMostrados = hasta;

  actionsTable.style.display = registrosMostrados >= total ? "none" : "flex";
}

function cargarTodo() {
  registrosMostrados = datosFiltrados.length;
  renderTabla(datosFiltrados);

  actionsTable.style.display = "none";
}

function initListenersTabla() {
  cargarTodoBtn.addEventListener("click", cargarTodo);
  cargarMasBtn.addEventListener("click", cargarMas);

  document.getElementById("buscador").addEventListener("input", filtrarTabla);
  document.getElementById("id").addEventListener("input", filtrarTabla);
  document
    .getElementById("selectModelo")
    .addEventListener("change", filtrarTabla);
  document
    .getElementById("selectLinea")
    .addEventListener("change", filtrarTabla);
}

initListenersTabla();
