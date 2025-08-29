// gateway.js

import { abrirModalGateway } from "./gateway-modal.js";
import { actualizarBarraPorcentual } from "./barraPorcentual.js";

const container = document.getElementById("containerGateways");

let todosLosGateways = [];

async function cargarGateways() {
  try {
    const res = await fetch("/api/gateways");
    if (!res.ok) throw new Error("Error al obtener gateways");

    todosLosGateways = await res.json();

    if (!todosLosGateways.length) {
      container.innerHTML = "<p>No hay gateways cargados.</p>";
    } else {
      renderizarGateways(todosLosGateways);
      actualizarBarraPorcentual(todosLosGateways);
    }
  } catch (err) {
    container.innerHTML = `<p style="color:red;">Error cargando gateways: ${err.message}</p>`;
  }
}

// Validación y formateo automático del buscador por IP
const ipInput = document.getElementById("porIp");
if (ipInput) {
  ipInput.addEventListener("input", (e) => {
    let valor = e.target.value;

    valor = valor.replace(/[^\d.]/g, "");
    valor = valor.replace(/\.{2,}/g, ".");
    valor = valor.replace(/^\./, "");

    let bloques = valor.split(".");
    if (bloques.length > 4) bloques = bloques.slice(0, 4);

    bloques = bloques.map((b) => b.slice(0, 3));

    e.target.value = bloques.join(".");
  });
}

const inputIP = document.getElementById("porIp");
const selectLinea = document.getElementById("porLinea");

if (inputIP) inputIP.addEventListener("input", filtrarGateways);
if (selectLinea) selectLinea.addEventListener("change", filtrarGateways);

function renderizarGateways(gateways) {
  container.innerHTML = "";

  if (!gateways.length) {
    container.innerHTML = "<p>No hay coincidencias con tu búsqueda.</p>";
    return;
  }

  gateways.forEach((gw) => {
    const gwDiv = document.createElement("div");
    gwDiv.setAttribute("data-id", gw._id);

    gwDiv.classList.add("gatewayCard");
    gwDiv.classList.add("off");

    if (gw.comunicacion_back === true) {
      gwDiv.classList.remove("off");
      gwDiv.classList.add("on");
    }

    gwDiv.addEventListener("click", () => abrirModalGateway(gw));

    gwDiv.innerHTML = `
      <h4>${gw.nombre} (ID: ${gw.id || "Sin ID"})</h4>
      <p>${gw.ip}</p>
      <div style="display:flex;gap:5px">
        <p>${gw.ubicacion || ""}</p>
        <div class="miniCircle ${gw.linea}">${gw.linea}</div>
      </div>
      <div>
        <span class="material-symbols-outlined ${
          gw.bypass ? "bypassed" : "activated"
        }" title="${gw.bypass ? "Deshabilitado" : "Habilitado"}"
        data-toggle-id="${gw._id}">
        ${gw.bypass ? "toggle_off" : "toggle_on"}
        </span>
      </div>
    `;

    container.appendChild(gwDiv);
  });
}

function filtrarGateways() {
  const filtroIP = inputIP ? inputIP.value.trim().toLowerCase() : "";
  const filtroLinea = selectLinea ? selectLinea.value : "todas";

  const filtrados = todosLosGateways.filter((gw) => {
    const coincideIP = gw.ip.toLowerCase().includes(filtroIP);
    const coincideLinea = filtroLinea === "todas" || gw.linea === filtroLinea;
    return coincideIP && coincideLinea;
  });

  renderizarGateways(filtrados);
}

cargarGateways();

function actualizarEstadosPeriodicamente(intervaloSegundos = 5) {
  setInterval(async () => {
    try {
      const res = await fetch("/api/gateways");
      if (!res.ok) throw new Error("Error actualizando estados");

      const nuevosDatos = await res.json();

      actualizarBarraPorcentual(nuevosDatos);

      nuevosDatos.forEach((nuevoGW) => {
        const gwDiv = document.querySelector(
          `.gatewayCard[data-id="${nuevoGW._id}"]`
        );
        if (!gwDiv) return;

        if (nuevoGW.comunicacion_back === true) {
          gwDiv.classList.remove("off");
          gwDiv.classList.add("on");
        } else {
          gwDiv.classList.remove("on");
          gwDiv.classList.add("off");
        }

        const toggle = gwDiv.querySelector(`[data-toggle-id="${nuevoGW._id}"]`);
        if (nuevoGW.bypass === true) {
          toggle.classList.add("bypassed");
          toggle.classList.remove("activated");
          toggle.textContent = "toggle_off";
          toggle.title = "Deshabilitado";
        } else {
          toggle.classList.add("activated");
          toggle.classList.remove("bypassed");
          toggle.textContent = "toggle_on";
          toggle.title = "Habilitado";
        }
      });
    } catch (err) {
      console.error("Error actualizando estados de gateways:", err);
    }
  }, intervaloSegundos * 1000);
}

actualizarEstadosPeriodicamente(5);
