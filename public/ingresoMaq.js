const form = document.getElementById("formEngrasadora");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData(form);
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
    const res = await fetch("/api/engrasadoras", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      alert("Engrasadora guardada correctamente");
      form.reset();
    } else {
      alert("Error al guardar la engrasadora");
    }
  } catch (err) {
    console.error(err);
    alert("Error de conexión con el servidor");
  }
});
