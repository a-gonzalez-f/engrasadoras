// analytics.js

let resumenGlobal = [];
let resumenLineaA = [];
let resumenLineaB = [];
let resumenLineaC = [];
let resumenLineaD = [];
let resumenLineaE = [];
let resumenLineaH = [];

async function cargarResumenGlobal() {
  const hoy = new Date();
  const hace7dias = new Date();
  hace7dias.setDate(hoy.getDate() - 7);

  const desde = hace7dias.toISOString().split("T")[0];
  const hasta = hoy.toISOString().split("T")[0];

  const res = await fetch(
    `/api/engrasadoras/resumen/total?desde=${desde}&hasta=${hasta}`
  );

  resumenGlobal = await res.json();
}

async function cargarResumenPorLinea() {
  const hoy = new Date();
  const hace7dias = new Date();
  hace7dias.setDate(hoy.getDate() - 7);

  const desde = hace7dias.toISOString().split("T")[0];
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
    `/api/engrasadoras/resumen/linea/D?desde=${desde}&hasta=${hasta}`
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

  const fechas = data.map((d) => new Date(d.fecha).toLocaleDateString());
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

  const fechas = data.map((d) => new Date(d.fecha).toLocaleDateString());

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

  const fechas = data.map((d) => new Date(d.fecha).toLocaleDateString());
  const total_accionam = data.map((d) =>
    redondearNumero(d.total_delta_accionam)
  );
  const prom_accionam = data.map((d) => redondearNumero(d.prom_delta_accionam));

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
      data: ["Total Accionamientos", "Promedio Accionamientos"],
    },
    xAxis: { type: "category", data: fechas },
    yAxis: {
      type: "value",
    },
    series: [
      {
        name: "Total Accionamientos",
        type: "line",
        data: total_accionam,
        color: "#2f5671",
        smooth: true,
      },
      {
        name: "Promedio Accionamientos",
        type: "line",
        data: prom_accionam,
        color: "#4a8a8c",
        smooth: true,
      },
    ],
  });
}

async function graficarAccionamPorLinea() {
  const data = resumenGlobal;

  const fechas = data.map((d) => new Date(d.fecha).toLocaleDateString());
  const prom_accionam = data.map((d) => d.prom_delta_accionam);

  const chart = echarts.init(
    document.getElementById("accionam-lineas"),
    "dark"
  );
  chart.setOption({
    title: { text: "Promedio de accionamientos por máquina" },
    backgroundColor: "transparent",
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
    },
    legend: {
      data: ["Accionamientos"],
    },
    xAxis: { type: "category", data: fechas },
    yAxis: {
      type: "value",
    },
    series: [
      {
        name: "Accionamientos",
        type: "line",
        data: prom_accionam,
        color: "#fff",
        smooth: true,
      },
    ],
  });
}

(async () => {
  await cargarResumenGlobal();
  await cargarResumenPorLinea();
  graficarEstadosGlobal();
  graficarPorcentajesGlobal();
  graficarAccionamGlobal();
  graficarAccionamPorLinea();
})();
