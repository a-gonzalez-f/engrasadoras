// dashboard.jsx

let datosEngrasadoras = [];

let chartGlobal = null;
const chartsPorLinea = {};

async function fetchEngrasadoras() {
  const res = await fetch("/api/engrasadoras");
  const data = await res.json();
  return data;
}

function actualizarDatos(data) {
  datosEngrasadoras = data;
}

function actualizarGraficos(data) {
  actualizarGraficoGlobal(data);
  renderEstadoPorLinea(data);
}

async function cargarEngrasadoras() {
  const data = await fetchEngrasadoras();
  actualizarDatos(data);
  actualizarGraficos(data);
  actualizarResumenGlobal(data);
}

async function actualizarGraficoGlobal(data) {
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

function renderEstadoPorLinea(data) {
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
      <td>${e.id ? e.id : "Sin ID"}</td>
      <td>${e.nombre}</td>
      <td>${e.linea}</td>
      <td>${e.modelo}</td>
      <td>${new Date(e.date).toLocaleString("es-AR")}</td>
      <td>${e.set_tiempodosif ? e.set_tiempodosif : "-"}</td>
      <td>${e.set_ejes ? e.set_ejes : "-"}</td>
      <td>${e.sens_corriente ? e.sens_corriente : "-"}</td>
      <td>${e.sens_flujo ? booleanToIcon(e.sens_flujo) : "-"}</td>
      <td>${e.sens_power ? booleanToIcon(e.sens_power) : "-"}</td>
      <td>${e.cont_accionam ? e.cont_accionam : "-"}</td>
      <td>${e.estado ? formatearEstado(e.estado) : "-"}</td>
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
      return `<span class="material-symbols-outlined" style="color:var(--color-desconectada)"> wifi_off </span>`;
    case "fs":
      return `<span class="material-symbols-outlined" style="color:var(--color-error)"> block </span>`;
    case "pm":
      return `<span class="material-symbols-outlined" style="color:var(--color-pstv-alt)">pause_circle</span>`;
    default:
      return estado;
  }
}

let registrosMostrados = 0;
let datosFiltrados = [];
const cantidadPorCarga = 10;

const cargarTodoBtn = document.querySelector("#cargarTodos");
const cargarMasBtn = document.querySelector("#cargarMas");
const actionButtons = document.querySelector("#actionsTable");

function filtrarTabla() {
  const texto = document.getElementById("buscador").value.toLowerCase();
  const modelo = document.getElementById("selectModelo").value;
  const linea = document.getElementById("selectLinea").value;
  const id = document.getElementById("id").value;

  datosFiltrados = datosEngrasadoras.filter((item) => {
    const coincideNombre =
      texto === "" || item.nombre.toLowerCase().includes(texto);
    const coincideModelo =
      modelo === "todas" || item.modelo.toString() === modelo;
    const coincideLinea =
      linea === "todas" || item.linea.toLowerCase() === linea;
    const coincideID = id === "" || item.id.toString() === id.toString();

    return coincideNombre && coincideModelo && coincideLinea && coincideID;
  });

  registrosMostrados = 0;
  cargarMas();
}

function cargarMas() {
  const total = datosFiltrados.length;
  const hasta = Math.min(registrosMostrados + cantidadPorCarga, total);
  const datosParaMostrar = datosFiltrados.slice(0, hasta);

  renderTabla(datosParaMostrar);

  registrosMostrados = hasta;

  actionsTable.style.display = registrosMostrados >= total ? "none" : "flex";
}

function cargarTodo() {
  registrosMostrados = datosFiltrados.length;
  renderTabla(datosFiltrados);

  actionsTable.style.display = "none";
}

cargarTodoBtn.addEventListener("click", cargarTodo);
cargarMasBtn.addEventListener("click", cargarMas);

document.getElementById("buscador").addEventListener("input", filtrarTabla);
document.getElementById("id").addEventListener("input", filtrarTabla);
document
  .getElementById("selectModelo")
  .addEventListener("change", filtrarTabla);
document.getElementById("selectLinea").addEventListener("change", filtrarTabla);

cargarEngrasadoras().then(filtrarTabla);
setInterval(cargarEngrasadoras, 60000);
