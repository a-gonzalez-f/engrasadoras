import { formatearEstado } from "./detalles-tools.js";
import { formatearSignal } from "./formatear-signal.js";

export function listarHistorialEnModal(historial) {
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

  const itemsOriginal = historial.slice(-1000);

  const vistos = new Set();
  const itemsFiltrados = [];

  for (const h of itemsOriginal) {
    if (h.tipo_evento === "Sensado") {
      if (!vistos.has(h.cont_accionam)) {
        itemsFiltrados.push(h);
        vistos.add(h.cont_accionam);
      }
    } else {
      itemsFiltrados.push(h);
    }
  }

  itemsFiltrados.reverse();

  if (itemsFiltrados.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="12" style="text-align:center">No hay historial válido para mostrar</td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = itemsFiltrados
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
          second: "2-digit",
          hour12: false,
        })}</td>
        <td>${formatearEstado(h.estado, "texto")}</td>
        <td>${h.set_tiempodosif ? h.set_tiempodosif + " s" : "-"}</td>
        <td>${h.set_ejes ? h.set_ejes : "-"}</td>
        <td>${h.sens_corriente ? h.sens_corriente + "mA" : "-"}</td>
        <td>${h.sens_flujo ? "Sí" : "No"}</td>
        <td>${h.sens_power ? "Sí" : "No"}</td>
        <td>${formatearSignal(h.lora_signal, "icono")}</td>
        <td>${h.on_off ? "ON" : "OFF"}</td>
        <td>${h.cont_accionam || "-"}</td>
      </tr>
    `
    )
    .join("");
}
