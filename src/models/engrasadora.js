// models/engrasadora.js

const mongoose = require("mongoose");

const HistorialSchema = new mongoose.Schema(
  {
    engrasadora: {
      type: Number,
      ref: "engrasadora",
      required: true,
      index: true,
    },
    nro_evento: Number,
    tipo_evento: String,
    fecha: { type: Date, default: Date.now },
    estado: String,
    set_tiempodosif: Number,
    set_ejes: Number,
    on_off: Boolean,
    sens_corriente: Number,
    sens_flujo: Boolean,
    sens_power: Boolean,
    cont_accionam: Number,
    user: String,
    lora_signal: Number,
    falla: Boolean,
  },
  { timestamps: true }
);

HistorialSchema.index({ engrasadora: 1, nro_evento: 1 }, { unique: true });
HistorialSchema.index({ fecha: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 365 });

const comentariosschema = new mongoose.Schema({
  date: Date,
  comentario: String,
  user: String,
});

const EngrasadoraSchema = new mongoose.Schema(
  {
    date: { type: Date, default: () => new Date() },

    id: { type: Number, unique: true, required: true, max: 999 },
    linea: String,
    nombre: String,
    modelo: String,
    ubicacion: String,

    set_tiempodosif: { type: Number, default: 0.2, max: 2 },
    set_ejes: { type: Number, default: 1, max: 128 },
    on_off: { type: Boolean, default: true },

    sens_corriente: { type: Number, default: 0 },
    sens_flujo: { type: Boolean, default: false },
    sens_power: { type: Boolean, default: false },
    lora_signal: { type: Number, default: 0 },
    falla: { type: Boolean, default: false },

    cont_accionam: { type: Number, default: 0 },

    estado: { type: String, default: "desconectada" },

    comentarios: [comentariosschema],

    perdidos: { type: Number, default: 0 },
    revision: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const SnapshotHoraSchema = new mongoose.Schema(
  {
    id: { type: Number },
    linea: { type: String },

    fecha: { type: Date }, // UTC

    estado: { type: String },

    set_tiempodosif: { type: Number },
    set_ejes: { type: Number },
    on_off: { type: Boolean },

    sens_corriente: { type: Number },
    sens_flujo: { type: Boolean },
    sens_power: { type: Boolean },
    lora_signal: { type: Number },

    delta_accionam: { type: Number },
    accionam_estimados: { type: Number },
  },

  { timestamps: true }
);

SnapshotHoraSchema.index({ id: 1, fecha: 1 }, { unique: true });

const ResumenHoraSchema = new mongoose.Schema(
  {
    linea: { type: String }, // solo para resumen por linea
    tipo: { type: String }, // resumen: por linea o total

    fecha: { type: Date, required: true },

    // porcentajes
    porc_estado: {
      type: Map,
      of: Number,
    },
    porc_flujo: {
      type: Map,
      of: Number,
    },
    porc_power: {
      type: Map,
      of: Number,
    },

    // promedios
    prom_signal: Number,
    prom_corriente: Number,
    prom_delta_accionam: Number,

    // totales
    total_maq_alertas: Number,
    total_maq_desc: Number,
    total_maq_fs: Number,
    total_maq_func: Number,
    total_delta_accionam: Number,
    accionam_estimados: Number,
  },
  { timestamps: true }
);

ResumenHoraSchema.index({ tipo: 1, linea: 1, fecha: 1 }, { unique: true });

const ResumenDiaSchema = new mongoose.Schema(
  {
    id: { type: Number }, // solo para resumen por máquina
    linea: { type: String }, // solo para resumen por linea
    tipo: { type: String }, // resumen: por id, por linea o total

    fecha: { type: Date, required: true },

    // porcentajes
    porc_estado: {
      type: Map,
      of: Number,
    },
    porc_flujo: {
      type: Map,
      of: Number,
    },
    porc_power: {
      type: Map,
      of: Number,
    },

    // promedios
    prom_signal: Number,
    prom_corriente: Number,
    prom_delta_accionam: Number,

    prom_maq_alertas: Number,
    prom_maq_desc: Number,
    prom_maq_fs: Number,
    prom_maq_func: Number,

    total_delta_accionam: Number,
    accionam_estimados: Number,
  },
  { timestamps: true }
);

ResumenDiaSchema.index(
  { tipo: 1, id: 1, linea: 1, fecha: 1 },
  { unique: true }
);

const Engrasadora = mongoose.model("engrasadora", EngrasadoraSchema);
const Historial = mongoose.model("Historial", HistorialSchema);
const SnapshotHora = mongoose.model("SnapshotHora", SnapshotHoraSchema);
const ResumenHora = mongoose.model("ResumenHora", ResumenHoraSchema);
const ResumenDia = mongoose.model("ResumenDia", ResumenDiaSchema);

module.exports = {
  Engrasadora,
  Historial,
  SnapshotHora,
  ResumenHora,
  ResumenDia,
};
