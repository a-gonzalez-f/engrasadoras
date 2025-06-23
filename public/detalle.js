const params = new URLSearchParams(window.location.search);
const linea = params.get("linea");

console.log("Línea seleccionada:", linea);

if (!linea) {
  alert("Línea no especificada");
  window.location.href = "/";
}

document.title = `Detalle Línea ${linea}`;
document.getElementById("tituloLinea").innerText = `Línea ${linea}`;

// Traer y mostrar las máquinas de esa línea
async function cargarDetalle() {
  try {
    const res = await fetch("/api/engrasadoras");
    const data = await res.json();

    const filtradas = data.filter((e) => e.linea === linea);

    const tbody = document.getElementById("tablaDetalle");
    filtradas.forEach((e) => {
      const fila = document.createElement("tr");
      fila.classList.add(`${e.estado}`);
      fila.innerHTML = `
        <td>${new Date(e.date).toLocaleString("es-AR")}</td>
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

    if (filtradas.length === 0) {
      tbody.innerHTML = `<tr><td colspan="10" style="text-align:center;">No hay máquinas registradas para esta línea</td></tr>`;
    }
  } catch (err) {
    console.error(err);
    alert("Error al cargar los datos");
  }
}

cargarDetalle();

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
