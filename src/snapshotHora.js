// snapshotHora.js
require("dotenv").config({ path: "../.env" });
const conectarDB = require("./db");
const mongoose = require("mongoose");
const { Engrasadora, SnapshotHora } = require("./models/engrasadora");

// Uso: node snapshotHora [YYYY-MM-DDTHH:MM:SS] (UTC)
const arg = process.argv[2];
const baseHoraUTC = arg ? new Date(arg + "Z") : new Date();

// Redondear al inicio de la hora UTC
const horaInicio = new Date(
  Date.UTC(
    baseHoraUTC.getUTCFullYear(),
    baseHoraUTC.getUTCMonth(),
    baseHoraUTC.getUTCDate(),
    baseHoraUTC.getUTCHours(),
    0,
    0,
    0
  )
);
const horaFin = new Date(horaInicio.getTime() + 60 * 60 * 1000); // +1 hora

async function generarSnapshotHora() {
  await conectarDB();
  console.log("🟢 Conectado a MongoDB");
  console.log(
    `📸 Generando snapshot horario UTC: ${horaInicio.toISOString()} → ${horaFin.toISOString()}`
  );

  const engrasadoras = await Engrasadora.find();

  for (const eng of engrasadoras) {
    if (!eng.id || !Array.isArray(eng.historial) || eng.historial.length === 0)
      continue;

    const eventosEnVentana = eng.historial.filter((e) => {
      const fecha = new Date(e.fecha);
      return fecha >= horaInicio && fecha < horaFin;
    });

    if (eventosEnVentana.length === 0) {
      console.log(`⚪ Sin eventos en la ventana para ID:${eng.id}`);
      continue;
    }

    eventosEnVentana.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

    const primerEvento = eventosEnVentana[0];
    const ultimoEvento = eventosEnVentana[eventosEnVentana.length - 1];

    const delta_accionam =
      (ultimoEvento.cont_accionam ?? 0) - (primerEvento.cont_accionam ?? 0) + 1;

    const eventosNoRepetidos = Array.from(
      new Map(eventosEnVentana.map((e) => [e.cont_accionam, e])).values()
    );

    const conteo_alertas = eventosNoRepetidos.filter(
      (e) => e.estado === "alerta"
    ).length;

    const conteo_desc = eventosNoRepetidos.filter(
      (e) => e.estado === "desconectada"
    ).length;

    const conteo_fs = eventosNoRepetidos.filter(
      (e) => e.estado === "fs"
    ).length;

    const conteo_func = eventosNoRepetidos.filter(
      (e) => e.estado === "funcionando"
    ).length;

    await SnapshotHora.findOneAndUpdate(
      { id: eng.id, fecha: horaInicio },
      {
        id: eng.id,
        linea: eng.linea,
        fecha: horaInicio,
        estado: ultimoEvento.estado,
        sens_corriente: ultimoEvento.sens_corriente,
        sens_flujo: ultimoEvento.sens_flujo,
        sens_power: ultimoEvento.sens_power,
        lora_signal: ultimoEvento.lora_signal,

        delta_accionam,
        conteo_alertas,
        conteo_desc,
        conteo_fs,
        conteo_func,
      },
      { upsert: true, new: true }
    );

    console.log(`✅ Snapshot guardado para máquina ${eng.id}`);
  }
}

generarSnapshotHora()
  .then(() => console.log("Resumen horario generado con éxito."))
  .catch((err) => console.error("Error generando resumen horario:", err))
  .finally(() => mongoose.connection.close());
