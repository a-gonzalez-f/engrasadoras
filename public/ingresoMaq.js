const form = document.getElementById("formEngrasadora");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData(form);
  const id = formData.get("id");

  const idExistente = await verificarIdExistente(id);
  if (idExistente) {
    alert("El ID ya está en uso, por favor elige otro.");
    return;
  }

  const cantidadIngresos = Number(formData.get("cantidadIngresos")) || 1;
  formData.delete("cantidadIngresos");
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
    let errores = 0;
    for (let i = 0; i < cantidadIngresos; i++) {
      const res = await fetch("/api/engrasadoras", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) errores++;
    }

    if (errores === 0) {
      alert(`Engrasadora guardada ${cantidadIngresos} veces correctamente`);
      form.reset();
    } else {
      alert(`Error en ${errores} de ${cantidadIngresos} envíos`);
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
