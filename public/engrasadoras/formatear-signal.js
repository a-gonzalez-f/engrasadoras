export function formatearSignal(signal, modo = "icono") {
  let estado = "";

  if (signal <= -1 && signal > -80) {
    estado = "excelente";
  } else if (signal <= -80 && signal > -90) {
    estado = "buena";
  } else if (signal <= -90 && signal > -100) {
    estado = "pobre";
  } else if (signal <= -100) {
    estado = "sinsenal";
  } else {
    estado = "sinsenal";
  }

  const estadosMap = {
    excelente: {
      texto: "Excelente",
      icono: `<span title="${signal}" class="material-symbols-outlined" style="color:var(--color-pstv)">signal_cellular_alt</span>`,
    },
    buena: {
      texto: "Buena",
      icono: `<span title="${signal}" class="material-symbols-outlined" style="color:var(--color-pstv)">signal_cellular_alt_2_bar</span>`,
    },
    pobre: {
      texto: "Pobre",
      icono: `<span title="${signal}" class="material-symbols-outlined" style="color:var(--color-alerta)">signal_cellular_alt_1_bar</span>`,
    },
    sinsenal: {
      texto: "Sin señal",
      icono: `<span title="${signal}" class="material-symbols-outlined" style="color:var(--color-error)">signal_cellular_connected_no_internet_0_bar</span>`,
    },
  };

  const estadoObj = estadosMap[estado];

  if (!estadoObj) {
    return modo === "icono"
      ? signal ?? "-"
      : (signal ?? "-").toString().toUpperCase();
  }
  return modo === "icono" ? estadoObj.icono : estadoObj.texto;
}
