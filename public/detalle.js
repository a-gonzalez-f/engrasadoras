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

      card.addEventListener("click", () => {
        let historialHtml = `
          <table class="tabla-historial">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Estado</th>
                <th>Tiempo Dosif.</th>
                <th>Cant. Ejes</th>
                <th>Corriente</th>
                <th>Flujo</th>
                <th>Power</th>
                <th>Accionamientos</th>
              </tr>
            </thead>
            <tbody>
          `;

        if (e.historial && e.historial.length > 0) {
          historialHtml += e.historial
            .slice(-10)
            .reverse()
            .map(
              (h) => `
            <tr class="historial-item ${h.estado}">
              <td>${new Date(h.fecha).toLocaleString("es-AR")}</td>
              <td>${h.estado.toUpperCase()}</td>
              <td>${h.set_tiempodosif}</td>
              <td>${h.set_ejes}</td>
              <td>${h.sens_corriente} A</td>
              <td>${h.sens_flujo ? "Sí" : "No"}</td>
              <td>${h.sens_power ? "Sí" : "No"}</td>
              <td>${h.cont_accionam}</td>
            </tr>
            `
            )
            .join("");
        } else {
          historialHtml += `
            <tr>
              <td colspan="8" style="text-align:center">No hay historial registrado</td>
            </tr>
          `;
        }
        historialHtml += `</tbody></table>`;

        const contenido = `
        <h5>${e.nombre.toUpperCase()} | <span>${e.modelo.toUpperCase()}</span> | <span class="${
          e.estado
        }">${e.estado.toUpperCase()}</span></h5>
        <div class="cont">
          <div class="subCont">
            <h6>SETEO</h6>
            <div>
              <p>Tiempo Dosif.:</p>
              <div>
                <p id="tiempoDosif">${e.set_tiempodosif}</p>
                <span class="material-symbols-outlined icono-editar" id="editarTiempo">edit</span>
              </div>
            </div>
            <div>
              <p>Cant. de ejes:</p>
              <div>
                <p id="cantEjes">${e.set_ejes}</p>
                <span class="material-symbols-outlined icono-editar" id="editarEjes">edit</span>
              </div>
            </div>   
          </div>
          <div class="subCont">
            <h6>ULTIMO SENSADO</h6>
            <div><p>Fecha:</p><p>${new Date(e.date).toLocaleString(
              "es-AR"
            )}</p></div>              
            <div><p>Accionamientos:</p><p>${e.cont_accionam}</p></div>
            <div><p>Corriente:</p><p>${e.sens_corriente} A</p></div>
            <div><p>Flujo:</p><p>${e.sens_flujo ? "Sí" : "No"}</p></div>
            <div><p>Power:</p><p>${e.sens_power ? "Sí" : "No"}</p></div>
          </div>
          <div class="subCont contComments">
            <h6>COMENTARIOS</h6>
            <div class=commContainer>
              <div>
                <textarea id="newComment" name="comentario" rows="5" cols="40" placeholder="Ingrese su comentario"></textarea>
                <button id="addComment">Comentar</button>
              </div>
              <div>
                <h4 style="font-weight:700">Ultimo comentario:</h4>
                <p>bla blba balbalbalba lba bla bla lbal ba lba lba ba lbal bal bal bal bal ba lba lba lba lba lba</p>
                <button>Ver todos</button>
              </div>
            </div>
          </div>
          <div class="subCont historial">
            <h6>HISTORIAL</h6>
            ${historialHtml}
          </div>
        </div>  
      `;

        document.getElementById("contenidoModal").innerHTML = contenido;
        document.getElementById("modalDetalle").style.display = "flex";

        document
          .getElementById("editarTiempo")
          .addEventListener("click", () => {
            const nuevoValor = prompt(
              "Ingrese el nuevo tiempo de dosificación (0.2s - 0.8s):",
              e.set_tiempodosif
            );

            if (nuevoValor !== null) {
              const numValor = parseFloat(nuevoValor);

              if (isNaN(numValor) || numValor < 0.2) {
                alert("El tiempo de dosificación debe ser a partir de 0.2");
                return;
              }

              if (numValor > 0.8) {
                alert("El tiempo de dosificación debe ser menor a 0.8");
                return;
              }

              fetch(`/api/engrasadoras/${e._id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ set_tiempodosif: numValor }),
              })
                .then((res) => {
                  if (!res.ok) throw new Error("Error al actualizar");
                  return res.json();
                })
                .then((data) => {
                  e.set_tiempodosif = data.set_tiempodosif;
                  document.getElementById("tiempoDosif").innerText =
                    data.set_tiempodosif;
                })
                .catch((err) => alert(err.message));
            }
          });

        document.getElementById("editarEjes").addEventListener("click", () => {
          const nuevoValor = prompt(
            "Ingrese la nueva cantidad de ejes (1 - 128):",
            e.set_ejes
          );

          if (nuevoValor !== null) {
            const numValor = parseInt(nuevoValor);

            if (isNaN(numValor) || numValor < 1) {
              alert("La cantidad de ejes debe ser a partir de 1");
              return;
            }

            if (numValor > 128) {
              alert("La cantidad de ejes debe ser menor a 128");
              return;
            }

            fetch(`/api/engrasadoras/${e._id}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ set_ejes: numValor }),
            })
              .then((res) => {
                if (!res.ok) throw new Error("Error al actualizar");
                return res.json();
              })
              .then((data) => {
                e.set_ejes = data.set_ejes;
                document.getElementById("cantEjes").innerText = data.set_ejes;
              })
              .catch((err) => alert(err.message));
          }
        });
      });

      contenedor.appendChild(card);
    });
  } catch (err) {
    console.error(err);
    alert("Error al cargar los datos");
  }
}

cargarDetalle();

// Cierres del modal, se agregan una sola vez
document.getElementById("cerrarModal").addEventListener("click", () => {
  document.getElementById("modalDetalle").style.display = "none";
});

document.getElementById("modalDetalle").addEventListener("click", (e) => {
  if (e.target.id === "modalDetalle") {
    document.getElementById("modalDetalle").style.display = "none";
  }
});

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
