// snapshotHora.js
require("dotenv").config({ path: "/usr/src/app/.env" }); // PARA PRODUCCIÓN -----------------------------------------------
// require("dotenv").config({ path: "../.env" }); // PARA PRUEBA LOCAL -------------------------------------------------------
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

function esHorarioServicioArgentina(fechaUTC) {
  const fechaAR = new Date(fechaUTC.getTime() - 3 * 60 * 60 * 1000);

  const h = fechaAR.getHours();
  const d = fechaAR.getDay(); // 0 domingo, 6 sábado

  const esDiaSemana = d >= 1 && d <= 5; // lun-vie
  const esHorario = h >= 6;

  return esDiaSemana && esHorario;
}

const horario_servicio = esHorarioServicioArgentina(horaInicio);

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

    let ultimoEvento = null;

    let delta_accionam = 0;

    if (eventosEnVentana.length > 0) {
      eventosEnVentana.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
      const primerEvento = eventosEnVentana[0];
      ultimoEvento = eventosEnVentana[eventosEnVentana.length - 1];

      delta_accionam =
        (ultimoEvento.cont_accionam ?? 0) -
        (primerEvento.cont_accionam ?? 0) +
        1;

      if (delta_accionam < 0) delta_accionam = 0;
    }

    if (eventosEnVentana.length === 0) {
      const media_movil_completo = await calcularMediaMovil({
        id: eng.id,
        horas: 72,
        soloServicio: false,
        valorActual: delta_accionam,
        incluirActual: true,
      });

      const media_movil_servicio = await calcularMediaMovil({
        id: eng.id,
        horas: 54,
        soloServicio: true,
        valorActual: delta_accionam,
        incluirActual: horario_servicio,
      });

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
          accionam_estimados: eng.set_ejes ? (6 * 24) / eng.set_ejes : 0,
          // ( [cantidad de trenes x hora] * [24 ejes x tren] ) /  seteo de ejes engrasadora

          horario_servicio,

          media_movil_completo,
          media_movil_servicio,
        },
        { upsert: true, new: true }
      );

      continue;
    }

    const media_movil_completo = await calcularMediaMovil({
      id: eng.id,
      horas: 72,
      soloServicio: false,
      valorActual: delta_accionam,
      incluirActual: true,
    });

    const media_movil_servicio = await calcularMediaMovil({
      id: eng.id,
      horas: 54,
      soloServicio: true,
      valorActual: delta_accionam,
      incluirActual: horario_servicio,
    });

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

        horario_servicio,

        media_movil_completo,
        media_movil_servicio,
      },
      { upsert: true, new: true }
    );

    console.log(`✅ Snapshot guardado para máquina ${eng.id}`);
  }
}

async function calcularMediaMovil({
  id,
  horas,
  soloServicio,
  valorActual,
  incluirActual,
}) {
  const filtro = { id };
  if (soloServicio) filtro.horario_servicio = true;

  const snaps = await SnapshotHora.find(filtro)
    .sort({ fecha: -1 })
    .limit(horas - (incluirActual ? 1 : 0))
    .select("delta_accionam")
    .lean();

  let valores = snaps.map((s) => s.delta_accionam || 0);

  if (incluirActual && typeof valorActual === "number") {
    valores.unshift(valorActual);
  }

  if (valores.length === 0) return null;

  const suma = valores.reduce((a, b) => a + b, 0);
  return suma / valores.length;
}

generarSnapshotHora()
  .then(() => console.log("Resumen horario generado con éxito."))
  .catch((err) => console.error("Error generando resumen horario:", err))
  .finally(() => mongoose.connection.close());
