// app.js

async function cargarEngrasadoras() {
  const res = await fetch("/api/engrasadoras");
  const data = await res.json();

  // Mostrar en tabla
  const tbody = document.getElementById("tablaEngrasadoras");
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

  // Calcular gráfico de estado global
  const total = data.length;
  const funcionando = data.filter((e) => e.estado === "funcionando").length;
  const alerta = data.filter((e) => e.estado === "alerta").length;
  const sinConexion = data.filter((e) => e.estado === "desconectada").length;

  new Chart(document.getElementById("chartGlobal"), {
    type: "doughnut",
    data: {
      datasets: [
        {
          data: [funcionando, alerta, sinConexion],
          backgroundColor: ["#0dae1a", "#fca311", "#888"],
          borderWidth: 0,
        },
      ],
    },
    options: {
      responsive: true,
      cutout: "50%",
      plugins: {
        title: {
          display: false,
          text: "Estado Global",
        },
      },
    },
    animation: {
      animateRotate: true,
      animateScale: true,
    },
  });

  // Actualizar resumen global
  document.getElementById(
    "func-global"
  ).innerText = `${funcionando} / ${total} (${Math.round(
    (funcionando / total) * 100
  )}%)`;
  document.getElementById(
    "alerta-global"
  ).innerText = `${alerta} / ${total} (${Math.round((alerta / total) * 100)}%)`;
  document.getElementById(
    "sc-global"
  ).innerText = `${sinConexion} / ${total} (${Math.round(
    (sinConexion / total) * 100
  )}%)`;
}

cargarEngrasadoras();

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
      return `<span class="material-symbols-outlined" style="color:grey"> wifi_off </span>`;
    default:
      return estado;
  }
}
