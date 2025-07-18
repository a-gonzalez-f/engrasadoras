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

    id: { type: Number, unique: true },
    linea: String,
    nombre: String,
    modelo: String,
    ubicacion: String,

    set_tiempodosif: { type: Number, default: 0.2, min: 0.2, max: 2 },
    set_ejes: { type: Number, default: 1, min: 1, max: 128 },
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
  },
  { timestamps: true }
);

module.exports = mongoose.model("engrasadora", EngrasadoraSchema);
