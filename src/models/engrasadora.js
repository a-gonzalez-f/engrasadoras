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
  nombre: String,
  modelo: String,
  linea: String,
  date: Date,
  user: String,
});

const comentariosschema = new mongoose.Schema({
  date: Date,
  comentario: String,
  user: String,
});

const EngrasadoraSchema = new mongoose.Schema({
  date: { type: Date },
  linea: { type: String },
  nombre: { type: String },
  modelo: { type: String },

  set_tiempodosif: { type: Number },
  set_ejes: { type: Number },

  sens_corriente: { type: Number },
  sens_flujo: { type: Boolean },
  sens_power: { type: Boolean },

  cont_accionam: { type: Number },

  estado: { type: String },

  historial: [historialSchema],
  comentarios: [comentariosschema],
});

module.exports = mongoose.model("engrasadora", EngrasadoraSchema);
