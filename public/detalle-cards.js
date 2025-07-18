// detalle-cards.js

import { formatearEstado } from "./detalles-tools.js";
import { renderDetalleMaquina } from "./detalle-render.js";

export function renderCardsMaquinas(data, contenedor, setMaquinaSeleccionada) {
  contenedor.innerHTML = "";
  document.querySelectorAll(".detalle-hover").forEach((d) => d.remove());

  data.forEach((e) => {
    const card = document.createElement("div");
    card.classList.add("card-maquina");
    card.dataset.id = e._id;

    const detalle = document.createElement("div");
    detalle.classList.add("detalle-hover");
    detalle.innerHTML = `
      <strong>${e.nombre.toUpperCase()}</strong><br>
      ${e.id ? "ID: " + e.id : "Sin ID"}<br>
      ${e.modelo.toUpperCase()}<br>
      Corriente: ${e.sens_corriente} A<br>
      Flujo: ${e.sens_flujo ? "Sí" : "No"}<br>
      Power: ${e.sens_power ? "Sí" : "No"}<br>
      Accionamientos: ${e.cont_accionam}<br>
    `;

    document.body.appendChild(detalle);

    card.addEventListener(
      "mouseenter",
      () => (detalle.style.display = "block")
    );
    card.addEventListener("mousemove", (eMouse) => {
      const detalleWidth = detalle.offsetWidth;
      const detalleHeight = detalle.offsetHeight;
      let top = eMouse.clientY + 10;
      let left = eMouse.clientX + 10;

      if (window.innerHeight - eMouse.clientY < detalleHeight + 20)
        top = eMouse.clientY - detalleHeight - 10;
      if (window.innerWidth - eMouse.clientX < detalleWidth + 20)
        left = eMouse.clientX - detalleWidth - 10;

      detalle.style.top = `${Math.max(top, 0)}px`;
      detalle.style.left = `${Math.max(left, 0)}px`;
    });
    card.addEventListener("mouseleave", () => (detalle.style.display = "none"));

    card.addEventListener("click", () => {
      setMaquinaSeleccionada(e);
      renderDetalleMaquina(e);
    });

    card.innerHTML = `
      <div class="nombre">${e.nombre.toUpperCase()}</div>
      <div class="estado">${formatearEstado(e.estado)}</div>
    `;

    contenedor.appendChild(card);
  });
}
