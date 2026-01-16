// detalle.js

import { renderCardsMaquinas } from "./detalle-cards.js";
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

      // primera carga al abrir modal de una maquina
      if (maquinaSeleccionada) {
        fetch(`/api/engrasadoras/full/${maquinaSeleccionada._id}`)
          .then((res) => res.json())
          .then((actualizada) => {
            if (!actualizada) return;
            renderizarModal(actualizada);
          })
          .catch((err) => console.error("Error al actualizar modal:", err));
      }
    });
  } catch (err) {
    console.error(err);
    alert("Error al cargar los datos");
  }

  actualizarBarraPorcentual(data);
}

document.getElementById("cerrarModal").addEventListener("click", () => {
  cerrarModal();
});

document.getElementById("modalDetalle").addEventListener("click", (e) => {
  if (e.target.id === "modalDetalle") {
    cerrarModal();
  }
});

document.addEventListener("keydown", (e) => {
  if (
    e.key === "Escape" &&
    document.getElementById("modalDetalle").style.display === "flex"
  ) {
    cerrarModal();
  }
});

function cerrarModal() {
  document.getElementById("modalDetalle").style.display = "none";
  maquinaSeleccionada = null;
}

document.getElementById("modalComentarios").addEventListener("click", (e) => {
  if (e.target.id === "modalComentarios") {
    document.getElementById("modalComentarios").style.display = "none";
  }
});

document.getElementById("cerrarComentarios").addEventListener("click", () => {
  document.getElementById("modalComentarios").style.display = "none";
});

let ultimoListado = [];
let ultimaVersion_All = [];

// Primera carga
fetch(`/api/engrasadoras/filtrado?linea=${linea}`)
  .then((res) => res.json())
  .then((data) => {
    cargarDetalle(data);
    ultimoListado = data;
  })
  .catch((err) => console.error("Error en carga inicial:", err));

fetch(`/api/engrasadoras/ultimaVersion?linea=${linea}`)
  .then((res) => res.json())
  .then((data) => {
    ultimaVersion_All = data;
  })
  .catch((err) => console.error("Error en cargar inicia de version:", err));

setInterval(() => {
  fetch(`/api/engrasadoras/ultimaVersion?linea=${linea}`)
    .then((res) => res.json())
    .then((data) => {
      // detecto si hay cambios en revision
      const hayCambios = hayCambiosEnVersion(data, ultimaVersion_All);

      if (!hayCambios) {
        return;
      }

      ultimaVersion_All = data;

      return fetch(`/api/engrasadoras?linea=${linea}`);
    })
    .then((res) => (res ? res.json() : null))
    .then((data) => {
      if (!data) return;
      // dinamizo cambios en cards
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

            renderizarModal(actualizada);
          })
          .catch((err) => console.error("Error al actualizar modal:", err));
      }
    })
    .catch((err) => console.error("Error en ciclo de actualización:", err));
}, 5000);

function hayCambiosEnVersion(nuevo, anterior) {
  if (!Array.isArray(anterior) || nuevo.length !== anterior.length) return true;

  for (let i = 0; i < nuevo.length; i++) {
    const actual = nuevo[i];
    const previo = anterior.find((a) => a.id === actual.id);

    if (!previo || Number(actual.revision) !== Number(previo.revision)) {
      return true;
    }
  }

  return false;
}

function renderizarModal(maquina) {
  maquinaSeleccionada = maquina;

  document.getElementById("estadoMaquina").innerText = formatearEstado(
    maquina.estado,
    "texto"
  ).toUpperCase();
  document.getElementById("estadoMaquina").className = maquina.estado;
  document.getElementById("fechaHora").innerText = new Date(
    maquina.date
  ).toLocaleString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  document.getElementById("accionamientos").innerText = maquina.cont_accionam;
  document.getElementById("tiempoDosif").innerText = maquina.set_tiempodosif;
  document.getElementById("cantEjes").innerText = maquina.set_ejes;
  document.getElementById("estado").value = maquina.estado;
  document.getElementById("corriente").innerText = maquina.sens_corriente
    ? maquina.sens_corriente + " mA"
    : "-";
  document.getElementById("flujo").innerText = maquina.sens_flujo ? "Si" : "No";
  document.getElementById("power").innerText = maquina.sens_power ? "Si" : "No";
  document.getElementById("lora").innerHTML = formatearSignal(
    maquina.lora_signal,
    "icono"
  );
  document.getElementById("perdidos").innerText = maquina.perdidos;

  maquinaSeleccionada.historial = maquina.historial;
  listarHistorialEnModal(maquina.historial);

  const btnApagar = document.getElementById("apagarEquipo");
  const switchButton = document.querySelector("#apagarEquipo > div > span");
  btnApagar.classList.remove("apagar", "encender");
  if (maquina.on_off === false) {
    btnApagar.classList.add("encender");
    switchButton.innerHTML = "play_arrow";
  } else if (maquina.on_off === true) {
    btnApagar.classList.add("apagar");
    switchButton.innerHTML = "pause";
  }

  const perdidos = document.getElementById("perdidos");
  if (maquina.perdidos) {
    perdidos.innerHTML = maquina.perdidos;
  }
}
