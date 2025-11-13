// analytics.js

let resumenGlobal = [];

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

async function graficarSensados() {
  const data = resumenGlobal;

  const fechas = data.map((d) => new Date(d.fecha).toLocaleDateString());
  const alertas = data.map((d) => d.total_maq_alertas);
  const funcs = data.map((d) => d.total_maq_func);
  const fs = data.map((d) => d.total_maq_fs);
  const desc = data.map((d) => d.total_maq_desc);

  const chart = echarts.init(document.getElementById("conteo"), "dark");
  chart.setOption({
    title: { text: "Sensados por estado" },
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

async function graficarPorcentajes() {
  const data = resumenGlobal;

  const fechas = data.map((d) => new Date(d.fecha).toLocaleDateString());
  const alertas = data.map((d) => d.porc_estado.alerta);
  const funcs = data.map((d) => d.porc_estado.funcionando);
  const fs = data.map((d) => d.porc_estado.fs);
  const desc = data.map((d) => d.porc_estado.desconectada);

  const chart = echarts.init(document.getElementById("porcentaje"), "dark");
  chart.setOption({
    title: { text: "Porcentajes de sensados" },
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

async function graficarAccionamTotales() {
  const data = resumenGlobal;

  const fechas = data.map((d) => new Date(d.fecha).toLocaleDateString());
  const total_accionam = data.map((d) => d.total_delta_accionam);

  const chart = echarts.init(document.getElementById("accionam-total"), "dark");
  chart.setOption({
    title: { text: "Total accionamientos" },
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
        data: total_accionam,
        color: "#fff",
        smooth: true,
      },
    ],
  });
}

async function graficarAccionamPromedio() {
  const data = resumenGlobal;

  const fechas = data.map((d) => new Date(d.fecha).toLocaleDateString());
  const prom_accionam = data.map((d) => d.prom_delta_accionam);

  const chart = echarts.init(document.getElementById("accionam-prom"), "dark");
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
  graficarSensados();
  graficarPorcentajes();
  graficarAccionamTotales();
  graficarAccionamPromedio();
})();
