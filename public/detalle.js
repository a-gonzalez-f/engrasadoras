const params = new URLSearchParams(window.location.search);
const linea = params.get("linea");

if (!linea) {
  alert("Línea no especificada");
  window.location.href = "/";
}

document.title = `Detalle Línea ${linea}`;
document.getElementById("tituloLinea").innerText = `${linea}`;

async function cargarDetalle() {
  try {
    const res = await fetch("/api/engrasadoras");
    const data = await res.json();

    const filtradas = data.filter((e) => e.linea === linea);

    const contenedor = document.getElementById("contenedorMaquinas");
    contenedor.innerHTML = "";

    if (filtradas.length === 0) {
      contenedor.innerHTML = `<p>No hay máquinas registradas para esta línea.</p>`;
      return;
    }

    filtradas.forEach((e) => {
      const card = document.createElement("div");
      card.classList.add("card-maquina");
      card.innerHTML = `
        <div class="nombre">${e.nombre.toUpperCase()}</div>
        <div class="estado">${formatearEstado(e.estado)}</div>
      `;

      card.addEventListener("click", () => {
        alert(
          `Detalles de ${e.nombre}\nModelo: ${e.modelo}\nCorriente: ${
            e.sens_corriente
          } A\nFlujo: ${e.sens_flujo ? "Sí" : "No"}\nPower: ${
            e.sens_power ? "Sí" : "No"
          }\nAccionamientos: ${e.cont_accionam}\nEstado: ${e.estado}`
        );
      });

      contenedor.appendChild(card);
    });
  } catch (err) {
    console.error(err);
    alert("Error al cargar los datos");
  }
}

cargarDetalle();

function formatearEstado(estado) {
  switch (estado) {
    case "funcionando":
      return `<span class="material-symbols-outlined" style="color:var(--color-pstv)">check_circle</span>`;
    case "alerta":
      return `<span class="material-symbols-outlined" style="color:var(--color-alerta)">error</span>`;
    case "desconectada":
      return `<span class="material-symbols-outlined" style="color:grey">wifi_off</span>`;
    default:
      return estado;
  }
}
