const params = new URLSearchParams(window.location.search);
const linea = params.get("linea");

let maquinaSeleccionada = null;
let mostrarHistorialCompleto = false;

if (!linea) {
  alert("Línea no especificada");
  window.location.href = "/";
}

document.title = `Detalle Línea ${linea}`;
document.getElementById("tituloLinea").innerText = `${linea}`;

async function cargarDetalle(data) {
  try {
    const contenedor = document.getElementById("contenedorMaquinas");
    contenedor.innerHTML = "";

    if (data.length === 0) {
      contenedor.innerHTML = `<p>No hay máquinas registradas para esta línea.</p>`;
      return;
    }

    document.querySelectorAll(".detalle-hover").forEach((d) => d.remove());

    data.forEach((e) => {
      const card = document.createElement("div");
      card.classList.add("card-maquina");
      card.dataset.id = e._id;

      const detalle = document.createElement("div");
      detalle.classList.add("detalle-hover");
      detalle.innerHTML = `
        <strong>${e.nombre.toUpperCase()}</strong><br>
        ${e.id ? "ID: " + e.id : "Sin ID"}<br>
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
        const detalleWidth = detalle.offsetWidth;
        const detalleHeight = detalle.offsetHeight;

        const espacioDerecha = window.innerWidth - eMouse.clientX;
        const espacioAbajo = window.innerHeight - eMouse.clientY;

        let top = eMouse.clientY + 10;
        let left = eMouse.clientX + 10;

        if (espacioAbajo < detalleHeight + 20) {
          top = eMouse.clientY - detalleHeight - 10;
        }

        if (espacioDerecha < detalleWidth + 20) {
          left = eMouse.clientX - detalleWidth - 10;
        }

        detalle.style.top = `${Math.max(top, 0)}px`;
        detalle.style.left = `${Math.max(left, 0)}px`;
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
                <th>Señal Lora</th>
                <th>On/Off</th>
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
              <td>${h.nro_evento || "-"}</td>
              <td>${h.tipo_evento || "-"}</td>
              <td>${new Date(h.fecha).toLocaleString("es-AR", {
                day: "2-digit",
                month: "2-digit",
                year: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              })}</td>
              <td>${formatearEstado(h.estado, "texto")}</td>
              <td>${h.set_tiempodosif} s</td>
              <td>${h.set_ejes}</td>
              <td>${h.sens_corriente} mA</td>
              <td>${h.sens_flujo ? "Sí" : "No"}</td>
              <td>${h.sens_power ? "Sí" : "No"}</td>
              <td>${h.lora_signal || "-"}</td>
              <td>${h.on_off ? "ON" : "OFF"}</td>
              <td>${h.cont_accionam || "-"}</td>
            </tr>
            `
            )
            .join("");
        } else {
          historialHtml += `
            <tr>
              <td colspan="12" style="text-align:center">No hay historial registrado</td>
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
          ).toLocaleString("es-AR", {
            day: "2-digit",
            month: "2-digit",
            year: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          })}<br>
            </div>
              ${ultimo.comentario}    
          </div>      
        `;
        }

        const contenido = `
        <h5>
        ${e.nombre.toUpperCase()} | 
        <span id="modeloMaquina">${e.modelo.toUpperCase()}</span> | 
        <span id="estadoMaquina" class="${e.estado}">${formatearEstado(
          e.estado,
          "texto"
        ).toUpperCase()}</span> | 
        <span id="idMaquina">${e.id ? "ID: " + e.id : "Sin ID"}</span>
        </h5>

        <div class="cont">
          <div class="subCont">
            <h6>SETEO</h6>
            <div>
              <p>Tiempo Dosif. (s):</p>
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
            <div>
            <p>Estado:</p>            
            <select name="estado" id="estado">
              <option value="funcionando">Funcionando</option>
              <option value="alerta">Alerta</option>
              <option value="desconectada">Desconectada</option>
              <option value="fs">Fuera de Servicio</option>
            </select>
            </div>
            <div>
            <p>Ubicación:</p>            
              <div>
              <p id="ubicacion">${e.ubicacion}</p>
              <span class="material-symbols-outlined icono-editar" id="editarUbi">edit</span>
              </div>
            </div>
            <div>  
              <div id="resetAccionam" class="reset">
                <p>Reset Accionamientos</p>
                <div>
                  <span class="material-symbols-outlined icono-reset">restart_alt</span>
                </div>
              </div>
              <div id="apagarEquipo" class="reset">
                <div>
                  <span class="material-symbols-outlined icono-reset">mode_off_on</span>
                </div>
              </div> 
            </div> 
          </div>
          <div class="subCont">
            <h6>ULTIMO SENSADO</h6>
            <div><p>Fecha:</p><p>${new Date(e.date).toLocaleString("es-AR", {
              day: "2-digit",
              month: "2-digit",
              year: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            })}</p></div>              
            <div><p>Accionamientos:</p><p id="accionamientos">${
              e.cont_accionam
            }</p></div>
            <div><p>Corriente:</p><p id="corriente">${
              e.sens_corriente
            } mA</p></div>
            <div><p>Flujo:</p><p id="flujo">${
              e.sens_flujo ? "Sí" : "No"
            }</p></div>
            <div><p>Power:</p><p id="power">${
              e.sens_power ? "Sí" : "No"
            }</p></div>
            <div><p>Señal Lora:</p><p id="lora">${
              e.lora_signal ? e.lora_signal : "-"
            }</p></div>            
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
            <div class="actionButtons">
              <div id="resetHistorial" class="reset">
                <p>Reset Historial</p>
                <div>
                  <span class="material-symbols-outlined icono-reset">restart_alt</span>
                </div>
              </div>
              <div id="historialCompleto" class="reset">
                <p>Historial Completo</p>
                <span class="material-symbols-outlined">list</span>
              </div>
            </div>
          </div>
        </div>  
      `;

        document.getElementById("contenidoModal").innerHTML = contenido;

        document
          .getElementById("historialCompleto")
          .addEventListener("click", () => {
            mostrarHistorialCompleto = !mostrarHistorialCompleto;
            listarHistorialEnModal(e.historial, mostrarHistorialCompleto);

            const btn = document
              .getElementById("historialCompleto")
              .querySelector("p");
            btn.innerText = mostrarHistorialCompleto
              ? "Últimos 10"
              : "Historial Completo";
          });

        const botonApagar = document.getElementById("apagarEquipo");
        botonApagar.classList.remove("apagar", "encender");

        if (e.estado === "fs") {
          botonApagar.classList.add("encender");
        } else {
          botonApagar.classList.add("apagar");
        }

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
              "Ingrese el nuevo tiempo de dosificación (0.2s - 2s):",
              e.set_tiempodosif
            );

            if (nuevoValor !== null) {
              const valorSanitizado = nuevoValor.replace(",", ".");
              const numValor = parseFloat(valorSanitizado);

              if (isNaN(numValor) || numValor < 0.2) {
                alert("El tiempo de dosificación debe ser a partir de 0.2");
                return;
              }

              if (numValor > 2) {
                alert("El tiempo de dosificación debe ser menor o igual a 2");
                return;
              }

              const valorTruncado = Math.trunc(numValor * 10) / 10;

              fetch(`/api/engrasadoras/${e._id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ set_tiempodosif: valorTruncado }),
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

        document.getElementById("editarUbi").addEventListener("click", () => {
          const nuevoValor = prompt("Ingrese la nueva ubicación", e.ubicacion);

          if (nuevoValor !== null) {
            fetch(`/api/engrasadoras/${e._id}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ ubicacion: nuevoValor }),
            })
              .then((res) => {
                if (!res.ok) throw new Error("Error al actualizar");
                return res.json();
              })
              .then((data) => {
                e.ubicacion = data.ubicacion;
                document.getElementById("ubicacion").innerText = data.ubicacion;
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
              document.getElementById("newComment").value = "";

              maquinaSeleccionada.comentarios = data.comentarios;

              const ultComentario =
                data.comentarios[data.comentarios.length - 1];

              const comentarioHtmlActualizado = `
              <div>
                <div class="dataComment">
                  <span>${ultComentario.user || "Anónimo"}</span> - ${new Date(
                ultComentario.date
              ).toLocaleString("es-AR", {
                day: "2-digit",
                month: "2-digit",
                year: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              })}<br>
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
                e.cont_accionam = data.cont_accionam;
                e.historial = data.historial;

                document.getElementById("accionamientos").innerText =
                  data.cont_accionam;
                listarHistorialEnModal(e.historial);
              })
              .catch((err) => alert(err.message));
          });
        const selectEstado = document.getElementById("estado");
        selectEstado.value = e.estado;

        selectEstado.addEventListener("change", () => {
          const nuevoEstado = selectEstado.value;

          if (nuevoEstado === e.estado) return;

          if (
            !confirm(
              `¿Seguro que desea cambiar el estado a "${formatearEstado(
                nuevoEstado,
                "texto"
              )}"?`
            )
          ) {
            selectEstado.value = e.estado;
            return;
          }

          fetch(`/api/engrasadoras/${e._id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ estado: nuevoEstado }),
          })
            .then((res) => {
              if (!res.ok) throw new Error("Error al actualizar el estado");
              return res.json();
            })
            .then((data) => {
              e.estado = data.estado;
              e.historial = data.historial;

              document.getElementById("estadoMaquina").innerText =
                formatearEstado(data.estado, "texto").toUpperCase();

              document.getElementById("estadoMaquina").className = data.estado;

              const btnApagar = document.getElementById("apagarEquipo");
              btnApagar.classList.remove("apagar", "encender");

              if (e.estado === "fs") {
                btnApagar.classList.add("encender");
              } else if (e.estado === "funcionando") {
                btnApagar.classList.add("apagar");
              }

              listarHistorialEnModal(e.historial);
            })
            .catch((err) => alert(err.message));
        });

        document
          .getElementById("apagarEquipo")
          .addEventListener("click", () => {
            const nuevoEstado = e.estado === "fs" ? "funcionando" : "fs";
            const textoConfirm =
              nuevoEstado === "fs" ? "apagar el equipo" : "encender el equipo";

            if (!confirm(`¿Seguro que desea ${textoConfirm}?`)) return;

            fetch(`/api/engrasadoras/${e._id}/switchOnOff`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ estado: nuevoEstado }),
            })
              .then((res) => {
                if (!res.ok) throw new Error("Error al actualizar el estado");
                return res.json();
              })
              .then((data) => {
                e.estado = data.estado;
                e.historial = data.historial;

                document.getElementById("estadoMaquina").innerText =
                  formatearEstado(data.estado, "texto").toUpperCase();

                document.getElementById("estadoMaquina").className =
                  data.estado;

                const btnApagar = document.getElementById("apagarEquipo");
                btnApagar.classList.remove("apagar", "encender");

                if (e.estado === "fs") {
                  btnApagar.classList.add("encender");
                } else if (e.estado === "funcionando") {
                  btnApagar.classList.add("apagar");
                }

                listarHistorialEnModal(e.historial);
              })
              .catch((err) => alert(err.message));
          });

        document
          .getElementById("resetHistorial")
          .addEventListener("click", () => {
            if (!confirm("¿Seguro que desea resetear el historial?")) return;

            fetch(`/api/engrasadoras/${e._id}/resetHistorial`, {
              method: "PUT",
            })
              .then((res) => {
                if (!res.ok) throw new Error("Error al resetear el historial");
                return res.json();
              })
              .then((data) => {
                e.historial = data.historial;
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

  actualizarBarraPorcentual(data);
}

document.getElementById("cerrarModal").addEventListener("click", () => {
  document.getElementById("modalDetalle").style.display = "none";
});

document.getElementById("modalDetalle").addEventListener("click", (e) => {
  if (e.target.id === "modalDetalle") {
    document.getElementById("modalDetalle").style.display = "none";
  }
});

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
        ).toLocaleString("es-AR", {
          day: "2-digit",
          month: "2-digit",
          year: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })}
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
      ).toLocaleString("es-AR", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })}<br>
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

function listarHistorialEnModal(historial, completo = false) {
  const tbody = document.querySelector(".tabla-historial tbody");

  if (!tbody) return;

  if (historial.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="12" style="text-align:center">No hay historial registrado</td>
      </tr>
    `;
    return;
  }

  const items = completo
    ? historial.slice().reverse()
    : historial.slice(-10).reverse();

  tbody.innerHTML = items
    .map(
      (h) => `
      <tr class="historial-item ${h.estado}">
        <td>${h.nro_evento || "-"}</td>
        <td>${h.tipo_evento || "-"}</td>
        <td>${new Date(h.fecha).toLocaleString("es-AR", {
          day: "2-digit",
          month: "2-digit",
          year: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })}</td>
        <td>${formatearEstado(h.estado, "texto")}</td>
        <td>${h.set_tiempodosif} s</td>
        <td>${h.set_ejes}</td>
        <td>${h.sens_corriente} mA</td>
        <td>${h.sens_flujo ? "Sí" : "No"}</td>
        <td>${h.sens_power ? "Sí" : "No"}</td>
        <td>${h.lora_signal || "-"}</td>
        <td>${h.on_off ? "ON" : "OFF"}</td>
        <td>${h.cont_accionam || "-"}</td>
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

function formatearEstado(estado, modo = "icono") {
  const estadosMap = {
    funcionando: {
      texto: "Funcionando",
      icono: `<span class="material-symbols-outlined" style="color:var(--color-pstv)">check_circle</span>`,
    },
    alerta: {
      texto: "Alerta",
      icono: `<span class="material-symbols-outlined" style="color:var(--color-alerta)">error</span>`,
    },
    desconectada: {
      texto: "Desconectada",
      icono: `<span class="material-symbols-outlined" style="color:var(--color-desconectada)">wifi_off</span>`,
    },
    fs: {
      texto: "Fuera de Servicio",
      icono: `<span class="material-symbols-outlined" style="color:var(--color-error)">block</span>`,
    },
  };

  const estadoObj = estadosMap[estado];

  if (!estadoObj) {
    return modo === "icono" ? estado : estado.toUpperCase();
  }

  return modo === "icono" ? estadoObj.icono : estadoObj.texto;
}

function actualizarBarraPorcentual(maquinas) {
  const total = maquinas.length;
  if (total === 0) {
    document.getElementById("porc_func").style.width = "0%";
    document.getElementById("porc_alert").style.width = "0%";
    document.getElementById("porc_desconectada").style.width = "0%";
    document.getElementById("porc_fs").style.width = "0%";
    return;
  }

  const cant_func = maquinas.filter((m) => m.estado === "funcionando").length;
  const cant_alert = maquinas.filter((m) => m.estado === "alerta").length;
  const cant_desc = maquinas.filter((m) => m.estado === "desconectada").length;
  const cant_fs = maquinas.filter((m) => m.estado === "fs").length;

  const porc_func = Number(((cant_func / total) * 100).toPrecision(3));
  const porc_alert = Number(((cant_alert / total) * 100).toPrecision(3));
  const porc_desc = Number(((cant_desc / total) * 100).toPrecision(3));
  const porc_fs = Number(((cant_fs / total) * 100).toPrecision(3));

  document.getElementById("porc_func").style.width = `${porc_func}%`;
  document.getElementById("porc_alert").style.width = `${porc_alert}%`;
  document.getElementById("porc_desconectada").style.width = `${porc_desc}%`;
  document.getElementById("porc_fs").style.width = `${porc_fs}%`;

  if (cant_func !== 0) {
    document.getElementById(
      "value_func"
    ).innerText = `${cant_func} - ${porc_func}%`;
  }
  if (cant_alert !== 0) {
    document.getElementById(
      "value_alert"
    ).innerText = `${cant_alert} - ${porc_alert}%`;
  }
  if (cant_desc !== 0) {
    document.getElementById(
      "value_desc"
    ).innerText = `${cant_desc} - ${porc_desc}%`;
  }
  if (cant_fs !== 0) {
    document.getElementById("value_fs").innerText = `${cant_fs} - ${porc_fs}%`;
  }

  document.getElementById("total_value").innerText = ` Total: ${total}`;
}

let ultimoListado = [];

setInterval(() => {
  fetch(`/api/engrasadoras?linea=${linea}`)
    .then((res) => res.json())
    .then((data) => {
      actualizarBarraPorcentual(data);

      // Si cambia la cantidad de máquinas o sus IDs, recargo todo
      const idsActuales = data.map((m) => m._id).join(",");
      const idsUltimos = ultimoListado.map((m) => m._id).join(",");

      if (idsActuales !== idsUltimos) {
        cargarDetalle(data);
        ultimoListado = data;
      } else {
        // Si no cambió la estructura, actualizo solo los estados visuales
        data.forEach((m) => {
          const card = document.querySelector(
            `.card-maquina[data-id="${m._id}"]`
          );
          if (card) {
            card.querySelector(".estado").innerHTML = formatearEstado(m.estado);
          }
        });
      }

      if (maquinaSeleccionada) {
        fetch(`/api/engrasadoras/full/${maquinaSeleccionada._id}`)
          .then((res) => res.json())
          .then((actualizada) => {
            if (actualizada) {
              maquinaSeleccionada = actualizada;

              document.getElementById("estadoMaquina").innerText =
                formatearEstado(actualizada.estado, "texto").toUpperCase();
              document.getElementById("estadoMaquina").className =
                actualizada.estado;
              document.getElementById("accionamientos").innerText =
                actualizada.cont_accionam;
              document.getElementById("tiempoDosif").innerText =
                actualizada.set_tiempodosif;
              document.getElementById("cantEjes").innerText =
                actualizada.set_ejes;
              document.getElementById("estado").value = actualizada.estado;
              document.getElementById("corriente").innerText =
                actualizada.sens_corriente + " mA";
              document.getElementById("flujo").innerText =
                actualizada.sens_flujo ? "Si" : "No";
              document.getElementById("power").innerText =
                actualizada.sens_power ? "Si" : "No";
              document.getElementById("lora").innerText =
                actualizada.lora_signal;

              maquinaSeleccionada.historial = actualizada.historial;

              listarHistorialEnModal(
                actualizada.historial,
                mostrarHistorialCompleto
              );

              const btnApagar = document.getElementById("apagarEquipo");
              btnApagar.classList.remove("apagar", "encender");
              if (actualizada.estado === "fs")
                btnApagar.classList.add("encender");
              else if (actualizada.estado === "funcionando")
                btnApagar.classList.add("apagar");
            }
          })
          .catch((err) => console.error("Error al actualizar modal:", err));
      }
    })
    .catch((err) => console.error("Error actualizando:", err));
}, 1000);
