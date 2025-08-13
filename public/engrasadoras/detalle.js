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
});

document.getElementById("modalDetalle").addEventListener("click", (e) => {
  if (e.target.id === "modalDetalle") {
    document.getElementById("modalDetalle").style.display = "none";
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

setInterval(() => {
  fetch(`/api/engrasadoras?linea=${linea}`)
    .then((res) => res.json())
    .then((data) => {
      actualizarBarraPorcentual(data);

      // Si cambia la cantidad de máquinas o sus IDs, recargo todo
      const idsActuales = data.map((m) => m._id).join(",");
      const idsUltimos = ultimoListado.map((m) => m._id).join(",");

      if (idsActuales !== idsUltimos) {
        cargarDetalle(data);
        ultimoListado = data;
      } else {
        // Si no cambió la estructura, actualizo solo los estados visuales
        data.forEach((m) => {
          const card = document.querySelector(
            `.card-maquina[data-id="${m._id}"]`
          );
          if (card) {
            card.querySelector(".estado").innerHTML = formatearEstado(m.estado);
            // +'<span class="material-symbols-outlined">signal_cellular_0_bar</span>';
          }
        });
      }

      if (maquinaSeleccionada) {
        fetch(`/api/engrasadoras/full/${maquinaSeleccionada._id}`)
          .then((res) => res.json())
          .then((actualizada) => {
            if (actualizada) {
              maquinaSeleccionada = actualizada;

              document.getElementById("estadoMaquina").innerText =
                formatearEstado(actualizada.estado, "texto").toUpperCase();
              document.getElementById("estadoMaquina").className =
                actualizada.estado;
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
              document.getElementById("flujo").innerText =
                actualizada.sens_flujo ? "Si" : "No";
              document.getElementById("power").innerText =
                actualizada.sens_power ? "Si" : "No";
              document.getElementById("lora").innerText =
                actualizada.lora_signal;

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
            }
          })
          .catch((err) => console.error("Error al actualizar modal:", err));
      }
    })
    .catch((err) => console.error("Error actualizando:", err));
}, 1000);
