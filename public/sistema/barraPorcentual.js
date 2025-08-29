export function actualizarBarraPorcentual(gateways) {
  const total = gateways.length;
  const conectadas = document.getElementById("barra_conectadas");
  const desconectadas = document.getElementById("barra_desconectadas");
  if (total === 0) {
    conectadas.style.width = "0%";
    desconectadas.style.width = "0%";
    return;
  }

  const cant_conectadas = gateways.filter(
    (gateway) => gateway.comunicacion_back == true
  ).length;
  const cant_desconectadas = gateways.filter(
    (gateway) => gateway.comunicacion_back == false
  ).length;

  const porc_conectadas = Math.round((cant_conectadas / total) * 100);
  const porc_desconectadas = Math.round((cant_desconectadas / total) * 100);

  conectadas.style.width = `${porc_conectadas}%`;
  desconectadas.style.width = `${porc_desconectadas}%`;

  const value_conectadas = document.getElementById("value_conectadas");
  const value_desconectadas = document.getElementById("value_desconectadas");

  if (cant_conectadas !== 0) {
    value_conectadas.innerText = `${cant_conectadas} - ${porc_conectadas}%`;
    value_conectadas.style.display = "block";
  }
  if (cant_desconectadas !== 0) {
    value_desconectadas.innerText = `${cant_desconectadas} - ${porc_desconectadas}%`;
    value_desconectadas.style.display = "block";
  }

  if (porc_conectadas === 0) {
    value_conectadas.style.display = "none";
  }
  if (porc_desconectadas === 0) {
    value_desconectadas.style.display = "none";
  }

  document.getElementById("total_value").innerText = ` Total: ${total}`;
}
