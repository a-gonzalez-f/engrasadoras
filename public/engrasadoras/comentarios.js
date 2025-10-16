// comentarios.js

export function listarComentarios(maquina, abrirModal = true) {
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
          <button class="btnEliminarComentario" data-index="${index}" data-id="${
          maquina._id
        }">
          <span class="material-symbols-outlined deleteBtn">delete</span>
        </button>
          <hr>
        </div>
      `
      )
      .join("");

    document.querySelectorAll(".btnEliminarComentario").forEach((btn) => {
      btn.addEventListener("click", () => {
        const indexComentario = btn.getAttribute("data-index");
        eliminarComentario(maquina, indexComentario);
      });
    });
  }

  if (abrirModal) modal.style.display = "flex";
}

export function eliminarComentario(maquina, indexComentario) {
  if (!confirm("¿Seguro que desea eliminar este comentario?")) return;

  document.getElementById("overlay").style.display = "flex";
  document.getElementById("overlay-message").innerText = "Cargando...";

  fetch(`/api/engrasadoras/${maquina._id}/comentarios/${indexComentario}`, {
    method: "DELETE",
  })
    .then((res) => {
      if (!res.ok) throw new Error("Error al eliminar el comentario");
      return res.json();
    })
    .then((data) => {
      document.getElementById("overlay").style.display = "none";
      document.getElementById("overlay-message").innerText =
        "Esperando confirmación...";

      maquina.comentarios = data.comentarios;
      listarComentarios(maquina, false);

      const ultComentario =
        maquina.comentarios.length > 0
          ? `
          <div>
            <div class="dataComment">
              <span>${
                maquina.comentarios[maquina.comentarios.length - 1].user ||
                "Anónimo"
              }</span> - 
              ${new Date(
                maquina.comentarios[maquina.comentarios.length - 1].date
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
              maquina.comentarios[maquina.comentarios.length - 1].comentario
            }    
          </div>`
          : "Sin comentarios";

      document.getElementById("ultimoComentario").innerHTML = ultComentario;
    })
    .catch((err) => {
      document.getElementById("overlay").style.display = "none";
      document.getElementById("overlay-message").innerText =
        "Esperando confirmación...";
      alert(err.message);
    });
}

export function renderUltimoComentario(comentarios) {
  if (!comentarios.length) return "Sin comentarios";
  const ult = comentarios[comentarios.length - 1];
  return `
    <div>
      <div class="dataComment">
        <span>${ult.user || "Anónimo"}</span> - ${new Date(
    ult.date
  ).toLocaleString("es-AR", {})}</div>
      ${ult.comentario}
    </div>`;
}
