// models/engrasadora.js

const mongoose = require("mongoose");

const EngrasadoraSchema = new mongoose.Schema({
  date: { type: Date }, // Fecha del último evento registrado
  linea: { type: String }, // Línea de subte (ej. "A", "B", etc.)
  nombre: { type: String }, // Nombre identificador de la engrasadora
  modelo: { type: String }, // Modelo de la engrasadora

  // Seteos configurados en la máquina
  set_tiempodosif: { type: Number }, // Tiempo de dosificación seteado (segundos)
  set_ejes: { type: Number }, // Cantidad de ejes requeridos para accionar

  // Sensado actual
  sens_ejes: { type: Number }, // Contador de ejes en tiempo real
  sens_corriente: { type: Number }, // Corriente eléctrica detectada
  sens_flujo: { type: Boolean }, // Detección de flujo de grasa (true/false)
  sens_power: { type: Boolean }, // Detección de alimentación eléctrica (true/false)

  // Contadores
  cont_accionam: { type: Number }, // Cantidad total de accionamientos

  // Estado general de la máquina (ej. "funcionando", "fallando", "desconectada")
  estado: { type: String },
});

module.exports = mongoose.model("engrasadora", EngrasadoraSchema);
