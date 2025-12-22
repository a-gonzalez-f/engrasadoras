// snapshotHora.js
require("dotenv").config({ path: "/usr/src/app/.env" });
const conectarDB = require("./db");
const mongoose = require("mongoose");
const {
  Engrasadora,
  SnapshotHora,
  Historial,
} = require("./models/engrasadora");

// Uso: node snapshotHora [YYYY-MM-DDTHH:MM:SS] (UTC)
const arg = process.argv[2];
const baseHoraUTC = arg ? new Date(arg + "Z") : new Date();

// hora anterior
const horaBase = new Date(baseHoraUTC.getTime() - 60 * 60 * 1000);

// Redondear al inicio de la hora UTC
const horaInicio = new Date(
  Date.UTC(
    horaBase.getUTCFullYear(),
    horaBase.getUTCMonth(),
    horaBase.getUTCDate(),
    horaBase.getUTCHours(),
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
    if (!eng.id) continue;

    const eventosEnVentana = await Historial.find({
      engrasadora: eng.id,
      fecha: { $gte: horaInicio, $lt: horaFin },
    }).lean();

    if (eventosEnVentana.length === 0) {
      await SnapshotHora.findOneAndUpdate(
        { id: eng.id, fecha: horaInicio },
        {
          id: eng.id,
          linea: eng.linea,

          fecha: horaInicio,

          estado:
            eng.estado !== "funcionando" && eng.estado !== "alerta"
              ? eng.estado
              : "desconectada",

          set_tiempodosif: eng.set_tiempodosif,
          set_ejes: eng.set_ejes,
          on_off: eng.on_off,

          sens_corriente: null,
          sens_flujo: null,
          sens_power: null,
          lora_signal: null,

          delta_accionam: 0,
          accionam_estimados: eng.set_ejes ? (20 * 24) / eng.set_ejes : 0,
        },
        { upsert: true, new: true }
      );

      continue;
    }

    eventosEnVentana.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

    const primerEvento = eventosEnVentana[0];
    const ultimoEvento = eventosEnVentana[eventosEnVentana.length - 1];

    let delta_accionam =
      (ultimoEvento.cont_accionam ?? 0) - (primerEvento.cont_accionam ?? 0) + 1;

    if (delta_accionam < 0) {
      delta_accionam = 0;
    }

    const eventosNoRepetidos = Array.from(
      new Map(eventosEnVentana.map((e) => [e.cont_accionam, e])).values()
    );

    await SnapshotHora.findOneAndUpdate(
      { id: eng.id, fecha: horaInicio },
      {
        id: eng.id,
        linea: eng.linea,

        fecha: horaInicio,

        estado: ultimoEvento.estado,

        set_tiempodosif: ultimoEvento.set_tiempodosif,
        set_ejes: ultimoEvento.set_ejes,
        on_off: ultimoEvento.on_off,

        sens_corriente: ultimoEvento.sens_corriente,
        sens_flujo: ultimoEvento.sens_flujo,
        sens_power: ultimoEvento.sens_power,
        lora_signal: ultimoEvento.lora_signal,

        delta_accionam,
        accionam_estimados: eng.set_ejes ? (20 * 24) / eng.set_ejes : 0,
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
