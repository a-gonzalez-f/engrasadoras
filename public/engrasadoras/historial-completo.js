import { formatearEstado } from "./detalles-tools.js";
import { formatearSignal } from "./formatear-signal.js";

export function abrirHistorialCompleto(maquina) {
  const modal = document.getElementById("modalHistorialCompleto");
  const tbody = modal.querySelector("tbody");
  const cerrarBtn = modal.querySelector("#cerrarHistorialCompleto");
  const contenedorScroll = modal.querySelector(".tabla-scrollable");

  modal.style.display = "flex";
  tbody.innerHTML = `<tr><td colspan="12" style="text-align:center">Cargando...</td></tr>`;

  let offset = 0;
  const limit = 50;
  let loading = false;
  let hasMore = true;

  const fetchHistorial = () => {
    if (loading || !hasMore) return;
    loading = true;

    fetch(
      `/api/engrasadoras/historial/${maquina._id}?offset=${offset}&limit=${limit}`
    )
      .then((res) => res.json())
      .then((data) => {
        const historial = data.historial;

        if (offset === 0 && historial.length === 0) {
          tbody.innerHTML = `<tr><td colspan="12" style="text-align:center">No hay historial disponible</td></tr>`;
          return;
        }

        // Si es la primera carga, limpiamos el contenido
        if (offset === 0) {
          tbody.innerHTML = "";
        }

        historial.forEach((h) => {
          const tr = document.createElement("tr");
          tr.className = h.estado;
          tr.innerHTML = `
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
          `;
          tbody.appendChild(tr);
        });

        offset += historial.length;
        loading = false;
        hasMore = historial.length === limit; // Si recibimos menos que el límite, no hay más
      })
      .catch((err) => {
        console.error("Error al obtener historial:", err);
        if (offset === 0) {
          tbody.innerHTML = `<tr><td colspan="12" style="text-align:center">Error al cargar historial</td></tr>`;
        }
        loading = false;
      });
  };

  // Carga inicial
  fetchHistorial();

  // Escucha el scroll dentro del contenedor scrollable
  contenedorScroll.addEventListener("scroll", () => {
    const el = contenedorScroll;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 150) {
      fetchHistorial();
    }
  });

  cerrarBtn.addEventListener("click", () => {
    modal.style.display = "none";
    tbody.innerHTML = "";
    offset = 0;
    hasMore = true;
    loading = false;
  });
}
