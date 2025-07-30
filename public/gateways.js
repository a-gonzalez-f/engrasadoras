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

cargarGateways();
