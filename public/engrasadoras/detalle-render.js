// detalle-render.js

import { listarHistorialEnModal } from "./historial.js";
import { formatearEstado } from "./detalles-tools.js";
import { listarComentarios } from "./comentarios.js";
import { inicializarSeteos } from "./detalle-seteos.js";
import { abrirHistorialCompleto } from "./historial-completo.js";
import { abrirAnalyticsMaq } from "./analytics-maq.js";

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
        <tr><td colspan="12" style="text-align: center">Cargando...</td></tr>
      </tbody>
    `;

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
                <img 
                  class="icon icono-editar"
                  id="editarTiempo" 
                  src="../img/icons/edit_24dp_FFF8E9_FILL0_wght400_GRAD0_opsz24.svg" 
                  alt="edit"
                />
              </div>
            </div>
            <div>
              <p>Cant. de ejes:</p>
              <div>
                <p id="cantEjes">${e.set_ejes}</p>
                <img 
                  class="icon icono-editar" 
                  id="editarEjes"
                  src="../img/icons/edit_24dp_FFF8E9_FILL0_wght400_GRAD0_opsz24.svg" 
                  alt="edit"
                />
              </div>
            </div>
            <div>
            <p>Estado:</p>            
            <select name="estado" id="estado">
              <option value="funcionando">Funcionando</option>
              <option value="fs">Fuera de Servicio</option>
              <option value="alerta" disabled>Alerta</option>
              <option value="desconectada" disabled>Desconectada</option>
              <option value="pm" disabled>Pausa Manual</option>
            </select>
            </div>
            <div>
            <p>Ubicación:</p>            
              <div>
              <p id="ubicacion">${e.ubicacion ? e.ubicacion : "-"}</p>
              <img 
                class="icon icono-editar" 
                id="editarUbi"
                src="../img/icons/edit_24dp_FFF8E9_FILL0_wght400_GRAD0_opsz24.svg" 
                alt="edit"
              />
              </div>
            </div>
            <div>  
              <div id="resetAccionam" class="actionButton reset">
                <p>Reset Accionamientos</p>
                <div>
                  <img 
                    class="icon icono-reset"
                    src="../img/icons/restart_alt_24dp_FFF8E9_FILL0_wght400_GRAD0_opsz24.svg" 
                    alt="edit"
                  />
                </div>
              </div>
              <div id="apagarEquipo" class="actionButton reset">
                <div>
                  <span class="material-symbols-outlined icono-reset">pause</span>
                </div>
              </div> 
            </div> 
          </div>
          <div class="subCont">
            <h6>ULTIMO SENSADO</h6>
            <div><p>Fecha:</p><p id="fechaHora">${new Date(
              e.date
            ).toLocaleString("es-AR", {
              day: "2-digit",
              month: "2-digit",
              year: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
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
              <div id="mostrarAnalytics" class="actionButton">
                <p>Analytics</p>
                <div>
                  <img 
                    class="icon"
                    src="../img/icons/bar_chart_4_bars_24dp_FFF8E9_FILL0_wght400_GRAD0_opsz24.svg" 
                    alt="chart"
                  />
                </div>
              </div>
              <div id="historialCompleto" class="actionButton">
                <p>Historial Completo</p>
                  <img 
                    class="icon"
                    src="../img/icons/list_24dp_FFF8E9_FILL0_wght400_GRAD0_opsz24.svg" 
                    alt="chart"
                  />
              </div>
              <div id="resetHistorial" class="actionButton reset">
                <p>Reset Historial</p>
                <div>
                  <img 
                    class="icon icono-reset"
                    src="../img/icons/restart_alt_24dp_FFF8E9_FILL0_wght400_GRAD0_opsz24.svg" 
                    alt="chart"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>  
      `;

  document.getElementById("contenidoModal").innerHTML = contenido;

  const botonApagar = document.getElementById("apagarEquipo");
  const switchButton = document.querySelector("#apagarEquipo > div > span");
  botonApagar.classList.remove("apagar", "encender");

  if (e.estado === "pm") {
    botonApagar.classList.add("encender");
    switchButton.innerHTML = "play_arrow";
  } else {
    botonApagar.classList.add("apagar");
    switchButton.innerHTML = "pause";
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

    document.getElementById("overlay").style.display = "flex";
    document.getElementById("overlay-message").innerText = "Cargando...";

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
        document.getElementById("overlay").style.display = "none";
        document.getElementById("overlay-message").innerText =
          "Esperando confirmación...";

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
      .catch((err) => {
        document.getElementById("overlay").style.display = "none";
        document.getElementById("overlay-message").innerText =
          "Esperando confirmación...";

        alert(err.message);
      });
  });

  const selectEstado = document.getElementById("estado");
  selectEstado.value = e.estado;
  selectEstado.addEventListener("change", () => {
    const nuevoEstado = selectEstado.value;

    if (nuevoEstado === e.estado) return;

    let confirmacion = `¿Seguro que desea cambiar el estado a "${formatearEstado(
      nuevoEstado,
      "texto"
    )}"?`;

    if (nuevoEstado === "fs") {
      confirmacion += `\nConfirme únicamente si la engrasadora NO está en servicio.\nSe desvinculará el monitoreo.`;
    }

    if (!confirm(confirmacion)) {
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
    if (
      !confirm(
        "¿Está seguro de que desea resetear el historial?\nEsto eliminará todo el historial y no se podrá deshacer."
      )
    )
      return;

    fetch(`/api/engrasadoras/${e.id}/resetHistorial`, {
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

  document.getElementById("historialCompleto").addEventListener("click", () => {
    abrirHistorialCompleto(e);
  });

  document.getElementById("mostrarAnalytics").addEventListener("click", () => {
    abrirAnalyticsMaq(e.id);
  });

  inicializarSeteos(e);
}
