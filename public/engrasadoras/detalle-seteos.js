// detalle-seteos.js

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
  document
    .getElementById("estado")
    .addEventListener("change", () => selectEstado(e));
}

async function obtenerValoresActuales(id) {
  const res = await fetch(`/api/engrasadoras/actualizada/${id}`);
  if (!res.ok) throw new Error("No se pudo obtener la engrasadora");
  return res.json();
}

async function editarTiempo(e) {
  try {
    const overlay = document.getElementById("overlay");
    const { set_ejes } = await obtenerValoresActuales(e.id);

    const nuevoValor = prompt(
      "Ingrese el nuevo tiempo de dosificación (0.2s - 2s):",
      e.set_tiempodosif
    );
    if (nuevoValor === null) {
      overlay.style.display = "none";
      return;
    }

    const valorSanitizado = nuevoValor.replace(",", ".");
    const numValor = parseFloat(valorSanitizado);
    if (isNaN(numValor) || numValor < 0.2 || numValor > 2) {
      alert("El tiempo debe estar entre 0.2s y 2s.");
      overlay.style.display = "none";
      return;
    }

    const valorTruncado = Math.trunc(numValor * 10) / 10;

    overlay.style.display = "flex";
    const res = await fetch(`/api/engrasadoras/setear`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: e.id,
        tiempo: valorTruncado,
        ejes: set_ejes,
      }),
    });

    const data = await res.json();
    overlay.style.display = "none";

    if (!res.ok) {
      alert("❌ " + data.mensaje);
      return;
    }
    alert("✅ " + data.mensaje);
  } catch (err) {
    document.getElementById("overlay").style.display = "none";
    alert(err.message);
  }
}

async function editarEjes(e) {
  try {
    const overlay = document.getElementById("overlay");
    const { set_tiempodosif } = await obtenerValoresActuales(e.id);

    const nuevoValor = prompt(
      "Ingrese la nueva cantidad de ejes (1 - 128):",
      e.set_ejes
    );
    if (nuevoValor === null) {
      overlay.style.display = "none";
      return;
    }

    const numValor = parseInt(nuevoValor);
    if (isNaN(numValor) || numValor < 1 || numValor > 128) {
      alert("Cantidad de ejes debe estar entre 1 y 128.");
      overlay.style.display = "none";
      return;
    }

    overlay.style.display = "flex";
    const res = await fetch(`/api/engrasadoras/setear`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: e.id,
        tiempo: set_tiempodosif,
        ejes: numValor,
      }),
    });

    const data = await res.json();
    overlay.style.display = "none";

    if (!res.ok) {
      alert("❌ " + data.mensaje);
      return;
    }
    alert("✅ " + data.mensaje);
  } catch (err) {
    document.getElementById("overlay").style.display = "none";
    alert(err.message);
  }
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

async function resetearAccionamientos(e) {
  try {
    if (!confirm("¿Seguro que desea resetear los accionamientos?")) return;
    const overlay = document.getElementById("overlay");

    console.log(e.id);
    overlay.style.display = "flex";
    const res = await fetch(`/api/engrasadoras/resetAccionam`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: e.id,
      }),
    });

    const data = await res.json();
    overlay.style.display = "none";

    if (!res.ok) {
      alert("❌ " + data.mensaje);
      return;
    }
    alert("✅ " + data.mensaje);
  } catch (err) {
    overlay.style.display = "none";
    alert(err.message);
  }
}

function toBool(v) {
  // por si en la DB viene como "1"/"0", 1/0, true/false
  return v === true || v === 1 || v === "1";
}

async function toggleOnOff(e) {
  try {
    const overlay = document.getElementById("overlay");
    const res = await fetch(`/api/engrasadoras/full/${e._id}`);
    if (!res.ok) throw new Error("No se pudo obtener el estado actual");
    const maquina = await res.json();

    const actualDB = toBool(maquina.on_off);
    const solicitado = !actualDB; // toggleo respecto a lo REAL, no a e.on_off

    // Si el solicitado es igual al actual, no enviar
    if (solicitado === actualDB) {
      alert(
        `La máquina ya está ${
          actualDB ? "ON" : "OFF"
        }. No se enviará ningún código.`
      );
      e.on_off = actualDB;
      return;
    }

    const nuevoEstadoStr = solicitado ? "ON" : "OFF";
    if (
      !confirm(
        `¿Seguro que desea cambiar el estado a ${nuevoEstadoStr} (${solicitado})?`
      )
    )
      return;

    console.log(e.id, "actual DB:", actualDB, "nuevo:", solicitado);

    // Envio el cambio
    overlay.style.display = "flex";
    const resp = await fetch(`/api/engrasadoras/switchOnOff`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: maquina.id,
        on_off: solicitado,
      }),
    });

    const data = await resp.json();
    overlay.style.display = "none";

    if (!resp.ok) {
      alert("❌ " + data.mensaje);
      return;
    }
    alert("✅ " + data.mensaje);

    overlay.style.display = "none";
    e.on_off = solicitado;
  } catch (err) {
    overlay.style.display = "none";
    alert(err.message);
  }
}

async function selectEstado(e) {
  fetch(`/api/engrasadoras/${e._id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ estado: nuevoEstado }),
  })
    .then((res) => res.json())
    .then((data) => {
      e.estado = data.nuevoEstado;
      document.getElementById("estado").innerText = data.nuevoEstado;
    })
    .catch((err) => alert(err.message));
}
