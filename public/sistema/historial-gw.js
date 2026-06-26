// historial-gw.js

export function listarHistorial(gateway) {
  const tbody = document.getElementById("historialGW");
  tbody.innerHTML = "";

  if (gateway.historial.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align:center">No hay historial registrado</td>
      </tr>
    `;
    return;
  }

  const todos = gateway.historial.slice(-100).reverse();

  tbody.innerHTML = todos
    .map(
      (h) => `
      <tr>
        <td>${h.nro_evento || "-"}</td>
        <td>${h.tipo_evento || "-"}</td>
        <td>${new Date(h.fecha).toLocaleString("es-AR", {
          day: "2-digit",
          month: "2-digit",
          year: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })}</td>
        <td class="${h.estado}">${h.estado}</td>
        <td class="${h.bypass ? "ngtv" : "pstv"}">${h.bypass ? "No" : "Sí"}</td>
      </tr>`
    )
    .join("");
}
