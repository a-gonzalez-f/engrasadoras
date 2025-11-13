// src/resumenDia.js
require("dotenv").config({ path: "../.env" });
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

  await generarResumenPorMaquina(inicioDia, finDia);
  await generarResumenPorLinea(inicioDia, finDia);
  await generarResumenTotal(inicioDia, finDia);

  mongoose.connection.close();
}

async function generarResumenPorMaquina(inicioDia, finDia) {
  const ids = await SnapshotHora.distinct("id");

  for (const id of ids) {
    const snapshots = await SnapshotHora.find({
      id,
      fecha: { $gte: inicioDia, $lt: finDia },
    });

    if (snapshots.length === 0) {
      console.log("Sin snapshots para generar resumen para la máquina", id);
      continue;
    }

    const linea = snapshots[0].linea || "N/A";
    const resumen = calcularEstadisticas(snapshots);

    await ResumenDia.findOneAndUpdate(
      { id, fecha: inicioDia },
      { id, linea, tipo: "maquina", fecha: inicioDia, ...resumen },
      { upsert: true, new: true }
    );

    console.log(`🧩 Resumen diario generado para máquina ${id}`);
  }
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

  const estados = ["desconectada", "funcionando", "alerta", "fs"];
  const conteoEstados = contarValores(snapshots, "estado", estados);

  const conteoFlujo = contarValores(snapshots, "sens_flujo", [true, false]);

  const conteoPower = contarValores(snapshots, "sens_power", [true, false]);

  // Promedios
  const prom_signal = promedio(snapshots.map((s) => s.lora_signal));
  const prom_corriente = promedio(snapshots.map((s) => s.sens_corriente));
  const prom_delta_accionam = promedio(snapshots.map((s) => s.delta_accionam));
  const prom_conteo_alertas = promedio(
    snapshots.map((s) => s.total_conteo_alertas)
  );
  const prom_conteo_desc = promedio(snapshots.map((s) => s.total_conteo_desc));
  const prom_conteo_fs = promedio(snapshots.map((s) => s.total_conteo_fs));
  const prom_conteo_func = promedio(snapshots.map((s) => s.total_conteo_func));

  // Totales
  const total_conteo_alertas = suma(
    snapshots.map((s) => s.total_conteo_alertas)
  );
  const total_conteo_desc = suma(snapshots.map((s) => s.total_conteo_desc));
  const total_conteo_fs = suma(snapshots.map((s) => s.total_conteo_fs));
  const total_conteo_func = suma(snapshots.map((s) => s.total_conteo_func));
  const total_delta_accionam = suma(
    snapshots.map((s) => s.total_delta_accionam)
  );

  return {
    porc_estado: porcentaje(conteoEstados, n),
    porc_flujo: porcentaje(conteoFlujo, n),
    porc_power: porcentaje(conteoPower, n),

    prom_signal,
    prom_corriente,
    prom_delta_accionam,
    prom_conteo_alertas,
    prom_conteo_desc,
    prom_conteo_fs,
    prom_conteo_func,

    total_conteo_alertas,
    total_conteo_desc,
    total_conteo_fs,
    total_conteo_func,
    total_delta_accionam,
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
    res[clave] = total > 0 ? (valor / total) * 100 : 0;
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

main().catch((err) => console.error("❌ Error generando resumen diario:", err));
