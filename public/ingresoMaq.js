const form = document.getElementById("formEngrasadora");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData(form);
  const cantidadIngresos = Number(formData.get("cantidadIngresos")) || 1;
  formData.delete("cantidadIngresos"); // No lo mandamos al backend
  const body = {};
  formData.forEach((value, key) => {
    if (key === "sens_flujo" || key === "sens_power") {
      body[key] = value === "true";
    } else if (
      [
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
