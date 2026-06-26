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

async function graficarPorcentajesGlobal() {
  const data = resumenGlobal;

  const fechas = data.map((d) => new Date(d.fecha).toLocaleDateString("es-AR"));

  const alertas = data.map((d) => redondearPorcentaje(d.porc_estado.alerta));
  const funcs = data.map((d) => redondearPorcentaje(d.porc_estado.funcionando));
  const fs = data.map((d) => redondearPorcentaje(d.porc_estado.fs));
  const desc = data.map((d) => redondearPorcentaje(d.porc_estado.desconectada));

  const chart = echarts.init(document.getElementById("porcentaje"), "dark");
  chart.setOption({
    title: { text: "Porcentajes diarios de estados" },
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
        start: 0,
        end: 100,
      },
      {
        type: "slider",
        show: false,
        start: 0,
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
    title: { text: "Accionamientos diarios por línea" },
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
        start: 0,
        end: 100,
      },
      {
        type: "slider",
        show: false,
        start: 0,
        end: 100,
      },
    ],

    series,
  });
}

(async () => {
  await cargarResumenGlobal();
  await cargarResumenPorLinea();
  graficarPorcentajesGlobal();
  graficarAccionamPorLinea();
})();
