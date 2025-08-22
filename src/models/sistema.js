// models/sistema.js

const mongoose = require("mongoose");

const ConfigSistema = new mongoose.Schema(
  {
    request_time: { type: Number, required: true },
    time_out: { type: Number, required: true, default: 1 },
    user: { type: String, default: "userX" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("configSistema", ConfigSistema);
