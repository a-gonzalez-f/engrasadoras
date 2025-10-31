// detalle.js

import { renderCardsMaquinas } from "./detalle-cards.js";
import {
  listarComentarios,
  eliminarComentario,
  renderUltimoComentario,
} from "./comentarios.js";
import { listarHistorialEnModal } from "./historial.js";
import {
  formatearEstado,
  actualizarBarraPorcentual,
} from "./detalles-tools.js";
import { formatearSignal } from "./formatear-signal.js";

const params = new URLSearchParams(window.location.search);
const linea = params.get("linea");

let maquinaSeleccionada = null;

if (!linea) {
  alert("Línea no especificada");
  window.location.href = "/";
}

document.title = `Detalle Línea ${linea}`;
document.getElementById("tituloLinea").innerText = `${linea}`;

async function cargarDetalle(data) {
  try {
    const contenedor = document.getElementById("contenedorMaquinas");
    contenedor.innerHTML = "";

    if (data.length === 0) {
      contenedor.innerHTML = `<p>No hay máquinas registradas para esta línea.</p>`;
      return;
    }

    renderCardsMaquinas(data, contenedor, (maquina) => {
      maquinaSeleccionada = maquina;
    });
  } catch (err) {
    console.error(err);
    alert("Error al cargar los datos");
  }

  actualizarBarraPorcentual(data);
}

document.getElementById("cerrarModal").addEventListener("click", () => {
  document.getElementById("modalDetalle").style.display = "none";
  maquinaSeleccionada = null;
});

document.getElementById("modalDetalle").addEventListener("click", (e) => {
  if (e.target.id === "modalDetalle") {
    document.getElementById("modalDetalle").style.display = "none";
    maquinaSeleccionada = null;
  }
});

document.getElementById("modalComentarios").addEventListener("click", (e) => {
  if (e.target.id === "modalComentarios") {
    document.getElementById("modalComentarios").style.display = "none";
  }
});

document.getElementById("cerrarComentarios").addEventListener("click", () => {
  document.getElementById("modalComentarios").style.display = "none";
});

let ultimoListado = [];
let ultimoUpdatedAt_All = [];

// Primera carga
fetch(`/api/engrasadoras/filtrado?linea=${linea}`)
  .then((res) => res.json())
  .then((data) => {
    cargarDetalle(data);
    ultimoListado = data;
  })
  .catch((err) => console.error("Error en carga inicial:", err));

fetch(`/api/engrasadoras/ultimoUpdate?linea=${linea}`)
  .then((res) => res.json())
  .then((data) => {
    ultimoUpdatedAt_All = data;
  })
  .catch((err) => console.error("Error en cargar inicia de updatedAt:", err));

setInterval(() => {
  fetch(`/api/engrasadoras/ultimoUpdate?linea=${linea}`)
    .then((res) => res.json())
    .then((data) => {
      const hayCambios = hayCambiosEnUpdatedAt(data, ultimoUpdatedAt_All);

      if (!hayCambios) {
        console.log("✅ no cambió ningún updatedAt");
        return;
      }

      console.log("🔄 cambió algún updatedAt");
      ultimoUpdatedAt_All = data;

      return fetch(`/api/engrasadoras?linea=${linea}`);
    })
    .then((res) => (res ? res.json() : null))
    .then((data) => {
      if (!data) return;
      // dinamizo cambios en cards
      console.log("dinamizo cambios en cards");
      actualizarBarraPorcentual(data);

      const idsActuales = data.map((m) => m._id).join(",");
      const idsUltimos = ultimoListado.map((m) => m._id).join(",");

      if (idsActuales !== idsUltimos) {
        cargarDetalle(data);
        ultimoListado = data;
      } else {
        data.forEach((m) => {
          const card = document.querySelector(
            `.card-maquina[data-id="${m._id}"]`
          );
          if (card) {
            card.querySelector(".estado").innerHTML =
              formatearEstado(m.estado) + formatearSignal(m.lora_signal);
          }
        });
      }

      if (maquinaSeleccionada) {
        fetch(`/api/engrasadoras/full/${maquinaSeleccionada._id}`)
          .then((res) => res.json())
          .then((actualizada) => {
            if (!actualizada) return;
            // dinamizo cambios en maquina seleccionada

            console.log("actualizando maquina seleccionada");

            maquinaSeleccionada = actualizada;

            document.getElementById("estadoMaquina").innerText =
              formatearEstado(actualizada.estado, "texto").toUpperCase();
            document.getElementById("estadoMaquina").className =
              actualizada.estado;
            document.getElementById("fechaHora").innerText = new Date(
              actualizada.date
            ).toLocaleString("es-AR", {
              day: "2-digit",
              month: "2-digit",
              year: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              hour12: false,
            });
            document.getElementById("accionamientos").innerText =
              actualizada.cont_accionam;
            document.getElementById("tiempoDosif").innerText =
              actualizada.set_tiempodosif;
            document.getElementById("cantEjes").innerText =
              actualizada.set_ejes;
            document.getElementById("estado").value = actualizada.estado;
            document.getElementById("corriente").innerText =
              actualizada.sens_corriente
                ? actualizada.sens_corriente + " mA"
                : "-";
            document.getElementById("flujo").innerText = actualizada.sens_flujo
              ? "Si"
              : "No";
            document.getElementById("power").innerText = actualizada.sens_power
              ? "Si"
              : "No";
            document.getElementById("lora").innerHTML = formatearSignal(
              actualizada.lora_signal,
              "icono"
            );

            maquinaSeleccionada.historial = actualizada.historial;
            listarHistorialEnModal(actualizada.historial);

            const btnApagar = document.getElementById("apagarEquipo");
            const switchButton = document.querySelector(
              "#apagarEquipo > div > span"
            );
            btnApagar.classList.remove("apagar", "encender");
            if (actualizada.on_off === false) {
              btnApagar.classList.add("encender");
              switchButton.innerHTML = "play_arrow";
            } else if (actualizada.on_off === true) {
              btnApagar.classList.add("apagar");
              switchButton.innerHTML = "pause";
            }

            const perdidos = document.getElementById("perdidos");
            if (actualizada.perdidos) {
              perdidos.innerHTML = actualizada.perdidos;
            }
          })
          .catch((err) => console.error("Error al actualizar modal:", err));
      }
    })
    .catch((err) => console.error("Error en ciclo de actualización:", err));
}, 5000);

function hayCambiosEnUpdatedAt(nuevo, anterior) {
  if (!Array.isArray(anterior) || nuevo.length !== anterior.length) return true;

  for (let i = 0; i < nuevo.length; i++) {
    const actual = nuevo[i];
    const previo = anterior.find((a) => a._id === actual._id);

    if (!previo || actual.updatedAt !== previo.updatedAt) {
      return true;
    }
  }

  return false;
}
