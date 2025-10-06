// models/gateway.js

const mongoose = require("mongoose");

const HistorialSchema = new mongoose.Schema({
  nro_evento: Number,
  tipo_evento: String,
  fecha: { type: Date, default: Date.now },
  estado: String,
  user: String,
  bypass: Boolean,
});

const GatewaySchema = new mongoose.Schema(
  {
    ip: { type: String, required: true, unique: true },
    puerto: { type: Number, default: 80 },
    nombre: { type: String, default: "-" },
    id: { type: Number, required: true, unique: true },
    linea: { type: String, default: "-" },
    ubicacion: { type: String, default: "-" },

    power: { type: Boolean, default: false },
    comunicacion_back: { type: Boolean, default: false },
    comunicacion_campo: { type: Boolean, default: false },
    ultimaConexion: { type: Date, default: null },

    engrasadoras: [{ type: Number }],
    bypass: { type: Boolean, default: false },

    historial: [HistorialSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("gateway", GatewaySchema);
