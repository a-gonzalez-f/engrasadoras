// dashboard.js

import { filtrarTabla } from "./table.js";

let datosEngrasadoras = [];

let chartGlobal = null;
const chartsPorLinea = {};

async function fetchEngrasadoras() {
  const res = await fetch("/api/engrasadoras");
  const data = await res.json();
  return data;
}

export function returnDatos() {
  return datosEngrasadoras;
}

function actualizarDatos(data) {
  datosEngrasadoras = data;
}

function actualizarDonuts(data) {
  renderDonutGlobal(data);
  renderDonutPorLinea(data);
}

async function cargarEngrasadoras() {
  const data = await fetchEngrasadoras();
  actualizarDatos(data);
  actualizarDonuts(data);
  actualizarResumenGlobal(data);
}

async function renderDonutGlobal(data) {
  const total = data.length;
  const funcionando = data.filter((e) => e.estado === "funcionando").length;
  const alerta = data.filter((e) => e.estado === "alerta").length;
  const sinConexion = data.filter((e) => e.estado === "desconectada").length;
  const fs = data.filter((e) => e.estado === "fs").length;
  const pm = data.filter((e) => e.estado === "pm").length;

  if (!chartGlobal) {
    chartGlobal = new Chart(document.getElementById("chartGlobal"), {
      type: "doughnut",
      data: {
        labels: [
          "Funcionando",
          "Alerta",
          "Desconectada",
          "Fuera de Servicio",
          "Pausa Manual",
        ],
        datasets: [
          {
            data: [funcionando, alerta, sinConexion, fs, pm],
            backgroundColor: [
              "#0dae1a",
              "#fca311",
              "#888",
              "#d90429",
              "#5dbe65",
            ],
            borderWidth: 0,
            hoverBorderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        cutout: "50%",
        plugins: { title: { display: false }, legend: { display: false } },
      },
      animation: {
        animateRotate: true,
        animateScale: true,
      },
    });
  } else {
    chartGlobal.data.datasets[0].data = [
      funcionando,
      alerta,
      sinConexion,
      fs,
      pm,
    ];
    chartGlobal.update();
  }
}

function actualizarResumenGlobal(data) {
  const total = data.length;
  const funcionando = data.filter((e) => e.estado === "funcionando").length;
  const alerta = data.filter((e) => e.estado === "alerta").length;
  const sinConexion = data.filter((e) => e.estado === "desconectada").length;
  const fs = data.filter((e) => e.estado === "fs").length;
  const pm = data.filter((e) => e.estado === "pm").length;

  document.getElementById("func-global").innerText = `${
    funcionando + pm
  } (${Math.round(((funcionando + pm) / total) * 100)}%)`;
  document.getElementById("alerta-global").innerText = `${alerta} (${Math.round(
    (alerta / total) * 100
  )}%)`;
  document.getElementById(
    "sc-global"
  ).innerText = `${sinConexion} (${Math.round((sinConexion / total) * 100)}%)`;
  document.getElementById("fs-global").innerText = `${fs} (${Math.round(
    (fs / total) * 100
  )}%)`;
  document.getElementById("total-global").innerText = `${total}`;
}

function renderDonutPorLinea(data) {
  const lineas = ["A", "B", "C", "D", "E", "H"];

  lineas.forEach((linea) => {
    const dataLinea = data.filter((e) => e.linea === linea);
    const total = dataLinea.length;

    const canvas = document.getElementById(`chart${linea}`);
    const container = canvas?.parentElement;

    const detalleFunc = document.getElementById(`func-${linea}`);
    const detalleAlerta = document.getElementById(`alerta-${linea}`);
    const detalleSC = document.getElementById(`sc-${linea}`);
    const detalleFS = document.getElementById(`fs-${linea}`);

    // Si no hay datos en la línea
    if (total === 0) {
      // Oculta el canvas si existe
      if (canvas) canvas.style.display = "none";

      // Oculta los detalles
      document.getElementById(`detalle-${linea}`).style.display = "none";
      container.classList.add("centrar");

      // Verifica si ya existe el mensaje para no duplicarlo
      if (!document.getElementById(`sinMaquinas-${linea}`)) {
        const sinMaquinas = document.createElement("div");
        sinMaquinas.classList.add("sinMaquinas");
        sinMaquinas.id = `sinMaquinas-${linea}`;
        sinMaquinas.innerHTML =
          `<span class="material-symbols-outlined" id="sinMaquinasIcon">error</span>` +
          `<p style="color:grey;">Sin máquinas</p>`;

        if (container) container.appendChild(sinMaquinas);
      }

      return;
    }

    // Si hay datos, asegurarse de mostrar el canvas y eliminar el mensaje
    if (canvas) canvas.style.display = "block";

    const mensajeExistente = document.getElementById(`sinMaquinas-${linea}`);
    if (mensajeExistente) mensajeExistente.remove();

    const funcionando = dataLinea.filter(
      (e) => e.estado === "funcionando"
    ).length;
    const alerta = dataLinea.filter((e) => e.estado === "alerta").length;
    const desconectada = dataLinea.filter(
      (e) => e.estado === "desconectada"
    ).length;
    const fs = dataLinea.filter((e) => e.estado === "fs").length;
    const pm = dataLinea.filter((e) => e.estado === "pm").length;

    if (!chartsPorLinea[linea]) {
      chartsPorLinea[linea] = new Chart(canvas, {
        type: "doughnut",
        data: {
          labels: [
            "Funcionando",
            "Alerta",
            "Desconectada",
            "Fuera de Servicio",
            "Pausa Manual",
          ],
          datasets: [
            {
              data: [funcionando, alerta, desconectada, fs, pm],
              backgroundColor: [
                "#0dae1a",
                "#fca311",
                "#888",
                "#d90429",
                "#5dbe65",
              ],
              borderWidth: 0,
              hoverBorderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          cutout: "50%",
          plugins: { title: { display: false }, legend: { display: false } },
        },
      });
    } else {
      chartsPorLinea[linea].data.datasets[0].data = [
        funcionando,
        alerta,
        desconectada,
        fs,
        pm,
      ];
      chartsPorLinea[linea].update();
    }

    // Render detalle
    if (detalleFunc)
      detalleFunc.innerText = `${funcionando + pm} (${Math.round(
        ((funcionando + pm) / total) * 100
      )}%)`;
    if (detalleAlerta)
      detalleAlerta.innerText = `${alerta} (${Math.round(
        (alerta / total) * 100
      )}%)`;
    if (detalleSC)
      detalleSC.innerText = `${desconectada} (${Math.round(
        (desconectada / total) * 100
      )}%)`;
    if (detalleFS)
      detalleFS.innerText = `${fs} (${Math.round((fs / total) * 100)}%)`;
  });
}

cargarEngrasadoras().then(filtrarTabla);
setInterval(cargarEngrasadoras, 60000);
