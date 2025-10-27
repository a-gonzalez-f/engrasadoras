import { formatearEstado } from "./detalles-tools.js";
import { formatearSignal } from "./formatear-signal.js";

export function abrirHistorialCompleto(maquina) {
  const modal = document.getElementById("modalHistorialCompleto");
  const tbody = modal.querySelector("tbody");
  const cerrarBtn = modal.querySelector("#cerrarHistorialCompleto");
  const contenedorScroll = modal.querySelector(".tabla-scrollable");
  const title = document.getElementById("titleHistorial");
  // const ordenBtn = document.getElementById("evento-filtro");

  modal.style.display = "flex";
  tbody.innerHTML = `<tr class="fila-cargando"><td colspan="12" style="text-align:center">Cargando...</td></tr>`;

  let offset = 0;
  const limit = 50;
  let loading = false;
  let hasMore = true;

  let historialCargado = [];

  const fetchHistorial = (reiniciar = false) => {
    if (loading || !hasMore) return;

    if (reiniciar) {
      offset = 0;
      historialCargado = [];
      tbody.innerHTML = `<tr class="fila-cargando"><td colspan="12" style="text-align:center">Cargando...</td></tr>`;
    }

    loading = true;

    const tipo = document.getElementById("tipoEvento-filtro").value;
    const fecha = document.getElementById("fecha-filtro").value;
    const estado = document.getElementById("estado-filtro").value;
    const flujo = document.getElementById("flujo-filtro").value;
    const power = document.getElementById("power-filtro").value;
    const onoff = document.getElementById("onoff-filtro").value;
    const mostrarRepetidos =
      document.getElementById("repetidos-filtros").checked;

    const params = new URLSearchParams({
      offset,
      limit,
      tipo,
      estado,
      flujo,
      power,
      onoff,
      repetidos: mostrarRepetidos ? "true" : "false",
    });

    if (fecha) params.append("fecha", fecha);

    const filaCargandoExistente = tbody.querySelector(".fila-cargando");
    if (filaCargandoExistente) {
      filaCargandoExistente.remove();
    }

    const trCargando = document.createElement("tr");
    trCargando.classList.add("fila-cargando");
    trCargando.innerHTML = `
    <td colspan="12" style="text-align: center">Cargando...</td>
    `;
    tbody.appendChild(trCargando);

    fetch(`/api/engrasadoras/historial/${maquina._id}?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        title.innerText = ` - ${maquina.nombre} (${maquina.id})`.toUpperCase();

        const historial = data.historial;

        if (offset === 0 && historial.length === 0) {
          tbody.innerHTML = `<tr><td colspan="12" style="text-align:center">No hay coincidencias</td></tr>`;
          loading = false;
          hasMore = false;
          return;
        }

        if (offset === 0) {
          historialCargado = [];
          tbody.innerHTML = "";
        }

        historialCargado.push(...historial);

        offset += historial.length;
        loading = false;
        hasMore = historial.length === limit;

        aplicarFiltros();
      })
      .catch((err) => {
        console.error("Error al obtener historial:", err);
        if (offset === 0) {
          tbody.innerHTML = `<tr><td colspan="12" style="text-align:center">Error al cargar historial</td></tr>`;
        }
        loading = false;
      });
  };

  function aplicarFiltros() {
    // const orden = ordenBtn.value;
    const tipo = document.getElementById("tipoEvento-filtro").value;
    const fecha = document.getElementById("fecha-filtro");
    const estado = document.getElementById("estado-filtro").value;
    // const tiempo = document.getElementById("tiempo-filtro").value;
    // const ejes = document.getElementById("ejes-filtro").value;
    // const corriente = document.getElementById("corriente-filtro").value;
    const flujo = document.getElementById("flujo-filtro").value;
    const power = document.getElementById("power-filtro").value;
    // const senal = document.getElementById("senal-filtro").value;
    const onoff = document.getElementById("onoff-filtro").value;
    const mostrarRepetidos =
      document.getElementById("repetidos-filtros").checked;

    let filtrado = historialCargado.filter((h) => {
      // if (tiempo !== "unset" && String(h.set_tiempodosif) !== tiempo)
      //   return false;
      // if (ejes !== "unset" && String(h.set_ejes) !== ejes) return false;
      // if (corriente !== "unset" && String(h.sens_corriente) !== corriente)
      //   return false;
      // if (senal !== "unset" && String(h.lora_signal) !== senal) return false;

      if (tipo !== "todos" && h.tipo_evento !== tipo) return false;
      if (estado !== "todos" && h.estado !== estado) return false;
      if (fecha.value) {
        const fechaSeleccionada = fecha.value;
        const fechaEvento = new Date(h.fecha);
        const fechaEventoStr = fechaEvento.toISOString().slice(0, 10);
        if (fechaSeleccionada !== fechaEventoStr) return false;
      }

      if (flujo !== "todos" && String(h.sens_flujo) !== flujo) return false;
      if (power !== "todos" && String(h.sens_power) !== power) return false;
      if (onoff !== "todos" && String(h.on_off) !== onoff) return false;

      if (!mostrarRepetidos && h.repetido) return false;

      return true;
    });

    // filtrado.sort((a, b) => {
    //   if (orden === "ascendente") return a.nro_evento - b.nro_evento;
    //   else return b.nro_evento - a.nro_evento;
    // });

    renderizarTabla(filtrado);
  }

  function renderizarTabla(datos) {
    tbody.innerHTML = "";

    if (datos.length === 0) {
      tbody.innerHTML = `<tr><td colspan="12" style="text-align:center">No hay coincidencias</td></tr>`;
      return;
    }

    datos.forEach((h) => {
      const tr = document.createElement("tr");
      tr.className = h.estado;
      tr.innerHTML = `
      <td>${h.nro_evento || "-"}</td>
      <td>${h.tipo_evento || "-"}</td>
      <td>${new Date(h.fecha).toLocaleString("es-AR", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      })}</td>
      <td>${formatearEstado(h.estado, "texto")}</td>
      <td>${h.set_tiempodosif ? h.set_tiempodosif + " s" : "-"}</td>
      <td>${h.set_ejes || "-"}</td>
      <td>${h.sens_corriente ? h.sens_corriente + " mA" : "-"}</td>
      <td>${h.sens_flujo ? "Sí" : "No"}</td>
      <td>${h.sens_power ? "Sí" : "No"}</td>
      <td>${formatearSignal(h.lora_signal, "icono")}</td>
      <td>${h.on_off ? "No" : "Sí"}</td>
      <td>${h.cont_accionam || "-"}</td>
    `;
      tbody.appendChild(tr);
    });
  }

  // Escuchas de filtros
  document.querySelectorAll(".filtro").forEach((f) => {
    f.addEventListener("change", () => {
      hasMore = true;
      fetchHistorial(true);
    });
  });

  // ✅ Solo una vez el listener de ordenamiento
  // ordenBtn.addEventListener("click", (e) => {
  //   const btn = e.currentTarget;
  //   btn.value = btn.value === "ascendente" ? "descendente" : "ascendente";
  //   btn.querySelector("span").textContent =
  //     btn.value === "ascendente" ? "keyboard_arrow_up" : "keyboard_arrow_down";
  //   aplicarFiltros();
  // });

  // Carga inicial
  fetchHistorial();

  // Scroll infinito
  contenedorScroll.addEventListener("scroll", () => {
    const el = contenedorScroll;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 150) {
      fetchHistorial();
    }
  });

  cerrarBtn.addEventListener("click", () => {
    modal.style.display = "none";
    tbody.innerHTML = "";
    offset = 0;
    hasMore = true;
    loading = false;
  });
}
