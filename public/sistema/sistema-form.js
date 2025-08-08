// sistema-form.js

import { enviarFormularioGateway } from "./form-handler.js";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("formGateway");

  form.addEventListener("click", (e) => {
    const addBtn = e.target.closest(".add");
    const removeBtn = e.target.closest(".remove");

    if (addBtn) {
      e.preventDefault();

      const container = document.getElementById("inputsEngrasadoras");

      const engBlock = document.createElement("div");
      engBlock.classList.add("engrasadoraBlock");
      engBlock.innerHTML = `
        <label>Engrasadora (ID): </label>
        <div class="flex">
            <input class="id" type="text" name="idEngrasadora" required />
            <div class="actionButtons flex">
              <button>
                <span class="material-symbols-outlined remove"> remove </span>
              </button>
            </div>
        </div>
      `;

      container.appendChild(engBlock);
      asignarEventosInputsID();
    }

    if (removeBtn) {
      e.preventDefault();

      const allBlocks = form.querySelectorAll(".engrasadoraBlock");
      if (allBlocks.length > 1) {
        const wrapperToRemove = e.target.closest(".engrasadoraBlock");
        if (wrapperToRemove) {
          wrapperToRemove.remove();
        }
      }
    }
  });

  // Validación y formateo automático del input IP Gateway
  const ipInput = document.getElementById("ip");
  if (ipInput) {
    ipInput.addEventListener("input", (e) => {
      let valor = e.target.value;

      // Permitir solo dígitos y puntos
      valor = valor.replace(/[^\d.]/g, "");

      // Eliminar múltiples puntos consecutivos
      valor = valor.replace(/\.{2,}/g, ".");

      // Eliminar puntos al inicio
      valor = valor.replace(/^\./, "");

      // Limitar a 3 puntos (4 bloques)
      let bloques = valor.split(".");
      if (bloques.length > 4) {
        bloques = bloques.slice(0, 4);
      }

      // Limitar cada bloque a 3 dígitos
      bloques = bloques.map((b) => b.slice(0, 3));

      e.target.value = bloques.join(".");
    });
  }

  // Validación y formateo automático del input nombre
  const nombreInput = document.getElementById("nombre");
  if (nombreInput) {
    nombreInput.addEventListener("input", (e) => {
      let valor = e.target.value;

      valor = valor.slice(0, 20);

      e.target.value = valor;
    });
  }

  // Validación y formateo automático del input ubicación
  const ubiInput = document.getElementById("ubi");
  if (ubiInput) {
    ubiInput.addEventListener("input", (e) => {
      let valor = e.target.value;

      valor = valor.slice(0, 20);

      e.target.value = valor;
    });
  }

  // Validación y formateo automático del input ID Gateway
  const idInput = document.getElementById("idGateway");
  if (idInput) {
    idInput.addEventListener("input", (e) => {
      let valor = e.target.value;

      // Permitir solo dígitos y puntos
      valor = valor.replace(/[^\d.]/g, "");
      valor = valor.slice(0, 3);
      e.target.value = valor;
    });
  }

  asignarEventosInputsID();

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Recolectar datos
    const data = {
      ip: document.getElementById("ip").value.trim(),
      nombre: document.getElementById("nombre").value.trim(),
      id: document.getElementById("idGateway").value.trim(),
      linea: document.getElementById("linea").value.trim(),
      ubicacion: document.getElementById("ubi").value.trim(),
      engrasadoras: Array.from(document.querySelectorAll(".id")).map((input) =>
        input.value.trim()
      ),
    };

    try {
      const res = await enviarFormularioGateway(data);
      alert("Gateway ingresado correctamente");
      modalIngreso.style.display = "none";
      console.log(res);
      window.location.reload(); // provisorio, que no se necesite refrescar
    } catch (err) {
      alert("Error al enviar: " + err.message);
    }
  });
});

function asignarEventosInputsID() {
  const idInputs = document.querySelectorAll(".id");
  idInputs.forEach((input) => {
    input.removeEventListener("input", validarID);
    input.addEventListener("input", validarID);
  });
}

function validarID(e) {
  let valor = e.target.value;
  valor = valor.replace(/[^\d]/g, "");
  valor = valor.slice(0, 3);
  e.target.value = valor;
}
