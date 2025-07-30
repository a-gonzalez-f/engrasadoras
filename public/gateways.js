const container = document.getElementById("containerGateways");

async function cargarGateways() {
  try {
    const res = await fetch("/api/gateways");
    if (!res.ok) throw new Error("Error al obtener gateways");

    const gateways = await res.json();

    container.innerHTML = "";

    if (!gateways.length) {
      container.innerHTML = "<p>No hay gateways cargados.</p>";
      return;
    }

    gateways.forEach((gw) => {
      const gwDiv = document.createElement("div");
      gwDiv.classList.add("gatewayCard");

      gwDiv.innerHTML = `
        <h4>${gw.nombre} (ID: ${gw.id || "Sin ID"})</h4>
        <p>${gw.ip}</p>
        <p><strong>Línea:</strong> ${gw.linea || "-"}</p>
        <p><strong>Ubicación:</strong> ${gw.ubicacion || "-"}</p>
        <p><strong>Engrasadoras:</strong> ${
          gw.engrasadoras ? gw.engrasadoras.join(", ") : "No asignadas"
        }</p>
      `;

      container.appendChild(gwDiv);
    });
  } catch (err) {
    container.innerHTML = `<p style="color:red;">Error cargando gateways: ${err.message}</p>`;
  }
}

// Validación y formateo automático del buscador por IP
const ipInput = document.getElementById("porIp");
if (ipInput) {
  ipInput.addEventListener("input", (e) => {
    let valor = e.target.value;

    // Permitir solo dígitos y puntos
    valor = valor.replace(/[^\d.]/g, "");

    // Eliminar múltiples puntos consecutivos
    valor = valor.replace(/\.{2,}/g, ".");

    // Eliminar puntos al inicio
    valor = valor.replace(/^\./, "");

    // Limitar a 3 puntos (4 bloques)
    let bloques = valor.split(".");
    if (bloques.length > 4) {
      bloques = bloques.slice(0, 4);
    }

    // Limitar cada bloque a 3 dígitos
    bloques = bloques.map((b) => b.slice(0, 3));

    e.target.value = bloques.join(".");
  });
}

const inputIP = document.getElementById("porIp");
const selectLinea = document.getElementById("porLinea");

inputIP.addEventListener("input", filtrarGateways);
selectLinea.addEventListener("change", filtrarGateways);

let todosLosGateways = [];

async function cargarGateways() {
  try {
    const res = await fetch("/api/gateways");
    if (!res.ok) throw new Error("Error al obtener gateways");

    todosLosGateways = await res.json();
    renderizarGateways(todosLosGateways);
  } catch (err) {
    container.innerHTML = `<p style="color:red;">Error cargando gateways: ${err.message}</p>`;
  }
}

function renderizarGateways(gateways) {
  container.innerHTML = "";

  if (!gateways.length) {
    container.innerHTML = "<p>No hay coincidencias con tu búsqueda.</p>";
    return;
  }

  gateways.forEach((gw) => {
    const gwDiv = document.createElement("div");
    gwDiv.classList.add("gatewayCard");

    gwDiv.innerHTML = `
      <h4>${gw.nombre} (ID: ${gw.id || "Sin ID"})</h4>
      <p>${gw.ip}</p>
      <div style="display:flex;gap:5px"><p>${
        gw.ubicacion || ""
      } <div class="miniCircle ${gw.linea}">${gw.linea}</div></p></div>
      <p><strong>Engrasadoras:</strong> ${
        gw.engrasadoras ? gw.engrasadoras.join(", ") : "No asignadas"
      }</p>
    `;

    container.appendChild(gwDiv);
  });
}

function filtrarGateways() {
  const filtroIP = inputIP.value.trim();
  const filtroLinea = selectLinea.value;

  const filtrados = todosLosGateways.filter((gw) => {
    const coincideIP = gw.ip.toLowerCase().includes(filtroIP);
    const coincideLinea = filtroLinea === "todas" || gw.linea === filtroLinea;
    return coincideIP && coincideLinea;
  });

  renderizarGateways(filtrados);
}

cargarGateways();
