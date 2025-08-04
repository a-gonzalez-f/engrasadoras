// gateway-modal.js
const modal = document.getElementById("gatewayModal");
const cerrarBtn = document.getElementById("cerrarModal");
const form = document.getElementById("formEditGateway");
const containerEngrasadoras = document.getElementById("conectadasContainer");

let currentGatewayId = null;

export function abrirModalGateway(gw) {
  currentGatewayId = gw._id;
  modal.classList.remove("hidden");

  document.getElementById("gw-ip").textContent = gw.ip;
  document.getElementById("gw-id").textContent = gw.id;
  document.getElementById("gw-nombre").textContent = gw.nombre || "";
  document.getElementById("gw-linea").value = gw.linea || "";
  document.getElementById("gw-ubicacion").textContent = gw.ubicacion || "";

  renderizarEngrasadoras(gw.engrasadoras || []);
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
      block.remove();
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

  const payload = {
    nombre: document.getElementById("gw-nombre").textContent,
    linea: document.getElementById("gw-linea").value,
    ubicacion: document.getElementById("gw-ubicacion").textContent,
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
