// card-actions.js

const modal = document.getElementById("modalEdit");
const overlay = document.getElementById("overlay");
let modalOpen = false;
let currentEngId = null;
let originalData = {};

let cerrarBtn = document.getElementById("cerrarModalEdit");
let form = document.getElementById("editarEngrasadora");
let btnGuardar = document.getElementById("confirmEdit");
let inputNombre = document.getElementById("eng-nombre");
let inputId = document.getElementById("eng-id");
let inputLinea = document.getElementById("eng-linea");
let inputModelo = document.getElementById("eng-modelo");

cerrarBtn.addEventListener("click", cerrarModal);

document.body.addEventListener("contextmenu", (event) => {
  event.preventDefault();
});

export function handleRightClick(event, maquina) {
  event.preventDefault();

  const existingMenu = document.querySelector(".actionsMenu");
  if (existingMenu) {
    existingMenu.remove();
  }

  const posX = event.clientX;
  const posY = event.clientY;

  const menu = document.createElement("div");
  menu.classList.add("actionsMenu");
  menu.innerHTML = `
    <div class="edit" data-maquina-id="${maquina._id}">
    <span class="material-symbols-outlined edit">edit</span>
    <span>Editar</span>
    </div>
    <div class="delete" data-maquina-id="${maquina._id}">
    <span class="material-symbols-outlined delete">delete</span>
    <span>Borrar</span>
    </div>
  `;

  menu.style.position = "absolute";
  menu.style.left = `${posX}px`;
  menu.style.top = `${posY}px`;

  document.body.appendChild(menu);

  menu.querySelector(".edit").addEventListener("click", () => {
    menu.remove();
    abrirModal(maquina);
  });

  menu.querySelector(".delete").addEventListener("click", () => {
    menu.remove();
    deleteMaquina(maquina);
  });

  document.addEventListener("click", (e) => {
    if (!menu.contains(e.target)) {
      menu.remove();
    }
  });
}

async function abrirModal(maquina) {
  currentEngId = maquina._id;
  if (modalOpen) return;

  modal.classList.remove("hidden");
  modal.classList.add("visible");
  modalOpen = true;

  inputNombre.value = maquina.nombre || "";
  inputId.value = maquina.id || "";
  inputLinea.value = maquina.linea || "";
  inputModelo.value = maquina.modelo || "";

  originalData = {
    nombre: inputNombre.value,
    id: inputId.value,
    linea: inputLinea.value,
    modelo: inputModelo.value,
  };
}

function cerrarModal() {
  modal.classList.remove("visible");
  modal.classList.add("hidden");
  modalOpen = false;

  [inputNombre, inputId, inputLinea, inputModelo].forEach((input) => {
    input.value = "";
    input.classList.remove("cambio");
  });

  btnGuardar.style.backgroundColor = "#777";
}

[inputNombre, inputId, inputLinea, inputModelo].forEach((input) => {
  input.addEventListener("input", detectarCambios);
  input.addEventListener("change", detectarCambios);
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && modalOpen) {
    cerrarModal();
  }
});

function detectarCambios() {
  const cambios =
    inputNombre.value !== originalData.nombre ||
    inputId.value !== originalData.id ||
    inputLinea.value !== originalData.linea ||
    inputModelo.value !== originalData.modelo;

  btnGuardar.style.backgroundColor = cambios ? "var(--color-pstv)" : "#777";

  const campos = [
    { input: inputNombre, key: "nombre" },
    { input: inputId, key: "id" },
    { input: inputLinea, key: "linea" },
    { input: inputModelo, key: "modelo" },
  ];

  campos.forEach(({ input, key }) => {
    if (input.value !== originalData[key]) {
      input.classList.add("cambio");
    } else {
      input.classList.remove("cambio");
    }
  });
}

// guardar
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nuevoId = inputId.value;
  const idOriginal = originalData.id;
  const cambioID = nuevoId !== idOriginal;

  if (cambioID) {
    const confirmarCambio = confirm(
      `¿Seguro que desea cambiar el ID de "${idOriginal}" a "${nuevoId}"?`
    );
    if (!confirmarCambio) return;

    try {
      overlay.style.display = "flex";

      const resID = await fetch(`/api/engrasadoras/editarID`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: idOriginal,
          idNuevo: nuevoId,
        }),
      });

      const data = await resID.json();

      if (!resID.ok) {
        alert("❌ " + data.mensaje);
        overlay.style.display = "none";
        return;
      }

      alert("✅ " + data.mensaje);

      overlay.style.display = "none";
      originalData.id = nuevoId;
    } catch (err) {
      overlay.style.display = "none";
      alert("❌ Error al cambiar el ID: " + err.message);
      return;
    }
  }

  let cambiosDirectos = {};
  if (inputNombre.value !== originalData.nombre)
    cambiosDirectos.nombre = inputNombre.value;
  if (inputLinea.value !== originalData.linea)
    cambiosDirectos.linea = inputLinea.value;
  if (inputModelo.value !== originalData.modelo)
    cambiosDirectos.modelo = inputModelo.value;

  if (Object.keys(cambiosDirectos).length === 0) {
    cerrarModal();
    location.reload();
    return;
  }

  try {
    const res = await fetch(`/api/engrasadoras/${currentEngId}/editar`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cambiosDirectos),
    });

    if (!res.ok) {
      const errorData = await res.json();
      alert("❌ " + errorData.mensaje);
      return;
    }

    cerrarModal();
    location.reload();
  } catch (err) {
    alert("❌ Error al guardar los cambios: " + err.message);
  }
});

// eliminar
async function deleteMaquina(maquina) {
  if (!maquina._id) return;

  const confirmar = confirm(
    "¿Seguro desea eliminar esta engrasadora?\nEsta acción NO se puede deshacer"
  );
  if (!confirmar) return;

  try {
    const res = await fetch(`/api/engrasadoras/${maquina._id}`, {
      method: "DELETE",
    });

    if (!res.ok) throw new Error("Error al eliminar engrasadora");

    const maquinaElemento = document.querySelector(
      `[data-maquina-id="${maquina._id}"]`
    );
    if (maquinaElemento) {
      maquinaElemento.remove();
    }
  } catch (err) {
    console.error("Error eliminando engrasadora:", err);
    alert("❌ No se pudo eliminar la engrasadora.");
  }
}
