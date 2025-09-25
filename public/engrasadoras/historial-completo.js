import { formatearEstado } from "./detalles-tools.js";
import { formatearSignal } from "./formatear-signal.js";

export function abrirHistorialCompleto(maquina) {
  const modal = document.getElementById("modalHistorialCompleto");
  const tbody = modal.querySelector("tbody");
  const cerrarBtn = modal.querySelector("#cerrarHistorialCompleto");

  modal.style.display = "flex";
  tbody.innerHTML = `<tr><td colspan="12" style="text-align:center">Cargando...</td></tr>`;

  fetch(`/api/engrasadoras/full/${maquina._id}`)
    .then((res) => res.json())
    .then((actualizada) => {
      const historial = actualizada.historial.slice().reverse();

      if (!historial.length) {
        tbody.innerHTML = `<tr><td colspan="12" style="text-align:center">No hay historial disponible</td></tr>`;
        return;
      }

      tbody.innerHTML = historial
        .map(
          (h) => `
        <tr class="${h.estado}">
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
          <td>${h.set_ejes || "-"}</td>
          <td>${h.sens_corriente ? h.sens_corriente + " mA" : "-"}</td>
          <td>${h.sens_flujo ? "Sí" : "No"}</td>
          <td>${h.sens_power ? "Sí" : "No"}</td>
          <td>${formatearSignal(h.lora_signal, "icono")}</td>
          <td>${h.on_off ? "ON" : "OFF"}</td>
          <td>${h.cont_accionam || "-"}</td>
        </tr>`
        )
        .join("");
    })
    .catch((err) => {
      console.error("Error al obtener historial completo:", err);
      tbody.innerHTML = `<tr><td colspan="12" style="text-align:center">Error al cargar historial</td></tr>`;
    });

  cerrarBtn.addEventListener("click", () => {
    modal.style.display = "none";
  });
}
