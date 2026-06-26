const modalBtn = document.getElementById("btnAddMaq");
const modal = document.getElementById("modalIngresoMaq");
const form = document.getElementById("formEngrasadora");
const btnCerrar = document.getElementById("cerrarModalIngreso");

let modalOpen = false;

const params = new URLSearchParams(window.location.search);
const linea = params.get("linea");

modalBtn.addEventListener("click", () => {
  modal.style.display = "flex";
  modalOpen = true;
  document.getElementById("linea-ingreso").value = `${linea}`;
});

btnCerrar.addEventListener("click", () => {
  cerrarModalIngreso();
});

function cerrarModalIngreso() {
  modal.style.display = "none";
  modalOpen = false;
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData(form);
  const id = formData.get("id");

  const idExistente = await verificarIdExistente(id);
  if (idExistente) {
    alert("El ID ya está en uso, por favor elige otro.");
    return;
  }

  const body = {};
  formData.forEach((value, key) => {
    if (key === "sens_flujo" || key === "sens_power") {
      body[key] = value === "true";
    } else if (
      [
        "id",
        "set_tiempodosif",
        "set_ejes",
        "sens_corriente",
        "cont_accionam",
      ].includes(key)
    ) {
      body[key] = Number(value);
    } else {
      body[key] = value;
    }
  });

  try {
    const res = await fetch("/api/engrasadoras", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      cerrarModalIngreso();
      form.reset();
    } else {
      alert("Hubo un error al guardar la engrasadora");
    }
  } catch (err) {
    console.error(err);
    alert("Error de conexión con el servidor");
  }
});

async function verificarIdExistente(id) {
  try {
    const response = await fetch(`/api/engrasadoras/${id}`);
    if (response.status === 404) {
      return false;
    } else if (response.status === 200) {
      return true;
    } else {
      alert("Error al verificar el ID");
      return false;
    }
  } catch (err) {
    console.error("Error en la verificación de ID:", err);
    alert("Error al conectar con el servidor para verificar el ID");
    return false;
  }
}
