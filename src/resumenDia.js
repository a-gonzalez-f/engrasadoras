// src/resumenDia.js
require("dotenv").config({ path: "/usr/src/app/.env" });
const mongoose = require("mongoose");
const conectarDB = require("./db");
const {
  SnapshotHora,
  ResumenHora,
  ResumenDia,
} = require("./models/engrasadora");

// Uso: node resumenDia [YYYY-MM-DD]
const arg = process.argv[2];
const baseFechaUTC = arg ? new Date(arg + "T00:00:00Z") : new Date();

const inicioDia = new Date(
  Date.UTC(
    baseFechaUTC.getUTCFullYear(),
    baseFechaUTC.getUTCMonth(),
    baseFechaUTC.getUTCDate(),
    0,
    0,
    0
  )
);
const finDia = new Date(inicioDia.getTime() + 24 * 60 * 60 * 1000);

async function main() {
  await conectarDB();
  console.log(`🟢 Conectado a MongoDB`);
  console.log(
    `📊 Generando resumen diario UTC: ${inicioDia.toISOString()} → ${finDia.toISOString()}`
  );

  await generarResumenPorLinea(inicioDia, finDia);
  await generarResumenTotal(inicioDia, finDia);

  mongoose.connection.close();
}

async function generarResumenPorLinea(inicioDia, finDia) {
  const lineas = await ResumenHora.distinct("linea");

  for (const linea of lineas) {
    const snapshots = await ResumenHora.find({
      linea,
      fecha: { $gte: inicioDia, $lt: finDia },
    });

    if (snapshots.length === 0) {
      console.log("Sin snapshots para generar resumen para la Linea", linea);
      continue;
    }

    const resumen = calcularEstadisticas(snapshots);

    await ResumenDia.findOneAndUpdate(
      { linea, tipo: "linea", fecha: inicioDia },
      { linea, tipo: "linea", fecha: inicioDia, ...resumen },
      { upsert: true, new: true }
    );

    console.log(`📈 Resumen diario generado para línea ${linea}`);
  }
}

async function generarResumenTotal(inicioDia, finDia) {
  const snapshots = await ResumenHora.find({
    fecha: { $gte: inicioDia, $lt: finDia },
    tipo: "total",
  });

  if (snapshots.length === 0) {
    console.log("Sin snapshots para generar resumen global");
    return;
  }

  const resumen = calcularEstadisticas(snapshots);

  await ResumenDia.findOneAndUpdate(
    { tipo: "total", fecha: inicioDia },
    { tipo: "total", fecha: inicioDia, ...resumen },
    { upsert: true, new: true }
  );

  console.log("🌍 Resumen diario total generado");
}

function calcularEstadisticas(snapshots) {
  const n = snapshots.length;

  // Promediar los mapas de porcentaje
  const porc_estado = promedioMapas(snapshots.map((s) => s.porc_estado));
  const porc_flujo = promedioMapas(snapshots.map((s) => s.porc_flujo));
  const porc_power = promedioMapas(snapshots.map((s) => s.porc_power));

  // Promedios numéricos
  const prom_signal = promedio(snapshots.map((s) => s.prom_signal));
  const prom_corriente = promedio(snapshots.map((s) => s.prom_corriente));
  const prom_delta_accionam = promedio(
    snapshots.map((s) => s.prom_delta_accionam)
  );
  const prom_maq_alertas = promedio(snapshots.map((s) => s.total_maq_alertas));
  const prom_maq_desc = promedio(snapshots.map((s) => s.total_maq_desc));
  const prom_maq_fs = promedio(snapshots.map((s) => s.total_maq_fs));
  const prom_maq_func = promedio(snapshots.map((s) => s.total_maq_func));

  // Totales
  const total_delta_accionam = suma(
    snapshots.map((s) => s.total_delta_accionam)
  );
  const accionam_estimados = suma(snapshots.map((s) => s.accionam_estimados));

  return {
    porc_estado,
    porc_flujo,
    porc_power,
    prom_signal,
    prom_corriente,
    prom_delta_accionam,
    prom_maq_alertas,
    prom_maq_desc,
    prom_maq_fs,
    prom_maq_func,
    total_delta_accionam,
    accionam_estimados,
  };
}

function promedioMapas(listaDeMapas) {
  const acumulado = {};
  const conteo = {};

  for (let mapa of listaDeMapas) {
    if (!mapa) continue;

    if (mapa instanceof Map) mapa = Object.fromEntries(mapa);
    else if (typeof mapa.toObject === "function") mapa = mapa.toObject();

    for (const [k, v] of Object.entries(mapa)) {
      const valorNum = Number(v);
      if (!isNaN(valorNum)) {
        acumulado[k] = (acumulado[k] || 0) + valorNum;
        conteo[k] = (conteo[k] || 0) + 1;
      }
    }
  }

  const resultado = {};
  for (const k of Object.keys(acumulado)) {
    resultado[k] = acumulado[k] / conteo[k];
  }
  return resultado;
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

main().catch((err) => console.error("❌ Error generando resumen diario:", err));
