// analytics-linea.js

const params = new URLSearchParams(window.location.search);
const linea = params.get("linea");

const abrirModalBtn = document.getElementById("abrirAnalyticsLinea");
const modal = document.getElementById("modalAnalytics");
const titulo = document.getElementById("analytics-de");
const message = document.getElementById("message-analytics");
const cerrarBtn = document.getElementById("cerrarAnalytics");

const btnSwitch = document.getElementById("actionBtn");
const iconSwitch = document.getElementById("iconSwitch");
const titleSwitch = document.getElementById("switchTitle");
let horarioEnServicio = true;

// abrir
abrirModalBtn.addEventListener("click", () => {
  modal.style.display = "flex";
  titulo.innerText = linea ? `Linea ${linea}` : "";

  message.innerText = "Cargando...";
  message.style.display = "flex";

  fetchLinea(linea);
  activarSwitch();
});

// cerrar
cerrarBtn.addEventListener("click", () => {
  horarioEnServicio = true;

  titleSwitch.innerText = "Horario en servicio";
  iconSwitch.src =
    "../img/icons/toggle_on_24dp_0DAE1A_FILL0_wght400_GRAD0_opsz24.svg";

  desactivarSwitch();
});

// switch horario
function onSwitchClick() {
  horarioEnServicio = !horarioEnServicio;

  titleSwitch.innerText = horarioEnServicio
    ? "Horario en servicio"
    : "Horario completo";

  iconSwitch.src = horarioEnServicio
    ? "../img/icons/toggle_on_24dp_0DAE1A_FILL0_wght400_GRAD0_opsz24.svg"
    : "../img/icons/toggle_off_24dp_D90429_FILL0_wght400_GRAD0_opsz24.svg";

  if (linea) {
    fetchLinea(linea);
  }
}

function activarSwitch() {
  btnSwitch.removeEventListener("click", onSwitchClick);
  btnSwitch.addEventListener("click", onSwitchClick);
}

function desactivarSwitch() {
  btnSwitch.removeEventListener("click", onSwitchClick);
}

async function fetchLinea(linea) {
  console.log("fetch por linea", linea);
  try {
    message.innerText = "Cargando...";
    message.style.display = "flex";

    const params = new URLSearchParams();
    if (horarioEnServicio) params.append("servicio", "true");

    const res = await fetch(
      `/api/engrasadoras/resumenHora/${linea}?${params.toString()}`
    );
    if (!res.ok) throw new Error("Error en servidor");

    const data = await res.json();

    renderAnalytics(data);
    renderPorcentajesEstados(data);

    message.style.display = "none";
  } catch (err) {
    console.error(err);
    message.innerText = "Error cargando analytics";
  }
}

async function renderAnalytics(data) {
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
  const delta_accionam = data.map((d) => d.total_delta_accionam);
  const accionam_estimados = data.map((d) => d.accionam_estimados);
  const media_movil = horarioEnServicio
    ? data.map((d) => d.media_movil_servicio ?? null)
    : data.map((d) => d.media_movil_completo ?? null);

  const chart = echarts.init(document.getElementById("delta-accionam"), "dark");
  chart.setOption({
    title: { text: "Accionamientos" },
    backgroundColor: "transparent",
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
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "line" },
    },
    legend: {
      data: ["Accionamientos", "Accionamientos esperados", "Media Movil"],
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
      {
        name: "Media móvil",
        type: "line",
        data: media_movil,
        color: "#7dbda1",
        smooth: true,
        lineStyle: {
          type: "dashed",
        },
      },
    ],
  });
}

const redondearPorcentaje = (n) => Math.round(n * 100 * 100) / 100;

async function renderPorcentajesEstados(data) {
  const fechas = data.map((d) => new Date(d.fecha).toLocaleDateString("es-AR"));

  const alertas = data.map((d) => redondearPorcentaje(d.porc_estado.alerta));
  const funcs = data.map((d) => redondearPorcentaje(d.porc_estado.funcionando));
  const fs = data.map((d) => redondearPorcentaje(d.porc_estado.fs));
  const desc = data.map((d) => redondearPorcentaje(d.porc_estado.desconectada));

  const chart = echarts.init(document.getElementById("estado-chart"), "dark");
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
      },
      {
        type: "slider",
        show: false,
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

// swiper -------------------------------------------------------
// const swiper = new Swiper(".mySwiper", {
//   loop: false,
//   spaceBetween: 30,
//   navigation: {
//     nextEl: ".swiper-button-next",
//     prevEl: ".swiper-button-prev",
//   },
//   allowTouchMove: false,
//   touchStartPreventDefault: false,
// });
