// gateway-modal.js

import { listarHistorial } from "./historial-gw.js";

const modal = document.getElementById("gatewayModal");
const cerrarBtn = document.getElementById("cerrarModal");
const form = document.getElementById("formEditGateway");
const containerEngrasadoras = document.getElementById("conectadasContainer");

let currentGatewayId = null;
let currentBypass = false;

export function abrirModalGateway(gw) {
  currentGatewayId = gw._id;
  currentBypass = gw.bypass || false;
  modal.classList.remove("hidden");

  document.getElementById("gw-ip").textContent = gw.ip;
  document.getElementById("gw-id").textContent = gw.id;
  document.getElementById("gw-nombre").textContent = gw.nombre || "";
  document.getElementById("gw-linea").value = gw.linea || "";
  document.getElementById("gw-ubicacion").textContent = gw.ubicacion || "";
  const bypassBtn = document.getElementById("bypassBtn");

  if (gw.bypass) {
    bypassBtn.textContent = "toggle_off";
    bypassBtn.classList.remove("activated");
    bypassBtn.classList.add("bypassed");
  } else {
    bypassBtn.textContent = "toggle_on";
    bypassBtn.classList.remove("bypassed");
    bypassBtn.classList.add("activated");
  }

  renderizarEngrasadoras(gw.engrasadoras || []);
  listarHistorial(gw);
}

// Cerrar modal
cerrarBtn.addEventListener("click", () => modal.classList.add("hidden"));
window.addEventListener("click", (e) => {
  if (e.target === modal) modal.classList.add("hidden");
});

// Render engrasadoras en #conectadasContainer
function renderizarEngrasadoras(lista) {
  containerEngrasadoras.innerHTML = "";

  lista.forEach((id, i) => {
    const block = document.createElement("div");
    block.className = "engrasadoraBlock";

    block.innerHTML = `
      <label>Engrasadora ${i + 1}: </label>
      <div class="flex">
        <input class="id" type="text" name="idEngrasadora" value="${id}" required />
        <div class="actionButtons flex">
          <button type="button" class="btnRemove">
            <span class="material-symbols-outlined remove">remove</span>
          </button>
        </div>
      </div>
    `;

    block.querySelector(".btnRemove").addEventListener("click", () => {
      if (confirm("¿Seguro quiere desconectar esta Engrasadora?")) {
        block.remove();
      }
    });

    containerEngrasadoras.appendChild(block);
  });
}

// Guardar cambios
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const engrasadoras = Array.from(
    containerEngrasadoras.querySelectorAll("input.id")
  )
    .map((input) => input.value.trim())
    .filter((val) => val !== "");

  const ipEl = document.getElementById("gw-ip");
  const idEl = document.getElementById("gw-id");

  const payload = {
    ip: ipEl.textContent || ipEl.value,
    id: parseInt(idEl.textContent || idEl.value),
    nombre:
      document.getElementById("gw-nombre").textContent ||
      document.getElementById("gw-nombre").value,
    linea: document.getElementById("gw-linea").value,
    ubicacion:
      document.getElementById("gw-ubicacion").textContent ||
      document.getElementById("gw-ubicacion").value,
    engrasadoras,
  };

  try {
    const res = await fetch(`/api/gateways/${currentGatewayId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error("Error al guardar gateway");

    modal.classList.add("hidden");
    location.reload();
  } catch (err) {
    console.error("Error guardando gateway:", err);
    alert("Error al guardar los cambios");
  }
});

// Funcionalidad de añadir engrasadora para conectar
document.getElementById("addEngrasadora").addEventListener("click", () => {
  const index = containerEngrasadoras.children.length;

  const block = document.createElement("div");
  block.className = "engrasadoraBlock";

  block.innerHTML = `
    <label>Engrasadora ${index + 1}: </label>
    <div class="flex">
      <input class="id" type="text" name="idEngrasadora" required />
      <div class="actionButtons flex">
        <button type="button" class="btnRemove">
          <span class="material-symbols-outlined remove">remove</span>
        </button>
      </div>
    </div>
  `;

  block.querySelector(".btnRemove").addEventListener("click", () => {
    if (confirm("¿Seguro quiere desconectar esta Engrasadora?")) {
      block.remove();
    }
    actualizarNumeracionEngrasadoras();
  });

  containerEngrasadoras.appendChild(block);
  formatIdInput();
});

function actualizarNumeracionEngrasadoras() {
  const blocks = containerEngrasadoras.querySelectorAll(".engrasadoraBlock");
  blocks.forEach((block, i) => {
    const label = block.querySelector("label");
    label.textContent = `Engrasadora ${i + 1}:`;
  });
}

// Validación y formateo automático del input ID Engrasadora
function formatIdInput() {
  const idInputs = document.querySelectorAll(".id");

  if (idInputs.length > 0) {
    idInputs.forEach((input) => {
      input.addEventListener("input", (e) => {
        let valor = e.target.value;
        // Permitir solo dígitos
        valor = valor.replace(/[^\d]/g, "");
        // Limitar a 3 caracteres
        valor = valor.slice(0, 3);

        e.target.value = valor;
      });
    });
  }
}

function activarEdicion(spanId, fieldId) {
  const editBtn = document.getElementById(spanId);
  const fieldEl = document.getElementById(fieldId);

  if (!editBtn || !fieldEl) return;

  const handleEdit = () => {
    const original = fieldEl.textContent.trim();
    const input = document.createElement("input");

    input.type = "text";
    input.value = original;
    input.className = "editableInput";

    fieldEl.replaceWith(input);
    input.focus();

    const guardar = () => {
      const nuevoValor = input.value.trim();
      const nuevoP = document.createElement("p");
      nuevoP.id = fieldId;
      nuevoP.textContent = nuevoValor;

      input.replaceWith(nuevoP);

      // Reactivar edición
      activarEdicion(spanId, fieldId);
    };

    input.addEventListener("blur", guardar, { once: true });
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        guardar();
      }
    });
  };

  editBtn.addEventListener("click", handleEdit);
}

// Activar edición en campos
activarEdicion("edit-ip", "gw-ip");
activarEdicion("edit-nombre", "gw-nombre");
activarEdicion("edit-id", "gw-id");
activarEdicion("edit-ubi", "gw-ubicacion");

// delete

const deleteBtn = document.getElementById("deleteGW");

deleteBtn.addEventListener("click", async () => {
  if (!currentGatewayId) return;

  const confirmar = confirm("¿Seguro desea eliminar este Gateway?");

  if (!confirmar) return;

  try {
    const res = await fetch(`/api/gateways/${currentGatewayId}`, {
      method: "DELETE",
    });

    if (!res.ok) throw new Error("Error al eliminar gateway");

    modal.classList.add("hidden");
    location.reload();
  } catch (err) {
    console.error("Error eliminando gateway:", err);
    alert("No se pudo eliminar el Gateway.");
  }
});

// bypass

const bypassBtn = document.getElementById("bypassBtn");

bypassBtn.addEventListener("click", async () => {
  if (!currentGatewayId) return;

  const confirmar = confirm(
    currentBypass
      ? "¿Seguro desea habilitar este Gateway?"
      : "¿Seguro desea deshabilitar este Gateway?"
  );

  if (!confirmar) return;

  try {
    const nuevoEstado = !currentBypass;

    const res = await fetch(`/api/gateways/${currentGatewayId}/bypass`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bypass: nuevoEstado }),
    });

    if (!res.ok) throw new Error("Error al actualizar estado bypass");

    const gateway = await res.json();

    currentBypass = gateway.bypass;

    bypassBtn.textContent = currentBypass ? "toggle_off" : "toggle_on";
    bypassBtn.classList.remove(currentBypass ? "activated" : "bypassed");
    bypassBtn.classList.add(currentBypass ? "bypassed" : "activated");

    listarHistorial(gateway);
  } catch (err) {
    console.error("Error al deshabilitar gateway:", err);
    alert("Error al cambiar estado bypass del Gateway");
  }
});
