let datosEngrasadoras = [];

let chartGlobal = null;
const chartsPorLinea = {};

async function cargarEngrasadoras() {
  const res = await fetch("/api/engrasadoras");
  const data = await res.json();

  datosEngrasadoras = data;
  // generarAnalytics(data);

  filtrarTabla();

  // Calcular gráfico de estado global
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
    const pm = dataLinea.filter((e) => e.estado === "pm").length;

    // Render gráfico
    const canvas = document.getElementById(`chart${linea}`);
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

function filtrarTabla() {
  const texto = document.getElementById("buscador").value.toLowerCase();
  const modelo = document.getElementById("selectModelo").value;
  const linea = document.getElementById("selectLinea").value;

  const filtrados = datosEngrasadoras.filter((item) => {
    const coincideNombre = texto === "" || item.nombre.toLowerCase() === texto;
    const coincideModelo =
      modelo === "todas" || item.modelo.toString() === modelo;
    const coincideLinea =
      linea === "todas" || item.linea.toLowerCase() === linea;

    return coincideNombre && coincideModelo && coincideLinea;
  });

  renderTabla(filtrados);
}

document.getElementById("buscador").addEventListener("input", filtrarTabla);
document
  .getElementById("selectModelo")
  .addEventListener("change", filtrarTabla);
document.getElementById("selectLinea").addEventListener("change", filtrarTabla);

renderTabla([]);
cargarEngrasadoras();
setInterval(cargarEngrasadoras, 5000);
