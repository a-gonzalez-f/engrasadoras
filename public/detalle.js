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

      const detalle = document.createElement("div");
      detalle.classList.add("detalle-hover");
      detalle.innerHTML = `
    <strong>${e.nombre.toUpperCase()}</strong><br>
    ${e.modelo.toUpperCase()}<br>
    Corriente: ${e.sens_corriente} A<br>
    Flujo: ${e.sens_flujo ? "Sí" : "No"}<br>
    Power: ${e.sens_power ? "Sí" : "No"}<br>
    Accionamientos: ${e.cont_accionam}<br>
  `;

      card.innerHTML = `
    <div class="nombre">${e.nombre.toUpperCase()}</div>
    <div class="estado">${formatearEstado(e.estado)}</div>
  `;

      document.body.appendChild(detalle);

      card.addEventListener("mouseenter", () => {
        detalle.style.display = "block";
      });

      card.addEventListener("mousemove", (eMouse) => {
        detalle.style.top = `${eMouse.clientY + 10}px`;
        detalle.style.left = `${eMouse.clientX + 10}px`;
      });

      card.addEventListener("mouseleave", () => {
        detalle.style.display = "none";
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
