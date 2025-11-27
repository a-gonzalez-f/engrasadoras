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
    const res = await fetch(`/api/engrasadoras/snapshots/accionam/${idMaq}`);
    if (!res.ok) throw new Error("Error en servidor");

    const data = await res.json();

    renderAnalytics(data);

    message.style.display = "none";
  } catch (err) {
    console.error(err);
    message.innerText = "Error cargando analytics";
  }
}

async function renderAnalytics(data) {
  const fechas = data.map((d) => new Date(d.fecha).toLocaleDateString());
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

// swiper -------------------------------------------------------
const swiper = new Swiper(".mySwiper", {
  loop: false,
  spaceBetween: 30,
  navigation: {
    nextEl: ".swiper-button-next",
    prevEl: ".swiper-button-prev",
  },
  allowTouchMove: true,
  touchStartPreventDefault: false,
});
