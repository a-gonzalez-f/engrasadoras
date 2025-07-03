// app.js

// menu
function toggleMenu() {
  document.getElementById("menu").classList.toggle("show-menu");
}

document.addEventListener("click", function (e) {
  const menu = document.getElementById("menu");
  const menuBtn = e.target.closest("button");
  if (!menu.contains(e.target) && !menuBtn) {
    menu.classList.remove("show-menu");
  }
});

// logica
let datosEngrasadoras = [];

let chartGlobal = null;
const chartsPorLinea = {};

async function cargarEngrasadoras() {
  const res = await fetch("/api/engrasadoras");
  const data = await res.json();

  datosEngrasadoras = data;

  renderTabla([]);

  document.getElementById("buscador").addEventListener("input", (e) => {
    const texto = e.target.value.toLowerCase();

    if (texto === "") {
      renderTabla([]);
      return;
    }

    const filtrados = datosEngrasadoras.filter(
      (item) =>
        item.nombre.toLowerCase().includes(texto) ||
        item.modelo.toLowerCase().includes(texto) ||
        item.linea.toLowerCase().includes(texto)
    );

    renderTabla(filtrados);
  });

  // Calcular gráfico de estado global
  const total = data.length;
  const funcionando = data.filter((e) => e.estado === "funcionando").length;
  const alerta = data.filter((e) => e.estado === "alerta").length;
  const sinConexion = data.filter((e) => e.estado === "desconectada").length;
  const fs = data.filter((e) => e.estado === "fs").length;

  if (!chartGlobal) {
    chartGlobal = new Chart(document.getElementById("chartGlobal"), {
      type: "doughnut",
      data: {
        datasets: [
          {
            data: [funcionando, alerta, sinConexion, fs],
            backgroundColor: ["#0dae1a", "#fca311", "#888", "#d90429"],
            borderWidth: 0,
            hoverBorderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        cutout: "50%",
        plugins: { title: { display: false } },
      },
      animation: {
        animateRotate: true,
        animateScale: true,
      },
    });
  } else {
    chartGlobal.data.datasets[0].data = [funcionando, alerta, sinConexion, fs];
    chartGlobal.update();
  }

  // Actualizar resumen global
  document.getElementById(
    "func-global"
  ).innerText = `${funcionando} (${Math.round((funcionando / total) * 100)}%)`;
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

  renderEstadoPorLinea(data);
}

function renderTabla(data) {
  const tbody = document.getElementById("tablaEngrasadoras");
  const thead = document.getElementById("theadbuscador");
  tbody.innerHTML = "";

  if (data.length === 0) {
    thead.style.display = "none";
    tbody.innerHTML = `<tr><td colspan="11" style="text-align:center; color:grey;">No se encontraron resultados</td></tr>`;
    return;
  }

  thead.style.display = "table-header-group";

  data.forEach((e) => {
    const fila = document.createElement("tr");
    fila.classList.add(`${e.estado}`);
    fila.innerHTML = `
      <td>${new Date(e.date).toLocaleString("es-AR")}</td>
      <td>${e.linea}</td>
      <td>${e.nombre}</td>
      <td>${e.modelo}</td>
      <td>${e.set_tiempodosif}</td>
      <td>${e.set_ejes}</td>
      <td>${e.sens_corriente}</td>
      <td>${booleanToIcon(e.sens_flujo)}</td>
      <td>${booleanToIcon(e.sens_power)}</td>
      <td>${e.cont_accionam}</td>
      <td>${formatearEstado(e.estado)}</td>
    `;
    tbody.appendChild(fila);
  });
}

function booleanToIcon(valor) {
  return valor
    ? `<span class="material-symbols-outlined" style="color:var(--color-pstv)">check_circle</span>`
    : `<span class="material-symbols-outlined" style="color:var(--color-error)">error</span>`;
}

function formatearEstado(estado) {
  switch (estado) {
    case "funcionando":
      return `<span class="material-symbols-outlined" style="color:var(--color-pstv)"> check_circle </span>`;
    case "alerta":
      return `<span class="material-symbols-outlined" style="color:var(--color-alerta)"> error </span>`;
    case "desconectada":
      return `<span class="material-symbols-outlined" style="color:var(--color-desconectada"> wifi_off </span>`;
    case "fs":
      return `<span class="material-symbols-outlined" style="color:var(--color-error"> block </span>`;
    default:
      return estado;
  }
}

function renderEstadoPorLinea(data) {
  const lineas = ["A", "B", "C", "D", "E", "H"];

  lineas.forEach((linea) => {
    const dataLinea = data.filter((e) => e.linea === linea);
    const total = dataLinea.length;

    const funcionando = dataLinea.filter(
      (e) => e.estado === "funcionando"
    ).length;
    const alerta = dataLinea.filter((e) => e.estado === "alerta").length;
    const desconectada = dataLinea.filter(
      (e) => e.estado === "desconectada"
    ).length;
    const fs = dataLinea.filter((e) => e.estado === "fs").length;

    // Render gráfico
    const canvas = document.getElementById(`chart${linea}`);
    if (!chartsPorLinea[linea]) {
      chartsPorLinea[linea] = new Chart(canvas, {
        type: "doughnut",
        data: {
          datasets: [
            {
              data: [funcionando, alerta, desconectada, fs],
              backgroundColor: ["#0dae1a", "#fca311", "#888", "#d90429"],
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
      ];
      chartsPorLinea[linea].update();
    }

    // Render detalle
    document.getElementById(
      `func-${linea}`
    ).innerText = `${funcionando} (${Math.round(
      (funcionando / total) * 100
    )}%)`;
    document.getElementById(
      `alerta-${linea}`
    ).innerText = `${alerta} (${Math.round((alerta / total) * 100)}%)`;
    document.getElementById(
      `sc-${linea}`
    ).innerText = `${desconectada} (${Math.round(
      (desconectada / total) * 100
    )}%)`;
    document.getElementById(`fs-${linea}`).innerText = `${fs} (${Math.round(
      (fs / total) * 100
    )}%)`;
  });
}

cargarEngrasadoras();
setInterval(cargarEngrasadoras, 1000);
