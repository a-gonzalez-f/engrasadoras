export function formatearEstado(estado, modo = "icono") {
  const estadosMap = {
    funcionando: {
      texto: "Funcionando",
      icono: `<span class="material-symbols-outlined" style="color:var(--color-pstv)">check_circle</span>`,
    },
    alerta: {
      texto: "Alerta",
      icono: `<span class="material-symbols-outlined" style="color:var(--color-alerta)">error</span>`,
    },
    desconectada: {
      texto: "Desconectada",
      icono: `<span class="material-symbols-outlined" style="color:var(--color-desconectada)">wifi_off</span>`,
    },
    fs: {
      texto: "Fuera de Servicio",
      icono: `<span class="material-symbols-outlined" style="color:var(--color-error)">block</span>`,
    },
    pm: {
      texto: "Pausa Manual",
      icono: `<span class="material-symbols-outlined" style="color:var(--color-pstv-alt)">pause_circle</span>`,
    },
  };

  const estadoObj = estadosMap[estado];

  if (!estadoObj) {
    return modo === "icono" ? estado ?? "-" : (estado ?? "-").toUpperCase();
  }

  return modo === "icono" ? estadoObj.icono : estadoObj.texto;
}

export function actualizarBarraPorcentual(maquinas) {
  const total = maquinas.length;
  if (total === 0) {
    document.getElementById("porc_func").style.width = "0%";
    document.getElementById("porc_alert").style.width = "0%";
    document.getElementById("porc_desconectada").style.width = "0%";
    document.getElementById("porc_fs").style.width = "0%";
    document.getElementById("porc_pm").style.width = "0%";
    return;
  }

  const cant_func = maquinas.filter((m) => m.estado === "funcionando").length;
  const cant_alert = maquinas.filter((m) => m.estado === "alerta").length;
  const cant_desc = maquinas.filter((m) => m.estado === "desconectada").length;
  const cant_fs = maquinas.filter((m) => m.estado === "fs").length;
  const cant_pm = maquinas.filter((m) => m.estado === "pm").length;

  const porc_func = Math.round((cant_func / total) * 100);
  const porc_alert = Math.round((cant_alert / total) * 100);
  const porc_desc = Math.round((cant_desc / total) * 100);
  const porc_fs = Math.round((cant_fs / total) * 100);
  const porc_pm = Math.round((cant_pm / total) * 100);

  document.getElementById("porc_func").style.width = `${porc_func}%`;
  document.getElementById("porc_alert").style.width = `${porc_alert}%`;
  document.getElementById("porc_desconectada").style.width = `${porc_desc}%`;
  document.getElementById("porc_fs").style.width = `${porc_fs}%`;
  document.getElementById("porc_pm").style.width = `${porc_pm}%`;

  const value_func = document.getElementById("value_func");
  const value_alert = document.getElementById("value_alert");
  const value_desc = document.getElementById("value_desc");
  const value_fs = document.getElementById("value_fs");
  const value_pm = document.getElementById("value_pm");

  if (cant_func !== 0) {
    value_func.innerText = `${cant_func} - ${porc_func}%`;
    value_func.style.display = "block";
  }
  if (cant_alert !== 0) {
    value_alert.innerText = `${cant_alert} - ${porc_alert}%`;
    value_alert.style.display = "block";
  }
  if (cant_desc !== 0) {
    value_desc.innerText = `${cant_desc} - ${porc_desc}%`;
    value_desc.style.display = "block";
  }
  if (cant_fs !== 0) {
    value_fs.innerText = `${cant_fs} - ${porc_fs}%`;
    value_fs.style.display = "block";
  }
  if (cant_pm !== 0) {
    value_pm.innerText = `${cant_pm} - ${porc_pm}%`;
    value_pm.style.display = "block";
  }

  if (porc_func === 0) {
    value_func.style.display = "none";
  }
  if (porc_alert === 0) {
    value_alert.style.display = "none";
  }
  if (porc_desc === 0) {
    value_desc.style.display = "none";
  }
  if (porc_fs === 0) {
    value_fs.style.display = "none";
  }
  if (porc_pm === 0) {
    value_pm.style.display = "none";
  }

  document.getElementById("total_value").innerText = ` Total: ${total}`;
}
