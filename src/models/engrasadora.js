// models/engrasadora.js

const mongoose = require("mongoose");

const historialSchema = new mongoose.Schema({
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
});

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

    historial: [historialSchema],
    comentarios: [comentariosschema],

    perdidos: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const SnapshotHoraSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true },
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
    conteo_alertas: { type: Number },
    conteo_desc: { type: Number },
    conteo_fs: { type: Number },
    conteo_func: { type: Number },
  },

  { timestamps: true }
);

SnapshotHoraSchema.index({ id: 1, fecha: 1 }, { unique: true });

const ResumenDiaSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true }, // solo para resumen por máquina
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
    prom_conteo_alertas: Number,
    prom_conteo_desc: Number,
    prom_conteo_fs: Number,
    prom_conteo_func: Number,

    // totales
    total_conteo_alertas: Number,
    total_conteo_desc: Number,
    total_conteo_fs: Number,
    total_conteo_func: Number,
    total_delta_accionam: Number,
  },
  { timestamps: true }
);

ResumenDiaSchema.index(
  { tipo: 1, id: 1, linea: 1, fecha: 1 },
  { unique: true }
);

const Engrasadora = mongoose.model("engrasadora", EngrasadoraSchema);
const SnapshotHora = mongoose.model("SnapshotHora", SnapshotHoraSchema);
const ResumenDia = mongoose.model("ResumenDia", ResumenDiaSchema);

module.exports = { Engrasadora, SnapshotHora, ResumenDia };
