// models/engrasadora.js

const mongoose = require("mongoose");

const historialSchema = new mongoose.Schema({
  nro_evento: Number,
  tipo_evento: String,
  fecha: { type: Date, default: Date.now },
  estado: String,
  set_tiempodosif: Number,
  set_ejes: Number,
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

const EngrasadoraSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },

  id: Number,
  linea: String,
  nombre: String,
  modelo: String,

  set_tiempodosif: Number,
  set_ejes: Number,

  sens_corriente: Number,
  sens_flujo: Boolean,
  sens_power: Boolean,
  lora_signal: { type: Number, default: 0 },
  falla: { type: Boolean, default: false },

  cont_accionam: Number,

  estado: String,

  historial: [historialSchema],
  comentarios: [comentariosschema],
});

module.exports = mongoose.model("engrasadora", EngrasadoraSchema);
