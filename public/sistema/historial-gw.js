// historial-gw.js

export function listarHistorial(gateway) {
  const tbody = document.getElementById("historialGW");
  tbody.innerHTML = "";

  const todos = gateway.historial.reverse();

  tbody.innerHTML = todos
    .map(
      (h) => `
      <tr class="${h.estado}">
        <td>${h.nro_evento || "-"}</td>
        <td>${h.tipo_evento || "-"}</td>
        <td>${new Date(h.fecha).toLocaleString("es-AR", {
          day: "2-digit",
          month: "2-digit",
          year: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })}</td>
        <td>${h.estado}</td>
        <td>${h.bypass ? "Deshabilitado" : "Habilitado"}</td>
      </tr>`
    )
    .join("");
}
