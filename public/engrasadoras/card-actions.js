// card-actions.js

const modal = document.getElementById("modalEdit");
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

  menu.querySelector(".edit").addEventListener("click", (e) => {
    menu.remove();

    abrirModal(maquina);
  });

  menu.querySelector(".delete").addEventListener("click", (e) => {
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

  modal.style.display = "flex";
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
  modal.style.display = "none";
  modalOpen = false;

  const inputs = document.querySelectorAll(
    "#eng-nombre, #eng-id, #eng-linea, #eng-modelo"
  );
  inputs.forEach((input) => (input.value = ""));

  btnGuardar.style.backgroundColor = "#777";
}

[inputNombre, inputId, inputLinea, inputModelo].forEach((input) => {
  input.addEventListener("input", detectarCambios);
  input.addEventListener("change", detectarCambios);
});

function detectarCambios() {
  const cambios =
    inputNombre.value !== originalData.nombre ||
    inputId.value !== originalData.id ||
    inputLinea.value !== originalData.linea ||
    inputModelo.value !== originalData.modelo;

  btnGuardar.style.backgroundColor = cambios ? "var(--color-pstv)" : "#777";
}

// guardar
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  let payload = {};
  if (inputNombre.value !== originalData.nombre)
    payload.nombre = inputNombre.value;
  if (inputId.value !== originalData.id) payload.id = inputId.value;
  if (inputLinea.value !== originalData.linea) payload.linea = inputLinea.value;
  if (inputModelo.value !== originalData.modelo)
    payload.modelo = inputModelo.value;

  if (Object.keys(payload).length === 0) {
    return;
  }

  try {
    const res = await fetch(`/api/engrasadoras/${currentEngId}/editar`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorData = await res.json();
      alert(errorData.mensaje);
      return;
    }

    modal.classList.add("hidden");
    location.reload();
  } catch (err) {
    console.error("Error guardando engrasadora:", err);
    alert("Error al guardar los cambios");
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
    alert("No se pudo eliminar la engrasadora.");
  }
}
