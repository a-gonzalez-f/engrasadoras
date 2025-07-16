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
  };

  const estadoObj = estadosMap[estado];

  if (!estadoObj) {
    return modo === "icono" ? estado : estado.toUpperCase();
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
    return;
  }

  const cant_func = maquinas.filter((m) => m.estado === "funcionando").length;
  const cant_alert = maquinas.filter((m) => m.estado === "alerta").length;
  const cant_desc = maquinas.filter((m) => m.estado === "desconectada").length;
  const cant_fs = maquinas.filter((m) => m.estado === "fs").length;

  const porc_func = Number(((cant_func / total) * 100).toPrecision(3));
  const porc_alert = Number(((cant_alert / total) * 100).toPrecision(3));
  const porc_desc = Number(((cant_desc / total) * 100).toPrecision(3));
  const porc_fs = Number(((cant_fs / total) * 100).toPrecision(3));

  document.getElementById("porc_func").style.width = `${porc_func}%`;
  document.getElementById("porc_alert").style.width = `${porc_alert}%`;
  document.getElementById("porc_desconectada").style.width = `${porc_desc}%`;
  document.getElementById("porc_fs").style.width = `${porc_fs}%`;

  if (cant_func !== 0) {
    document.getElementById(
      "value_func"
    ).innerText = `${cant_func} - ${porc_func}%`;
  }
  if (cant_alert !== 0) {
    document.getElementById(
      "value_alert"
    ).innerText = `${cant_alert} - ${porc_alert}%`;
  }
  if (cant_desc !== 0) {
    document.getElementById(
      "value_desc"
    ).innerText = `${cant_desc} - ${porc_desc}%`;
  }
  if (cant_fs !== 0) {
    document.getElementById("value_fs").innerText = `${cant_fs} - ${porc_fs}%`;
  }

  document.getElementById("total_value").innerText = ` Total: ${total}`;
}
