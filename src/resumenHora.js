// resumenHoraLinea.js
require("dotenv").config({ path: "/usr/src/app/.env" }); // PARA PRODUCCIÓN -----------------------------------------------
// require("dotenv").config({ path: "../.env" }); // PARA PRUEBA LOCAL -------------------------------------------------------
const mongoose = require("mongoose");
const conectarDB = require("./db");
const { SnapshotHora, ResumenHora } = require("./models/engrasadora");

// Uso: node resumenHoraLinea [YYYY-MM-DDTHH:MM:SS] (UTC)
const arg = process.argv[2];
const baseHoraUTC = arg ? new Date(arg + "Z") : new Date();

// hora anterior
const horaBase = new Date(baseHoraUTC.getTime() - 60 * 60 * 1000);

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

async function main() {
  await conectarDB();
  console.log(
    `📊 Generando resumen horario por línea UTC: ${horaInicio.toISOString()} → ${horaFin.toISOString()}`
  );

  await generarResumenPorLinea(horaInicio, horaFin);
  await generarResumenGlobal(horaInicio, horaFin);

  mongoose.connection.close();
}

async function generarResumenPorLinea(horaInicio, horaFin) {
  const lineas = await SnapshotHora.distinct("linea", {
    fecha: { $gte: horaInicio, $lt: horaFin },
  });

  for (const linea of lineas) {
    const snapshots = await SnapshotHora.find({
      linea,
      fecha: { $gte: horaInicio, $lt: horaFin },
    });

    if (snapshots.length === 0) {
      console.log(`⚪ Sin snapshots de máquina para la línea ${linea}`);
      continue;
    }

    const resumen = calcularEstadisticas(snapshots);

    await ResumenHora.findOneAndUpdate(
      { tipo: "linea", linea, fecha: horaInicio },
      {
        tipo: "linea",
        linea,
        fecha: horaInicio,
        horario_servicio,
        ...resumen,
      },
      { upsert: true, new: true }
    );

    console.log(`📈 Resumen horario generado para línea ${linea}`);
  }
}

async function generarResumenGlobal(inicio, fin) {
  const snapshots = await SnapshotHora.find({
    fecha: { $gte: horaInicio, $lt: horaFin },
  });

  if (snapshots.length === 0) {
    console.log("Sin snapshots para generar resumen global");
    return;
  }

  const resumen = calcularEstadisticas(snapshots);

  await ResumenHora.findOneAndUpdate(
    { tipo: "total", fecha: inicio },
    {
      tipo: "total",
      fecha: inicio,
      horario_servicio,
      ...resumen,
    },
    { upsert: true, new: true }
  );

  console.log("🌍 Resumen horario global generado");
}

function calcularEstadisticas(snapshots) {
  const n = snapshots.length;

  // Estado
  const estados = ["desconectada", "funcionando", "alerta", "fs"];
  const conteoEstados = contarValores(snapshots, "estado", estados);

  // totales
  const conteoFlujo = contarValores(snapshots, "sens_flujo", [true, false]);
  const conteoPower = contarValores(snapshots, "sens_power", [true, false]);

  const total_maq_func = conteoEstados["funcionando"] || 0;
  const total_maq_alertas = conteoEstados["alerta"] || 0;
  const total_maq_desc = conteoEstados["desconectada"] || 0;
  const total_maq_fs = conteoEstados["fs"] || 0;

  const total_delta_accionam = suma(snapshots.map((s) => s.delta_accionam));
  const accionam_estimados = suma(snapshots.map((s) => s.accionam_estimados));

  // promedios
  const prom_signal = promedio(snapshots.map((s) => s.lora_signal));
  const prom_corriente = promedio(snapshots.map((s) => s.sens_corriente));
  const prom_delta_accionam = promedio(snapshots.map((s) => s.delta_accionam));

  // medias
  const media_movil_completo = suma(
    snapshots.map((s) => s.media_movil_completo)
  );
  const media_movil_servicio = suma(
    snapshots.map((s) => s.media_movil_servicio)
  );

  return {
    // porcentajes
    porc_estado: porcentaje(conteoEstados, n),
    porc_flujo: porcentaje(conteoFlujo, n),
    porc_power: porcentaje(conteoPower, n),

    // promedios
    prom_signal,
    prom_corriente,
    prom_delta_accionam,

    // totales
    total_maq_alertas,
    total_maq_desc,
    total_maq_fs,
    total_maq_func,
    total_delta_accionam,
    accionam_estimados,

    media_movil_completo,
    media_movil_servicio,
  };
}

function contarValores(arr, campo, posiblesValores) {
  const conteo = {};
  for (const v of posiblesValores) conteo[v] = 0;
  for (const item of arr) {
    const valor = item[campo];
    if (conteo.hasOwnProperty(valor)) conteo[valor]++;
  }
  return conteo;
}

function porcentaje(conteo, total) {
  const res = {};
  for (const [clave, valor] of Object.entries(conteo))
    res[clave] = total > 0 ? valor / total : 0;
  return res;
}

function promedio(valores) {
  const filtrados = valores.filter((v) => typeof v === "number" && !isNaN(v));
  if (filtrados.length === 0) return 0;
  return filtrados.reduce((a, b) => a + b, 0) / filtrados.length;
}

function suma(valores) {
  return valores
    .filter((v) => typeof v === "number")
    .reduce((a, b) => a + b, 0);
}

main().catch((err) =>
  console.error("❌ Error generando resumen horario:", err)
);
