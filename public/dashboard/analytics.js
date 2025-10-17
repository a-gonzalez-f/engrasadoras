let chartAnalytics = null;

function getWeekNumber(fecha) {
  const d = new Date(
    Date.UTC(fecha.getFullYear(), fecha.getMonth(), fecha.getDate())
  );
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNum = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-S${weekNum.toString().padStart(2, "0")}`;
}

export function generarAnalytics(datos) {
  const conteoPorSemana = {};

  datos.forEach((item) => {
    const fecha = new Date(item.date);
    const semana = getWeekNumber(fecha);

    if (!conteoPorSemana[semana]) {
      conteoPorSemana[semana] = {
        funcionando: 0,
        alerta: 0,
        desconectada: 0,
        fs: 0,
      };
    }

    if (conteoPorSemana[semana][item.estado] !== undefined) {
      conteoPorSemana[semana][item.estado]++;
    }
  });

  const semanas = Object.keys(conteoPorSemana).sort();

  const funcionandoData = semanas.map(
    (semana) => conteoPorSemana[semana].funcionando
  );
  const alertaData = semanas.map((semana) => conteoPorSemana[semana].alerta);
  const desconectadaData = semanas.map(
    (semana) => conteoPorSemana[semana].desconectada
  );
  const fsData = semanas.map((semana) => conteoPorSemana[semana].fs);

  const ctx = document.getElementById("analytics-global").getContext("2d");

  if (chartAnalytics) {
    chartAnalytics.destroy();
  }

  chartAnalytics = new Chart(ctx, {
    type: "bar",
    data: {
      labels: semanas,
      datasets: [
        {
          label: "Funcionando",
          backgroundColor: "#0dae1a",
          data: funcionandoData,
        },
        {
          label: "Alerta",
          backgroundColor: "#fca311",
          data: alertaData,
        },
        {
          label: "Desconectada",
          backgroundColor: "#888",
          data: desconectadaData,
        },
        {
          label: "FS",
          backgroundColor: "#d90429",
          data: fsData,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        title: { display: true, text: "Evolución semanal de estados" },
      },
      scales: {
        x: {
          stacked: false,
        },
        y: {
          beginAtZero: true,
          stacked: false,
          title: {
            display: true,
            text: "Cantidad",
          },
        },
      },
    },
  });
}
