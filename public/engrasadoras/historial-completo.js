import { formatearEstado } from "./detalles-tools.js";
import { formatearSignal } from "./formatear-signal.js";

export function abrirHistorialCompleto(maquina) {
  const modal = document.getElementById("modalHistorialCompleto");
  modal.style.display = "flex";

  const tbody = modal.querySelector("tbody");
  tbody.innerHTML = "";

  const todos = maquina.historial.slice().reverse();

  tbody.innerHTML = todos
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

  modal
    .querySelector("#cerrarHistorialCompleto")
    .addEventListener("click", () => {
      modal.style.display = "none";
    });
}
