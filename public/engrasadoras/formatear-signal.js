export function formatearSignal(signal, modo = "icono") {
  let estado = "";
  let signal_abs = -Math.abs(signal);

  if (signal_abs <= -1 && signal_abs > -80) {
    estado = "excelente";
  } else if (signal_abs <= -80 && signal_abs > -90) {
    estado = "buena";
  } else if (signal_abs <= -90 && signal_abs > -110) {
    estado = "pobre";
  } else if (signal_abs <= -110) {
    estado = "sinsenal";
  } else {
    estado = "sinsenal";
  }

  const estadosMap = {
    excelente: {
      texto: "Excelente",
      icono: `<img src="../img/icons/signal_cellular_alt_24dp_0DAE1A_FILL0_wght400_GRAD0_opsz24.svg" title="${signal_abs}" class="icon"/>`,
    },
    buena: {
      texto: "Buena",
      icono: `<img src="../img/icons/signal_cellular_alt_2_bar_24dp_0DAE1A_FILL0_wght400_GRAD0_opsz24.svg" title="${signal_abs}" class="icon"/>`,
    },
    pobre: {
      texto: "Pobre",
      icono: `<img src="../img/icons/signal_cellular_alt_1_bar_24dp_FCA311_FILL0_wght400_GRAD0_opsz24.svg" title="${signal_abs}" class="icon"/>`,
    },
    sinsenal: {
      texto: "Sin señal",
      icono: `<img src="../img/icons/signal_cellular_connected_no_internet_0_bar_24dp_D90429_FILL0_wght400_GRAD0_opsz24.svg" title="${signal_abs}" class="icon"/>`,
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
