// timeSet.js

const modal = document.getElementById("modalTime");
const btnTime = document.getElementById("btnTime");
const closeModalTime = document.getElementById("closeModalTime");
let modalTimeAbierto = false;

btnTime.addEventListener("click", async () => {
  if (!modalTimeAbierto) {
    try {
      const res = await fetch("/api/sistema/get-time");
      const data = await res.json();

      if (res.ok && data.tiempo) {
        document.getElementById("time").value = data.tiempo;
        document.getElementById("timeOut").value = data.timeOut;
      } else {
        document.getElementById("time").value = "";
        document.getElementById("timeOut").value = "";
        console.warn("No se pudo cargar el tiempo actual");
      }

      if (res.ok && data.user) {
        document.getElementById("user").innerText = data.user;
      } else {
        document.getElementById("user").innerText = "";
        console.warn("No se pudo cargar el user");
      }

      if (res.ok && data.updatedAt) {
        const fecha = new Date(data.updatedAt);
        document.getElementById("lastUpdate").innerText =
          fecha.toLocaleString("es-AR");
      } else {
        document.getElementById("lastUpdate").innerText = "";
        console.warn("No se pudo cargar la fecha de actualización");
      }

      modal.style.display = "flex";
      modalTimeAbierto = true;
    } catch (err) {
      console.error("Error al obtener tiempo actual:", err);
      alert("No se pudo obtener la configuración actual");
    }
  }
});

window.addEventListener("click", (e) => {
  if (e.target === modal) modal.style.display = "none";
  modalTimeAbierto = false;
});

closeModalTime.addEventListener("click", () => {
  modal.style.display = "none";
  modalTimeAbierto = false;
});

const submitBtn = document.getElementById("submitTime");

submitBtn.addEventListener("click", async () => {
  const tiempo = parseInt(document.getElementById("time").value);
  const timeOut = parseInt(document.getElementById("timeOut").value);

  if (isNaN(tiempo) || tiempo < 1 || tiempo > 600) {
    alert("Ingresá un tiempo válido entre 1 y 600 segundos");
    return;
  }

  if (isNaN(timeOut) || timeOut < 1 || timeOut > 600) {
    alert("Ingresá un timeOut válido entre 1 y 600 segundos");
    return;
  }

  try {
    const res = await fetch("/api/sistema/set-time", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ tiempo, timeOut }),
    });

    if (res.ok) {
      alert("Tiempo actualizado correctamente");
      modal.style.display = "none";
      modalTimeAbierto = false;
    } else {
      alert("Error al actualizar el tiempo");
    }
  } catch (err) {
    console.error(err);
    alert("Error de conexión con el servidor");
  }
});
