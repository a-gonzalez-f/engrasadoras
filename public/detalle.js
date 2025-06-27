const params = new URLSearchParams(window.location.search);
const linea = params.get("linea");

let maquinaSeleccionada = null;

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
        maquinaSeleccionada = e;
        let historialHtml = `
          <table class="tabla-historial">
            <thead>
              <tr>
                <th>N° Evento</th>
                <th>Tipo</th>
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
              <td>${h.nro_evento}</td>
              <td>${h.tipo_evento}</td>
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
              <td colspan="10" style="text-align:center">No hay historial registrado</td>
            </tr>
          `;
        }
        historialHtml += `</tbody></table>`;

        let comentarioHtml = "Sin comentarios";

        if (e.comentarios && e.comentarios.length > 0) {
          const ultimo = e.comentarios[e.comentarios.length - 1];
          comentarioHtml = `
          <div>
            <div class="dataComment">
              <span>${ultimo.user || "Anónimo"}</span> - ${new Date(
            ultimo.date
          ).toLocaleString("es-AR")}<br>
            </div>
              ${ultimo.comentario}    
          </div>      
        `;
        }

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
            <div id="resetAccionam">
              <p>Reset Accionamientos</p>
              <div>
                <span class="material-symbols-outlined icono-reset">restart_alt</span>
              </div>
            </div>   
          </div>
          <div class="subCont">
            <h6>ULTIMO SENSADO</h6>
            <div><p>Fecha:</p><p>${new Date(e.date).toLocaleString(
              "es-AR"
            )}</p></div>              
            <div><p>Accionamientos:</p><p id="accionamientos">${
              e.cont_accionam
            }</p></div>
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
                <div id="ultimoComentario">
                ${comentarioHtml}
                </div>
                <button id="btnVerTodosComentarios">Ver todos</button>
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
          .getElementById("btnVerTodosComentarios")
          .addEventListener("click", () => {
            listarComentarios(e);
          });

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
                  e.historial = data.historial;
                  document.getElementById("tiempoDosif").innerText =
                    data.set_tiempodosif;
                  listarHistorialEnModal(e.historial);
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
                e.historial = data.historial;
                document.getElementById("cantEjes").innerText = data.set_ejes;
                listarHistorialEnModal(e.historial);
              })
              .catch((err) => alert(err.message));
          }
        });

        document.getElementById("addComment").addEventListener("click", () => {
          const textoComentario = document
            .getElementById("newComment")
            .value.trim();

          if (textoComentario === "") {
            alert("Ingrese un comentario");
            return;
          }

          fetch(`/api/engrasadoras/${e._id}/comentarios`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              comentario: textoComentario,
              user: "usuarioX",
            }), // Reemplazar user por el usuario real
          })
            .then((res) => {
              if (!res.ok) throw new Error("Error al agregar comentario");
              return res.json();
            })
            .then((data) => {
              alert("Comentario agregado");
              document.getElementById("newComment").value = "";

              maquinaSeleccionada.comentarios = data.comentarios;

              const ultComentario =
                data.comentarios[data.comentarios.length - 1];

              const comentarioHtmlActualizado = `
              <div>
                <div class="dataComment">
                  <span>${ultComentario.user || "Anónimo"}</span> - ${new Date(
                ultComentario.date
              ).toLocaleString("es-AR")}<br>
                </div>
                ${ultComentario.comentario}    
              </div>
            `;

              document.getElementById("ultimoComentario").innerHTML =
                comentarioHtmlActualizado;
            })
            .catch((err) => alert(err.message));
        });

        document
          .getElementById("resetAccionam")
          .addEventListener("click", () => {
            if (!confirm("¿Seguro que desea resetear los accionamientos?"))
              return;

            fetch(`/api/engrasadoras/${e._id}/resetAccionamientos`, {
              method: "PUT",
            })
              .then((res) => {
                if (!res.ok)
                  throw new Error("Error al resetear los accionamientos");
                return res.json();
              })
              .then((data) => {
                alert("Accionamientos reseteados");

                e.cont_accionam = data.cont_accionam;
                e.historial = data.historial;

                document.getElementById("accionamientos").innerText =
                  data.cont_accionam;
                listarHistorialEnModal(e.historial);
              })
              .catch((err) => alert(err.message));
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

function listarComentarios(maquina) {
  const modal = document.getElementById("modalComentarios");
  const contenedor = document.getElementById("listaComentarios");

  if (!maquina.comentarios || maquina.comentarios.length === 0) {
    contenedor.innerHTML = "<p>No hay comentarios registrados.</p>";
  } else {
    contenedor.innerHTML = maquina.comentarios
      .map(
        (c, index) => `
        <div class="comentario-item">
          <div class="dataComment">
            <strong>${c.user || "Anónimo"}</strong> - ${new Date(
          c.date
        ).toLocaleString("es-AR")}
          </div>
          <div>${c.comentario}</div>
          <button onclick="eliminarComentario('${
            maquina._id
          }', ${index})"><span class="material-symbols-outlined deleteBtn">delete</span></button>
          <hr>
        </div>
      `
      )
      .join("");
  }

  modal.style.display = "flex";
}

function eliminarComentario(idMaquina, indexComentario) {
  if (!confirm("¿Seguro que desea eliminar este comentario?")) return;

  fetch(`/api/engrasadoras/${idMaquina}/comentarios/${indexComentario}`, {
    method: "DELETE",
  })
    .then((res) => {
      if (!res.ok) throw new Error("Error al eliminar el comentario");
      return res.json();
    })
    .then((data) => {
      alert("Comentario eliminado");
      maquinaSeleccionada.comentarios = data.comentarios;
      listarComentarios(maquinaSeleccionada);
      const ultComentario =
        maquinaSeleccionada.comentarios.length > 0
          ? `
  <div>
    <div class="dataComment">
      <span>${
        maquinaSeleccionada.comentarios[
          maquinaSeleccionada.comentarios.length - 1
        ].user || "Anónimo"
      }</span> - 
      ${new Date(
        maquinaSeleccionada.comentarios[
          maquinaSeleccionada.comentarios.length - 1
        ].date
      ).toLocaleString("es-AR")}<br>
    </div>
    ${
      maquinaSeleccionada.comentarios[
        maquinaSeleccionada.comentarios.length - 1
      ].comentario
    }    
  </div>`
          : "Sin comentarios";

      document.getElementById("ultimoComentario").innerHTML = ultComentario;
    })
    .catch((err) => alert(err.message));
}

function listarHistorialEnModal(historial) {
  const tbody = document.querySelector(".tabla-historial tbody");

  if (!tbody) return;

  const ultimos = historial.slice(-10).reverse();

  tbody.innerHTML = ultimos
    .map(
      (h) => `
      <tr class="historial-item ${h.estado}">
        <td>${h.nro_evento || "-"}</td>
        <td>${h.tipo_evento || "-"}</td>
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
}

document.getElementById("modalComentarios").addEventListener("click", (e) => {
  if (e.target.id === "modalComentarios") {
    document.getElementById("modalComentarios").style.display = "none";
  }
});

document.getElementById("cerrarComentarios").addEventListener("click", () => {
  document.getElementById("modalComentarios").style.display = "none";
});
