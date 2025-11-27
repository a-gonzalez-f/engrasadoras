const params = new URLSearchParams(window.location.search);
const linea = params.get("linea");

const abrirModalBtn = document.getElementById("abrirAnalyticsLinea");
const modal = document.getElementById("modalAnalytics");
const titulo = document.getElementById("analytics-de");
const message = document.getElementById("message-analytics");
const cerrarBtn = document.getElementById("cerrarAnalytics");

// abrir
abrirModalBtn.addEventListener("click", () => {
  modal.style.display = "flex";
  titulo.innerText = linea ? `Linea: ${linea}` : "";

  message.innerText = "Cargando...";
  message.style.display = "flex";

  fetchLinea(linea);
});

async function fetchLinea(linea) {
  try {
    const res = await fetch(`/api/engrasadoras/resumenHora/accionam/${linea}`);
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
  const delta_accionam = data.map((d) => d.total_delta_accionam);
  const accionam_hora_estimados = data.map((d) => (20 * 24) / 24);
  //!!!!!!!!!!!!!!!!!!!!!!! 20 trenesporhora x 24 ejesportren / seteo_ejes

  const chart = echarts.init(document.getElementById("delta-accionam"), "dark");
  chart.setOption({
    title: { text: "Accionamientos" },
    backgroundColor: "transparent",
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "line" },
    },
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
        data: accionam_hora_estimados,
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
