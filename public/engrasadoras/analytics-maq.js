// analytics-maq.js

const modal = document.getElementById("modalAnalyticsMaq");
const cerrarBtn = document.getElementById("cerrarAnalyticsMaq");
const message = document.getElementById("message-analyticsMaq");
const titulo = document.getElementById("analytics-de");

cerrarBtn.addEventListener("click", () => {
  modal.style.display = "none";
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
    console.log(data);

    message.style.display = "none";
  } catch (err) {
    console.error(err);
    message.innerText = "Error cargando analytics";
  }
}

async function renderAnalytics(data) {
  const fechas = data.map((d) => new Date(d.fecha).toLocaleDateString());
  const delta_accionam = data.map((d) => d.delta_accionam);
  const accionam_hora_estimados = data.map((d) =>
    d.set_ejes ? 480 / d.set_ejes : 0
  );
  // 20 trenesporhora x 24 ejesportren / seteo_ejes

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
