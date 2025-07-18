import { listarHistorialEnModal } from "./historial.js";
import { formatearEstado } from "./detalles-tools.js";

export function inicializarSeteos(e) {
  document
    .getElementById("editarTiempo")
    .addEventListener("click", () => editarTiempo(e));
  document
    .getElementById("editarEjes")
    .addEventListener("click", () => editarEjes(e));
  document
    .getElementById("editarUbi")
    .addEventListener("click", () => editarUbicacion(e));
  document
    .getElementById("resetAccionam")
    .addEventListener("click", () => resetearAccionamientos(e));
  document
    .getElementById("apagarEquipo")
    .addEventListener("click", () => toggleOnOff(e));
}

function editarTiempo(e) {
  const nuevoValor = prompt(
    "Ingrese el nuevo tiempo de dosificación (0.2s - 2s):",
    e.set_tiempodosif
  );
  if (nuevoValor === null) return;

  const valorSanitizado = nuevoValor.replace(",", ".");
  const numValor = parseFloat(valorSanitizado);
  if (isNaN(numValor) || numValor < 0.2 || numValor > 2) {
    alert("El tiempo debe estar entre 0.2s y 2s.");
    return;
  }

  const valorTruncado = Math.trunc(numValor * 10) / 10;

  console.log(e.id, e.modelo, valorTruncado, e.set_ejes);

  fetch(`/api/engrasadoras/setearTiempo`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: e.id,
      modelo: e.modelo,
      tiempo: valorTruncado,
      ejes: e.set_ejes,
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      alert(data.mensaje);
    })
    .catch((err) => alert(err.message));
}

function editarEjes(e) {
  const nuevoValor = prompt(
    "Ingrese la nueva cantidad de ejes (1 - 128):",
    e.set_ejes
  );
  if (nuevoValor === null) return;

  const numValor = parseInt(nuevoValor);
  if (isNaN(numValor) || numValor < 1 || numValor > 128) {
    alert("Cantidad de ejes debe estar entre 1 y 128.");
    return;
  }

  fetch(`/api/engrasadoras/${e._id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ set_ejes: numValor }),
  })
    .then((res) => res.json())
    .then((data) => {
      e.set_ejes = data.set_ejes;
      e.historial = data.historial;
      document.getElementById("cantEjes").innerText = data.set_ejes;
      listarHistorialEnModal(e.historial);
    })
    .catch((err) => alert(err.message));
}

function editarUbicacion(e) {
  const nuevoValor = prompt(
    "Ingrese la nueva ubicación (max. 50 caracteres)",
    e.ubicacion
  );
  if (nuevoValor === null) return;

  fetch(`/api/engrasadoras/${e._id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ubicacion: nuevoValor }),
  })
    .then((res) => res.json())
    .then((data) => {
      e.ubicacion = data.ubicacion;
      document.getElementById("ubicacion").innerText = data.ubicacion;
    })
    .catch((err) => alert(err.message));
}

function resetearAccionamientos(e) {
  if (!confirm("¿Seguro que desea resetear los accionamientos?")) return;

  fetch(`/api/engrasadoras/${e._id}/resetAccionamientos`, { method: "PUT" })
    .then((res) => res.json())
    .then((data) => {
      e.cont_accionam = data.cont_accionam;
      e.historial = data.historial;
      document.getElementById("accionamientos").innerText = data.cont_accionam;
      listarHistorialEnModal(e.historial);
    })
    .catch((err) => alert(err.message));
}

function toggleOnOff(e) {
  const nuevoEstado = e.estado === "pm" ? "funcionando" : "pm";
  if (
    !confirm(
      `¿Seguro que desea cambiar el estado a "${formatearEstado(
        nuevoEstado,
        "texto"
      )}"?`
    )
  )
    return;

  fetch(`/api/engrasadoras/${e._id}/switchOnOff`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ estado: nuevoEstado }),
  })
    .then((res) => res.json())
    .then((data) => {
      e.estado = data.estado;
      e.historial = data.historial;

      document.getElementById("estadoMaquina").innerText = formatearEstado(
        data.estado,
        "texto"
      ).toUpperCase();
      document.getElementById("estadoMaquina").className = data.estado;

      const btnApagar = document.getElementById("apagarEquipo");
      btnApagar.classList.remove("apagar", "encender");
      if (e.estado === "pm") btnApagar.classList.add("encender");
      else if (e.estado === "funcionando") btnApagar.classList.add("apagar");

      listarHistorialEnModal(e.historial);
    })
    .catch((err) => alert(err.message));
}
