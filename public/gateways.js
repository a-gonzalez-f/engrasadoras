// gateway.js

import { abrirModalGateway } from "./gateway-modal.js";

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
    gwDiv.classList.add("gatewayCard");

    gwDiv.addEventListener("click", () => abrirModalGateway(gw));

    gwDiv.innerHTML = `
      <h4>${gw.nombre} (ID: ${gw.id || "Sin ID"})</h4>
      <p>${gw.ip}</p>
      <div style="display:flex;gap:5px">
        <p>${gw.ubicacion || ""}</p>
        <div class="miniCircle ${gw.linea}">${gw.linea}</div>
      </div>
      <p><strong>Engrasadoras:</strong><br> ${
        gw.engrasadoras
          ? gw.engrasadoras.length > 3
            ? gw.engrasadoras.slice(0, 3).join(", ") + ", ..."
            : gw.engrasadoras.join(", ")
          : "No asignadas"
      }</p>

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
