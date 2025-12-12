// analytics.js

let resumenGlobal = [];
let resumenLineaA = [];
let resumenLineaB = [];
let resumenLineaC = [];
let resumenLineaD = [];
let resumenLineaE = [];
let resumenLineaH = [];

const coloresLineas = {
  A: "#1b93c2",
  B: "#cf1222",
  C: "#015a9b",
  D: "#05735f",
  E: "#661371",
  H: "#f0cd1f",
};

async function cargarResumenGlobal() {
  const hoy = new Date();
  const hace100dias = new Date();
  hace100dias.setDate(hoy.getDate() - 100);

  const desde = hace100dias.toISOString().split("T")[0];
  const hasta = hoy.toISOString().split("T")[0];

  const res = await fetch(
    `/api/engrasadoras/resumen/total?desde=${desde}&hasta=${hasta}`
  );

  resumenGlobal = await res.json();

  console.log(resumenGlobal);
}

async function cargarResumenPorLinea() {
  const hoy = new Date();
  const hace100dias = new Date();
  hace100dias.setDate(hoy.getDate() - 100);

  const desde = hace100dias.toISOString().split("T")[0];
  const hasta = hoy.toISOString().split("T")[0];

  const resA = await fetch(
    `/api/engrasadoras/resumen/linea/A?desde=${desde}&hasta=${hasta}`
  );
  resumenLineaA = await resA.json();

  const resB = await fetch(
    `/api/engrasadoras/resumen/linea/B?desde=${desde}&hasta=${hasta}`
  );
  resumenLineaB = await resB.json();

  const resC = await fetch(
    `/api/engrasadoras/resumen/linea/C?desde=${desde}&hasta=${hasta}`
  );
  resumenLineaC = await resC.json();

  const resD = await fetch(
    `/api/engrasadoras/resumen/linea/D?desde=${desde}&hasta=${hasta}`
  );
  resumenLineaD = await resD.json();

  const resE = await fetch(
    `/api/engrasadoras/resumen/linea/E?desde=${desde}&hasta=${hasta}`
  );
  resumenLineaE = await resE.json();

  const resH = await fetch(
    `/api/engrasadoras/resumen/linea/H?desde=${desde}&hasta=${hasta}`
  );
  resumenLineaH = await resH.json();
}

const redondearPorcentaje = (n) => Math.round(n * 100 * 100) / 100;
const redondearNumero = (n) => Math.round(n * 100) / 100;

async function graficarEstadosGlobal() {
  const data = resumenGlobal;

  const fechas = data.map((d) => new Date(d.fecha).toLocaleDateString("es-AR"));
  const alertas = data.map((d) => redondearNumero(d.prom_maq_alertas));
  const funcs = data.map((d) => redondearNumero(d.prom_maq_func));
  const fs = data.map((d) => redondearNumero(d.prom_maq_fs));
  const desc = data.map((d) => redondearNumero(d.prom_maq_desc));

  const chart = echarts.init(document.getElementById("conteo"), "dark");
  chart.setOption({
    title: { text: "Promedios de estados" },
    backgroundColor: "transparent",
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
    },
    legend: {
      data: ["Alertas", "Funcionando", "Fuera de Servicio", "Desconectadas"],
    },
    dataZoom: [
      {
        type: "inside",
        start: 93,
        end: 100,
      },
      {
        type: "slider",
        show: false,
        start: 93,
        end: 100,
      },
    ],

    xAxis: { type: "category", data: fechas },
    yAxis: { type: "value" },
    series: [
      {
        name: "Alertas",
        type: "line",
        smooth: true,
        data: alertas,
        color: "#fca311",
      },
      {
        name: "Funcionando",
        type: "line",
        smooth: true,
        data: funcs,
        color: "#0dae1a",
      },
      {
        name: "Fuera de Servicio",
        type: "line",
        smooth: true,
        data: fs,
        color: "#d90429",
      },
      {
        name: "Desconectadas",
        type: "line",
        smooth: true,
        data: desc,
        color: "#888",
      },
    ],
  });
}

async function graficarPorcentajesGlobal() {
  const data = resumenGlobal;

  const fechas = data.map((d) => new Date(d.fecha).toLocaleDateString("es-AR"));

  const alertas = data.map((d) => redondearPorcentaje(d.porc_estado.alerta));
  const funcs = data.map((d) => redondearPorcentaje(d.porc_estado.funcionando));
  const fs = data.map((d) => redondearPorcentaje(d.porc_estado.fs));
  const desc = data.map((d) => redondearPorcentaje(d.porc_estado.desconectada));

  const chart = echarts.init(document.getElementById("porcentaje"), "dark");
  chart.setOption({
    title: { text: "Porcentajes de estados" },
    backgroundColor: "transparent",
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      valueFormatter: (value) => value + "%",
    },
    legend: {
      data: ["Alertas", "Funcionando", "Fuera de Servicio", "Desconectadas"],
    },
    xAxis: { type: "category", data: fechas },
    yAxis: {
      type: "value",
      max: 100,
      axisLabel: { formatter: "{value}%" },
    },
    dataZoom: [
      {
        type: "inside",
        start: 93,
        end: 100,
      },
      {
        type: "slider",
        show: false,
        start: 93,
        end: 100,
      },
    ],

    series: [
      {
        name: "Alertas",
        type: "bar",
        stack: "total",
        barWidth: "40%",
        data: alertas,
        color: "#fca311",
      },
      {
        name: "Funcionando",
        type: "bar",
        stack: "total",
        barWidth: "40%",
        data: funcs,
        color: "#0dae1a",
      },
      {
        name: "Fuera de Servicio",
        type: "bar",
        stack: "total",
        barWidth: "40%",
        data: fs,
        color: "#d90429",
      },
      {
        name: "Desconectadas",
        type: "bar",
        stack: "total",
        barWidth: "40%",
        data: desc,
        color: "#888",
      },
    ],
  });
}

async function graficarAccionamGlobal() {
  const data = resumenGlobal;

  const fechas = data.map((d) => new Date(d.fecha).toLocaleDateString("es-AR"));
  const total_accionam = data.map((d) =>
    redondearNumero(d.total_delta_accionam)
  );
  const prom_accionam = data.map((d) => redondearNumero(d.prom_delta_accionam));
  const accionam_estimados = data.map((d) => d.accionam_estimados);

  const chart = echarts.init(
    document.getElementById("accionam-global"),
    "dark"
  );
  chart.setOption({
    title: { text: "Accionamientos globales" },
    backgroundColor: "transparent",
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
    },
    legend: {
      data: ["Total", "Promedio por máquina", "Estimados"],
    },
    xAxis: { type: "category", data: fechas },
    yAxis: {
      type: "value",
    },
    dataZoom: [
      {
        type: "inside",
        start: 93,
        end: 100,
      },
      {
        type: "slider",
        show: false,
        start: 93,
        end: 100,
      },
    ],

    series: [
      {
        name: "Total",
        type: "line",
        data: total_accionam,
        color: "#2f5671",
        smooth: true,
      },
      {
        name: "Promedio por máquina",
        type: "line",
        data: prom_accionam,
        color: "#4a8a8c",
        smooth: true,
      },
      {
        name: "Estimados",
        type: "line",
        data: accionam_estimados,
        color: "grey",
        smooth: true,
        lineStyle: {
          type: "dashed",
        },
      },
    ],
  });
}

async function graficarAccionamPorLinea() {
  const lineas = {
    A: resumenLineaA,
    B: resumenLineaB,
    C: resumenLineaC,
    D: resumenLineaD,
    E: resumenLineaE,
    H: resumenLineaH,
  };

  // Fechas: tomo las de cualquiera que tenga datos
  const algunaLinea = Object.values(lineas).find((x) => x && x.length > 0);
  if (!algunaLinea) return;

  const fechas = algunaLinea.map((d) =>
    new Date(d.fecha).toLocaleDateString("es-AR")
  );

  const series = [];

  for (const [linea, data] of Object.entries(lineas)) {
    if (!data || data.length === 0) continue;

    const total_accionam = data.map((d) =>
      redondearNumero(d.total_delta_accionam)
    );

    series.push({
      name: `Línea ${linea}`,
      type: "line",
      smooth: true,
      data: total_accionam,
      color: coloresLineas[linea],
    });
  }

  const chart = echarts.init(
    document.getElementById("accionam-lineas"),
    "dark"
  );

  chart.setOption({
    title: { text: "Accionamientos por línea" },
    backgroundColor: "transparent",
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
    },
    legend: {
      data: series.map((s) => s.name),
    },
    xAxis: { type: "category", data: fechas },
    yAxis: { type: "value" },
    dataZoom: [
      {
        type: "inside",
        start: 93,
        end: 100,
      },
      {
        type: "slider",
        show: false,
        start: 93,
        end: 100,
      },
    ],

    series,
  });
}

async function graficarAlertasPorLinea() {
  const lineas = {
    A: resumenLineaA,
    B: resumenLineaB,
    C: resumenLineaC,
    D: resumenLineaD,
    E: resumenLineaE,
    H: resumenLineaH,
  };

  const algunaLinea = Object.values(lineas).find((x) => x && x.length > 0);
  if (!algunaLinea) return;

  const fechas = algunaLinea.map((d) =>
    new Date(d.fecha).toLocaleDateString("es-AR")
  );

  const series = [];

  for (const [linea, data] of Object.entries(lineas)) {
    if (!data || data.length === 0) continue;

    const prom_maq_alertas = data.map((d) =>
      redondearNumero(d.prom_maq_alertas)
    );

    series.push({
      name: `Línea ${linea}`,
      type: "line",
      smooth: true,
      data: prom_maq_alertas,
      color: coloresLineas[linea],
    });
  }

  const chart = echarts.init(
    document.getElementById("alertasPorLinea"),
    "dark"
  );

  chart.setOption({
    title: { text: "Promedio diario 'Alerta'" },
    backgroundColor: "transparent",
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
    },
    legend: {
      data: series.map((s) => s.name),
    },
    xAxis: { type: "category", data: fechas },
    yAxis: { type: "value" },
    dataZoom: [
      {
        type: "inside",
        start: 93,
        end: 100,
      },
      {
        type: "slider",
        show: false,
        start: 93,
        end: 100,
      },
    ],

    series,
  });
}

async function graficarFuncionandoPorLinea() {
  const lineas = {
    A: resumenLineaA,
    B: resumenLineaB,
    C: resumenLineaC,
    D: resumenLineaD,
    E: resumenLineaE,
    H: resumenLineaH,
  };

  const algunaLinea = Object.values(lineas).find((x) => x && x.length > 0);
  if (!algunaLinea) return;

  const fechas = algunaLinea.map((d) =>
    new Date(d.fecha).toLocaleDateString("es-AR")
  );

  const series = [];

  for (const [linea, data] of Object.entries(lineas)) {
    if (!data || data.length === 0) continue;

    const prom_maq_func = data.map((d) => redondearNumero(d.prom_maq_func));

    series.push({
      name: `Línea ${linea}`,
      type: "line",
      smooth: true,
      data: prom_maq_func,
      color: coloresLineas[linea],
    });
  }

  const chart = echarts.init(
    document.getElementById("funcionandoPorLinea"),
    "dark"
  );

  chart.setOption({
    title: { text: "Promedio diario 'Funcionando'" },
    backgroundColor: "transparent",
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
    },
    legend: {
      data: series.map((s) => s.name),
    },
    xAxis: { type: "category", data: fechas },
    yAxis: { type: "value" },
    dataZoom: [
      {
        type: "inside",
        start: 93,
        end: 100,
      },
      {
        type: "slider",
        show: false,
        start: 93,
        end: 100,
      },
    ],

    series,
  });
}

async function graficarDescPorLinea() {
  const lineas = {
    A: resumenLineaA,
    B: resumenLineaB,
    C: resumenLineaC,
    D: resumenLineaD,
    E: resumenLineaE,
    H: resumenLineaH,
  };

  const algunaLinea = Object.values(lineas).find((x) => x && x.length > 0);
  if (!algunaLinea) return;

  const fechas = algunaLinea.map((d) =>
    new Date(d.fecha).toLocaleDateString("es-AR")
  );

  const series = [];

  for (const [linea, data] of Object.entries(lineas)) {
    if (!data || data.length === 0) continue;

    const prom_maq_desc = data.map((d) => redondearNumero(d.prom_maq_desc));

    series.push({
      name: `Línea ${linea}`,
      type: "line",
      smooth: true,
      data: prom_maq_desc,
      color: coloresLineas[linea],
    });
  }

  const chart = echarts.init(document.getElementById("descPorLinea"), "dark");

  chart.setOption({
    title: { text: "Promedio diario 'Desconectadas'" },
    backgroundColor: "transparent",
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
    },
    legend: {
      data: series.map((s) => s.name),
    },
    xAxis: { type: "category", data: fechas },
    yAxis: { type: "value" },
    dataZoom: [
      {
        type: "inside",
        start: 93,
        end: 100,
      },
      {
        type: "slider",
        show: false,
        start: 93,
        end: 100,
      },
    ],

    series,
  });
}

async function graficarFSPorLinea() {
  const lineas = {
    A: resumenLineaA,
    B: resumenLineaB,
    C: resumenLineaC,
    D: resumenLineaD,
    E: resumenLineaE,
    H: resumenLineaH,
  };

  const algunaLinea = Object.values(lineas).find((x) => x && x.length > 0);
  if (!algunaLinea) return;

  const fechas = algunaLinea.map((d) =>
    new Date(d.fecha).toLocaleDateString("es-AR")
  );

  const series = [];

  for (const [linea, data] of Object.entries(lineas)) {
    if (!data || data.length === 0) continue;

    const prom_maq_fs = data.map((d) => redondearNumero(d.prom_maq_fs));

    series.push({
      name: `Línea ${linea}`,
      type: "line",
      smooth: true,
      data: prom_maq_fs,
      color: coloresLineas[linea],
    });
  }

  const chart = echarts.init(document.getElementById("fsPorLinea"), "dark");

  chart.setOption({
    title: { text: "Promedio diario 'Fuera de Servicio'" },
    backgroundColor: "transparent",
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
    },
    legend: {
      data: series.map((s) => s.name),
    },
    xAxis: { type: "category", data: fechas },
    yAxis: { type: "value" },
    dataZoom: [
      {
        type: "inside",
        start: 93,
        end: 100,
      },
      {
        type: "slider",
        show: false,
        start: 93,
        end: 100,
      },
    ],

    series,
  });
}

(async () => {
  await cargarResumenGlobal();
  await cargarResumenPorLinea();
  graficarEstadosGlobal();
  graficarPorcentajesGlobal();
  graficarAccionamGlobal();
  graficarAccionamPorLinea();
  graficarAlertasPorLinea();
  graficarFuncionandoPorLinea();
  graficarDescPorLinea();
  graficarFSPorLinea();
})();

// swiper -------------------------------------------------
const swiper = new Swiper(".mySwiper", {
  loop: false,
  spaceBetween: 30,
  navigation: {
    nextEl: ".swiper-button-next",
    prevEl: ".swiper-button-prev",
  },
  allowTouchMove: false,
  touchStartPreventDefault: false,
});
