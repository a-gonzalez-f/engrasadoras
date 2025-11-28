// analytics-maq.js

const modal = document.getElementById("modalAnalytics");
const cerrarBtn = document.getElementById("cerrarAnalytics");
const message = document.getElementById("message-analytics");
const titulo = document.getElementById("analytics-de");

cerrarBtn.addEventListener("click", () => {
  modal.style.display = "none";

  document.querySelectorAll(".chart").forEach((div) => {
    const instance = echarts.getInstanceByDom(div);
    if (instance) instance.dispose();
  });

  titulo.innerText = "";
  message.innerText = "";
});

export function abrirAnalyticsMaq(idMaq) {
  message.innerText = "Cargando...";
  message.style.display = "flex";

  titulo.innerText = idMaq ? `ID: ${idMaq}` : "Sin ID";

  modal.style.display = "flex";

  fetchMaq(idMaq);
}

async function fetchMaq(idMaq) {
  try {
    const res = await fetch(`/api/engrasadoras/snapshots/${idMaq}`);
    if (!res.ok) throw new Error("Error en servidor");

    const data = await res.json();

    renderAccionam(data);
    renderEstados(data);

    message.style.display = "none";
  } catch (err) {
    console.error(err);
    message.innerText = "Error cargando analytics";
  }
}

async function renderAccionam(data) {
  const fechas = data.map((d) => {
    const fecha = new Date(d.fecha);
    return fecha.toLocaleString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  });
  const delta_accionam = data.map((d) => d.delta_accionam);
  const accionam_estimados = data.map((d) => d.accionam_estimados);

  const chart = echarts.init(document.getElementById("delta-accionam"), "dark");
  chart.setOption({
    title: { text: "Accionamientos" },
    backgroundColor: "transparent",
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "line" },
    },
    dataZoom: [
      {
        type: "slider",
        show: false,
        start: 0,
        end: 100,
      },
      {
        type: "inside",
        start: 0,
        end: 100,
      },
    ],
    legend: {
      data: ["Accionamientos", "Accionamientos esperados"],
    },
    xAxis: { type: "category", data: fechas },
    yAxis: {
      type: "value",
    },
    series: [
      {
        name: "Accionamientos",
        type: "line",
        data: delta_accionam,
        color: "#4786b3",
        smooth: true,
      },
      {
        name: "Accionamientos esperados",
        type: "line",
        data: accionam_estimados,
        color: "#aaa",
        smooth: true,
        lineStyle: {
          type: "dashed",
        },
      },
    ],
  });
}

async function renderEstados(data) {
  const chart = echarts.init(document.getElementById("estado-chart"), "dark");

  const mapaEstados = {
    funcionando: 4,
    alerta: 3,
    desconectada: 2,
    fs: 1,
  };

  const colores = {
    funcionando: "#0dae1a",
    alerta: "#fca311",
    desconectada: "#888",
    fs: "#d90429",
  };

  const estadosColores = data.map((d) => colores[d.estado] || "#ffffff");

  const fechas = data.map((d) => {
    const fecha = new Date(d.fecha);
    return fecha.toLocaleString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  });

  const estadosNumericos = data.map((d) => mapaEstados[d.estado] || 0);

  chart.setOption({
    title: { text: "Estado" },
    backgroundColor: "transparent",
    tooltip: {
      trigger: "axis",
      formatter: function (params) {
        const p = params[0];
        const valor = p.value;

        const texto =
          Object.keys(mapaEstados).find((key) => mapaEstados[key] === valor) ||
          "desconocido";

        return `${p.axisValue}<br>Estado: <b>${texto}</b>`;
      },
    },
    xAxis: {
      type: "category",
      data: fechas,
    },
    yAxis: {
      type: "value",
      min: 0,
      max: 4,
      interval: 1,
      axisLabel: {
        formatter: (v) => {
          const entry = Object.entries(mapaEstados).find(([, n]) => n === v);
          return entry ? entry[0] : "";
        },
      },
    },
    dataZoom: [
      { type: "slider", show: false, start: 0, end: 100 },
      { type: "inside", start: 0, end: 100 },
    ],
    series: [
      {
        name: "Estado",
        type: "line",
        data: estadosNumericos,
        step: "middle",
        smooth: false,
        symbol: "roundRect",
        lineStyle: {
          width: 1,
          color: "#666",
        },
        itemStyle: {
          color: (params) => estadosColores[params.dataIndex],
        },
      },
    ],
  });
}

// swiper -------------------------------------------------------
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
