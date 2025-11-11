// analytics.js

async function cargarResumenGlobalUltimos7() {
  const hoy = new Date();
  const hace7dias = new Date();
  hace7dias.setDate(hoy.getDate() - 7);

  const desde = hace7dias.toISOString().split("T")[0];
  const hasta = hoy.toISOString().split("T")[0];

  const res = await fetch(
    `/api/engrasadoras/resumen/total?desde=${desde}&hasta=${hasta}`
  );
  const data = await res.json();

  console.log("Últimos 7 días:", data);
  return data;
}

async function graficarSensadosSemanal() {
  const data = await cargarResumenGlobalUltimos7();

  const fechas = data.map((d) => new Date(d.fecha).toLocaleDateString());
  const alertas = data.map((d) => d.total_conteo_alertas);
  const funcs = data.map((d) => d.total_conteo_func);
  const fs = data.map((d) => d.total_conteo_fs);
  const desc = data.map((d) => d.total_conteo_desc);

  const chart = echarts.init(document.getElementById("grafico-semanal"));
  chart.setOption({
    title: { text: "Sensados Semanales" },
    tooltip: {},
    legend: {
      data: ["Alertas", "Funcionando", "Fuera de Servicio", "Desconectadas"],
    },
    xAxis: { type: "category", data: fechas },
    yAxis: { type: "value" },
    series: [
      { name: "Alertas", type: "line", data: alertas, color: "#fca311" },
      { name: "Funcionando", type: "line", data: funcs, color: "#0dae1a" },
      { name: "Fuera de Servicio", type: "line", data: fs, color: "#d90429" },
      { name: "Desconectadas", type: "line", data: desc, color: "#888" },
    ],
  });
}

graficarSensadosSemanal();
