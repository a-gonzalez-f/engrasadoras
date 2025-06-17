async function cargarEngrasadoras() {
  const res = await fetch("/api/engrasadoras");
  const data = await res.json();

  // Mostrar en tabla
  const tbody = document.getElementById("tablaEngrasadoras");
  data.forEach((e) => {
    const fila = document.createElement("tr");
    fila.innerHTML = `
          <td>${new Date(e.date).toLocaleString("es-AR")}</td>
          <td>${e.linea}</td>
          <td>${e.nombre}</td>
          <td>${e.modelo}</td>
          <td>${e.set_tiempodosif}</td>
          <td>${e.set_ejes}</td>
          <td>${e.sens_ejes}</td>
          <td>${e.sens_corriente}</td>
          <td>${e.sens_flujo}</td>
          <td>${e.sens_power}</td>
          <td>${e.cont_accionam}</td>
          <td>${e.estado}</td>
        `;
    tbody.appendChild(fila);
  });

  // Calcular gráfico de estado global
  const funcionando = data.filter((e) => e.estado === "funcionando").length;
  const total = data.length;
  const fallando = total - funcionando;

  new Chart(document.getElementById("chartGlobal"), {
    type: "doughnut",
    data: {
      labels: ["Funcionando", "Fallando"],
      datasets: [
        {
          data: [funcionando, fallando],
          backgroundColor: ["#4caf50", "#f44336"],
        },
      ],
    },
    options: {
      plugins: {
        title: {
          display: true,
          text: "Estado Global",
        },
      },
    },
  });
}

cargarEngrasadoras();
