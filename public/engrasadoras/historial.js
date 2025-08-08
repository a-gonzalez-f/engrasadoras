import { formatearEstado } from "./detalles-tools.js";

export function listarHistorialEnModal(historial, completo = false) {
  const tbody = document.querySelector(".tabla-historial tbody");

  if (!tbody) return;

  if (historial.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="12" style="text-align:center">No hay historial registrado</td>
      </tr>
    `;
    return;
  }

  const items = completo
    ? historial.slice().reverse()
    : historial.slice(-10).reverse();

  tbody.innerHTML = items
    .map(
      (h) => `
      <tr class="historial-item ${h.estado}">
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
        <td>${formatearEstado(h.estado, "texto")}</td>
        <td>${h.set_tiempodosif ? h.set_tiempodosif + " s" : "-"}</td>
        <td>${h.set_ejes ? h.set_ejes : "-"}</td>
        <td>${h.sens_corriente ? h.sens_corriente + "mA" : "-"}</td>
        <td>${h.sens_flujo ? "Sí" : "No"}</td>
        <td>${h.sens_power ? "Sí" : "No"}</td>
        <td>${h.lora_signal || "-"}</td>
        <td>${h.on_off ? "ON" : "OFF"}</td>
        <td>${h.cont_accionam || "-"}</td>
      </tr>
    `
    )
    .join("");
}
