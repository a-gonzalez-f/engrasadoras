// models/gateway.js

const mongoose = require("mongoose");

const GatewaySchema = new mongoose.Schema(
  {
    ip: { type: String, required: true },
    puerto: { type: Number, default: 80 },
    nombre: { type: String, default: "-" },
    id: { type: Number, required: true },
    linea: { type: String, default: "-" },
    ubicacion: { type: String, default: "-" },

    power: { type: Boolean, default: false },
    comunicacion_back: { type: Boolean, default: false },
    comunicacion_campo: { type: Boolean, default: false },
    ultimaConexion: { type: Date, default: null },

    engrasadoras: [{ type: Number }],
    bypass: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("gateway", GatewaySchema);
