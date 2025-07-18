// detalle-render.js

import { listarHistorialEnModal } from "./historial.js";
import { formatearEstado } from "./detalles-tools.js";
import { listarComentarios } from "./comentarios.js";
import { inicializarSeteos } from "./detalle-seteos.js";

export function renderDetalleMaquina(maquina) {
  let e = maquina;
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
              <option value="pm">Pausa Manual</option>
            </select>
            </div>
            <div>
            <p>Ubicación:</p>            
              <div>
              <p id="ubicacion">${e.ubicacion ? e.ubicacion : "-"}</p>
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

  document.getElementById("historialCompleto").addEventListener("click", () => {
    mostrarHistorialCompleto = !mostrarHistorialCompleto;
    listarHistorialEnModal(e.historial, mostrarHistorialCompleto);

    const btn = document.getElementById("historialCompleto").querySelector("p");
    btn.innerText = mostrarHistorialCompleto
      ? "Últimos 10"
      : "Historial Completo";
  });

  const botonApagar = document.getElementById("apagarEquipo");
  botonApagar.classList.remove("apagar", "encender");

  if (e.estado === "pm") {
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

  document.getElementById("addComment").addEventListener("click", () => {
    const textoComentario = document.getElementById("newComment").value.trim();

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

        e.comentarios = data.comentarios;

        const ultComentario = data.comentarios[data.comentarios.length - 1];

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

        listarComentarios(e, false);
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

        document.getElementById("estadoMaquina").innerText = formatearEstado(
          data.estado,
          "texto"
        ).toUpperCase();

        document.getElementById("estadoMaquina").className = data.estado;

        const btnApagar = document.getElementById("apagarEquipo");
        btnApagar.classList.remove("apagar", "encender");

        if (e.estado === "pm") {
          btnApagar.classList.add("encender");
        } else if (e.estado === "funcionando") {
          btnApagar.classList.add("apagar");
        }

        listarHistorialEnModal(e.historial);
      })
      .catch((err) => alert(err.message));
  });

  document.getElementById("resetHistorial").addEventListener("click", () => {
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

  inicializarSeteos(e);
}
